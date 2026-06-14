# Mantis — Intelligent Product Support Platform

> AI-powered product support that diagnoses issues like an expert technician

## What is Mantis?

Companies register on Mantis, add their products, and upload support documentation (PDFs, manuals, images, links). Users browse the product catalog and chat with an AI diagnostic assistant for each product. The AI behaves like an experienced technician — asking targeted follow-up questions one at a time before giving a diagnosis backed by the actual manual.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend API | Python FastAPI |
| Database | SQLite via SQLAlchemy |
| Vector Search | ChromaDB |
| AI Model | Google Gemini 1.5 Flash |
| Auth | JWT (python-jose) |
| Frontend (Users) | React + Tailwind CSS (Vite) |
| Company Portal | React + Tailwind CSS (Vite) |

## Project Structure

```
mantis/
├── backend/          # FastAPI backend (port 8000)
├── frontend/         # User-facing app (port 5173)
└── company-ui/       # Company dashboard (port 5174)
```

## Setup & Running

### 1. Backend

```bash
cd backend
pip install -r requirements.txt
cp .env.example .env
# Add your Gemini API key to .env
python main.py
```

Backend runs at: http://localhost:8000  
API docs at: http://localhost:8000/docs

### 2. Frontend (User App)

```bash
cd frontend
npm install
npm run dev
```

Runs at: http://localhost:5173

### 3. Company UI

```bash
cd company-ui
npm install
npm run dev
```

Runs at: http://localhost:5174

## Environment Variables

```env
GEMINI_API_KEY=your_gemini_api_key_here
SECRET_KEY=mantis_super_secret_jwt_key_change_this
DATABASE_URL=sqlite:///./mantis.db
```

Get a free Gemini API key at: https://aistudio.google.com/app/apikey

## API Endpoints

### Authentication
- `POST /auth/company/register` — Company registration
- `POST /auth/company/login` — Company login
- `POST /auth/user/register` — User registration
- `POST /auth/user/login` — User login

### Products
- `GET /products/` — Browse all products (with `?search=` filter)
- `POST /products/` — Create product (company auth required)
- `GET /products/{id}` — Get product details
- `GET /products/company/mine` — Company's own products

### Documents
- `POST /products/{id}/upload` — Upload PDF/image or add link
- `GET /products/{id}/documents` — List product documents

### Chat
- `POST /chat/{product_id}` — Chat with AI about a product

## Team

- **Tanuj** — Backend + AI Assistant
- **Nikhil** — Company UI + Database
- **Yatin** — Frontend + User Experience

---

*Built for PClub UIET Chandigarh Hackathon 2024*
