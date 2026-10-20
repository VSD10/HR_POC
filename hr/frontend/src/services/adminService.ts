import { request, ApiError } from './apiClient';
import {
  AdminStats,
  AdminUser,
  AdminRole,
  AdminSettings,
  AuditLogResponse,
  AdminAuditLog
} from '../types/admin';

export const adminService = {
  /**
   * Fetch aggregated overview metrics and platform health
   */
  async getAdminStats(): Promise<AdminStats> {
    try {
      return await request<AdminStats>('/admin/stats');
    } catch (err: any) {
      console.error('[adminService] getAdminStats error:', err);
      throw err;
    }
  },

  /**
   * Fetch user directory with optional filtering and search
   */
  async getAdminUsers(params?: {
    search?: string;
    role?: string;
    status?: string;
    department?: string;
  }): Promise<AdminUser[]> {
    try {
      const query = new URLSearchParams();
      if (params?.search) query.append('search', params.search);
      if (params?.role && params.role !== 'all') query.append('role', params.role);
      if (params?.status && params.status !== 'all') query.append('status', params.status);
      if (params?.department && params.department !== 'all') query.append('department', params.department);

      const qs = query.toString();
      return await request<AdminUser[]>(`/admin/users${qs ? `?${qs}` : ''}`);
    } catch (err: any) {
      console.error('[adminService] getAdminUsers error:', err);
      throw err;
    }
  },

  /**
   * Create a new enterprise user
   */
  async createAdminUser(userData: {
    firstName?: string;
    lastName?: string;
    name?: string;
    email: string;
    department: string;
    role: string;
    roles?: string[];
    status?: 'active' | 'inactive';
  }): Promise<{ success: boolean; user: AdminUser }> {
    try {
      return await request<{ success: boolean; user: AdminUser }>('/admin/users', {
        method: 'POST',
        body: JSON.stringify(userData)
      });
    } catch (err: any) {
      console.error('[adminService] createAdminUser error:', err);
      throw err;
    }
  },

  /**
   * Update an existing user's credentials, role, or profile
   */
  async updateAdminUser(
    id: string,
    updates: Partial<AdminUser>
  ): Promise<{ success: boolean; user: AdminUser }> {
    try {
      return await request<{ success: boolean; user: AdminUser }>(`/admin/users/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(updates)
      });
    } catch (err: any) {
      console.error('[adminService] updateAdminUser error:', err);
      throw err;
    }
  },

  /**
   * Soft-delete/deactivate an account
   */
  async deactivateAdminUser(id: string): Promise<{ success: boolean; message: string; user: AdminUser }> {
    try {
      return await request<{ success: boolean; message: string; user: AdminUser }>(`/admin/users/${id}`, {
        method: 'DELETE'
      });
    } catch (err: any) {
      console.error('[adminService] deactivateAdminUser error:', err);
      throw err;
    }
  },

  /**
   * Fetch all system roles and their permission lists
   */
  async getAdminRoles(): Promise<AdminRole[]> {
    try {
      return await request<AdminRole[]>('/admin/roles');
    } catch (err: any) {
      console.error('[adminService] getAdminRoles error:', err);
      throw err;
    }
  },

  /**
   * Update permissions or description for a role
   */
  async updateRolePermissions(
    roleId: string,
    permissions: string[],
    description?: string
  ): Promise<{ success: boolean; role: AdminRole }> {
    try {
      return await request<{ success: boolean; role: AdminRole }>(`/admin/roles/${roleId}`, {
        method: 'PATCH',
        body: JSON.stringify({ permissions, description })
      });
    } catch (err: any) {
      console.error('[adminService] updateRolePermissions error:', err);
      throw err;
    }
  },

  /**
   * Fetch platform configuration, SLA thresholds, and feature toggles
   */
  async getAdminSettings(): Promise<AdminSettings> {
    try {
      return await request<AdminSettings>('/admin/settings');
    } catch (err: any) {
      console.error('[adminService] getAdminSettings error:', err);
      throw err;
    }
  },

  /**
   * Update platform configuration, SLA thresholds, and feature toggles
   */
  async updateAdminSettings(settings: Partial<AdminSettings>): Promise<{ success: boolean; settings: AdminSettings }> {
    try {
      return await request<{ success: boolean; settings: AdminSettings }>('/admin/settings', {
        method: 'PATCH',
        body: JSON.stringify(settings)
      });
    } catch (err: any) {
      console.error('[adminService] updateAdminSettings error:', err);
      throw err;
    }
  },

  /**
   * Fetch paginated audit trail logs
   */
  async getAdminAuditLogs(params?: {
    search?: string;
    action?: string;
    actor?: string;
    from?: string;
    to?: string;
    page?: number;
    limit?: number;
  }): Promise<AuditLogResponse> {
    try {
      const query = new URLSearchParams();
      if (params?.search) query.append('search', params.search);
      if (params?.action && params.action !== 'all') query.append('action', params.action);
      if (params?.actor && params.actor !== 'all') query.append('actor', params.actor);
      if (params?.from) query.append('from', params.from);
      if (params?.to) query.append('to', params.to);
      if (params?.page) query.append('page', String(params.page));
      if (params?.limit) query.append('limit', String(params.limit));

      const qs = query.toString();
      return await request<AuditLogResponse>(`/admin/audit-logs${qs ? `?${qs}` : ''}`);
    } catch (err: any) {
      console.error('[adminService] getAdminAuditLogs error:', err);
      throw err;
    }
  },

  /**
   * Assign or reassign an employee to a specific HR specialist
   */
  async assignEmployeeHr(
    employeeIdOrPayload: string | { employeeId: string; hrId: string; reason?: string },
    hrId?: string,
    reason?: string
  ): Promise<{ success: boolean; message: string; employee: any; assignment: any }> {
    try {
      const payload = typeof employeeIdOrPayload === 'object'
        ? employeeIdOrPayload
        : { employeeId: employeeIdOrPayload, hrId: hrId!, reason };
      return await request<{ success: boolean; message: string; employee: any; assignment: any }>('/admin/assign-hr', {
        method: 'POST',
        body: JSON.stringify(payload)
      });
    } catch (err: any) {
      console.error('[adminService] assignEmployeeHr error:', err);
      throw err;
    }
  },

  /**
   * Fetch all employee assignments across the organization
   */
  async getEmployeeAssignments(): Promise<any[]> {
    try {
      return await request<any[]>('/admin/assignments');
    } catch (err: any) {
      console.error('[adminService] getEmployeeAssignments error:', err);
      throw err;
    }
  },

  /**
   * Fetch assignment history audit trail
   */
  async getAssignmentHistory(params?: { employeeId?: string; hrId?: string }): Promise<any[]> {
    try {
      const query = new URLSearchParams();
      if (params?.employeeId) query.append('employeeId', params.employeeId);
      if (params?.hrId) query.append('hrId', params.hrId);
      const qs = query.toString();
      return await request<any[]>(`/admin/assignment-history${qs ? `?${qs}` : ''}`);
    } catch (err: any) {
      console.error('[adminService] getAssignmentHistory error:', err);
      throw err;
    }
  },

  /**
   * Fetch active HR specialists roster for dropdowns
   */
  async getActiveHrSpecialists(): Promise<any[]> {
    try {
      return await request<any[]>('/hr/active-specialists');
    } catch (err: any) {
      console.error('[adminService] getActiveHrSpecialists error:', err);
      throw err;
    }
  },

  /**
   * Fetch employees assigned to current HR specialist
   */
  async getAssignedEmployees(hrId?: string): Promise<any[]> {
    try {
      const query = new URLSearchParams();
      if (hrId) query.append('hrId', hrId);
      const qs = query.toString();
      return await request<any[]>(`/hr/assigned-employees${qs ? `?${qs}` : ''}`);
    } catch (err: any) {
      console.error('[adminService] getAssignedEmployees error:', err);
      throw err;
    }
  }
};

