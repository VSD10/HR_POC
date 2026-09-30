from datetime import datetime, timezone
from sqlalchemy import Column, String, DateTime, Date, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(String(36), primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    role = Column(String(50), default="HR_SPECIALIST", nullable=False)  # HR_ADMIN | HR_SPECIALIST | EMPLOYEE
    title = Column(String(255), nullable=True)
    avatar_url = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    # Relationships
    employee_profile = relationship("Employee", back_populates="user", uselist=False)
    assigned_requests = relationship("Request", back_populates="assignee", foreign_keys="Request.assigned_to")

class Employee(Base):
    __tablename__ = "employees"

    id = Column(String(36), primary_key=True, index=True)  # e.g. EMP-410
    first_name = Column(String(100), nullable=False)
    last_name = Column(String(100), nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    department = Column(String(100), nullable=True)
    job_title = Column(String(150), nullable=True)
    hire_date = Column(Date, nullable=True)
    tenure = Column(String(50), nullable=True)
    avatar_url = Column(Text, nullable=True)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=True)

    # Relationships
    user = relationship("User", back_populates="employee_profile")
    requests = relationship("Request", back_populates="employee", foreign_keys="Request.employee_id")
    deliverables = relationship("Deliverable", back_populates="employee")
    actions = relationship("HRAction", back_populates="employee")

    @property
    def full_name(self) -> str:
        return f"{self.first_name} {self.last_name}".strip()
