from datetime import datetime, timezone
from sqlalchemy import Column, String, Text, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from app.database import Base

class Deliverable(Base):
    __tablename__ = "deliverables"

    id = Column(String(36), primary_key=True, index=True)  # DEL-1024
    request_id = Column(String(36), ForeignKey("requests.id"), nullable=True)
    employee_id = Column(String(36), ForeignKey("employees.id"), nullable=True)
    title = Column(String(255), nullable=False)
    type = Column(String(50), nullable=False)  # compensation_letter, verification_of_employment, etc.
    content = Column(Text, nullable=True)
    status = Column(String(30), default="pending_approval")  # pending_approval, approved, dispatched
    file_path = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    # Relationships
    request = relationship("Request", back_populates="deliverables")
    employee = relationship("Employee", back_populates="deliverables")
