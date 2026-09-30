import uuid
from datetime import datetime, timezone
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import or_

from app.database import get_db
from app.models.user import User, Employee
from app.models.request import Request
from app.models.triage import TriageItem
from app.models.audit import AuditLog
from app.schemas.request import (
    RequestItemResponse, EmployeeSummary, AITriageSummary,
    RequestCreate, RequestReview, RequestListResponse
)
from app.api.deps import get_current_user, require_roles, require_employee
from app.ws.manager import ws_manager

router = APIRouter(prefix="/requests", tags=["Requests & Case Management"])

def map_request_to_response(req: Request) -> RequestItemResponse:
    emp = req.employee
    emp_summary = EmployeeSummary(
        id=emp.id if emp else "EMP-UNKNOWN",
        name=emp.full_name if emp else "Unknown Employee",
        department=emp.department if emp else "General",
        email=emp.email if emp else "unknown@enterprise.internal",
        avatar=emp.avatar_url if emp else None,
        title=emp.job_title if emp else None,
        tenure=emp.tenure if emp else None
    )

    triage = AITriageSummary(
        confidence=float(req.ai_confidence or 0.95),
        classification=req.ai_classification or "General Autonomous Routing",
        autoRouted=True
    )

    tags = [t.strip() for t in req.tags.split(",")] if req.tags else []

    return RequestItemResponse(
        id=req.id,
        title=req.title,
        employee=emp_summary,
        category=req.category,
        priority=req.priority,
        status=req.status,
        waitingTime=f"{req.waiting_minutes // 60}h {req.waiting_minutes % 60}m" if req.waiting_minutes else "Just now",
        createdAt=req.created_at.isoformat() if req.created_at else datetime.now(timezone.utc).isoformat(),
        aiTriage=triage,
        description=req.description or "",
        resolutionNotes=req.resolution_notes,
        tags=tags
    )

