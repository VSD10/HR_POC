from typing import List, Optional
from pydantic import BaseModel, Field, field_validator


class ChatMessage(BaseModel):
    """Represents a single message in the conversation history."""
    role: str = Field(..., description="Role of the speaker, e.g. 'user' or 'assistant'")
    content: str = Field(..., description="Message text content")


class ChatRequest(BaseModel):
    """Incoming user chat query with optional conversation history."""
    question: str = Field(
        ...,
        min_length=1,
        max_length=2000,
        description="User question or conversational input",
        examples=["How many annual leave days do employees receive?"]
    )
    history: List[ChatMessage] = Field(
        default_factory=list,
        description="Previous conversation messages for multi-turn dialogue context"
    )

    @field_validator("question")
    @classmethod
    def validate_question_not_empty(cls, value: str) -> str:
        trimmed = value.strip()
        if not trimmed:
            raise ValueError("Question cannot be empty or solely whitespace.")
        return trimmed


class SourceItem(BaseModel):
    """Source reference for retrieved knowledge base chunks."""
    document: str = Field(..., description="Filename of the policy document")
    page: int = Field(..., description="1-indexed page number within the policy document")


class ChatResponse(BaseModel):
    """RAG-generated answer and associated policy sources."""
    answer: str = Field(..., description="Grounded answer based on company policies")
    sources: List[SourceItem] = Field(
        default_factory=list,
        description="List of cited documents and pages"
    )


class RootResponse(BaseModel):
    """API root status response."""
    status: str = "ok"
    message: str = "Company Policy RAG API is running"


class HealthResponse(BaseModel):
    """API health status response."""
    status: str = "healthy"
    azure_configured: bool
    vector_store_ready: bool
    knowledge_base_files: int
