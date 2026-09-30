from sqlalchemy import Column, String, Integer, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from app.database import Base

class Document(Base):
    __tablename__ = "documents"

    id = Column(String(64), primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    category = Column(String(100), nullable=False, default="Company Policy")
    summary = Column(Text, nullable=True)
    file_name = Column(String(255), nullable=False)
    file_path = Column(String(500), nullable=False)
    uploaded_by = Column(String(100), nullable=True, default="HR Operations")
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    last_updated = Column(String(50), nullable=True)
    page_count = Column(Integer, default=1)

    embeddings = relationship("DocumentEmbedding", back_populates="document", cascade="all, delete-orphan")


class DocumentEmbedding(Base):
    __tablename__ = "document_embeddings"

    id = Column(String(64), primary_key=True, index=True)
    document_id = Column(String(64), ForeignKey("documents.id", ondelete="CASCADE"), nullable=False, index=True)
    chunk_index = Column(Integer, default=0)
    page_number = Column(Integer, default=1)
    chunk_text = Column(Text, nullable=False)
    embedding_vector = Column(Text, nullable=True)  # JSON-serialized embedding or vector reference

    document = relationship("Document", back_populates="embeddings")
