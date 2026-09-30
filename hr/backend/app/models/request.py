from datetime import datetime, timezone
from sqlalchemy import Column, String, Text, ForeignKey, Numeric, Integer, DateTime
from sqlalchemy.orm import relationship
from app.database import Base

class Request(Base):
    __tablename__ = "requests"

    id = Column(String(36), primary_key=True, index=True)  # HR-1028
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    employee_id = Column(String(36), ForeignKey("employees.id"), nullable=False)
    category = Column(String(50), nullable=False)  # payroll, benefits, leave, documents, compliance, other
    priority = Column(String(20), default="medium")  # high, medium, low
    status = Column(String(30), default="open")  # open, in_review, resolved, escalated
    ai_confidence = Column(Numeric(3, 2), default=0.95)
    ai_classification = Column(String(100), nullable=True)
    waiting_minutes = Column(Integer, default=0)
    assigned_to = Column(String(36), ForeignKey("users.id"), nullable=True)
    resolution_notes = Column(Text, nullable=True)
    tags = Column(String(255), nullable=True)  # comma-separated tags
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    resolved_at = Column(DateTime(timezone=True), nullable=True)

    # Relationships
    employee = relationship("Employee", back_populates="requests", foreign_keys=[employee_id])
    assignee = relationship("User", back_populates="assigned_requests", foreign_keys=[assigned_to])
    triage_item = relationship("TriageItem", back_populates="request", uselist=False)
    deliverables = relationship("Deliverable", back_populates="request")
