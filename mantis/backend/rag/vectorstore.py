import uuid
from pathlib import Path
from typing import List

try:
    import chromadb
    from chromadb.utils import embedding_functions
    _chroma_available = True
except ImportError:
    _chroma_available = False
    print("[WARN] chromadb is not installed. Vector store features will be disabled.")

from rag.parser import parse_pdf

# ---------------------------------------------------------------------------
# ChromaDB client & collection (lazy initialisation)
# ---------------------------------------------------------------------------

_client = None
_collection = None

CHROMA_DB_PATH = str(Path(__file__).resolve().parent.parent / "chroma_db")
COLLECTION_NAME = "mantis_docs"


def _get_collection():
    """Return (and lazily initialise) the ChromaDB collection."""
    global _client, _collection
    if not _chroma_available:
        return None
    if _collection is None:
        _client = chromadb.PersistentClient(path=CHROMA_DB_PATH)
        # Use the default (built-in) embedding function
        default_ef = embedding_functions.DefaultEmbeddingFunction()
        _collection = _client.get_or_create_collection(
            name=COLLECTION_NAME,
            embedding_function=default_ef,
        )
    return _collection


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------

def add_documents(chunks: List[dict]) -> None:
    """
    Add a list of text chunks to the ChromaDB collection.

    Each chunk must be a dict with keys:
        - "text": str
        - "metadata": dict  (must contain at least "product_id" as a string)
    """
    collection = _get_collection()
    if collection is None or not chunks:
        return

    documents = [c["text"] for c in chunks]
    metadatas = [c["metadata"] for c in chunks]
    ids = [str(uuid.uuid4()) for _ in chunks]

    try:
        collection.add(documents=documents, metadatas=metadatas, ids=ids)
    except Exception as exc:
        print(f"[ERROR] Failed to add documents to ChromaDB: {exc}")


def search_documents(query: str, product_id: int, n_results: int = 5) -> str:
    """
    Search the vector store for chunks relevant to *query* that belong to
    *product_id*. Returns a single formatted string with the top results,
    including page references, suitable for injection into a prompt.

    Returns an empty string if no documents are found or ChromaDB is unavailable.
    """
    collection = _get_collection()
    if collection is None:
        return ""

    try:
        results = collection.query(
            query_texts=[query],
            n_results=n_results,
            where={"product_id": str(product_id)},
        )
    except Exception as exc:
        print(f"[WARN] ChromaDB query failed: {exc}")
        return ""

    if not results or not results.get("documents"):
        return ""

    docs = results["documents"][0]
    metas = results.get("metadatas", [[]])[0]

    if not docs:
        return ""

    parts = []
    for doc, meta in zip(docs, metas):
        page = meta.get("page_number", "?")
        source = meta.get("source_file", "unknown")
        parts.append(f"[Source: {source}, Page {page}]\n{doc}")

    return "\n\n".join(parts)


def parse_and_store(file_path: str, product_id: int) -> None:
    """
    Parse a PDF file and store all extracted chunks in the vector store.
    This is the single entry-point called after a PDF upload.
    """
    try:
        chunks = parse_pdf(file_path, product_id)
        if chunks:
            add_documents(chunks)
            print(f"[INFO] Stored {len(chunks)} chunks for product {product_id} from {file_path}.")
        else:
            print(f"[INFO] No chunks extracted from {file_path}.")
    except Exception as exc:
        print(f"[ERROR] parse_and_store failed for {file_path}: {exc}")
