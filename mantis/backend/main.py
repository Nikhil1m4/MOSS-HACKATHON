import os
from pathlib import Path

import uvicorn
from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

load_dotenv()

from database import engine, Base
from routes.companies import router as companies_router
from routes.products import router as products_router
from routes.uploads import router as uploads_router
from routes.chat import router as chat_router

# ---------------------------------------------------------------------------
# App setup
# ---------------------------------------------------------------------------

app = FastAPI(
    title="Mantis API",
    description="AI-powered product support chatbot platform",
    version="1.0.0",
)

# ---------------------------------------------------------------------------
# CORS
# ---------------------------------------------------------------------------

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:5174", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------------------------------------------------------
# Routers
# All routers use prefix="" because they define their full paths internally
# (e.g. /auth/company/register, /products/, /chat/{product_id})
# ---------------------------------------------------------------------------

app.include_router(companies_router, prefix="")
app.include_router(products_router, prefix="")
app.include_router(uploads_router, prefix="")
app.include_router(chat_router, prefix="")

# ---------------------------------------------------------------------------
# Static file serving for uploads
# ---------------------------------------------------------------------------

UPLOADS_DIR = Path(__file__).resolve().parent / "uploads"


@app.on_event("startup")
async def startup_event():
    """Create DB tables and ensure the uploads directory exists on startup."""
    # Create all SQLAlchemy tables
    Base.metadata.create_all(bind=engine)

    # Ensure uploads directory exists
    UPLOADS_DIR.mkdir(parents=True, exist_ok=True)
    print("[INFO] Mantis API started. DB tables created. Uploads directory ready.")


# Mount the uploads directory so files are accessible at /uploads/<filename>
# We mount after defining routes to avoid path conflicts.
app.mount("/uploads", StaticFiles(directory=str(UPLOADS_DIR)), name="uploads")


# ---------------------------------------------------------------------------
# Health check
# ---------------------------------------------------------------------------

@app.get("/", tags=["Health"])
def root():
    return {"status": "Mantis API running", "version": "1.0.0"}


# ---------------------------------------------------------------------------
# Entry point
# ---------------------------------------------------------------------------

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
