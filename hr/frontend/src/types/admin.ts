export interface SystemHealth {
  backendApi: 'HEALTHY' | 'DEGRADED' | 'DOWN' | 'UNKNOWN';
  database: 'CONNECTED' | 'DISCONNECTED' | 'DEGRADED' | 'UNKNOWN';
  sse: 'CONNECTED' | 'DISCONNECTED' | 'UNKNOWN';
  aiServices: 'AVAILABLE' | 'UNAVAILABLE' | 'DEGRADED' | 'UNKNOWN';
}

export interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  inactiveUsers: number;
  totalRequests: number;
  openRequests: number;
  resolvedRequests: number;
  slaCompliance: number;
  systemHealth: SystemHealth;
  recentActivity?: AdminAuditLog[];
  timestamp: string;
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  department: string;
  role: 'ADMIN' | 'HR_LEAD' | 'HR_SPECIALIST' | 'EMPLOYEE' | string;
  roles?: string[];
  systemRole?: 'ADMIN' | 'HR_LEAD' | 'HR_SPECIALIST' | 'EMPLOYEE';
  status: 'active' | 'inactive';
  createdDate: string;
  lastActivity: string;
  avatar?: string;
  avatarUrl?: string;
  isHr: boolean;
  title?: string;
  securityLevel?: number;
  tenure?: string;
  assignedHrId?: string;
  assignedHr?: {
    id: string;
    name: string;
    email?: string;
    department?: string;
    title?: string;
  };
}

export interface HrAssignmentRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  previousHrId: string | null;
  previousHrName: string | null;
  newHrId: string;
  newHrName: string;
  assignedById?: string;
  assignedByName?: string;
  assignedBy?: {
    id: string;
    name: string;
    role?: string;
  } | string;
  reason?: string;
  timestamp: string;
}

export interface EmployeeAssignmentItem {
  employeeId: string;
  employeeName: string;
  email: string;
  department: string;
  avatar?: string;
  assignedHrId?: string;
  assignedHr?: {
    id: string;
    name: string;
    email?: string;
    department?: string;
    title?: string;
  };
  openRequestsCount?: number;
}

export interface AdminRole {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  userCount: number;
  isSystem: boolean;
}

export interface SlaSettings {
  standardHours: number;
  highPriorityHours: number;
  sensitiveCaseHours: number;
}

export interface TicketCategorySetting {
  id: string;
  name: string;
  enabled: boolean;
}

export interface FeatureToggles {
  aiCopilot: boolean;
  aiTriage: boolean;
  reports: boolean;
  notifications: boolean;
  realtimeSse: boolean;
}

export interface AdminSettings {
  slaSettings: SlaSettings;
  ticketCategories: TicketCategorySetting[];
  featureToggles: FeatureToggles;
}

export interface AdminAuditLog {
  id: string;
  timestamp: string;
  actor: string;
  actorId: string;
  action: string;
  resource: string;
  resourceId: string;
  description: string;
  status: 'SUCCESS' | 'FAILED' | 'WARNING';
  ip?: string;
}

export interface AuditLogResponse {
  logs: AdminAuditLog[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export type AdminTab = 
  | 'dashboard' 
  | 'users' 
  | 'assignments'
  | 'roles' 
  | 'settings' 
  | 'audit-logs' 
  | 'ai-telemetry'
  | 'profile';
