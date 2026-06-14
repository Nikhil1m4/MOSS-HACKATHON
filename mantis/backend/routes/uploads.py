import os
from pathlib import Path
from typing import List, Optional

import aiofiles
from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile, status
from pydantic import BaseModel
from sqlalchemy.orm import Session

from database import get_db
from auth import get_current_company
import models
from rag.vectorstore import parse_and_store

router = APIRouter(tags=["Uploads"])

# Directory where uploaded files are stored (relative to this file's location)
BACKEND_DIR = Path(__file__).resolve().parent.parent
UPLOADS_DIR = BACKEND_DIR / "uploads"


# ---------------------------------------------------------------------------
# Pydantic schemas
# ---------------------------------------------------------------------------

class DocumentOut(BaseModel):
    id: int
    product_id: int
    file_name: str
    file_path: Optional[str] = None
    file_type: str
    external_url: Optional[str] = None

    class Config:
        from_attributes = True


# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------

@router.post("/products/{product_id}/upload", response_model=DocumentOut, status_code=status.HTTP_201_CREATED)
async def upload_document(
    product_id: int,
    files: Optional[List[UploadFile]] = File(None),
    link_urls: Optional[List[str]] = Form(None),
    link_types: Optional[List[str]] = Form(None),
    link_texts: Optional[List[str]] = Form(None),
    db: Session = Depends(get_db),
    current_company: models.Company = Depends(get_current_company),
):
    """
    Upload a file (PDF / image / video) or register an external link for a product.
    The authenticated company must own the product.
    """
    # Verify ownership
    product = db.query(models.Product).filter(models.Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found.")
    if product.company_id != current_company.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not own this product.",
        )

    created_documents = []

    # -- Link uploads (support multiple links) --
    if link_urls:
        allowed_link_types = {"link", "video"}
        for idx, url in enumerate(link_urls):
            lt = None
            try:
                lt = link_types[idx]
            except Exception:
                lt = "link"
            file_type = lt if lt in allowed_link_types else "link"

                # Check for optional custom text label (fallback to URL if missing)
                file_name = url
                try:
                    if link_texts and idx < len(link_texts) and link_texts[idx]:
                        file_name = link_texts[idx][:50]
                except Exception:
                    pass

            document = models.Document(
                product_id=product_id,
                    file_name=file_name,
                file_type=file_type,
                external_url=url,
            )
            db.add(document)
            db.commit()
            db.refresh(document)
            created_documents.append(document)

    # -- File uploads (support multiple files) --
    if files:
        UPLOADS_DIR.mkdir(parents=True, exist_ok=True)
        for file in files:
            if file is None:
                continue
            filename = file.filename or "upload"
            ext = Path(filename).suffix.lower()
            content_type = file.content_type or ""

            if ext == ".pdf" or "pdf" in content_type:
                file_type = "pdf"
            elif ext in {".jpg", ".jpeg", ".png", ".gif", ".webp", ".svg"} or "image" in content_type:
                file_type = "image"
            elif ext in {".mp4", ".mov", ".avi", ".mkv", ".webm"} or "video" in content_type:
                file_type = "video"
            else:
                file_type = "pdf"

            safe_filename = f"{product_id}_{filename}"
            dest_path = UPLOADS_DIR / safe_filename

            async with aiofiles.open(dest_path, "wb") as out_file:
                while chunk := await file.read(1024 * 1024):  # 1 MB chunks
                    await out_file.write(chunk)

            relative_path = f"uploads/{safe_filename}"

            document = models.Document(
                product_id=product_id,
                file_name=filename,
                file_path=relative_path,
                file_type=file_type,
            )
            db.add(document)
            db.commit()
            db.refresh(document)
            created_documents.append(document)

            # Trigger RAG parsing for PDFs
            if file_type == "pdf":
                try:
                    parse_and_store(str(dest_path), product_id)
                except Exception as exc:
                    print(f"[WARN] RAG parsing failed for {dest_path}: {exc}")

    if not created_documents:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Provide at least one file or link_url.",
        )

    # If a single document was created, return it, else return the list
    if len(created_documents) == 1:
        return created_documents[0]
    return created_documents



@router.delete("/documents/{document_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_document(document_id: int, db: Session = Depends(get_db), current_company: models.Company = Depends(get_current_company)):
    """Delete a document (file or link). Company must own the product."""
    document = db.query(models.Document).filter(models.Document.id == document_id).first()
    if not document:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Document not found.")

    product = db.query(models.Product).filter(models.Product.id == document.product_id).first()
    if not product or product.company_id != current_company.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="You do not have permission to delete this document.")

    # Remove file from disk if present
    try:
        if document.file_path:
            disk_path = BACKEND_DIR / document.file_path.split("/", 1)[-1]
            if disk_path.exists():
                disk_path.unlink()
    except Exception as exc:
        print(f"[WARN] Failed to delete file from disk: {exc}")

    db.delete(document)
    db.commit()
    return None


@router.put("/documents/{document_id}", response_model=DocumentOut)
def update_document(document_id: int, payload: DocumentOut, db: Session = Depends(get_db), current_company: models.Company = Depends(get_current_company)):
    """Update document metadata (file_name, external_url, file_type)."""
    document = db.query(models.Document).filter(models.Document.id == document_id).first()
    if not document:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Document not found.")

    product = db.query(models.Product).filter(models.Product.id == document.product_id).first()
    if not product or product.company_id != current_company.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="You do not have permission to update this document.")

    # Update allowed fields
    if payload.file_name is not None:
        document.file_name = payload.file_name
    if payload.external_url is not None:
        document.external_url = payload.external_url
    if payload.file_type is not None:
        document.file_type = payload.file_type

    db.commit()
    db.refresh(document)
    return document


@router.get("/products/{product_id}/documents", response_model=List[DocumentOut])
def list_documents(product_id: int, db: Session = Depends(get_db)):
    """List all documents associated with a product. Public endpoint."""
    product = db.query(models.Product).filter(models.Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found.")

    documents = (
        db.query(models.Document)
        .filter(models.Document.product_id == product_id)
        .all()
    )
    return documents
