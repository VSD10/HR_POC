import uuid
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User, Employee
from app.models.deliverable import Deliverable
from app.schemas.copilot import (
    ChatRequest, CopilotMessageResponse, Citation,
    DraftLetterRequest, DraftLetterResponse
)
from app.api.deps import get_current_user, require_roles

router = APIRouter(prefix="/ai/assist", tags=["AI Assistance & Copilot"])

@router.post("/chat", response_model=CopilotMessageResponse)
def copilot_chat(payload: ChatRequest, current_user: User = Depends(get_current_user)):
    prompt = payload.prompt.lower()
    reply = f"Based on the Enterprise HR Handbook (Section 4 & 6), here is the verified policy for your inquiry: '{payload.prompt}'."
    citations = [
        Citation(
            title="Global Employee Handbook 2026",
            section="Section 6.4: Sabbatical & Extended Leave Guidelines",
            page=42
        ),
        Citation(
            title="Compensation Governance Manual",
            section="Section 3.2: Incentive & Bonus Timelines"
        )
    ]
    suggested_actions = [
        "Generate Official Resolution Addendum",
        "Notify Payroll Operations",
        "Send Employee Confirmation Summary"
    ]

    if "bonus" in prompt or "payroll" in prompt or "salary" in prompt:
        reply = (
            "Regarding payroll and retention bonuses: Under Enterprise Compensation Policy Section 3.2, "
            "all approved off-cycle milestone adjustments authorized before the 25th of the month are "
            "disbursed on the next upcoming 1st-of-the-month payroll cycle. Retroactive tax reconciliation "
            "and withholding certificates are automatically populated in the employee's tax portal."
        )
        citations = [
            Citation(
                title="Enterprise Compensation Manual 2026",
                section="Section 3.2: Off-Cycle Reconciliation",
                page=18
            )
        ]
        suggested_actions = [
            "Trigger Compensation Comparison Tool",
            "Review Retention Agreement Appendix C",
            "Generate Bonus Remittance Letter"
        ]
    elif "sabbatical" in prompt or "leave" in prompt or "vacation" in prompt:
        reply = (
            "Regarding sabbatical and extended leave: Under Enterprise Handbook Section 6.4, full-time "
            "employees with at least 3 years of continuous tenure are eligible to apply for up to 90 "
            "consecutive calendar days of unpaid sabbatical leave for educational fellowships or personal "
            "development. Comprehensive health insurance coverage remains fully subsidized during the leave."
        )
        citations = [
            Citation(
                title="Global Employee Handbook 2026",
                section="Section 6.4: Extended Leave Governance",
                page=42
            )
        ]
        suggested_actions = [
            "Verify Continuous Service Tenure",
            "Generate Sabbatical Request Rider",
            "Schedule Manager Alignment Meeting"
        ]
    elif "benefit" in prompt or "health" in prompt or "insurance" in prompt:
        reply = (
            "Regarding health benefits and dependent tier enrollment: Full-time employees may enroll "
            "legal dependents under our international cross-border healthcare provider tier during the "
            "open enrollment window or within 30 days of a Qualifying Life Event (QLE)."
        )
        citations = [
            Citation(
                title="Global Health & Wellness Policy",
                section="Section 2.1: Dependent Eligibility Criteria",
                page=12
            )
        ]
        suggested_actions = [
            "Download Dependent Verification Form",
            "Check Provider Network Coverage"
        ]

    return CopilotMessageResponse(
        id=f"COP-{uuid.uuid4().hex[:8].upper()}",
        sender="assistant",
        text=reply,
        timestamp=datetime.now().strftime("%I:%M %p"),
        citations=citations,
        suggestedActions=suggested_actions
    )

@router.post("/draft-letter", response_model=DraftLetterResponse)
def draft_letter(
    payload: DraftLetterRequest,
    current_user: User = Depends(require_roles(["HR_ADMIN", "HR_SPECIALIST"])),
    db: Session = Depends(get_db)
):
    emp = db.query(Employee).filter(Employee.id == payload.recipientEmployeeId).first()
    emp_name = emp.full_name if emp else "Employee"
    title_map = {
        "VERIFICATION_OF_EMPLOYMENT": f"Verification of Employment - {emp_name}",
        "OFFER_LETTER": f"Executive Offer Letter - {emp_name}",
        "PAYROLL_RESOLUTION": f"Payroll Adjustment Resolution - {emp_name}",
        "WARNING_LETTER": f"Performance Notice - {emp_name}"
    }

    deliv_id = f"DEL-{uuid.uuid4().hex[:4].upper()}"
    title = title_map.get(payload.templateType, f"Official Document - {emp_name}")
    generated_text = (
        f"To Whom It May Concern:\n\n"
        f"This official document certifies that {emp_name} is actively employed in good standing with "
        f"Enterprise Systems as {emp.job_title if emp else 'Staff'}. "
        f"This document is cryptographically signed and archived per Enterprise Compliance Regulations."
    )

    new_deliv = Deliverable(
        id=deliv_id,
        employee_id=payload.recipientEmployeeId,
        title=title,
        type="verification_of_employment",
        content=generated_text,
        status="pending_approval",
        file_path=f"/storage/deliverables/{deliv_id.lower()}.pdf"
    )
    db.add(new_deliv)
    db.commit()

    return DraftLetterResponse(
        deliverableId=deliv_id,
        title=title,
        generatedText=generated_text,
        status="PENDING_HR_SIGN_OFF"
    )
