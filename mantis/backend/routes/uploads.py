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
    file: Optional[UploadFile] = File(None),
    link_url: Optional[str] = Form(None),
    link_type: Optional[str] = Form("link"),
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

    # -- Link upload --
    if link_url:
        allowed_link_types = {"link", "video"}
        file_type = link_type if link_type in allowed_link_types else "link"
        document = models.Document(
            product_id=product_id,
            file_name=link_url,
            file_type=file_type,
            external_url=link_url,
        )
        db.add(document)
        db.commit()
        db.refresh(document)
        return document

    # -- File upload --
    if file is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Provide either a file or a link_url.",
        )

    # Determine file type from content-type / extension
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
        file_type = "pdf"  # default fallback

    # Save file to disk
    UPLOADS_DIR.mkdir(parents=True, exist_ok=True)
    safe_filename = f"{product_id}_{filename}"
    dest_path = UPLOADS_DIR / safe_filename

    async with aiofiles.open(dest_path, "wb") as out_file:
        while chunk := await file.read(1024 * 1024):  # 1 MB chunks
            await out_file.write(chunk)

    relative_path = f"uploads/{safe_filename}"

    # Create DB record first so we have the ID before parsing
    document = models.Document(
        product_id=product_id,
        file_name=filename,
        file_path=relative_path,
        file_type=file_type,
    )
    db.add(document)
    db.commit()
    db.refresh(document)

    # Trigger RAG parsing for PDFs
    if file_type == "pdf":
        try:
            parse_and_store(str(dest_path), product_id)
        except Exception as exc:
            # Parsing failure should not break the upload response
            print(f"[WARN] RAG parsing failed for {dest_path}: {exc}")

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
