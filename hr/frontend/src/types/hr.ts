export type Priority = 'high' | 'medium' | 'low';
export type TicketStatus = 'open' | 'in_review' | 'resolved' | 'escalated';
export type Category =
  | 'payroll'
  | 'benefits'
  | 'leave'
  | 'documents'
  | 'compliance'
  | 'employee_relations'
  | 'reimbursement'
  | 'remote_work'
  | 'recruitment'
  | 'general_hr'
  | 'other';

export interface Employee {
  id: string;
  name: string;
  department: string;
  email: string;
  avatar: string;
  title?: string;
  tenure?: string;
}

export interface RequestComment {
  id: string;
  author: string;
  avatar?: string;
  text: string;
  time: string;
  isHr: boolean;
}

export interface TimelineEvent {
  title: string;
  desc: string;
  date: string;
  actor: string;
}

export interface RequestItem {
  id: string;
  title: string;
  employee: Employee;
  category: Category;
  priority: Priority;
  status: TicketStatus;
  waitingTime: string;
  createdAt: string;
  aiTriage: {
    confidence: number;
    classification: string;
    autoRouted: boolean;
  };
  triage?: TriageMetadata;
  description: string;
  resolutionNotes?: string;
  tags?: string[];
  timeline?: TimelineEvent[];
  comments?: RequestComment[];
  statusUpper?: string;
  attachmentName?: string;
  subject?: string;
  assignedTo?: string;
  assignedToId?: string;
  employeeId?: string;
  categoryDisplay?: string;
  department?: string;
  lastUpdated?: string;
}

export type TriageSensitivity = 'NORMAL' | 'SENSITIVE' | 'HIGHLY_SENSITIVE' | 'NEEDS_REVIEW';
export type TriagePriority = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
export type TriageStatus = 'PENDING' | 'ANALYZING' | 'TRIAGED' | 'NEEDS_REVIEW' | 'FAILED';

export interface TriageMetadata {
  category: string;
  categoryDisplay?: string;
  priority: TriagePriority;
  sensitivity: TriageSensitivity;
  confidence: number;
  relevantPolicy: string;
  suggestedAction: string;
  reason: string;
  status: TriageStatus;
  analyzedAt?: string;
  humanCategory?: string;
  humanPriority?: TriagePriority;
  overrideNotes?: string;
  overriddenBy?: string;
  overriddenAt?: string;
}

export interface AITriageItem {
  id: string;
  requestId: string;
  title: string;
  employeeName: string;
  predictedCategory: Category;
  confidenceScore: number;
  urgencyScore: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  sensitivity?: TriageSensitivity;
  relevantPolicy?: string;
  reasoning: string;
  suggestedAction: string;
  status: 'AUTO_ROUTED' | 'NEEDS_VERIFICATION' | 'OVERRIDDEN' | 'PENDING' | 'ANALYZING';
  timestamp: string;
  triage?: TriageMetadata;
}

export type DeliverableType =
  | 'HR Communication'
  | 'Case Summary'
  | 'Policy Analysis'
  | 'Compliance Checklist'
  | 'Employee Notice'
  | 'Investigation Summary'
  | 'HR Report'
  | 'Policy Comparison';

export type DeliverableStatus =
  | 'AI_GENERATED'
  | 'NEEDS_REVIEW'
  | 'EDITED'
  | 'READY'
  | 'SENT'
  | 'ARCHIVED';

export interface DeliverableItem {
  id: string;
  title: string;
  type: DeliverableType;
  status: DeliverableStatus;
  requestId?: string;
  employeeName?: string;
  department?: string;
  recipient?: string;
  subject?: string;
  content: string;
  contentPreview?: string;
  policySources?: Array<{ document: string; page?: number; excerpt?: string }>;
  createdBy?: string;
  createdAt: string;
  updatedAt?: string;
  generatedAt?: string;
  pdfUrl?: string;
  previewUrl?: string;
}

export interface HRActionItem {
  id: string;
  title: string;
  type: 'salary_adjustment' | 'leave_signoff' | 'role_transition' | 'equipment_offboard';
  employeeName: string;
  department: string;
  urgency: 'HIGH' | 'NORMAL';
  status: 'pending' | 'completed';
  timestamp: string;
  effectiveDate: string;
  summary: string;
}

