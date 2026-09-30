from datetime import datetime, timezone
from sqlalchemy import Column, String, Text, ForeignKey, Integer, DateTime
from app.database import Base

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, autoincrement=True)
    entity_type = Column(String(50), nullable=False)  # request, deliverable, action, auth
    entity_id = Column(String(36), nullable=False)
    action = Column(String(50), nullable=False)  # created, reviewed, resolved, approved, executed
    actor_id = Column(String(36), ForeignKey("users.id"), nullable=True)
    actor_name = Column(String(255), nullable=True)
    metadata_json = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
