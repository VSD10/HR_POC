from datetime import datetime, timezone
from sqlalchemy import Column, String, Text, ForeignKey, Numeric, DateTime
from sqlalchemy.orm import relationship
from app.database import Base

class TriageItem(Base):
    __tablename__ = "triage_items"

    id = Column(String(36), primary_key=True, index=True)  # TR-881
    request_id = Column(String(36), ForeignKey("requests.id"), nullable=False)
    title = Column(String(255), nullable=False)
    employee_name = Column(String(255), nullable=False)
    predicted_category = Column(String(50), nullable=False)
    confidence_score = Column(Numeric(3, 2), default=0.95)
    urgency_score = Column(String(20), default="MEDIUM")  # HIGH, MEDIUM, LOW
    reasoning = Column(Text, nullable=True)
    suggested_action = Column(Text, nullable=True)
    status = Column(String(30), default="AUTO_ROUTED")  # AUTO_ROUTED, NEEDS_VERIFICATION, OVERRIDDEN
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    # Relationships
    request = relationship("Request", back_populates="triage_item")
