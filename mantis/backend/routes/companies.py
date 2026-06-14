from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, EmailStr
from sqlalchemy.orm import Session

from database import get_db
from auth import verify_password, get_password_hash, create_access_token
import models

router = APIRouter(tags=["Company Auth"])


# ---------------------------------------------------------------------------
# Pydantic schemas
# ---------------------------------------------------------------------------

class CompanyRegisterRequest(BaseModel):
    name: str
    email: EmailStr
    password: str


class CompanyLoginRequest(BaseModel):
    email: EmailStr
    password: str


class CompanyOut(BaseModel):
    id: int
    name: str
    email: str

    class Config:
        from_attributes = True


class CompanyAuthResponse(BaseModel):
    token: str
    company: CompanyOut


# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------

@router.post("/auth/company/register", response_model=CompanyAuthResponse, status_code=status.HTTP_201_CREATED)
def register_company(payload: CompanyRegisterRequest, db: Session = Depends(get_db)):
    """Register a new company account and return a JWT."""
    existing = db.query(models.Company).filter(models.Company.email == payload.email).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A company with this email already exists.",
        )

    company = models.Company(
        name=payload.name,
        email=payload.email,
        password_hash=get_password_hash(payload.password),
    )
    db.add(company)
    db.commit()
    db.refresh(company)

    token = create_access_token({"company_id": company.id})
    return CompanyAuthResponse(token=token, company=CompanyOut.model_validate(company))


@router.post("/auth/company/login", response_model=CompanyAuthResponse)
def login_company(payload: CompanyLoginRequest, db: Session = Depends(get_db)):
    """Authenticate a company and return a JWT."""
    company = db.query(models.Company).filter(models.Company.email == payload.email).first()
    if not company or not verify_password(payload.password, company.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password.",
        )

    token = create_access_token({"company_id": company.id})
    return CompanyAuthResponse(token=token, company=CompanyOut.model_validate(company))
