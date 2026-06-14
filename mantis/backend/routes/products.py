from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel
from sqlalchemy.orm import Session

from database import get_db
from auth import get_current_company
import models

router = APIRouter(tags=["Products"])


# ---------------------------------------------------------------------------
# Pydantic schemas
# ---------------------------------------------------------------------------

class ProductCreateRequest(BaseModel):
    name: str
    category: str
    description: Optional[str] = None
    image_url: Optional[str] = None


class CompanyInfo(BaseModel):
    id: int
    name: str

    class Config:
        from_attributes = True


class ProductOut(BaseModel):
    id: int
    name: str
    category: str
    description: Optional[str] = None
    image_url: Optional[str] = None
    company_id: int
    company: Optional[CompanyInfo] = None

    class Config:
        from_attributes = True


# ---------------------------------------------------------------------------
# Routes
# NOTE: /products/company/mine MUST be declared before /products/{product_id}
# ---------------------------------------------------------------------------

@router.post("/products/", response_model=ProductOut, status_code=status.HTTP_201_CREATED)
def create_product(
    payload: ProductCreateRequest,
    db: Session = Depends(get_db),
    current_company: models.Company = Depends(get_current_company),
):
    """Create a new product owned by the authenticated company."""
    product = models.Product(
        company_id=current_company.id,
        name=payload.name,
        category=payload.category,
        description=payload.description,
        image_url=payload.image_url,
    )
    db.add(product)
    db.commit()
    db.refresh(product)
    # Eager-load company so the response includes it
    db.refresh(product)
    return product


@router.get("/products/", response_model=List[ProductOut])
def list_products(
    search: Optional[str] = Query(None, description="Filter by name, category, or description"),
    db: Session = Depends(get_db),
):
    """Return all products, optionally filtered by a search query. Public endpoint."""
    query = db.query(models.Product)
    if search:
        pattern = f"%{search}%"
        query = query.filter(
            models.Product.name.ilike(pattern)
            | models.Product.category.ilike(pattern)
            | models.Product.description.ilike(pattern)
        )
    products = query.all()
    return products


@router.get("/products/company/mine", response_model=List[ProductOut])
def list_my_products(
    db: Session = Depends(get_db),
    current_company: models.Company = Depends(get_current_company),
):
    """Return all products belonging to the authenticated company."""
    products = (
        db.query(models.Product)
        .filter(models.Product.company_id == current_company.id)
        .all()
    )
    return products


@router.get("/products/{product_id}", response_model=ProductOut)
def get_product(product_id: int, db: Session = Depends(get_db)):
    """Return a single product by ID with company info. Public endpoint."""
    product = (
        db.query(models.Product)
        .filter(models.Product.id == product_id)
        .first()
    )
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found.",
        )
    return product