@router.get("", response_model=List[RequestItemResponse])
def get_requests(
    category: Optional[str] = Query(None),
    priority: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(Request).join(Employee, Request.employee_id == Employee.id)

    # RBAC filtering: EMPLOYEE only sees their own requests
    if current_user.role == "EMPLOYEE":
        emp = db.query(Employee).filter(Employee.user_id == current_user.id).first()
        if not emp:
            emp = db.query(Employee).filter(Employee.email == current_user.email).first()
        if emp:
            query = query.filter(Request.employee_id == emp.id)
        else:
            return []

    # Category filter
    if category and category != "all":
        query = query.filter(Request.category == category)

    # Priority filter
    if priority and priority != "all":
        query = query.filter(Request.priority == priority)

    # Status filter
    if status and status != "all":
        query = query.filter(Request.status == status)

    # Search filter
    if search:
        term = f"%{search.lower()}%"
        query = query.filter(
            or_(
                Request.title.ilike(term),
                Request.id.ilike(term),
                Request.description.ilike(term),
                Employee.first_name.ilike(term),
                Employee.last_name.ilike(term),
                Employee.email.ilike(term)
            )
        )

    requests = query.order_by(Request.created_at.desc()).all()
    return [map_request_to_response(r) for r in requests]

@router.get("/my", response_model=List[RequestItemResponse])
def get_my_requests(
    current_user: User = Depends(require_employee),
    db: Session = Depends(get_db)
):
    """Employee-only: returns only the authenticated employee's own requests."""
    emp = db.query(Employee).filter(
        or_(Employee.user_id == current_user.id, Employee.email == current_user.email)
    ).first()
    if not emp:
        return []
    reqs = db.query(Request).filter(
        Request.employee_id == emp.id
    ).order_by(Request.created_at.desc()).all()
    return [map_request_to_response(r) for r in reqs]

@router.post("", response_model=RequestItemResponse, status_code=status.HTTP_201_CREATED)
async def create_request(
    payload: RequestCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Determine employee ID
    target_emp_id = payload.employeeId
    if current_user.role == "EMPLOYEE" or not target_emp_id:
        emp = db.query(Employee).filter(
            or_(Employee.user_id == current_user.id, Employee.email == current_user.email)
        ).first()
        if emp:
            target_emp_id = emp.id
        else:
            # Create a default employee profile for this user if missing
            parts = current_user.name.split(" ", 1)
            emp = Employee(
                id=f"EMP-{uuid.uuid4().hex[:4].upper()}",
                first_name=parts[0],
                last_name=parts[1] if len(parts) > 1 else "",
                email=current_user.email,
                department="General",
                job_title=current_user.title or "Staff Member",
                avatar_url=current_user.avatar_url,
                user_id=current_user.id
            )
            db.add(emp)
            db.commit()
            target_emp_id = emp.id

    # Compute ticket count for sequential ID
    total_count = db.query(Request).count()
    new_id = f"HR-{1029 + total_count}"

    # AI Autonomous Triage Engine Inference
    desc_lower = (payload.description + " " + payload.title).lower()
    cat = payload.category or "other"
    ai_class = "Autonomous Intake & Classification"
    confidence = 0.95
    urgency = "MEDIUM"

    if any(k in desc_lower for k in ["bonus", "payroll", "salary", "paycheck", "w-2", "tax"]):
        cat = "payroll"
        ai_class = "Payroll Discrepancy & Compensation Adjustment"
        confidence = 0.98
        urgency = "HIGH"
    elif any(k in desc_lower for k in ["health", "insurance", "dependent", "dental", "vision", "benefit"]):
        cat = "benefits"
        ai_class = "Benefits Enrollment & Policy Coverage"
        confidence = 0.94
        urgency = "MEDIUM"
    elif any(k in desc_lower for k in ["sabbatical", "vacation", "leave", "pto", "parental", "sick"]):
        cat = "leave"
        ai_class = "Leave & Sabbatical Protocol Evaluation"
        confidence = 0.96
        urgency = "LOW"
    elif any(k in desc_lower for k in ["verification", "voe", "contract", "letter", "mortgage", "document"]):
        cat = "documents"
        ai_class = "Official HR Documentation & Certification"
        confidence = 0.99
        urgency = "LOW"

    new_req = Request(
        id=new_id,
        title=payload.title,
        description=payload.description,
        employee_id=target_emp_id,
        category=cat,
        priority=payload.priority or ("high" if urgency == "HIGH" else "medium"),
        status="open",
        ai_confidence=confidence,
        ai_classification=ai_class,
        waiting_minutes=0
    )
    db.add(new_req)
    db.commit()
    db.refresh(new_req)

    # Automatically add to Triage Queue
    emp = db.query(Employee).filter(Employee.id == target_emp_id).first()
    triage_id = f"TR-{882 + total_count}"
    triage_item = TriageItem(
        id=triage_id,
        request_id=new_id,
        title=payload.title,
        employee_name=emp.full_name if emp else "Staff Member",
        predicted_category=cat,
        confidence_score=confidence,
        urgency_score=urgency,
        reasoning=f"Autonomous scanner evaluated key intent phrases in query: '{payload.title[:40]}...'",
        suggested_action=f"Route case to Senior {cat.capitalize()} Specialist.",
        status="AUTO_ROUTED"
    )
    db.add(triage_item)

    # Add audit log
    db.add(AuditLog(
        entity_type="request",
        entity_id=new_id,
        action="created",
        actor_id=current_user.id,
        actor_name=current_user.name,
        metadata_json=f'{{"title": "{payload.title}", "category": "{cat}"}}'
    ))
    db.commit()

    resp = map_request_to_response(new_req)

    # Broadcast on WebSocket
    await ws_manager.broadcast("triage.incoming", {
        "requestId": new_id,
        "title": new_req.title,
        "category": new_req.category,
        "confidence": confidence,
        "priority": new_req.priority
    })

    return resp

@router.post("/{id}/review", response_model=RequestItemResponse)
async def review_request(
    id: str,
    payload: RequestReview,
    current_user: User = Depends(require_roles(["HR_ADMIN", "HR_SPECIALIST"])),
    db: Session = Depends(get_db)
):
    req = db.query(Request).filter(Request.id == id).first()
    if not req:
        raise HTTPException(status_code=404, detail="Request ticket not found")

    new_status = payload.status or ("resolved" if payload.action == "resolve" else "in_review")
    req.status = new_status
    if payload.notes:
        req.resolution_notes = payload.notes
    if payload.assigneeId:
        req.assigned_to = payload.assigneeId
    else:
        req.assigned_to = current_user.id

    if new_status == "resolved":
        req.resolved_at = datetime.now(timezone.utc)

    db.add(AuditLog(
        entity_type="request",
        entity_id=id,
        action=new_status,
        actor_id=current_user.id,
        actor_name=current_user.name,
        metadata_json=f'{{"notes": "{payload.notes}"}}'
    ))
    db.commit()
    db.refresh(req)

    await ws_manager.broadcast("request.updated", {
        "requestId": id,
        "status": new_status,
        "notes": payload.notes,
        "resolvedBy": current_user.name
    })

    return map_request_to_response(req)
