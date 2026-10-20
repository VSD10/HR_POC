import React, { useState } from 'react';
import { ThemeToggle } from '../layout/ThemeToggle';
import { useAuth } from '../../context/AuthContext';
import { AdminTab } from '../../types/admin';
import { LogOut, Activity } from 'lucide-react';

interface AdminHeaderProps {
  activeTab: AdminTab;
  onToggleMobileMenu?: () => void;
  onSwitchPortal?: (portal: 'hr' | 'employee') => void;
}

const tabTitles: Record<AdminTab, { title: string; subtitle: string }> = {
  dashboard: {
    title: 'Platform Overview & Dashboard',
    subtitle: 'System health monitoring, user counts, and executive platform activity'
  },
  users: {
    title: 'Enterprise User Management',
    subtitle: 'Manage directory accounts, roles, access levels, and deactivations'
  },
  assignments: {
    title: 'Employee-to-HR Specialist Assignments',
    subtitle: 'Manage dedicated HR assignments, role access control, and reassignment audit trails'
  },
  roles: {
    title: 'Role & Permission Boundaries',
    subtitle: 'Define granular permissions across ADMIN, HR_LEAD, HR_SPECIALIST, and EMPLOYEE'
  },
  settings: {
    title: 'Global System Settings & SLAs',
    subtitle: 'Configure SLA response thresholds, ticket categories, and AI feature toggles'
  },
  'audit-logs': {
    title: 'Platform Audit & Compliance Trail',
    subtitle: 'Read-only immutable activity log for SOC2, security compliance, and change audits'
  },
  'ai-telemetry': {
    title: 'AI Telemetry & Token Intelligence',
    subtitle: 'Real-time AI model latency, prompt/completion tokens, costs, and invocation audit stream'
  },
  profile: {
    title: 'Administrator Profile & Credentials',
    subtitle: 'Primary system administrator account details and active security credentials'
  }
};

export const AdminHeader: React.FC<AdminHeaderProps> = ({
  activeTab,
  onToggleMobileMenu,
  onSwitchPortal
}) => {
  const { user, logout } = useAuth();
  const current = tabTitles[activeTab] || tabTitles.dashboard;
  const [imgError, setImgError] = useState(false);

  const avatarSrc = user?.avatarUrl || user?.avatar || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=120&q=80';

  return (
    <header className="sticky top-0 z-40 rounded-2xl bg-[#060814]/85 dark:bg-[#060814]/90 backdrop-blur-2xl border border-slate-700/60 dark:border-white/15 shadow-glass px-4 md:px-5 py-3 mb-5 flex items-center justify-between specular-border transition-all duration-200 flex-shrink-0">
      {/* Left: View title & badge */}
      <div className="flex items-center gap-3.5 min-w-0">
        {onToggleMobileMenu && (
          <button
            onClick={onToggleMobileMenu}
            className="md:hidden p-2 rounded-xl bg-white/5 border border-white/10 text-white/70 hover:text-white"
          >
            <span className="material-symbols-outlined text-[20px]">menu</span>
          </button>
        )}
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h1 className="font-display text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight leading-tight truncate">
              {current.title}
            </h1>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold tracking-wide bg-violet-500/20 border border-violet-400/40 text-violet-300 flex-shrink-0">
              ADMIN CONTROL
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-white/50 hidden sm:block truncate mt-0.5">
            {current.subtitle}
          </p>
        </div>
      </div>

      {/* Right: Controls & Admin Profile */}
      <div className="flex items-center gap-2.5 sm:gap-3 flex-shrink-0">
        {/* Live System Indicator */}
        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 font-mono text-[11px]">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>LIVE</span>
        </div>

        {/* Theme Toggle */}
        <div className="flex items-center">
          <ThemeToggle />
        </div>

        {/* Vertical Divider */}
        <div className="h-5 w-px bg-slate-700/60 dark:bg-white/15 mx-0.5 hidden sm:block" />

        {/* Admin Profile & Logout */}
        <div className="flex items-center gap-2 p-1 bg-white/[0.04] border border-slate-700/60 dark:border-white/10 rounded-2xl backdrop-blur-md shadow-glass">
          <div
            className="flex items-center gap-2 px-1 cursor-pointer group"
            title={`${user?.name || 'Admin'} (${user?.role || 'ADMIN'})`}
          >
            {!imgError ? (
              <img
                alt={user?.name || 'Administrator'}
                className="w-8 h-8 rounded-xl object-cover ring-1 ring-violet-400/50 shadow-md"
                src={avatarSrc}
                onError={() => setImgError(true)}
              />
            ) : (
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-violet-600 to-indigo-600 flex items-center justify-center text-white font-bold text-xs font-mono ring-1 ring-violet-400/50 shadow-md">
                AD
              </div>
            )}
            <div className="hidden md:flex flex-col text-left pr-1">
              <span className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
                {user?.name || 'Sarah Jenkins'}
              </span>
              <span className="text-[10px] font-mono text-violet-400">
                {user?.role || 'ADMIN'}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={logout}
            className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
            title="Log Out of Admin Portal"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
