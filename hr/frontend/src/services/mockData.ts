import {
  DashboardMetrics,
  VelocityData,
  RequestItem,
  AITriageItem,
  DeliverableItem,
  HRActionItem,
  InsightItem,
  CategoryVolume,
  ActivityEvent,
  CopilotMessage
} from '../types/hr';

export const initialMetrics: DashboardMetrics = {
  openRequests: {
    count: 0,
    changePercent: 0,
    comparisonText: "0 open"
  },
  highPriority: {
    count: 0,
    requiresAttention: 0
  },
  pendingHRActions: {
    count: 0,
    waitingOver24h: 0
  },
  slaCompliance: {
    percent: 100.0,
    changePercent: 0,
    targetPercent: 92.0
  },
  avgSla: "0m",
  resolvedOvernight: 0,
  aiTriagedToday: 0,
  aiAssistedCases: 0,
  draftsGenerated: 0
};

export const velocityDataset: Record<'7D' | '30D' | '90D', VelocityData> = {
  '7D': {
    range: '7D',
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    incoming: [0, 0, 0, 0, 0, 0, 0],
    resolved: [0, 0, 0, 0, 0, 0, 0],
    openTotal: 0,
    receivedToday: 0,
    resolvedToday: 0
  },
  '30D': {
    range: '30D',
    labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
    incoming: [0, 0, 0, 0],
    resolved: [0, 0, 0, 0],
    openTotal: 0,
    receivedToday: 0,
    resolvedToday: 0
  },
  '90D': {
    range: '90D',
    labels: ['August', 'September', 'October'],
    incoming: [0, 0, 0],
    resolved: [0, 0, 0],
    openTotal: 0,
    receivedToday: 0,
    resolvedToday: 0
  }
};

export const initialRequests: RequestItem[] = [];

export const initialTriageQueue: AITriageItem[] = [];

export const initialDeliverables: DeliverableItem[] = [
  {
    id: "DEL-1024",
    title: "Alex Johnson - Q3 Retention Bonus Reconciliation Addendum",
    type: "compensation_letter",
    employeeName: "Alex Johnson",
    department: "Platform Engineering",
    status: "pending_approval",
    generatedAt: "Today, 08:30 AM",
    contentPreview: "Official confirmation of adjusted retention milestone payout of $5,000 to be reflected on November 1st payroll cycle with retroactive tax adjustment."
  },
  {
    id: "DEL-1021",
    title: "Priya Sharma - Cross-Border Dependent Health Rider Notice",
    type: "policy_acknowledgement",
    employeeName: "Priya Sharma",
    department: "Product Design",
    status: "pending_approval",
    generatedAt: "Today, 07:45 AM",
    contentPreview: "Underwriter acceptance document specifying supplemental dependent healthcare coverage terms across UK & EU locations effective Dec 1st."
  },
  {
    id: "DEL-1018",
    title: "Daniel Thomas - Sabbatical Carryover Exemption Letter",
    type: "sabbatical_approval",
    employeeName: "Daniel Thomas",
    department: "Data Infrastructure",
    status: "approved",
    generatedAt: "Today, 05:20 AM",
    contentPreview: "Formal notice approving a 6-month extension to utilize 12 accrued sabbatical days through June 30, 2027 due to production infrastructure release."
  },
  {
    id: "DEL-1015",
    title: "Marcus Vance - Standard Verification of Employment",
    type: "verification_of_employment",
    employeeName: "Marcus Vance",
    department: "Legal & Compliance",
    status: "dispatched",
    generatedAt: "Today, 01:12 AM",
    contentPreview: "Encrypted verifiable digital credential confirming current employment status, job title, and tenure sent directly to Chase Mortgage Underwriting."
  }
];

