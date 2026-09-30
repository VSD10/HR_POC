import logging
from datetime import datetime, timezone, date
from sqlalchemy.orm import Session
from app.database import Base, engine
from app.models.user import User, Employee
from app.models.request import Request
from app.models.triage import TriageItem
from app.models.deliverable import Deliverable
from app.models.action import HRAction
from app.models.document import Document, DocumentEmbedding
from app.models.audit import AuditLog
from app.api.deps import get_password_hash

logger = logging.getLogger("hr_backend.seed")

def seed_database(db: Session):
    # Ensure tables exist
    Base.metadata.create_all(bind=engine)

    # Check if already seeded
    if db.query(User).first():
        logger.info("Database already seeded with initial data.")
        return

    logger.info("Seeding database with default enterprise users, tickets, and rules...")

    # 1. Users
    pw_hash = get_password_hash("SecretPassword123!")

    admin_user = User(
        id="usr_9410",
        name="Sarah Jenkins",
        email="sarah.jenkins@enterprise.internal",
        password_hash=pw_hash,
        role="HR_ADMIN",
        title="HR Operations Lead",
        avatar_url="https://lh3.googleusercontent.com/aida/AEtjO1Xtd_6Zzb5GlqZHxkO20YhGWUIh5W6zeXIQMhT-wo_XWwgwVuROluO2YbW2xoNMM9EX4rSJ9HfXVhPfo0-FHKC9ypn5YpZDfKfjsev9tVACXOmHmujbKFBPnxdIa0mK0Il1qM1GRlo1u2Phyfe_WS_DSjxP_VA-_CcPCooGoexaXN5JJnUeX6ce0c_p78M6YXoqa2h8-dvIVVZUElaP5exk5NPsZxfpbZryLSyTPFga3mLVWeRTcUTS_B0"
    )

    specialist_user = User(
        id="usr_9411",
        name="David Chen",
        email="david.chen@enterprise.internal",
        password_hash=pw_hash,
        role="HR_SPECIALIST",
        title="Senior Benefits Specialist",
        avatar_url="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80"
    )

    employee_alex = User(
        id="usr_410",
        name="Alex Johnson",
        email="alex.johnson@enterprise.internal",
        password_hash=pw_hash,
        role="EMPLOYEE",
        title="Senior Staff Engineer",
        avatar_url="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80"
    )

    employee_priya = User(
        id="usr_492",
        name="Priya Sharma",
        email="priya.sharma@enterprise.internal",
        password_hash=pw_hash,
        role="EMPLOYEE",
        title="Lead Product Designer",
        avatar_url="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=120&q=80"
    )

    db.add_all([admin_user, specialist_user, employee_alex, employee_priya])
    db.commit()

    # 2. Employees
    emp_alex = Employee(
        id="EMP-410",
        first_name="Alex",
        last_name="Johnson",
        email="alex.johnson@enterprise.internal",
        department="Platform Engineering",
        job_title="Senior Staff Engineer",
        hire_date=date(2021, 4, 15),
        tenure="3.5 years",
        avatar_url="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80",
        user_id="usr_410"
    )

    emp_priya = Employee(
        id="EMP-492",
        first_name="Priya",
        last_name="Sharma",
        email="priya.sharma@enterprise.internal",
        department="Product Design",
        job_title="Lead Product Designer",
        hire_date=date(2022, 9, 1),
        tenure="2.1 years",
        avatar_url="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=120&q=80",
        user_id="usr_492"
    )

    emp_daniel = Employee(
        id="EMP-388",
        first_name="Daniel",
        last_name="Thomas",
        email="daniel.t@enterprise.internal",
        department="Infrastructure",
        job_title="DevOps Lead",
        hire_date=date(2020, 2, 10),
        tenure="4.2 years",
        avatar_url="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&q=80"
    )

    emp_elena = Employee(
        id="EMP-512",
        first_name="Elena",
        last_name="Rostova",
        email="elena.r@enterprise.internal",
        department="Global Marketing",
        job_title="VP of Growth",
        hire_date=date(2019, 6, 20),
        tenure="5.0 years",
        avatar_url="https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=120&q=80"
    )

    emp_sarah = Employee(
        id="EMP-999",
        first_name="Sarah",
        last_name="Jenkins",
        email="sarah.jenkins@enterprise.internal",
        department="HR Operations",
        job_title="HR Operations Lead",
        hire_date=date(2018, 1, 1),
        tenure="6.0 years",
        avatar_url="https://lh3.googleusercontent.com/aida/AEtjO1Xtd_6Zzb5GlqZHxkO20YhGWUIh5W6zeXIQMhT-wo_XWwgwVuROluO2YbW2xoNMM9EX4rSJ9HfXVhPfo0-FHKC9ypn5YpZDfKfjsev9tVACXOmHmujbKFBPnxdIa0mK0Il1qM1GRlo1u2Phyfe_WS_DSjxP_VA-_CcPCooGoexaXN5JJnUeX6ce0c_p78M6YXoqa2h8-dvIVVZUElaP5exk5NPsZxfpbZryLSyTPFga3mLVWeRTcUTS_B0",
        user_id="usr_9410"
    )

    db.add_all([emp_alex, emp_priya, emp_daniel, emp_elena, emp_sarah])
    db.commit()

    # 3. Requests
    req1 = Request(
        id="HR-1028",
        title="Payroll discrepancy in Q3 retention bonus payment",
        description="October payslip reflects standard base but omits the agreed retention milestone payment documented in Addendum C. Requesting payroll reconciliation before the Nov 1 tax cut-off.",
        employee_id="EMP-410",
        category="payroll",
        priority="high",
        status="in_review",
        ai_confidence=0.98,
        ai_classification="Payroll Discrepancy / Bonus Adjustment",
        waiting_minutes=222,
        assigned_to="usr_9410",
        tags="Bonus,Addendum C,Withholding"
    )

    req2 = Request(
        id="HR-1025",
        title="Benefits eligibility: Dependent coverage under global plan",
        description="Inquiring if legal guardianship extension allows primary dependent enrollment under our European cross-border healthcare provider tier without underwriting waiting periods.",
        employee_id="EMP-492",
        category="benefits",
        priority="medium",
        status="in_review",
        ai_confidence=0.94,
        ai_classification="Health Insurance Tier Expansion",
        waiting_minutes=312,
        assigned_to="usr_9411",
        tags="Healthcare,Dependents,Cross-border"
    )

    req3 = Request(
        id="HR-1022",
        title="Sabbatical policy clarification for Q1 fellowship",
        description="Requesting pre-clearance for 60-day unpaid sabbatical fellowship in Zurich starting February 2027. Reviewing continuous service clauses.",
        employee_id="EMP-388",
        category="leave",
        priority="low",
        status="open",
        ai_confidence=0.96,
        ai_classification="Unpaid Leave / Sabbatical Governance",
        waiting_minutes=540,
        tags="Sabbatical,Fellowship,Leave"
    )

    req4 = Request(
        id="HR-1019",
        title="Employment verification letter for mortgage lender",
        description="Need certified verification of employment including bonus breakdown for residential mortgage underwriters.",
        employee_id="EMP-512",
        category="documents",
        priority="low",
        status="resolved",
        ai_confidence=0.99,
        ai_classification="Verification of Employment (VOE)",
        waiting_minutes=0,
        assigned_to="usr_9410",
        resolution_notes="Dispatched cryptographically stamped VOE PDF to employee on record.",
        tags="VOE,Mortgage,Certified"
    )

    db.add_all([req1, req2, req3, req4])
    db.commit()

    # 4. Triage Items
    triage1 = TriageItem(
        id="TR-881",
        request_id="HR-1028",
        title="Payroll discrepancy",
        employee_name="Alex Johnson",
        predicted_category="payroll",
        confidence_score=0.98,
        urgency_score="HIGH",
        reasoning="Detected missing Q3 retention milestone with specific contract addendum citation.",
        suggested_action="Route to Senior Payroll Specialist & run Compensation Comparison Tool.",
        status="AUTO_ROUTED"
    )

    triage2 = TriageItem(
        id="TR-880",
        request_id="HR-1025",
        title="Dependent coverage tier",
        employee_name="Priya Sharma",
        predicted_category="benefits",
        confidence_score=0.94,
        urgency_score="MEDIUM",
        reasoning="Legal guardianship extension across EU health provider networks.",
        suggested_action="Verify Hague Convention legal cert & initiate Cigna Global tier rider.",
        status="AUTO_ROUTED"
    )

    triage3 = TriageItem(
        id="TR-879",
        request_id="HR-1022",
        title="60-Day Unpaid Sabbatical",
        employee_name="Daniel Thomas",
        predicted_category="leave",
        confidence_score=0.96,
        urgency_score="LOW",
        reasoning="Tenure verified at 4.2 years (eligibility threshold: 3.0 yrs).",
        suggested_action="Pre-generate Section 6.4 Unpaid Leave agreement for VP sign-off.",
        status="AUTO_ROUTED"
    )

    db.add_all([triage1, triage2, triage3])
    db.commit()

    # 5. Deliverables
    del1 = Deliverable(
        id="DEL-1024",
        request_id="HR-1028",
        employee_id="EMP-410",
        title="October Retention Bonus Adjustment Letter",
        type="compensation_letter",
        status="pending_approval",
        content="This letter certifies that an off-cycle payroll delta of $3,500.00 will be remitted to Alex Johnson on the November 1 payroll run...",
        file_path="/storage/deliverables/del_1024.pdf"
    )

    del2 = Deliverable(
        id="DEL-1022",
        request_id="HR-1025",
        employee_id="EMP-492",
        title="Cross-Border Healthcare Coverage Rider",
        type="policy_acknowledgement",
        status="pending_approval",
        content="Primary dependent health rider agreement under European cross-border provider policy...",
        file_path="/storage/deliverables/del_1022.pdf"
    )

    del3 = Deliverable(
        id="DEL-1019",
        request_id="HR-1019",
        employee_id="EMP-512",
        title="Certified Employment & Income Verification",
        type="verification_of_employment",
        status="approved",
        content="To Whom It May Concern: This document confirms that Elena Rostova is employed full-time as VP of Growth...",
        file_path="/storage/deliverables/del_1019.pdf"
    )

    db.add_all([del1, del2, del3])
    db.commit()

    # 6. HR Actions
    act1 = HRAction(
        id="ACT-101",
        title="Adjust Off-Cycle Bonus Delta ($3,500)",
        type="salary_adjustment",
        employee_id="EMP-410",
        urgency="HIGH",
        status="pending",
        effective_date="2026-11-01",
        summary="Remits retention milestone delta under Addendum C before Nov cut-off."
    )

    act2 = HRAction(
        id="ACT-102",
        title="Approve Sabbatical Fellowship Rider (60 Days)",
        type="leave_signoff",
        employee_id="EMP-388",
        urgency="NORMAL",
        status="pending",
        effective_date="2027-02-01",
        summary="Unpaid research fellowship in Zurich. Health coverage sustained."
    )

    act3 = HRAction(
        id="ACT-103",
        title="Offboard Hardware & Security Tokens",
        type="equipment_offboard",
        employee_id="EMP-512",
        urgency="NORMAL",
        status="completed",
        effective_date="2026-10-20",
        summary="Device wiping and YubiKey revoke completed by IT SecOps."
    )

    db.add_all([act1, act2, act3])
    db.commit()

    # 7. Audit Log
    db.add(AuditLog(
        entity_type="system",
        entity_id="SYS-INIT",
        action="seed_completed",
        actor_id="usr_9410",
        actor_name="Sarah Jenkins",
        metadata_json='{"status": "initialized", "version": "3.4.0"}'
    ))
    db.commit()

    logger.info("Database seeding successfully completed!")
