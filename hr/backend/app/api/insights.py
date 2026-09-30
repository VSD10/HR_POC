from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.database import get_db
from app.models.request import Request
from app.schemas.dashboard import InsightItemResponse, CategoryVolumeResponse

router = APIRouter(prefix="/insights", tags=["Insights & Analytics"])

@router.get("/trends", response_model=List[InsightItemResponse])
def get_insight_trends():
    return [
        InsightItemResponse(
            id="INS-1",
            title="Payroll requests ↑ 23%",
            description="Increase in payroll-related requests over the last 30 days due to tax deduction queries.",
            icon="trending_up",
            type="info",
            changeText="+23% vs last month",
            severity="info",
            suggestedRemedy="Publish 2026 Q4 Tax Withholding FAQ"
        ),
        InsightItemResponse(
            id="INS-2",
            title="Leave requests taking longer",
            description="Resolution time is 31% above the HR average. Suggest updating self-service sabbatical guidelines.",
            icon="schedule",
            type="warning",
            changeText="Resolution +31% slower",
            severity="warning",
            suggestedRemedy="Activate Auto-Approve rule for leaves < 3 days"
        ),
        InsightItemResponse(
            id="INS-3",
            title="VOE Requests 100% Automated",
            description="Deliverable engine auto-signed 28 verification letters with zero compliance escalations.",
            icon="verified",
            type="emerald",
            changeText="99.4% SLA adherence",
            severity="info",
            suggestedRemedy="Maintain current automated policy"
        )
    ]

@router.get("/categories", response_model=List[CategoryVolumeResponse])
def get_category_volumes(db: Session = Depends(get_db)):
    # Group requests by category in DB
    category_counts = db.query(
        Request.category,
        func.count(Request.id)
    ).group_by(Request.category).all()

    color_map = {
        "payroll": ("linear-gradient(90deg, #06b6d4, #3b82f6)", "cyan"),
        "benefits": ("linear-gradient(90deg, #a855f7, #ec4899)", "purple"),
        "leave": ("linear-gradient(90deg, #10b981, #06b6d4)", "emerald"),
        "documents": ("linear-gradient(90deg, #3b82f6, #6366f1)", "blue"),
        "compliance": ("linear-gradient(90deg, #f59e0b, #ef4444)", "amber"),
        "other": ("linear-gradient(90deg, #64748b, #94a3b8)", "gray")
    }

    counts_dict = {cat: count for cat, count in category_counts}
    total = sum(counts_dict.values()) or 1

    predefined_cats = ["payroll", "benefits", "leave", "documents", "compliance", "other"]
    result = []
    for cat in predefined_cats:
        c = counts_dict.get(cat, 12 if cat in ["payroll", "benefits"] else 6)
        pct = max(1, int(round((c / (total + 30)) * 100)))
        gradient, color_name = color_map.get(cat, ("linear-gradient(90deg, #06b6d4, #3b82f6)", "cyan"))
        result.append(CategoryVolumeResponse(
            name=cat.capitalize(),
            count=c,
            percent=pct,
            colorGradient=gradient,
            barWidthPercent=min(pct * 2, 100),
            color=color_name
        ))
    return result
