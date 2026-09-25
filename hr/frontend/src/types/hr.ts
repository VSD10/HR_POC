export type Priority = 'high' | 'medium' | 'low';
export type TicketStatus = 'open' | 'in_review' | 'resolved' | 'escalated';
export type Category = 'payroll' | 'benefits' | 'leave' | 'documents' | 'compliance' | 'other';

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
  authorId?: string;
  author: string;
  avatar?: string;
  text: string;
  time: string;
  isHr: boolean;
}

export interface RequestItem {
  id: string;
  title: string;
  employeeId?: string;
  employee: Employee;
  assignedToId?: string;
  assignedTo?: string;
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
  description: string;
  resolutionNotes?: string;
  resolverName?: string;
  tags?: string[];
  timeline?: any[];
  comments?: RequestComment[];
  statusUpper?: string;
  attachmentName?: string;
  subject?: string;
  lastUpdated?: string;
  createdDate?: string;
}

export interface AITriageItem {
  id: string;
  requestId: string;
  title: string;
  employeeName: string;
  predictedCategory: Category;
  confidenceScore: number;
  urgencyScore: 'HIGH' | 'MEDIUM' | 'LOW';
  reasoning: string;
  suggestedAction: string;
  status: 'AUTO_ROUTED' | 'NEEDS_VERIFICATION' | 'OVERRIDDEN';
  timestamp: string;
}

export interface DeliverableItem {
  id: string;
  title: string;
  type: 'compensation_letter' | 'verification_of_employment' | 'sabbatical_approval' | 'policy_acknowledgement';
  employeeName: string;
  department: string;
  status: 'pending_approval' | 'approved' | 'dispatched';
  generatedAt: string;
  contentPreview: string;
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
  type: 'info' | 'warning' | 'emerald';
  changeText?: string;
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
}