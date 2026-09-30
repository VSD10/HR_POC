from typing import List, Optional
from pydantic import BaseModel

class EmployeeSummary(BaseModel):
    id: str
    name: str
    department: Optional[str] = "General"
    email: str
    avatar: Optional[str] = None
    title: Optional[str] = None
    tenure: Optional[str] = None

class AITriageSummary(BaseModel):
    confidence: float
    classification: str
    autoRouted: bool

class RequestItemResponse(BaseModel):
    id: str
    title: str
    employee: EmployeeSummary
    category: str
    priority: str
    status: str
    waitingTime: str
    createdAt: str
    aiTriage: AITriageSummary
    description: str
    resolutionNotes: Optional[str] = None
    tags: Optional[List[str]] = None

class RequestCreate(BaseModel):
    title: str
    employeeId: Optional[str] = None
    category: str
    priority: Optional[str] = "medium"
    description: str

class RequestReview(BaseModel):
    action: Optional[str] = "resolve"  # resolve | in_review | request_info | escalate
    notes: Optional[str] = ""
    status: Optional[str] = None
    assigneeId: Optional[str] = None

class RequestListResponse(BaseModel):
    total: int
    page: int
    limit: int
    data: List[RequestItemResponse]
