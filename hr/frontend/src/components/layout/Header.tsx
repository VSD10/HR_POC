import React, { useState } from 'react';
import { Mail } from 'lucide-react';
import { NavTab } from './Sidebar';
import { ThemeToggle } from './ThemeToggle';
import { useAuth } from '../../context/AuthContext';

interface HeaderProps {
  activeTab: NavTab;
  onOpenCommandPalette: () => void;
  onOpenNewAction: () => void;
  onToggleMobileMenu?: () => void;
  onOpenConnectMail?: () => void;
  mailStatus?: any;
}

const tabTitles: Record<NavTab, { title: string; subtitle: string }> = {
  dashboard: {
    title: "HR Dashboard",
    subtitle: "Enterprise Operations & Autonomous AI Cockpit"
  },
  requests: {
    title: "Service Requests Queue",
    subtitle: "Real-time employee cases, classification, & ticket lifecycles"
  },
  'ai-triage': {
    title: "Autonomous AI Triage Engine",
    subtitle: "Automated intent classification, routing models, & confidence scores"
  },
  'ai-assistance': {
    title: "HR Copilot & Policy Grounding",
    subtitle: "RAG-assisted policy query, handbook citations, & deliverable drafting"
  },
  deliverables: {
    title: "HR Deliverables & Email Dispatch",
    subtitle: "Inbound employee email triage, policy RAG drafts, and live Gmail response dispatch"
  },
  'hr-actions': {
    title: "Operational HR Actions",
    subtitle: "One-click approval workflows for salary, leave, and transitions"
  },
  insights: {
    title: "Process Improvement & Analytics",
    subtitle: "Continuous discovery of HR operational bottlenecks & SLA trends"
  },
  reports: {
    title: "Executive Reports & Audit Logs",
    subtitle: "SOC2 and HIPAA compliant telemetry, SLA summaries, and export tools"
  },
  'ai-telemetry': {
    title: "AI Model Telemetry & Token Intelligence",
    subtitle: "Real-time token utilization, model inference latency, cost attribution, and RAG vector store health"
  },
  settings: {
    title: "System & AI Model Settings",
    subtitle: "Routing thresholds, vector store parameters, and notification policies"
  },
  'hr-profile': {
    title: "HR Operations Profile",
    subtitle: "Specialist credentials, assigned jurisdictions, and shift schedule"
  }
};

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onOpenCommandPalette,
  onToggleMobileMenu,
  onOpenConnectMail,
  mailStatus
}) => {
  const { user, logout, demoLogin } = useAuth();
  const current = tabTitles[activeTab] || tabTitles.dashboard;
  const [imgError, setImgError] = useState(false);

  const avatarSrc = user?.avatarUrl || "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=120&q=80";

  return (
    <header className={`sticky top-0 z-40 rounded-2xl bg-[#060814]/85 backdrop-blur-2xl border border-white/15 shadow-glass px-4 md:px-5 flex items-center justify-between specular-border transition-all duration-200 flex-shrink-0 ${
      activeTab === 'ai-assistance' ? 'py-2.5 mb-2' : 'py-3 mb-5'
    }`}>
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
            <h1 className="font-display text-base sm:text-lg font-bold text-white tracking-tight leading-tight truncate">
              {current.title}
            </h1>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-medium tracking-wide bg-cyan-500/15 border border-cyan-400/30 text-cyan-300 flex-shrink-0">
              HR PORTAL
            </span>
          </div>
          <p className="text-xs text-white/50 hidden sm:block truncate mt-0.5">
            {current.subtitle}
          </p>
        </div>
      </div>

      {/* Right: Aligned navigation controls & profile */}
      <div className="flex items-center gap-2.5 sm:gap-3 flex-shrink-0">
        {/* HR Mailbox Connection Button / Pill */}
        {onOpenConnectMail && (
          mailStatus?.connected ? (
            <button
              onClick={onOpenConnectMail}
              className="inline-flex items-center gap-2 h-9 px-3 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-emerald-500/30 hover:border-emerald-400/50 text-white text-xs font-mono transition-all cursor-pointer shadow-sm group"
              title={`Mailbox Connected: ${mailStatus.email || 'hr.specialist@enterprise.internal'} • Click to change or disconnect`}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
              <Mail className="w-3.5 h-3.5 text-red-400 group-hover:scale-110 transition-transform shrink-0" />
              <span className="truncate max-w-[120px] sm:max-w-[160px] text-white/90">
                {mailStatus.email ? mailStatus.email.split('@')[0] : 'HR Mail'}
              </span>
              {mailStatus.accounts && mailStatus.accounts.length > 1 ? (
                <span className="text-[9px] text-purple-300 bg-purple-500/20 border border-purple-500/30 px-1.5 py-0.5 rounded font-semibold hidden sm:inline">
                  {mailStatus.accounts.length} mailboxes
                </span>
              ) : (
                <span className="text-[10px] text-emerald-400 font-semibold hidden sm:inline">• Live</span>
              )}
            </button>
          ) : (
            <button
              onClick={onOpenConnectMail}
              className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-xl bg-gradient-to-r from-red-600 via-rose-600 to-pink-600 hover:from-red-500 hover:to-rose-500 text-white text-xs font-semibold shadow-md shadow-red-500/25 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
              title="Connect your Google Workspace or corporate email to the portal"
            >
              <Mail className="w-3.5 h-3.5 animate-bounce" />
              <span>Connect Mail</span>
            </button>
          )
        )}

        {/* Quick Portal Switcher */}
        <button
          onClick={() => demoLogin('EMPLOYEE')}
          className="hidden lg:inline-flex items-center gap-1.5 h-9 px-3.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-400/30 hover:border-emerald-400/50 text-emerald-300 text-xs font-mono font-medium transition-all shadow-sm cursor-pointer"
          title="Switch view to Alex Johnson (Employee / User Self-Service Portal)"
        >
          <span className="material-symbols-outlined text-[16px]">person</span>
          <span>User Portal →</span>
        </button>

        {/* Glass Search Input - Click opens command palette */}
        <div
          onClick={onOpenCommandPalette}
          className="relative hidden sm:flex items-center cursor-pointer group"
          title="Open command palette (⌘K)"
        >
          <span className="material-symbols-outlined absolute left-3 text-white/40 group-hover:text-neon-cyan text-[18px] pointer-events-none transition-colors">
            search
          </span>
          <div className="w-44 md:w-52 h-9 pl-9 pr-11 bg-black/30 border border-white/10 group-hover:border-neon-cyan/50 rounded-xl text-xs text-white/50 backdrop-blur-md flex items-center transition-all">
            <span>Search cases...</span>
          </div>
          <span className="absolute right-2.5 text-[10px] font-mono text-white/40 border border-white/10 rounded px-1.5 py-0.5 bg-white/5 pointer-events-none">
            ⌘K
          </span>
        </div>

        {/* Theme Toggle */}
        <div className="flex items-center">
          <ThemeToggle />
        </div>

        {/* Subtle Vertical Divider */}
        <div className="h-5 w-px bg-white/15 mx-0.5 hidden sm:block" />

        {/* User Frosted Avatar Profile (picture only, no name text) */}
        <div className="flex items-center gap-1 p-1 bg-white/[0.04] border border-white/10 hover:border-white/20 rounded-2xl backdrop-blur-md shadow-glass transition-all">
          <div
            className="relative cursor-pointer group flex items-center"
            title={`${user?.name || 'Sarah Jenkins'} (${user?.role || 'HR_ADMIN'})`}
          >
            {!imgError ? (
              <img
                alt={user?.name || "Sarah Jenkins"}
                className="w-8 h-8 rounded-xl object-cover ring-1 ring-white/25 group-hover:ring-cyan-400/60 shadow-md transition-all"
                src={avatarSrc}
                onError={() => setImgError(true)}
              />
            ) : (
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-600 via-indigo-600 to-purple-600 flex items-center justify-center text-white font-bold text-xs font-mono ring-1 ring-white/25 shadow-md">
                SJ
              </div>
            )}
            <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 ring-2 ring-[#060814]" />
          </div>

          <button
            onClick={logout}
            className="w-7 h-7 rounded-xl flex items-center justify-center text-white/40 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
            title="Log Out"
          >
            <span className="material-symbols-outlined text-[16px]">logout</span>
          </button>
        </div>
      </div>
    </header>
  );
};
