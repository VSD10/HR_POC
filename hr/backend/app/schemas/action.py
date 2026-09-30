from typing import Optional, Dict, Any
from pydantic import BaseModel

class ActionResponse(BaseModel):
    id: str
    title: str
    type: str
    employeeName: str
    department: Optional[str] = "General"
    urgency: str
    status: str
    timestamp: str
    effectiveDate: str
    summary: str

class ActionExecuteRequest(BaseModel):
    actionType: Optional[str] = None
    targetEmployeeId: Optional[str] = None
    effectiveDate: Optional[str] = None
    parameters: Optional[Dict[str, Any]] = None

class ActionExecuteResponse(BaseModel):
    status: str
    transactionId: str
