import os
from typing import List, Optional

import google.generativeai as genai
from dotenv import load_dotenv
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, EmailStr
from sqlalchemy.orm import Session

from database import get_db
from auth import (
    verify_password,
    get_password_hash,
    create_access_token,
    get_optional_user,
)
import models
from rag.vectorstore import search_documents

load_dotenv()

# Configure Gemini
genai.configure(api_key=os.getenv("GEMINI_API_KEY", ""))

router = APIRouter(tags=["Chat & User Auth"])

# ---------------------------------------------------------------------------
# System prompt for the AI assistant
# ---------------------------------------------------------------------------

SYSTEM_PROMPT = """You are an expert product support technician. You have access to the official documentation and service manuals for this product.

Your strict behavior rules:
1. When a user reports a problem, NEVER immediately list all possible causes or solutions.
2. Ask exactly ONE clarifying question per message to understand the problem better.
3. After each user response, eliminate unlikely causes internally before asking the next question.
4. Only provide a final diagnosis after at least 3 back-and-forth exchanges.
5. When giving your final diagnosis, always reference the exact section name, page number, or figure number from the documentation provided to you.
6. If the issue requires a professional technician and is unsafe for the user to fix, clearly say so.
7. Keep messages short and focused. One question per message. No long paragraphs.
8. Use the documentation context provided to you — do not make up information.

The product documentation context will be provided to you before each message."""


# ---------------------------------------------------------------------------
# Pydantic schemas
# ---------------------------------------------------------------------------

class UserRegisterRequest(BaseModel):
    name: str
    email: EmailStr
    password: str


class UserLoginRequest(BaseModel):
    email: EmailStr
    password: str


class UserOut(BaseModel):
    id: int
    name: str
    email: str

    class Config:
        from_attributes = True


class UserAuthResponse(BaseModel):
    token: str
    user: UserOut


class ChatRequest(BaseModel):
    message: str
    session_id: Optional[int] = None


class ChatResponse(BaseModel):
    response: str
    session_id: int


# ---------------------------------------------------------------------------
# User Auth Routes
# ---------------------------------------------------------------------------

@router.post("/auth/user/register", response_model=UserAuthResponse, status_code=status.HTTP_201_CREATED)
def register_user(payload: UserRegisterRequest, db: Session = Depends(get_db)):
    """Register a new end-user account and return a JWT."""
    existing = db.query(models.User).filter(models.User.email == payload.email).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A user with this email already exists.",
        )

    user = models.User(
        name=payload.name,
        email=payload.email,
        password_hash=get_password_hash(payload.password),
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    token = create_access_token({"user_id": user.id})
    return UserAuthResponse(token=token, user=UserOut.from_orm(user))


@router.post("/auth/user/login", response_model=UserAuthResponse)
def login_user(payload: UserLoginRequest, db: Session = Depends(get_db)):
    """Authenticate a user and return a JWT."""
    user = db.query(models.User).filter(models.User.email == payload.email).first()
    if not user or not verify_password(payload.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password.",
        )

    token = create_access_token({"user_id": user.id})
    return UserAuthResponse(token=token, user=UserOut.from_orm(user))


# ---------------------------------------------------------------------------
# Chat Route
# ---------------------------------------------------------------------------

@router.post("/chat/{product_id}", response_model=ChatResponse)
def chat(
    product_id: int,
    payload: ChatRequest,
    db: Session = Depends(get_db),
    current_user: Optional[models.User] = Depends(get_optional_user),
):
    """
    Main chat endpoint. Creates or resumes a chat session, queries the RAG
    vector store for relevant context, and calls Gemini to produce a reply.
    """
    # Verify product exists
    product = db.query(models.Product).filter(models.Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found.")

    # Resolve or create the chat session
    if payload.session_id:
        session = db.query(models.ChatSession).filter(
            models.ChatSession.id == payload.session_id,
            models.ChatSession.product_id == product_id,
        ).first()
        if not session:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Chat session not found.",
            )
    else:
        session = models.ChatSession(
            user_id=current_user.id if current_user else None,
            product_id=product_id,
        )
        db.add(session)
        db.commit()
        db.refresh(session)

    # Persist the user message
    user_message = models.ChatMessage(
        session_id=session.id,
        role="user",
        content=payload.message,
    )
    db.add(user_message)
    db.commit()

    # Retrieve relevant document context from the vector store
    context = search_documents(payload.message, product_id)

    # Load the last 10 messages for conversation history
    history = (
        db.query(models.ChatMessage)
        .filter(models.ChatMessage.session_id == session.id)
        .order_by(models.ChatMessage.created_at.asc())
        .limit(10)
        .all()
    )

    # Build Gemini prompt
    context_block = ""
    if context:
        context_block = f"\n\n--- PRODUCT DOCUMENTATION CONTEXT ---\n{context}\n--- END OF CONTEXT ---\n"

    # Construct the conversation for Gemini using its chat API
    try:
        gemini_model = genai.GenerativeModel(
            model_name="gemini-1.5-flash",
            system_instruction=SYSTEM_PROMPT + context_block,
        )

        # Build history for multi-turn (exclude the last user message we just added)
        gemini_history = []
        for msg in history[:-1]:  # exclude the current user turn
            role = "user" if msg.role == "user" else "model"
            gemini_history.append({"role": role, "parts": [msg.content]})

        chat_session = gemini_model.start_chat(history=gemini_history)
        gemini_response = chat_session.send_message(payload.message)
        assistant_text = gemini_response.text

    except Exception as exc:
        print(f"[ERROR] Gemini API call failed: {exc}")
        assistant_text = (
            "I'm sorry, I'm having trouble connecting to my knowledge base right now. "
            "Please try again in a moment."
        )

    # Persist the assistant response
    assistant_message = models.ChatMessage(
        session_id=session.id,
        role="assistant",
        content=assistant_text,
    )
    db.add(assistant_message)
    db.commit()

    return ChatResponse(response=assistant_text, session_id=session.id)
