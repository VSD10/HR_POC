import React, { useState, useEffect, useMemo } from 'react';
import { adminService } from '../../services/adminService';
import { AdminUser, HrAssignmentRecord } from '../../types/admin';
import { AdminDataTable, Column } from './AdminDataTable';
import { SearchFilterBar, FilterGroup } from './SearchFilterBar';
import { AdminModal } from './AdminModal';
import { AdminConfirmDialog } from './AdminConfirmDialog';
import { useAdminToast } from './AdminToast';
import { useAuth } from '../../context/AuthContext';
import {
  UserPlus,
  Edit2,
  UserX,
  UserCheck,
  Eye,
  Shield,
  Mail,
  Building,
  RefreshCw,
  Loader2,
  CheckCircle2,
  AlertCircle,
  History,
  UserCog,
  ArrowRight
} from 'lucide-react';

export const UserManagement: React.FC = () => {
  const { user: currentUser } = useAuth();
  const { showToast } = useAdminToast();

  const [users, setUsers] = useState<AdminUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Search and Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [deptFilter, setDeptFilter] = useState('all');

  // Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);

  // HR Assignment States
  const [hrSpecialists, setHrSpecialists] = useState<any[]>([]);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [employeeToAssign, setEmployeeToAssign] = useState<AdminUser | null>(null);
  const [targetHrId, setTargetHrId] = useState<string>('');
  const [reassignReason, setReassignReason] = useState<string>('');
  const [isSavingAssignment, setIsSavingAssignment] = useState(false);

  // Assignment History States
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [assignmentHistoryList, setAssignmentHistoryList] = useState<HrAssignmentRecord[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  // Deactivate Confirm State
  const [userToDeactivate, setUserToDeactivate] = useState<AdminUser | null>(null);
  const [isDeactivating, setIsDeactivating] = useState(false);

  // Form states for Add / Edit
  const [formFirstName, setFormFirstName] = useState('');
  const [formLastName, setFormLastName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formDepartment, setFormDepartment] = useState('Operations');
  const [formRole, setFormRole] = useState<'ADMIN' | 'HR_LEAD' | 'HR_SPECIALIST' | 'EMPLOYEE'>('EMPLOYEE');
  const [formRoles, setFormRoles] = useState<string[]>(['EMPLOYEE']);
  const [formStatus, setFormStatus] = useState<'active' | 'inactive'>('active');
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchUsers = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await adminService.getAdminUsers();
      setUsers(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch user directory');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Filter options derived from actual data
  const departments = useMemo(() => {
    const set = new Set<string>();
    users.forEach((u) => u.department && set.add(u.department));
    return Array.from(set);
  }, [users]);

  const filterGroups: FilterGroup[] = [
    {
      id: 'role',
      label: 'Role',
      value: roleFilter,
      onChange: setRoleFilter,
      options: [
        { label: 'All Roles', value: 'all' },
        { label: 'Admin', value: 'ADMIN' },
        { label: 'HR Lead', value: 'HR_LEAD' },
        { label: 'HR Specialist', value: 'HR_SPECIALIST' },
        { label: 'Employee', value: 'EMPLOYEE' }
      ]
    },
    {
      id: 'status',
      label: 'Status',
      value: statusFilter,
      onChange: setStatusFilter,
      options: [
        { label: 'All Statuses', value: 'all' },
        { label: 'Active', value: 'active' },
        { label: 'Inactive', value: 'inactive' }
      ]
    },
    {
      id: 'department',
      label: 'Department',
      value: deptFilter,
      onChange: setDeptFilter,
      options: [
        { label: 'All Departments', value: 'all' },
        ...departments.map((d) => ({ label: d, value: d }))
      ]
    }
  ];

  // Client-side filtering for fast responsive UI
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matchesName = (u.name || '').toLowerCase().includes(q);
        const matchesEmail = (u.email || '').toLowerCase().includes(q);
        const matchesId = (u.id || '').toLowerCase().includes(q);
        if (!matchesName && !matchesEmail && !matchesId) return false;
      }
      if (roleFilter !== 'all') {
        const uRole = (u.role || '').toUpperCase();
        const uSys = (u.systemRole || '').toUpperCase();
        if (uRole !== roleFilter && uSys !== roleFilter) return false;
      }
      if (statusFilter !== 'all' && u.status !== statusFilter) {
        return false;
      }
      if (deptFilter !== 'all' && u.department !== deptFilter) {
        return false;
      }
      return true;
    });
  }, [users, searchQuery, roleFilter, statusFilter, deptFilter]);

  // Handlers for Add User
  const openAddModal = () => {
    setFormFirstName('');
    setFormLastName('');
    setFormEmail('');
    setFormDepartment('Operations');
    setFormRole('EMPLOYEE');
    setFormRoles(['EMPLOYEE']);
    setFormStatus('active');
    setFormError(null);
    setIsAddModalOpen(true);
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const name = `${formFirstName.trim()} ${formLastName.trim()}`.trim();
    if (!name) {
      setFormError('Please provide first and last name.');
      return;
    }
    if (!formEmail || !formEmail.includes('@') || !formEmail.includes('.')) {
      setFormError('Please enter a valid email address.');
      return;
    }

    const assignedRoles = formRoles.length > 0 ? formRoles : [formRole];
    const primaryRole = (assignedRoles[0] as any) || formRole;

    setIsSubmitting(true);
    try {
      const res = await adminService.createAdminUser({
        name,
        email: formEmail.trim().toLowerCase(),
        department: formDepartment,
        role: primaryRole,
        roles: assignedRoles,
        status: formStatus
      });
      showToast(`User ${res.user.name} created successfully with roles: ${assignedRoles.join(', ')}.`, 'success');
      setIsAddModalOpen(false);
      fetchUsers();
    } catch (err: any) {
      setFormError(err.message || 'Unable to create user.');
      showToast(err.message || 'Failed to create user.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handlers for Edit User
  const openEditModal = (user: AdminUser) => {
    setSelectedUser(user);
    const parts = (user.name || '').split(' ');
    setFormFirstName(parts[0] || '');
    setFormLastName(parts.slice(1).join(' ') || '');
    setFormEmail(user.email || '');
    setFormDepartment(user.department || 'Operations');
    setFormRole((user.role as any) || (user.systemRole as any) || 'EMPLOYEE');
    setFormRoles(Array.isArray(user.roles) && user.roles.length > 0 ? user.roles : [(user.role as any) || 'EMPLOYEE']);
    setFormStatus(user.status || 'active');
    setFormError(null);
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    setFormError(null);

    const name = `${formFirstName.trim()} ${formLastName.trim()}`.trim();
    if (!name) {
      setFormError('Name is required.');
      return;
    }
    if (!formEmail.includes('@')) {
      setFormError('Valid email is required.');
      return;
    }

    const assignedRoles = formRoles.length > 0 ? formRoles : [formRole];
    const primaryRole = (assignedRoles[0] as any) || formRole;

    setIsSubmitting(true);
    try {
      const res = await adminService.updateAdminUser(selectedUser.id, {
        name,
        email: formEmail.trim().toLowerCase(),
        department: formDepartment,
        role: primaryRole,
        roles: assignedRoles,
        status: formStatus
      });
      showToast(`User ${res.user.name} updated successfully with roles: ${assignedRoles.join(', ')}.`, 'success');
      setIsEditModalOpen(false);
      fetchUsers();
    } catch (err: any) {
      setFormError(err.message || 'Unable to update user.');
      showToast(err.message || 'Failed to update user.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handlers for Deactivate User
  const handleConfirmDeactivate = async () => {
    if (!userToDeactivate) return;
    setIsDeactivating(true);
    try {
      await adminService.deactivateAdminUser(userToDeactivate.id);
      showToast(`User ${userToDeactivate.name} has been deactivated.`, 'warning');
      setUserToDeactivate(null);
      fetchUsers();
    } catch (err: any) {
      showToast(err.message || 'Failed to deactivate user.', 'error');
    } finally {
      setIsDeactivating(false);
    }
  };

  // Handler for Reactivate User
  const handleReactivate = async (u: AdminUser) => {
    try {
      await adminService.updateAdminUser(u.id, { status: 'active' });
      showToast(`User ${u.name} has been reactivated.`, 'success');
      fetchUsers();
    } catch (err: any) {
      showToast(err.message || 'Failed to activate user.', 'error');
    }
  };

  // Handlers for HR Assignment
  const openAssignModal = async (emp: AdminUser) => {
    setEmployeeToAssign(emp);
    setTargetHrId(emp.assignedHrId || '');
    setReassignReason('');
    setIsAssignModalOpen(true);
    try {
      const specialists = await adminService.getActiveHrSpecialists();
      setHrSpecialists(specialists);
      if (!emp.assignedHrId && specialists.length > 0) {
        setTargetHrId(specialists[0].id);
      }
    } catch (err) {
      console.error('Failed to load HR specialists', err);
    }
  };

  const handleAssignSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!employeeToAssign || !targetHrId) return;

    setIsSavingAssignment(true);
    try {
      await adminService.assignEmployeeHr({
        employeeId: employeeToAssign.id,
        hrId: targetHrId,
        reason: reassignReason || 'Administrative reassignment'
      });
      showToast(`Employee ${employeeToAssign.name} reassigned to new HR specialist successfully.`, 'success');
      setIsAssignModalOpen(false);
      setEmployeeToAssign(null);
      fetchUsers();
    } catch (err: any) {
      showToast(err.message || 'Failed to reassign HR specialist', 'error');
    } finally {
      setIsSavingAssignment(false);
    }
  };

  const openHistoryModal = async () => {
    setIsHistoryModalOpen(true);
    setIsLoadingHistory(true);
    try {
      const history = await adminService.getAssignmentHistory();
      setAssignmentHistoryList(history);
    } catch (err: any) {
      showToast(err.message || 'Failed to load assignment history', 'error');
    } finally {
      setIsLoadingHistory(false);
    }
  };

  // Table Columns Definition
  const columns: Column<AdminUser>[] = [
    {
      key: 'id',
      header: 'User ID',
      sortable: true,
      className: 'font-mono text-violet-400 font-semibold',
      render: (u) => (
        <span className="px-2 py-0.5 rounded-md bg-violet-500/10 border border-violet-500/20 text-[11px]">
          {u.id}
        </span>
      )
    },
    {
      key: 'name',
      header: 'Name & Email',
      sortable: true,
      render: (u) => (
        <div className="flex items-center gap-3">
          <img
            src={u.avatarUrl || u.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80'}
            alt={u.name}
            className="w-8 h-8 rounded-xl object-cover ring-1 ring-slate-700 dark:ring-white/10"
          />
          <div className="min-w-0">
            <span className="font-bold text-slate-900 dark:text-white block truncate">
              {u.name}
            </span>
            <span className="text-[11px] text-slate-400 font-mono truncate block">
              {u.email}
            </span>
          </div>
        </div>
      )
    },
    {
      key: 'department',
      header: 'Department',
      sortable: true,
      render: (u) => (
        <span className="text-slate-600 dark:text-slate-300 font-medium">
          {u.department}
        </span>
      )
    },
    {
      key: 'role',
      header: 'Assigned Roles',
      sortable: true,
      render: (u) => {
        const rolesList = Array.isArray(u.roles) && u.roles.length > 0
          ? u.roles
          : [u.role || u.systemRole || 'EMPLOYEE'];

        return (
          <div className="flex flex-wrap gap-1">
            {rolesList.map((r) => {
              const roleKey = String(r).toUpperCase();
              const badgeClass = {
                ADMIN: 'bg-violet-500/15 text-violet-300 border-violet-400/40',
                HR_LEAD: 'bg-indigo-500/15 text-indigo-300 border-indigo-400/40',
                HR_SPECIALIST: 'bg-cyan-500/15 text-cyan-300 border-cyan-400/40',
                EMPLOYEE: 'bg-emerald-500/15 text-emerald-300 border-emerald-400/30'
              }[roleKey] || 'bg-slate-500/15 text-slate-300 border-slate-400/30';

              return (
                <span
                  key={roleKey}
                  className={`px-2 py-0.5 rounded-full text-[9px] font-mono font-bold border tracking-wider ${badgeClass}`}
                >
                  {roleKey}
                </span>
              );
            })}
          </div>
        );
      }
    },
    {
      key: 'assignedHr',
      header: 'Assigned HR Specialist',
      sortable: true,
      render: (u) => {
        const isEmployee = (u.role === 'EMPLOYEE' || u.systemRole === 'EMPLOYEE' || (Array.isArray(u.roles) && u.roles.includes('EMPLOYEE')));
        if (!isEmployee) {
          return <span className="text-slate-500 text-xs italic">—</span>;
        }
        return (
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-medium flex items-center gap-1.5">
              <UserCog className="w-3.5 h-3.5 text-indigo-400" />
              {typeof u.assignedHr === 'object' && u.assignedHr ? (u.assignedHr as any).name : (u.assignedHr || 'Unassigned')}
            </span>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                openAssignModal(u);
              }}
              className="px-2 py-0.5 rounded-md bg-violet-600/20 hover:bg-violet-600/30 text-violet-300 border border-violet-500/30 hover:border-violet-500/50 transition-colors text-[10px] font-semibold cursor-pointer"
              title="Change assigned HR"
            >
              Reassign
            </button>
          </div>
        );
      }
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (u) => (
        <span
          className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold border flex items-center gap-1.5 w-max ${
            u.status === 'active'
              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
              : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
          }`}
        >
          <span className={`w-1.5 h-1.5 rounded-full ${u.status === 'active' ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'}`} />
          {u.status === 'active' ? 'ACTIVE' : 'INACTIVE'}
        </span>
      )
    },
    {
      key: 'createdDate',
      header: 'Joined',
      sortable: true,
      render: (u) => (
        <span className="text-[11px] font-mono text-slate-400">
          {u.createdDate ? new Date(u.createdDate).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' }) : 'Jan 15, 2024'}
        </span>
      )
    },
    {
      key: 'actions',
      header: 'Actions',
      className: 'text-right',
      headerClassName: 'text-right',
      render: (u) => {
        const isSelf = currentUser?.id === u.id || u.id === 'HR001';
        return (
          <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
            {/* View Details */}
            <button
              type="button"
              onClick={() => {
                setSelectedUser(u);
                setIsViewModalOpen(true);
              }}
              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
              title="View User Details"
            >
              <Eye className="w-3.5 h-3.5" />
            </button>

            {/* Edit User */}
            <button
              type="button"
              onClick={() => openEditModal(u)}
              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-violet-400 hover:text-violet-300 transition-colors cursor-pointer"
              title="Edit User &amp; Role"
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>

            {/* Deactivate / Reactivate */}
            {u.status === 'active' ? (
              <button
                type="button"
                onClick={() => setUserToDeactivate(u)}
                disabled={isSelf}
                className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition-colors cursor-pointer disabled:opacity-30 disabled:pointer-events-none"
                title={isSelf ? 'Cannot deactivate primary or self admin account' : 'Deactivate user'}
              >
                <UserX className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => handleReactivate(u)}
                className="p-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 transition-colors cursor-pointer"
                title="Reactivate user"
              >
                <UserCheck className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        );
      }
    }
  ];

  return (
    <div className="flex flex-col gap-4">
      {/* Top Controls Bar */}
      <SearchFilterBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        placeholder="Search users by name, email, or user ID..."
        filters={filterGroups}
        actions={
          <>
            <button
              type="button"
              onClick={openHistoryModal}
              className="h-10 px-3.5 rounded-xl bg-white/5 hover:bg-white/10 border border-slate-700/60 dark:border-white/10 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-2 cursor-pointer shadow-sm transition-all"
              title="View HR Assignment Audit Log"
            >
              <History className="w-3.5 h-3.5 text-violet-400" />
              <span>Assignment History</span>
            </button>
            <button
              type="button"
              onClick={fetchUsers}
              className="h-10 px-3 rounded-xl bg-white/5 hover:bg-white/10 border border-slate-700/60 dark:border-white/10 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-sm transition-all"
              title="Refresh users"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={openAddModal}
              className="h-10 px-4 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold flex items-center gap-2 cursor-pointer shadow-lg shadow-violet-950/50 transition-all flex-shrink-0"
            >
              <UserPlus className="w-4 h-4" />
              <span>Add User</span>
            </button>
          </>
        }
      />

      {/* Users Data Table */}
      <AdminDataTable
        columns={columns}
        data={filteredUsers}
        keyExtractor={(u) => u.id}
        isLoading={isLoading}
        error={error}
        emptyMessage="No users match the selected search or filter criteria."
        pageSize={10}
        onRowClick={(u) => {
          setSelectedUser(u);
          setIsViewModalOpen(true);
        }}
      />

      {/* ---------------------------------------------------- */}
      {/* ADD USER MODAL */}
      {/* ---------------------------------------------------- */}
      <AdminModal
        isOpen={isAddModalOpen}
        onClose={() => !isSubmitting && setIsAddModalOpen(false)}
        title="Add New Enterprise User"
        subtitle="Provision a new employee, specialist, or administrator account"
        size="md"
        footer={
          <>
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              disabled={isSubmitting}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleAddSubmit}
              disabled={isSubmitting}
              className="px-5 py-2 rounded-xl text-xs font-bold bg-violet-600 hover:bg-violet-500 text-white shadow-lg shadow-violet-950/50 flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>Create User</span>
            </button>
          </>
        }
      >
        <form onSubmit={handleAddSubmit} className="space-y-4">
          {formError && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-mono text-slate-400 block mb-1">FIRST NAME *</label>
              <input
                type="text"
                required
                value={formFirstName}
                onChange={(e) => setFormFirstName(e.target.value)}
                placeholder="Jane"
                className="w-full h-10 px-3 rounded-xl bg-white/5 border border-white/15 focus:border-violet-500 text-xs text-white outline-none"
              />
            </div>
            <div>
              <label className="text-[11px] font-mono text-slate-400 block mb-1">LAST NAME *</label>
              <input
                type="text"
                required
                value={formLastName}
                onChange={(e) => setFormLastName(e.target.value)}
                placeholder="Doe"
                className="w-full h-10 px-3 rounded-xl bg-white/5 border border-white/15 focus:border-violet-500 text-xs text-white outline-none"
              />
            </div>
          </div>

          <div>
            <label className="text-[11px] font-mono text-slate-400 block mb-1">EMAIL ADDRESS *</label>
            <input
              type="email"
              required
              value={formEmail}
              onChange={(e) => setFormEmail(e.target.value)}
              placeholder="jane.doe@enterprise.internal"
              className="w-full h-10 px-3 rounded-xl bg-white/5 border border-white/15 focus:border-violet-500 text-xs text-white outline-none font-mono"
            />
          </div>

          <div>
            <label className="text-[11px] font-mono text-slate-400 block mb-1">DEPARTMENT *</label>
            <input
              type="text"
              required
              value={formDepartment}
              onChange={(e) => setFormDepartment(e.target.value)}
              placeholder="HR Operations, Engineering, etc."
              className="w-full h-10 px-3 rounded-xl bg-white/5 border border-white/15 focus:border-violet-500 text-xs text-white outline-none"
            />
          </div>

          <div>
            <label className="text-[11px] font-mono text-slate-400 block mb-1.5">ASSIGNED ROLES (MULTI-ROLE SUPPORT) *</label>
            <div className="grid grid-cols-2 gap-2 p-2.5 rounded-xl bg-black/40 border border-white/15">
              {[
                { id: 'ADMIN', label: 'Admin (Full Management)' },
                { id: 'EMPLOYEE', label: 'Employee (Self-Service)' },
                { id: 'HR_LEAD', label: 'HR Lead (Ops & Triage)' },
                { id: 'HR_SPECIALIST', label: 'HR Specialist (Tickets)' }
              ].map((r) => {
                const isChecked = formRoles.includes(r.id);
                return (
                  <label key={r.id} className="flex items-center gap-2 cursor-pointer text-xs p-1.5 rounded-lg hover:bg-white/5 transition-colors">
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => {
                        setFormRoles((prev) =>
                          prev.includes(r.id) ? prev.filter((x) => x !== r.id) : [...prev, r.id]
                        );
                      }}
                      className="accent-violet-500 rounded"
                    />
                    <span className={isChecked ? 'text-violet-300 font-semibold' : 'text-slate-400'}>{r.label}</span>
                  </label>
                );
              })}
            </div>
            {formRoles.length === 0 && (
              <p className="text-[10px] text-amber-400 mt-1">Please select at least one role.</p>
            )}
          </div>

          <div>
            <label className="text-[11px] font-mono text-slate-400 block mb-1">INITIAL STATUS</label>
            <div className="flex items-center gap-4 pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-xs">
                <input
                  type="radio"
                  name="add-status"
                  checked={formStatus === 'active'}
                  onChange={() => setFormStatus('active')}
                  className="accent-violet-500"
                />
                <span className="text-emerald-400 font-medium">Active Account</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer text-xs">
                <input
                  type="radio"
                  name="add-status"
                  checked={formStatus === 'inactive'}
                  onChange={() => setFormStatus('inactive')}
                  className="accent-violet-500"
                />
                <span className="text-slate-400 font-medium">Inactive / Provisioned</span>
              </label>
            </div>
          </div>
        </form>
      </AdminModal>

      {/* ---------------------------------------------------- */}
      {/* EDIT USER MODAL */}
      {/* ---------------------------------------------------- */}
      <AdminModal
        isOpen={isEditModalOpen}
        onClose={() => !isSubmitting && setIsEditModalOpen(false)}
        title={`Edit User: ${selectedUser?.name || ''}`}
        subtitle={`User ID: ${selectedUser?.id || ''}`}
        size="md"
        footer={
          <>
            <button
              type="button"
              onClick={() => setIsEditModalOpen(false)}
              disabled={isSubmitting}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleEditSubmit}
              disabled={isSubmitting}
              className="px-5 py-2 rounded-xl text-xs font-bold bg-violet-600 hover:bg-violet-500 text-white shadow-lg shadow-violet-950/50 flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>Save Changes</span>
            </button>
          </>
        }
      >
        <form onSubmit={handleEditSubmit} className="space-y-4">
          {formError && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-mono text-slate-400 block mb-1">FIRST NAME</label>
              <input
                type="text"
                required
                value={formFirstName}
                onChange={(e) => setFormFirstName(e.target.value)}
                className="w-full h-10 px-3 rounded-xl bg-white/5 border border-white/15 focus:border-violet-500 text-xs text-white outline-none"
              />
            </div>
            <div>
              <label className="text-[11px] font-mono text-slate-400 block mb-1">LAST NAME</label>
              <input
                type="text"
                required
                value={formLastName}
                onChange={(e) => setFormLastName(e.target.value)}
                className="w-full h-10 px-3 rounded-xl bg-white/5 border border-white/15 focus:border-violet-500 text-xs text-white outline-none"
              />
            </div>
          </div>

          <div>
            <label className="text-[11px] font-mono text-slate-400 block mb-1">EMAIL ADDRESS</label>
            <input
              type="email"
              required
              value={formEmail}
              onChange={(e) => setFormEmail(e.target.value)}
              className="w-full h-10 px-3 rounded-xl bg-white/5 border border-white/15 focus:border-violet-500 text-xs text-white outline-none font-mono"
            />
          </div>

          <div>
            <label className="text-[11px] font-mono text-slate-400 block mb-1">DEPARTMENT</label>
            <input
              type="text"
              required
              value={formDepartment}
              onChange={(e) => setFormDepartment(e.target.value)}
              className="w-full h-10 px-3 rounded-xl bg-white/5 border border-white/15 focus:border-violet-500 text-xs text-white outline-none"
            />
          </div>

          <div>
            <label className="text-[11px] font-mono text-slate-400 block mb-1.5">ASSIGNED ROLES (MULTI-ROLE SUPPORT) *</label>
            <div className="grid grid-cols-2 gap-2 p-2.5 rounded-xl bg-black/40 border border-white/15">
              {[
                { id: 'ADMIN', label: 'Admin (Full Management)' },
                { id: 'EMPLOYEE', label: 'Employee (Self-Service)' },
                { id: 'HR_LEAD', label: 'HR Lead (Ops & Triage)' },
                { id: 'HR_SPECIALIST', label: 'HR Specialist (Tickets)' }
              ].map((r) => {
                const isChecked = formRoles.includes(r.id);
                return (
                  <label key={r.id} className="flex items-center gap-2 cursor-pointer text-xs p-1.5 rounded-lg hover:bg-white/5 transition-colors">
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => {
                        setFormRoles((prev) =>
                          prev.includes(r.id) ? prev.filter((x) => x !== r.id) : [...prev, r.id]
                        );
                      }}
                      className="accent-violet-500 rounded"
                    />
                    <span className={isChecked ? 'text-violet-300 font-semibold' : 'text-slate-400'}>{r.label}</span>
                  </label>
                );
              })}
            </div>
            {formRoles.length === 0 && (
              <p className="text-[10px] text-amber-400 mt-1">Please select at least one role.</p>
            )}
          </div>

          <div>
            <label className="text-[11px] font-mono text-slate-400 block mb-1">ACCOUNT STATUS</label>
            <div className="flex items-center gap-4 pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-xs">
                <input
                  type="radio"
                  name="edit-status"
                  checked={formStatus === 'active'}
                  onChange={() => setFormStatus('active')}
                  className="accent-violet-500"
                />
                <span className="text-emerald-400 font-medium">Active</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer text-xs">
                <input
                  type="radio"
                  name="edit-status"
                  checked={formStatus === 'inactive'}
                  onChange={() => setFormStatus('inactive')}
                  className="accent-violet-500"
                />
                <span className="text-rose-400 font-medium">Inactive</span>
              </label>
            </div>
          </div>
        </form>
      </AdminModal>

      {/* ---------------------------------------------------- */}
      {/* VIEW USER DETAILS MODAL */}
      {/* ---------------------------------------------------- */}
      <AdminModal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        title="User Profile Details"
        subtitle={`Directory card for ${selectedUser?.name || ''}`}
        size="md"
        footer={
          <button
            type="button"
            onClick={() => setIsViewModalOpen(false)}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-white/10 hover:bg-white/20 text-white cursor-pointer"
          >
            Close
          </button>
        }
      >
        {selectedUser && (
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 rounded-xl bg-white/[0.03] border border-white/10">
              <img
                src={selectedUser.avatarUrl || selectedUser.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=160&q=80'}
                alt={selectedUser.name}
                className="w-16 h-16 rounded-2xl object-cover ring-2 ring-violet-500/40"
              />
              <div className="min-w-0">
                <h3 className="text-base font-bold text-white truncate">{selectedUser.name}</h3>
                <p className="text-xs font-mono text-slate-400 truncate">{selectedUser.email}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-violet-500/20 text-violet-300 border border-violet-500/30">
                    {selectedUser.role}
                  </span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold border ${selectedUser.status === 'active' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' : 'bg-rose-500/20 text-rose-300 border-rose-500/30'}`}>
                    {selectedUser.status === 'active' ? 'ACTIVE' : 'INACTIVE'}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 space-y-1">
                <span className="text-[10px] font-mono text-slate-400 uppercase">User ID</span>
                <p className="font-mono font-semibold text-white">{selectedUser.id}</p>
              </div>
              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 space-y-1">
                <span className="text-[10px] font-mono text-slate-400 uppercase">Department</span>
                <p className="font-semibold text-white">{selectedUser.department}</p>
              </div>
              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 space-y-1">
                <span className="text-[10px] font-mono text-slate-400 uppercase">Security Level</span>
                <p className="font-semibold text-white">Tier {selectedUser.securityLevel || 1}</p>
              </div>
              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 space-y-1">
                <span className="text-[10px] font-mono text-slate-400 uppercase">Tenure</span>
                <p className="font-semibold text-white">{selectedUser.tenure || 'N/A'}</p>
              </div>
            </div>
          </div>
        )}
      </AdminModal>

      {/* ---------------------------------------------------- */}
      {/* DEACTIVATE CONFIRMATION DIALOG */}
      {/* ---------------------------------------------------- */}
      <AdminConfirmDialog
        isOpen={!!userToDeactivate}
        onClose={() => setUserToDeactivate(null)}
        onConfirm={handleConfirmDeactivate}
        title="Confirm User Deactivation"
        message={`Are you sure you want to deactivate ${userToDeactivate?.name || 'this user'} (${userToDeactivate?.id || ''})? They will lose access to login and portal features, but their records will be safely preserved.`}
        confirmLabel="Deactivate Account"
        variant="danger"
        isLoading={isDeactivating}
      />

      {/* ---------------------------------------------------- */}
      {/* REASSIGN HR MODAL */}
      {/* ---------------------------------------------------- */}
      <AdminModal
        isOpen={isAssignModalOpen}
        onClose={() => !isSavingAssignment && setIsAssignModalOpen(false)}
        title="Reassign Dedicated HR Specialist"
        subtitle={`Select an active HR specialist for employee ${employeeToAssign?.name || ''} (${employeeToAssign?.id || ''})`}
        size="md"
        footer={
          <>
            <button
              type="button"
              onClick={() => setIsAssignModalOpen(false)}
              disabled={isSavingAssignment}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleAssignSubmit}
              disabled={isSavingAssignment || !targetHrId}
              className="px-5 py-2 rounded-xl text-xs font-bold bg-violet-600 hover:bg-violet-500 text-white shadow-lg shadow-violet-950/50 flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isSavingAssignment && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>Confirm Reassignment</span>
            </button>
          </>
        }
      >
        <form onSubmit={handleAssignSubmit} className="space-y-4">
          <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-200 text-xs flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-amber-400" />
            <div>
              <p className="font-semibold text-amber-300 mb-0.5">Strict Access Transfer Notice</p>
              <p className="text-slate-300 text-[11px] leading-relaxed">
                Reassigning this employee immediately transfers all active ticket management and request review access to the new HR specialist. The previous HR specialist immediately loses visibility into this employee's requests and data.
              </p>
            </div>
          </div>

          <div>
            <label className="text-[11px] font-mono text-slate-400 block mb-1">CURRENT DEDICATED HR</label>
            <div className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs font-mono text-slate-300 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-slate-400" />
              <span>{typeof employeeToAssign?.assignedHr === 'object' && employeeToAssign.assignedHr ? (employeeToAssign.assignedHr as any).name : (employeeToAssign?.assignedHr || 'Currently Unassigned')}</span>
              {employeeToAssign?.assignedHrId && (
                <span className="text-[10px] text-slate-500">({employeeToAssign.assignedHrId})</span>
              )}
            </div>
          </div>

          <div>
            <label className="text-[11px] font-mono text-slate-400 block mb-1">SELECT NEW HR SPECIALIST *</label>
            <select
              value={targetHrId}
              onChange={(e) => setTargetHrId(e.target.value)}
              className="w-full h-11 px-3 rounded-xl bg-slate-900 border border-white/20 focus:border-violet-500 text-xs text-white outline-none cursor-pointer"
            >
              <option value="" disabled>Select an active HR Specialist</option>
              {hrSpecialists.map((hr) => (
                <option key={hr.id} value={hr.id}>
                  {hr.name} ({hr.id}) — {hr.role}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[11px] font-mono text-slate-400 block mb-1">REASON / AUDIT NOTE</label>
            <textarea
              rows={2}
              value={reassignReason}
              onChange={(e) => setReassignReason(e.target.value)}
              placeholder="e.g. Workload balancing, department rotation, personnel shift..."
              className="w-full p-3 rounded-xl bg-white/5 border border-white/15 focus:border-violet-500 text-xs text-white outline-none resize-none"
            />
          </div>
        </form>
      </AdminModal>

      {/* ---------------------------------------------------- */}
      {/* ASSIGNMENT HISTORY AUDIT TRAIL MODAL */}
      {/* ---------------------------------------------------- */}
      <AdminModal
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
        title="Employee-to-HR Assignment Audit Trail"
        subtitle="Complete chronological history of HR specialist assignments and reassignments"
        size="lg"
        footer={
          <button
            type="button"
            onClick={() => setIsHistoryModalOpen(false)}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-white/10 hover:bg-white/20 text-white cursor-pointer"
          >
            Close
          </button>
        }
      >
        <div className="space-y-3">
          {isLoadingHistory ? (
            <div className="py-12 flex flex-col items-center justify-center gap-3 text-slate-400">
              <Loader2 className="w-6 h-6 animate-spin text-violet-400" />
              <p className="text-xs font-mono">Loading assignment audit logs...</p>
            </div>
          ) : assignmentHistoryList.length === 0 ? (
            <div className="py-10 text-center text-slate-400 text-xs">
              No reassignment records logged yet. Initial system state is active.
            </div>
          ) : (
            <div className="max-h-[60vh] overflow-y-auto space-y-2 pr-1">
              {assignmentHistoryList.map((item) => (
                <div
                  key={item.id}
                  className="p-3.5 rounded-xl bg-white/[0.02] border border-white/10 hover:border-violet-500/30 transition-colors"
                >
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="font-semibold text-white text-xs">
                      {item.employeeName} <span className="font-mono text-slate-400 text-[10px]">({item.employeeId})</span>
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">
                      {new Date(item.timestamp).toLocaleString()}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-xs py-1.5 px-2.5 rounded-lg bg-black/30 border border-white/5 font-mono mb-2">
                    <span className="text-slate-400">{item.previousHrName || item.previousHrId || 'None'}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-violet-400 flex-shrink-0" />
                    <span className="text-violet-300 font-bold">{item.newHrName || item.newHrId}</span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span>Assigned By: <strong className="text-slate-200">{item.assignedByName || (typeof item.assignedBy === 'object' ? item.assignedBy?.name : item.assignedBy) || 'Administrator'}</strong></span>
                    {item.reason && <span className="italic text-slate-400">"{item.reason}"</span>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </AdminModal>
    </div>
  );
};
