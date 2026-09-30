from datetime import datetime, timezone
from sqlalchemy import Column, String, Text, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from app.database import Base

class HRAction(Base):
    __tablename__ = "hr_actions"

    id = Column(String(36), primary_key=True, index=True)  # ACT-101
    title = Column(String(255), nullable=False)
    type = Column(String(50), nullable=False)  # salary_adjustment, leave_signoff, role_transition, equipment_offboard
    employee_id = Column(String(36), ForeignKey("employees.id"), nullable=False)
    urgency = Column(String(20), default="NORMAL")  # HIGH, NORMAL
    status = Column(String(30), default="pending")  # pending, completed
    effective_date = Column(String(50), nullable=False)
    summary = Column(Text, nullable=False)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    # Relationships
    employee = relationship("Employee", back_populates="actions")
