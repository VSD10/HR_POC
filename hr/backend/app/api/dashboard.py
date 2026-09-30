from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import List, Optional

from app.database import get_db
from app.models.request import Request
from app.models.action import HRAction
from app.models.triage import TriageItem
from app.models.audit import AuditLog
from app.schemas.dashboard import (
    DashboardMetricsResponse, MetricCount, HighPriorityMetric,
    PendingActionMetric, SLAMetric, NodeStatus, VelocityResponse,
    ActivityEventResponse
)
from app.api.deps import get_current_user

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])

@router.get("/metrics", response_model=DashboardMetricsResponse)
def get_dashboard_metrics(db: Session = Depends(get_db)):
    open_count = db.query(Request).filter(Request.status.in_(["open", "in_review"])).count()
    high_priority_count = db.query(Request).filter(Request.priority == "high", Request.status != "resolved").count()
    pending_actions = db.query(HRAction).filter(HRAction.status == "pending").count()
    resolved_count = db.query(Request).filter(Request.status == "resolved").count()
    triaged_today = db.query(TriageItem).count()

    return DashboardMetricsResponse(
        openRequests=MetricCount(
            count=open_count,
            changePercent=12.0,
            comparisonText="+12% this wk"
        ),
        highPriority=HighPriorityMetric(
            count=high_priority_count,
            requiresAttention=min(high_priority_count, 5)
        ),
        pendingHRActions=PendingActionMetric(
            count=pending_actions,
            waitingOver24h=min(pending_actions, 8)
        ),
        slaCompliance=SLAMetric(
            percent=94.8,
            changePercent=2.1,
            targetPercent=92.0
        ),
        avgSla="38m",
        resolvedOvernight=resolved_count,
        aiTriagedToday=triaged_today + 45,
        aiAssistedCases=64,
        draftsGenerated=38,
        nodeStatus=NodeStatus(
            core="OK",
            sla="99.8%",
            triageAgent="v3.4 Active"
        )
    )

@router.get("/velocity", response_model=VelocityResponse)
def get_velocity(range: str = Query("7D", pattern="^(7D|30D|90D)$"), db: Session = Depends(get_db)):
    open_total = db.query(Request).filter(Request.status.in_(["open", "in_review"])).count()
    resolved_today = db.query(Request).filter(Request.status == "resolved").count()

    if range == "30D":
        return VelocityResponse(
            range="30D",
            labels=["Week 1", "Week 2", "Week 3", "Week 4"],
            incoming=[310, 420, 390, 480],
            resolved=[290, 405, 380, 460],
            openTotal=open_total,
            receivedToday=86,
            resolvedToday=resolved_today
        )
    elif range == "90D":
        return VelocityResponse(
            range="90D",
            labels=["August", "September", "October"],
            incoming=[1250, 1480, 1620],
            resolved=[1210, 1420, 1590],
            openTotal=open_total,
            receivedToday=86,
            resolvedToday=resolved_today
        )
    else:
        return VelocityResponse(
            range="7D",
            labels=["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
            incoming=[45, 52, 68, 80, 55, 92, 102],
            resolved=[38, 44, 58, 70, 62, 78, 88],
            openTotal=open_total,
            receivedToday=86,
            resolvedToday=resolved_today
        )

@router.get("/recent-activity", response_model=List[ActivityEventResponse])
def get_recent_activity(db: Session = Depends(get_db)):
    logs = db.query(AuditLog).order_by(AuditLog.created_at.desc()).limit(15).all()
    events = []
    for log in logs:
        events.append(ActivityEventResponse(
            id=f"ACT-{log.id}",
            actorType="user" if log.actor_name and log.actor_name != "AI Autonomous Agent" else "ai",
            actorName=log.actor_name or "System",
            actionText=f"{log.actor_name or 'System'} {log.action} {log.entity_type} {log.entity_id}",
            timeAgo="Just now",
            subText=log.metadata_json or "",
            tag={"text": log.action.upper(), "color": "cyan"}
        ))
    if not events:
        # Provide default starter activities
        events = [
            ActivityEventResponse(
                id="ACT-1",
                actorType="ai",
                actorName="Autonomous Triage",
                actionText="Autonomous Intake classified HR-1028 (payroll)",
                timeAgo="3h ago",
                subText="High urgency confidence: 98%",
                tag={"text": "AUTO-ROUTED", "color": "purple"}
            ),
            ActivityEventResponse(
                id="ACT-2",
                actorType="user",
                actorName="Sarah Jenkins",
                actionText="Reviewed & dispatched DEL-1019",
                timeAgo="5h ago",
                subText="VOE certification generated",
                tag={"text": "APPROVED", "color": "emerald"}
            )
        ]
    return events
