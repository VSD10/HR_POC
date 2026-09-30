from typing import Optional
from pydantic import BaseModel

class DeliverableResponse(BaseModel):
    id: str
    title: str
    type: str
    employeeName: str
    department: Optional[str] = "General"
    status: str
    generatedAt: str
    contentPreview: Optional[str] = None
    previewUrl: Optional[str] = None

class DeliverableApproveResponse(BaseModel):
    status: str
    dispatchedAt: str
