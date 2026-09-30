from typing import List, Optional
from pydantic import BaseModel, Field

class PolicyItemResponse(BaseModel):
    id: str = Field(..., description="Unique policy identifier")
    title: str = Field(..., description="Title of the policy")
    category: str = Field(..., description="Category of the policy")
    summary: str = Field(..., description="Summary of the policy content")
    documentName: str = Field(..., description="Filename of the policy document")
    documentUrl: str = Field(..., description="Path or relative URL to the document")
    lastUpdated: str = Field(..., description="Last updated timestamp or human-readable date")
    pageCount: Optional[int] = Field(default=1, description="Total number of pages")
    featured: Optional[bool] = Field(default=False)
    readTime: Optional[str] = Field(default="5 min read")
    content: Optional[List[str]] = Field(default_factory=list)
    image: Optional[str] = Field(default=None)
    tag: Optional[str] = Field(default=None)

class DocumentUploadResponse(BaseModel):
    id: str
    title: str
    category: str
    summary: str
    documentName: str
    documentUrl: str
    lastUpdated: str
    chunksIndexed: int
    message: str

class ChatMessageSchema(BaseModel):
    role: str = Field(..., description="Sender role: user, assistant, or system")
    content: str = Field(..., description="Message text")

class ChatRequest(BaseModel):
    question: str = Field(..., min_length=1, description="User question or message")
    history: Optional[List[ChatMessageSchema]] = Field(default_factory=list)
    userId: Optional[str] = Field(default=None)

class SourceItem(BaseModel):
    document: str = Field(..., description="Filename of the policy document")
    page: int = Field(..., description="Page number where content was found")
    excerpt: Optional[str] = Field(default=None)

class ChatResponse(BaseModel):
    answer: str = Field(..., description="AI response text")
    sources: List[SourceItem] = Field(default_factory=list, description="List of cited documents and pages")
    intent: Optional[str] = Field(default="POLICY_RAG", description="Detected intent: CASUAL or POLICY_RAG")
