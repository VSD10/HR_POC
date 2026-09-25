export type ScreenId =
  | 'dashboard'
  | 'ask-hr'
  | 'raise-request'
  | 'my-requests'
  | 'notifications'
  | 'knowledge-hub'
  | 'my-profile'
  | 'help-support'
  | 'help-and-support';

export type RequestCategory =
  | 'Leave & Time'
  | 'Payroll'
  | 'Documents'
  | 'Employee Info'
  | 'HR Policies';

export type RequestStatus = 'SUBMITTED' | 'IN PROGRESS' | 'RESOLVED' | 'REJECTED';

export type RequestPriority = 'Low' | 'Medium' | 'High' | 'Urgent';

export interface RequestTimelineEvent {
  date: string;
  title: string;
  desc: string;
  actor: string;
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

export interface HrRequest {
  id: string;
  employeeId?: string;
  employee?: {
    id: string;
    name: string;
    department?: string;
    email?: string;
    avatar?: string;
    title?: string;
  };
  assignedToId?: string;
  subject: string;
  category: RequestCategory;
  status: RequestStatus;
  lastUpdated: string;
  createdDate: string;
  priority: RequestPriority;
  description: string;
  assignedTo: string;
  timeline: RequestTimelineEvent[];
  comments: RequestComment[];
  attachmentName?: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  time: string;
  read: boolean;
  type: 'request' | 'policy' | 'info';
  requestId?: string;
}

export interface HolidayItem {
  id: string;
  dateNum: string;
  monthText: string;
  name: string;
  type: string;
  dayOfWeek: string;
  fullDate: string;
}

export interface LeaveBalance {
  casual: { remaining: number; total: number };
  sick: { remaining: number; total: number };
  earned: { remaining: number; total: number };
}

export interface PolicyItem {
  id: string;
  title: string;
  category: string;
  summary: string;
  content: string[];
  lastUpdated: string;
  readTime: string;
  image?: string;
  tag?: string;
  featured?: boolean;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  sources?: string[];
  actionPrompt?: {
    label: string;
    action: () => void;
  };
}