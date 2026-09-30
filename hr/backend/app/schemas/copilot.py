from typing import List, Optional, Dict, Any
from pydantic import BaseModel

class Citation(BaseModel):
    title: str
    section: str
    page: Optional[int] = None

class CopilotMessageResponse(BaseModel):
    id: str
    sender: str
    text: str
    timestamp: str
    citations: Optional[List[Citation]] = None
    suggestedActions: Optional[List[str]] = None

class ChatRequest(BaseModel):
    prompt: str
    employeeContextId: Optional[str] = None

class DraftLetterRequest(BaseModel):
    templateType: str
    recipientEmployeeId: str
    customParameters: Optional[Dict[str, Any]] = None

class DraftLetterResponse(BaseModel):
    deliverableId: str
    title: str
    generatedText: str
    status: str
