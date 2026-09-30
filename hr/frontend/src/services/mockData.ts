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
    incoming: [16, 24, 28, 22, 34, 12, 19],
    resolved: [14, 21, 26, 20, 31, 11, 18],
    openTotal: 24,
    receivedToday: 19,
    resolvedToday: 18
  },
  '30D': {
    range: '30D',
    labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
    incoming: [82, 95, 118, 104],
    resolved: [78, 90, 112, 99],
    openTotal: 24,
    receivedToday: 19,
    resolvedToday: 18
  },
  '90D': {
    range: '90D',
    labels: ['Jul', 'Aug', 'Sep'],
    incoming: [320, 375, 412],
    resolved: [305, 360, 396],
    openTotal: 24,
    receivedToday: 19,
    resolvedToday: 18
  }
};

export const initialRequests: RequestItem[] = [];

export const initialTriageQueue: AITriageItem[] = [];

export const initialDeliverables: DeliverableItem[] = [
  {
    id: "DELIV-101",
    title: "Medical Leave Documentation Request & Entitlement Notice",
    type: "HR Communication",
    employeeName: "Maya Patel",
    department: "Design & Product",
    recipient: "maya.patel@enterprise.internal",
    subject: "Regarding Medical Leave & Dependent Documentation (REQ-1042)",
    status: "NEEDS_REVIEW",
    createdAt: new Date().toISOString(),
    content: "Dear Maya,\n\nThank you for reaching out regarding your medical leave request and dependent documentation. Under Article 6 of the Corporate Health & Leave Policy, medical absences exceeding three consecutive days require an authorized medical practitioner certificate.\n\nPlease upload the official certificate through the Employee Self-Service Portal within 5 business days so we can finalize your coverage.\n\nWarm regards,\nSarah Jenkins\nHR Operations Team",
    contentPreview: "Dear Maya, Thank you for reaching out regarding your medical leave request and dependent documentation..."
  },
  {
    id: "DELIV-102",
    title: "Remote Work Abroad & Cross-Border Compliance Analysis",
    type: "Policy Analysis",
    employeeName: "Alex Johnson",
    department: "Engineering",
    recipient: "alex.johnson@enterprise.internal",
    subject: "Compliance Assessment: Overseas Remote Work Schedule",
    status: "READY",
    createdAt: new Date().toISOString(),
    content: "### Policy Analysis: Remote Working Overseas (REQ-1037)\n\n**Case Overview:** Employee Alex Johnson requested 3 weeks of remote work from Spain during winter break.\n\n**Policy Evaluation:**\n- **Handbook Section 3.2 (International Remote Cadence):** Permits up to 20 business days per calendar year in eligible jurisdictions.\n- **Tax & Legal Risk:** Spain has a 30-day bilateral treaty grace period; 15 working days poses zero permanent establishment (PE) risk.\n- **Infrastructure Security:** Mandates hardware token VPN authentication.\n\n**Recommendation:** Approve remote work agreement with standard security stipulations.",
    contentPreview: "### Policy Analysis: Remote Working Overseas (REQ-1037)\n\nCase Overview: Employee Alex Johnson requested 3 weeks of remote work from Spain..."
  },
  {
    id: "DELIV-103",
    title: "Salary Revision Verification Letter for Home Loan",
    type: "Employee Notice",
    employeeName: "Rupam Sharma",
    department: "Product Engineering",
    recipient: "rupam.sharma@enterprise.org",
    subject: "Official Employment & Compensation Verification Letter (REQ-1029)",
    status: "SENT",
    createdAt: new Date().toISOString(),
    content: "To Whom It May Concern,\n\nThis letter certifies that Rupam Sharma is employed on a permanent, full-time basis as Lead Full-Stack Engineer at Enterprise Technologies. Current base compensation and active standing have been verified by HR Operations.\n\nSincerely,\nSarah Jenkins\nHR Operations Lead",
    contentPreview: "To Whom It May Concern, This letter certifies that Rupam Sharma is employed on a permanent, full-time basis..."
  },
  {
    id: "DELIV-104",
    title: "Overtime Allocation & Workload Disparity Investigation Summary",
    type: "Case Summary",
    employeeName: "David Chen",
    department: "Finance & Operations",
    recipient: "david.chen@enterprise.internal",
    subject: "Internal HR Case Summary: Workload Disparity Grievance",
    status: "NEEDS_REVIEW",
    createdAt: new Date().toISOString(),
    content: "### Confidential Investigation Summary: REQ-1014\n\n**Grievance:** Employee reported unequal overtime allocation during fiscal quarter-end close.\n\n**Findings:**\n1. Overtime records across the financial analysis team for Q3 show a 28% variance between team members.\n2. Workload scheduling was managed ad-hoc without rotation logs.\n\n**Proposed Remediation:**\n- Establish formalized rotation roster for month-end close.\n- HR Specialist Marcus Vance to facilitate a 1-on-1 alignment session.",
    contentPreview: "### Confidential Investigation Summary: REQ-1014\n\nGrievance: Employee reported unequal overtime allocation during fiscal quarter-end close..."
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
    id: "INS-201",
    title: "Medical Leave Documentation Lag",
    description: "32% of sick leave cases exceed 48h turnaround due to missing clinic practitioner slips.",
    icon: "alarm",
    type: "warning",
    changeText: "+14% delay vs last week",
    impact: "HIGH",
    suggestedRemediation: "Automate medical documentation checklist deliverable during employee intake.",
    relatedCategory: "leave",
    relatedPolicy: "Medical & Statutory Sick Leave Policy (Art. 6)"
  },
  {
    id: "INS-202",
    title: "Payroll Deductions Volume Spike",
    description: "Payroll tickets represent 38% of total case volume, exceeding normal threshold by 13%.",
    icon: "trending_up",
    type: "warning",
    changeText: "38% of volume",
    impact: "HIGH",
    suggestedRemediation: "Publish an automated tax withholding calculator and FAQ in the Employee Knowledge Hub.",
    relatedCategory: "payroll",
    relatedPolicy: "Compensation & Withholding Policy"
  },
  {
    id: "INS-203",
    title: "Parental Leave Policy Ambiguity",
    description: "Repetitive inquiries detected regarding parental leave carryover and primary caregiver eligibility.",
    icon: "auto_awesome",
    type: "cyan",
    changeText: "4 recurring cases",
    impact: "MEDIUM",
    suggestedRemediation: "Update Parental Leave FAQ section in Employee Handbook and enable self-service policy chatbot.",
    relatedCategory: "leave",
    relatedPolicy: "Global Parental & Caregiver Leave Guidelines"
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
