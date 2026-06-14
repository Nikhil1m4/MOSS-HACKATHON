import os
import sys
from pathlib import Path

# Add backend to path so imports work
sys.path.append(str(Path(__file__).resolve().parent))

from database import SessionLocal, engine, Base
from models import Company, Product, Document
from auth import get_password_hash
from rag.vectorstore import parse_and_store
import fitz  # PyMuPDF

def create_dummy_pdf(filepath: str, text: str):
    doc = fitz.open()
    page = doc.new_page()
    page.insert_text((50, 50), text, fontsize=12)
    doc.save(filepath)
    doc.close()

def seed_db():
    print("Creating tables...")
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    try:
        # 1. TVS Motors (The Working Demo)
        tvs_company = db.query(Company).filter(Company.email == "admin@tvsmotors.com").first()
        if not tvs_company:
            tvs_company = Company(name="TVS Motors", email="admin@tvsmotors.com", password_hash=get_password_hash("password123"))
            db.add(tvs_company)
            db.commit()
            db.refresh(tvs_company)

        tvs_product = db.query(Product).filter(Product.name == "TVS Jupiter Scooty").first()
        if not tvs_product:
            tvs_product = Product(
                company_id=tvs_company.id,
                name="TVS Jupiter Scooty",
                category="Vehicles",
                description="The most popular family scooter in India.",
                image_url="https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&q=80&w=800"
            )
            db.add(tvs_product)
            db.commit()
            db.refresh(tvs_product)

        # 2. Samsung
        samsung_company = db.query(Company).filter(Company.email == "admin@samsung.com").first()
        if not samsung_company:
            samsung_company = Company(name="Samsung", email="admin@samsung.com", password_hash=get_password_hash("password123"))
            db.add(samsung_company)
            db.commit()
            db.refresh(samsung_company)

        s24_product = db.query(Product).filter(Product.name == "Galaxy S24 Ultra").first()
        if not s24_product:
            s24_product = Product(
                company_id=samsung_company.id,
                name="Galaxy S24 Ultra",
                category="Electronics",
                description="AI-powered flagship smartphone with S-Pen.",
                image_url="https://images.unsplash.com/photo-1707343843437-caacff5cfa74?auto=format&fit=crop&q=80&w=800"
            )
            db.add(s24_product)
            db.commit()
            db.refresh(s24_product)

        # 3. Sony
        sony_company = db.query(Company).filter(Company.email == "admin@sony.com").first()
        if not sony_company:
            sony_company = Company(name="Sony", email="admin@sony.com", password_hash=get_password_hash("password123"))
            db.add(sony_company)
            db.commit()
            db.refresh(sony_company)

        headphones_product = db.query(Product).filter(Product.name == "WH-1000XM5 Headphones").first()
        if not headphones_product:
            headphones_product = Product(
                company_id=sony_company.id,
                name="WH-1000XM5 Headphones",
                category="Electronics",
                description="Industry leading noise canceling headphones.",
                image_url="https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?auto=format&fit=crop&q=80&w=800"
            )
            db.add(headphones_product)
            db.commit()
            db.refresh(headphones_product)

        # 4. Bosch
        bosch_company = db.query(Company).filter(Company.email == "admin@bosch.com").first()
        if not bosch_company:
            bosch_company = Company(name="Bosch", email="admin@bosch.com", password_hash=get_password_hash("password123"))
            db.add(bosch_company)
            db.commit()
            db.refresh(bosch_company)

        drill_product = db.query(Product).filter(Product.name == "Bosch Power Drill 18V").first()
        if not drill_product:
            drill_product = Product(
                company_id=bosch_company.id,
                name="Bosch Power Drill 18V",
                category="Industrial",
                description="Professional cordless drill driver.",
                image_url="https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&q=80&w=800"
            )
            db.add(drill_product)
            db.commit()
            db.refresh(drill_product)

        # Create PDFs for them
        uploads_dir = Path(__file__).resolve().parent / "uploads"
        uploads_dir.mkdir(parents=True, exist_ok=True)
        
        products_data = [
            (tvs_product, "tvs_jupiter_manual.pdf", "TVS Jupiter Scooty - Official Service Manual\n\nSection 1: Tyre Wiggling or Wobbling\nIf the customer reports that the front or rear tyre is wiggling or wobbling:\n1. Low Speed Wiggling: This is usually caused by low tyre pressure or a loose wheel nut. Check the tyre pressure and tighten the axle nut to 50 Nm.\n2. High Speed Wobbling: If the wobbling occurs at high speeds, especially after hitting a large pothole or bump, this strongly indicates a bent rim or damaged suspension fork.\nWARNING: A bent rim is a critical safety hazard. Replace the rim immediately at a certified mechanic shop."),
            (s24_product, "s24_manual.pdf", "Samsung Galaxy S24 Ultra Manual\n\nIf the screen is unresponsive, hold the power and volume down buttons for 10 seconds to force restart."),
            (headphones_product, "sony_xm5_manual.pdf", "Sony WH-1000XM5 Manual\n\nIf ANC is not working, clean the external microphones. If there is a flashing red light, the battery is critically low."),
            (drill_product, "bosch_drill_manual.pdf", "Bosch Power Drill 18V Manual\n\nIf the drill stops unexpectedly, the thermal overload protection may have activated. Let it cool for 15 minutes.")
        ]

        for product, filename, text in products_data:
            pdf_path = uploads_dir / filename
            if not pdf_path.exists():
                print(f"Generating PDF for {product.name}...")
                create_dummy_pdf(str(pdf_path), text)
            
            doc = db.query(Document).filter(Document.file_name == filename).first()
            if not doc:
                doc = Document(
                    product_id=product.id,
                    file_name=filename,
                    file_path=f"uploads/{filename}",
                    file_type="pdf"
                )
                db.add(doc)
                db.commit()
                print(f"Indexing {product.name} manual into ChromaDB...")
                parse_and_store(str(pdf_path), product.id)

        print("\n=== SEEDING COMPLETE ===")
        print("Demo products added to the database!")
        
    except Exception as e:
        print(f"An error occurred: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    seed_db()