export interface DashboardMetrics {
  openRequests: {
    count: number;
    changePercent: number;
    comparisonText: string;
  };
  highPriority: {
    count: number;
    requiresAttention: number;
  };
  pendingHRActions: {
    count: number;
    waitingOver24h: number;
  };
  slaCompliance: {
    percent: number;
    changePercent: number;
    targetPercent: number;
  };
  avgSla: string;
  resolvedOvernight: number;
  aiTriagedToday: number;
  aiAssistedCases: number;
  draftsGenerated: number;
}

export interface VelocityData {
  range: '7D' | '30D' | '90D';
  labels: string[];
  incoming: number[];
  resolved: number[];
  openTotal: number;
  receivedToday: number;
  resolvedToday: number;
}

export interface InsightItem {
  id: string;
  title: string;
  description: string;
  icon: string;
  type: 'info' | 'warning' | 'emerald' | 'cyan';
  changeText?: string;
  impact?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  suggestedRemediation?: string;
  relatedCategory?: string | null;
  relatedPolicy?: string;
}

export interface CategoryVolume {
  name: string;
  count: number;
  percent: number;
  colorGradient: string;
  barWidthPercent: number;
}

export interface ActivityEvent {
  id: string;
  actorType: 'ai' | 'user' | 'resolved';
  actorName: string;
  actionText: string;
  timeAgo: string;
  subText?: string;
  tag?: {
    text: string;
    color: 'rose' | 'cyan' | 'purple' | 'emerald';
  };
}

export interface CopilotMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  citations?: {
    title: string;
    section: string;
    page?: number;
  }[];
  suggestedActions?: string[];
  isError?: boolean;
  feedback?: 'up' | 'down';
  keyDetails?: {
    label: string;
    value: string;
  }[];
}

export type ReportType =
  | 'QUARTERLY_SLA_AUDIT'
  | 'POLICY_GROUNDING'
  | 'SENSITIVE_CASES'
  | 'LATENCY_VOLUME';

export type ReportStatus =
  | 'GENERATING'
  | 'VERIFIED & SIGNED'
  | 'DRAFT'
  | 'FAILED';

export interface ReportMetrics {
  totalCases: number;
  resolvedCases: number;
  openCases: number;
  highPriorityCases: number;
  sensitiveCases: number;
  slaApplicableCases: number;
  slaMet: number;
  slaBreached: number;
  slaResolvedWithin: number;
  slaResolvedBreached: number;
  slaOpenWithin: number;
  slaOpenBreached: number;
  slaComplianceRate: number;
  avgResolutionTimeHours: number;
  executiveSummary: string;
  categoryDistribution: Array<{
    category: string;
    categoryDisplay: string;
    count: number;
    percentage: number;
  }>;
  policyDistribution: Array<{
    policy: string;
    count: number;
  }>;
}

export interface ComplianceReportItem {
  id: string;
  name: string;
  standard: string;
  periodStart: string;
  periodEnd: string;
  periodLabel: string;
  generatedBy: string;
  generatedAt: string;
  status: ReportStatus;
  reportType: ReportType;
  integrityHash: string;
  metrics: ReportMetrics;
}

export interface InsightsTelemetry {
  horizon: '7D' | '30D' | '90D';
  kpis: {
    totalInbound: number;
    totalResolved: number;
    throughputRate: number;
    slaCompliance: number;
    mttrHours: number;
    mttrAiMinutes: number;
    aiDeflectionRate: number;
    triageAccuracy: number;
    draftAdoptionRate: number;
    hoursSaved: number;
    costSavings: number;
  };
  velocity: Array<{
    label: string;
    inflow: number;
    resolved: number;
    slaPercent: number;
    aiDeflected: number;
  }>;
  categories: Array<{
    category: string;
    name: string;
    count: number;
    percent: number;
    isThresholdExceeded: boolean;
  }>;
  dominantCategory: {
    category?: string;
    name: string;
    count: number;
    percent: number;
    isThresholdExceeded?: boolean;
  };
  slaCohorts: Array<{
    id: string;
    label: string;
    count: number;
    percent: number;
    color: string;
    textColor: string;
    description: string;
  }>;
  departments: Array<{
    dept: string;
    volume: number;
    resolved: number;
    adherence: number;
    avgTime: string;
    status: 'optimal' | 'within-sla' | 'warning' | 'critical';
  }>;
  latencyComparison: {
    manualHours: number;
    aiMinutes: number;
    reductionPercent: number;
  };
  insights: InsightItem[];
}

