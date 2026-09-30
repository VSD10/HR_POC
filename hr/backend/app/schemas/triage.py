from typing import List, Optional
from pydantic import BaseModel

class TriageItemResponse(BaseModel):
    id: str
    requestId: str
    title: str
    employeeName: str
    predictedCategory: str
    confidenceScore: float
    urgencyScore: str
    reasoning: str
    suggestedAction: str
    status: str
    timestamp: Optional[str] = "Just now"

class TriageQueueResponse(BaseModel):
    triagedToday: int
    routingAccuracy: float
    aiAssistedCases: int
    draftsGenerated: int
    queue: List[TriageItemResponse]

class TriageOverrideRequest(BaseModel):
    triageId: str
    correctedCategory: Optional[str] = None
    newCategory: Optional[str] = None  # accommodate both frontend formats
    overrideReason: Optional[str] = None
