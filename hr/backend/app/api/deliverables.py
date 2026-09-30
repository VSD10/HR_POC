from datetime import datetime, timezone
from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User, Employee
from app.models.deliverable import Deliverable
from app.models.audit import AuditLog
from app.schemas.deliverable import DeliverableResponse, DeliverableApproveResponse
from app.api.deps import get_current_user, require_roles

router = APIRouter(prefix="/deliverables", tags=["Deliverables & Documents"])

@router.get("", response_model=List[DeliverableResponse])
def get_deliverables(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(Deliverable)

    if current_user.role == "EMPLOYEE":
        emp = db.query(Employee).filter(
            (Employee.user_id == current_user.id) | (Employee.email == current_user.email)
        ).first()
        if emp:
            query = query.filter(Deliverable.employee_id == emp.id)
        else:
            return []

    items = query.order_by(Deliverable.created_at.desc()).all()
    results = []
    for d in items:
        emp_name = d.employee.full_name if d.employee else "Staff Member"
        dept = d.employee.department if d.employee else "General"
        results.append(DeliverableResponse(
            id=d.id,
            title=d.title,
            type=d.type,
            employeeName=emp_name,
            department=dept,
            status=d.status,
            generatedAt=d.created_at.isoformat() if d.created_at else datetime.now(timezone.utc).isoformat(),
            contentPreview=d.content[:160] + "..." if d.content and len(d.content) > 160 else d.content,
            previewUrl=d.file_path or f"/storage/deliverables/{d.id.lower()}.pdf"
        ))
    return results

@router.post("/{id}/approve", response_model=DeliverableApproveResponse)
def approve_deliverable(
    id: str,
    current_user: User = Depends(require_roles(["HR_ADMIN", "HR_SPECIALIST"])),
    db: Session = Depends(get_db)
):
    deliv = db.query(Deliverable).filter(Deliverable.id == id).first()
    if not deliv:
        raise HTTPException(status_code=404, detail="Deliverable not found")

    deliv.status = "approved"
    dispatched_time = datetime.now(timezone.utc).isoformat()

    db.add(AuditLog(
        entity_type="deliverable",
        entity_id=id,
        action="approved",
        actor_id=current_user.id,
        actor_name=current_user.name,
        metadata_json=f'{{"title": "{deliv.title}", "dispatchedAt": "{dispatched_time}"}}'
    ))
    db.commit()

    return DeliverableApproveResponse(
        status="APPROVED",
        dispatchedAt=dispatched_time
    )