export const initialHRActions: HRActionItem[] = [
  {
    id: "ACT-841",
    title: "Approve Off-Cycle Payroll Adjustment",
    type: "salary_adjustment",
    employeeName: "Alex Johnson",
    department: "Platform Engineering",
    urgency: "HIGH",
    status: "pending",
    timestamp: "Waiting 3h 42m",
    effectiveDate: "Nov 01, 2026",
    summary: "Execute $5,000 bonus disbursement and retroactive tax withholding correction."
  },
  {
    id: "ACT-840",
    title: "Sign-off Cross-Border Dependent Rider",
    type: "leave_signoff",
    employeeName: "Priya Sharma",
    department: "Product Design",
    urgency: "NORMAL",
    status: "pending",
    timestamp: "Waiting 5h 12m",
    effectiveDate: "Dec 01, 2026",
    summary: "Validate legal guardianship certificate and authorize supplemental insurance premium tier."
  },
  {
    id: "ACT-839",
    title: "Approve Sabbatical Carry-Forward Exception",
    type: "leave_signoff",
    employeeName: "Daniel Thomas",
    department: "Data Infrastructure",
    urgency: "NORMAL",
    status: "pending",
    timestamp: "Waiting 7h 20m",
    effectiveDate: "Immediately",
    summary: "Grant 180-day grace period on 12 sabbatical days before forfeiture calculation."
  },
  {
    id: "ACT-838",
    title: "Execute Senior Staff Promotion Workflow",
    type: "role_transition",
    employeeName: "Elena Rostova",
    department: "AI Research",
    urgency: "HIGH",
    status: "pending",
    timestamp: "Waiting 1h 15m",
    effectiveDate: "Nov 15, 2026",
    summary: "Update job code to RES-L6, adjust equity tranche schedule, and notify department lead."
  }
];

export const initialInsights: InsightItem[] = [
  {
    id: "INS-1",
    title: "Payroll requests ↑ 23%",
    description: "Increase in payroll-related requests over the last 30 days due to tax deduction queries.",
    icon: "payments",
    type: "info",
    changeText: "+23% last 30d"
  },
  {
    id: "INS-2",
    title: "Leave requests taking longer",
    description: "Resolution time is 31% above the HR average. Suggest updating self-service sabbatical guidelines.",
    icon: "timelapse",
    type: "warning",
    changeText: "+31% resolution lag"
  },
  {
    id: "INS-3",
    title: "Insurance FAQ recurring",
    description: "Frequently repeated employee question on annual dental coverage limits.",
    icon: "quiz",
    type: "emerald",
    changeText: "82 query citations"
  }
];

export const initialCategoryVolumes: CategoryVolume[] = [
  {
    name: "Payroll",
    count: 42,
    percent: 32,
    colorGradient: "from-blue-500 to-cyan-400 shadow-[0_0_8px_#00f0ff]",
    barWidthPercent: 40
  },
  {
    name: "Benefits",
    count: 28,
    percent: 22,
    colorGradient: "from-purple-500 to-indigo-400 shadow-[0_0_8px_#a855f7]",
    barWidthPercent: 27
  },
  {
    name: "Leave & Attendance",
    count: 24,
    percent: 19,
    colorGradient: "from-emerald-500 to-teal-400 shadow-[0_0_8px_#10b981]",
    barWidthPercent: 23
  },
  {
    name: "Documents",
    count: 18,
    percent: 14,
    colorGradient: "bg-cyan-400",
    barWidthPercent: 17
  },
  {
    name: "Policy & Compliance",
    count: 14,
    percent: 11,
    colorGradient: "bg-amber-400",
    barWidthPercent: 13
  },
  {
    name: "Other",
    count: 8,
    percent: 6,
    colorGradient: "bg-white/30",
    barWidthPercent: 8
  }
];

export const initialActivities: ActivityEvent[] = [
  {
    id: "ACT-LOG-1",
    actorType: "ai",
    actorName: "HR AI Engine",
    actionText: "Intake pipeline active and listening",
    timeAgo: "Just now",
    subText: "Ready to triage incoming requests",
    tag: {
      text: "Online",
      color: "emerald"
    }
  }
];

export const initialCopilotMessages: CopilotMessage[] = [
  {
    id: "COP-1",
    sender: "assistant",
    text: "Hello Sarah. I am your HR AI Assistant grounded in enterprise policies, statutory labor laws, and live employee rosters. How can I assist you with operations today?",
    timestamp: "09:00 AM",
    suggestedActions: [
      "Review Alex Johnson's Q3 retention bonus addendum",
      "Check sabbatical carry-forward policy limits",
      "Draft Verification of Employment for Elena Rostova"
    ]
  }
];
