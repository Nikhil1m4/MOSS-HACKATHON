from sqlalchemy import Column, Integer, String, Text, DateTime, Float, ForeignKey
from database import Base
from datetime import datetime, timezone

class DiagnosticTree(Base):
    __tablename__ = "diagnostic_trees"
    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, index=True)
    version = Column(Integer, default=1)
    status = Column(String, default="draft")
    symptom = Column(String)
    tree_json = Column(Text)
    coverage_score = Column(Float, default=0.0)
    generated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    published_at = Column(DateTime, nullable=True)

class DiagnosticSession(Base):
    __tablename__ = "diagnostic_sessions"
    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(Integer, index=True) # Links to existing ChatSession.id
    product_id = Column(Integer, index=True)
    user_id = Column(Integer, nullable=True)
    tree_id = Column(Integer, nullable=True)
    current_node = Column(String, nullable=True)
    history = Column(Text, default="[]")
    status = Column(String, default="active") # active, resolved, fallback
    final_diagnosis = Column(Text, nullable=True)