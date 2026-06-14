from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session

from database import get_db
from auth import get_current_company
import models
from tree_models import DiagnosticTree
from tree_generator import generate_and_store_tree
from rag.vectorstore import search_documents

router = APIRouter(tags=["Diagnostic Trees"])

class GenerateTreeRequest(BaseModel):
    symptom: str
    manual_text: Optional[str] = ""

class TreeOut(BaseModel):
    id: int
    product_id: int
    version: int
    status: str
    symptom: Optional[str] = None
    tree_json: str
    coverage_score: float

    class Config:
        from_attributes = True

@router.post("/products/{product_id}/trees/generate", response_model=TreeOut, status_code=status.HTTP_201_CREATED)
def generate_tree(
    product_id: int,
    payload: GenerateTreeRequest,
    db: Session = Depends(get_db),
    current_company: models.Company = Depends(get_current_company),
):
    """Generate a diagnostic tree using AI and store it for the given product."""
    product = db.query(models.Product).filter(models.Product.id == product_id).first()
    if not product or product.company_id != current_company.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found or access denied.")

    # --- HACKATHON MAGIC: Auto-fetch manual context if empty ---
    text_to_use = payload.manual_text
    if not text_to_use or not text_to_use.strip():
        text_to_use = search_documents(payload.symptom, product_id, n_results=10)
        if not text_to_use:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No relevant manual text found in uploaded documents. Please upload a manual first or paste text manually.")

    tree = generate_and_store_tree(db, product_id, payload.symptom, text_to_use)
    if not tree:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Tree generation failed or validation rules were not met.")
        
    return tree

@router.get("/products/{product_id}/trees", response_model=List[TreeOut])
def list_trees(
    product_id: int,
    db: Session = Depends(get_db),
    current_company: models.Company = Depends(get_current_company),
):
    """List all diagnostic trees generated for a specific product."""
    product = db.query(models.Product).filter(models.Product.id == product_id).first()
    if not product or product.company_id != current_company.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found or access denied.")

    trees = db.query(DiagnosticTree).filter(DiagnosticTree.product_id == product_id).all()
    return trees