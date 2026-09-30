from typing import List, Optional, Dict, Any
from pydantic import BaseModel

class MetricCount(BaseModel):
    count: int
    changePercent: Optional[float] = 0.0
    comparisonText: Optional[str] = ""

class HighPriorityMetric(BaseModel):
    count: int
    requiresAttention: int

class PendingActionMetric(BaseModel):
    count: int
    waitingOver24h: int

class SLAMetric(BaseModel):
    percent: float
    changePercent: float
    targetPercent: float

class NodeStatus(BaseModel):
    core: str = "OK"
    sla: str = "99.8%"
    triageAgent: str = "v3.4 Active"

class DashboardMetricsResponse(BaseModel):
    openRequests: MetricCount
    highPriority: HighPriorityMetric
    pendingHRActions: PendingActionMetric
    slaCompliance: SLAMetric
    avgSla: str
    resolvedOvernight: int
    aiTriagedToday: int
    aiAssistedCases: int
    draftsGenerated: int
    nodeStatus: Optional[NodeStatus] = None

class VelocityResponse(BaseModel):
    range: str
    labels: List[str]
    incoming: List[int]
    resolved: List[int]
    openTotal: int
    receivedToday: int
    resolvedToday: int

class ActivityEventResponse(BaseModel):
    id: str
    actorType: str  # 'ai' | 'user' | 'resolved'
    actorName: str
    actionText: str
    timeAgo: str
    subText: Optional[str] = None
    tag: Optional[Dict[str, str]] = None

class InsightItemResponse(BaseModel):
    id: str
    title: str
    description: str
    icon: Optional[str] = "trending_up"
    type: str = "info"  # info, warning, emerald
    changeText: Optional[str] = None
    severity: Optional[str] = None
    suggestedRemedy: Optional[str] = None

class CategoryVolumeResponse(BaseModel):
    name: str
    count: int
    percent: int
    colorGradient: Optional[str] = None
    barWidthPercent: Optional[int] = None
    color: Optional[str] = None
