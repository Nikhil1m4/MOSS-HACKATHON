import os
from pathlib import Path
from typing import List

try:
    import fitz  # PyMuPDF
except ImportError:
    fitz = None


def parse_pdf(file_path: str, product_id: int) -> List[dict]:
    """
    Parse a PDF file and return a list of text chunks with metadata.

    Each chunk is a dict:
        {
            "text": <str>,
            "metadata": {
                "product_id": <str>,
                "page_number": <str>,
                "source_file": <str>,
            }
        }

    Text is chunked into pieces of ~500 characters with a 50-character overlap
    so that context at chunk boundaries is preserved.
    """
    if fitz is None:
        print("[ERROR] PyMuPDF (fitz) is not installed. Cannot parse PDF.")
        return []

    chunks: List[dict] = []
    source_file = Path(file_path).name
    chunk_size = 500
    overlap = 50

    try:
        doc = fitz.open(file_path)
        for page_num, page in enumerate(doc):
            try:
                text = page.get_text("text")
            except Exception as page_exc:
                print(f"[WARN] Could not extract text from page {page_num + 1}: {page_exc}")
                continue

            if not text.strip():
                continue

            # Sliding window chunking
            start = 0
            while start < len(text):
                end = start + chunk_size
                chunk_text = text[start:end].strip()
                if chunk_text:
                    chunks.append(
                        {
                            "text": chunk_text,
                            "metadata": {
                                "product_id": str(product_id),
                                "page_number": str(page_num + 1),
                                "source_file": source_file,
                            },
                        }
                    )
                start = end - overlap  # move back by overlap amount

        doc.close()
    except Exception as exc:
        print(f"[ERROR] Failed to parse PDF '{file_path}': {exc}")

    return chunks
