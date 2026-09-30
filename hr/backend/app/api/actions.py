import uuid
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User, Employee
from app.models.action import HRAction
from app.models.audit import AuditLog
from app.schemas.action import ActionResponse, ActionExecuteRequest, ActionExecuteResponse
from app.api.deps import require_roles

router = APIRouter(prefix="/actions", tags=["Operational HR Actions"])

@router.get("", response_model=List[ActionResponse])
def get_actions(
    current_user: User = Depends(require_roles(["HR_ADMIN", "HR_SPECIALIST"])),
    db: Session = Depends(get_db)
):
    items = db.query(HRAction).order_by(HRAction.created_at.desc()).all()
    results = []
    for a in items:
        emp_name = a.employee.full_name if a.employee else "Staff Member"
        dept = a.employee.department if a.employee else "General"
        results.append(ActionResponse(
            id=a.id,
            title=a.title,
            type=a.type,
            employeeName=emp_name,
            department=dept,
            urgency=a.urgency,
            status=a.status,
            timestamp="Just now",
            effectiveDate=a.effective_date,
            summary=a.summary
        ))
    return results

@router.post("/{id}/execute", response_model=ActionResponse)
def execute_action_by_id(
    id: str,
    current_user: User = Depends(require_roles(["HR_ADMIN", "HR_SPECIALIST"])),
    db: Session = Depends(get_db)
):
    action = db.query(HRAction).filter(HRAction.id == id).first()
    if not action:
        raise HTTPException(status_code=404, detail="HR action not found")

    action.status = "completed"
    tx_id = f"TX-{uuid.uuid4().hex[:5].upper()}"

    db.add(AuditLog(
        entity_type="action",
        entity_id=id,
        action="executed",
        actor_id=current_user.id,
        actor_name=current_user.name,
        metadata_json=f'{{"txId": "{tx_id}", "action": "{action.title}"}}'
    ))
    db.commit()
    db.refresh(action)

    emp_name = action.employee.full_name if action.employee else "Staff Member"
    dept = action.employee.department if action.employee else "General"

    return ActionResponse(
        id=action.id,
        title=action.title,
        type=action.type,
        employeeName=emp_name,
        department=dept,
        urgency=action.urgency,
        status=action.status,
        timestamp="Just now",
        effectiveDate=action.effective_date,
        summary=action.summary
    )

@router.post("/execute", response_model=ActionExecuteResponse)
def execute_workflow(
    payload: ActionExecuteRequest,
    current_user: User = Depends(require_roles(["HR_ADMIN", "HR_SPECIALIST"])),
    db: Session = Depends(get_db)
):
    tx_id = f"TX-{uuid.uuid4().hex[:5].upper()}"
    db.add(AuditLog(
        entity_type="workflow",
        entity_id=tx_id,
        action="executed",
        actor_id=current_user.id,
        actor_name=current_user.name,
        metadata_json=f'{{"actionType": "{payload.actionType}", "targetEmployeeId": "{payload.targetEmployeeId}"}}'
    ))
    db.commit()

    return ActionExecuteResponse(
        status="COMPLETED",
        transactionId=tx_id
    )
