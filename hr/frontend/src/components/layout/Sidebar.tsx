import React from 'react';

export type NavTab = 
  | 'dashboard'
  | 'requests'
  | 'ai-triage'
  | 'ai-assistance'
  | 'deliverables'
  | 'hr-actions'
  | 'insights'
  | 'reports'
  | 'settings'
  | 'hr-profile'
  | 'backend-docs';

interface SidebarProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  openRequestsCount: number;
  pendingActionsCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  openRequestsCount,
  pendingActionsCount
}) => {
  return (
    <aside className="w-64 flex-shrink-0 h-full rounded-2xl bg-white/[0.04] backdrop-blur-2xl border border-white/10 shadow-glass flex flex-col justify-between p-3 z-30 specular-border hidden md:flex">
      <div className="flex flex-col gap-5 overflow-y-auto pr-1">
        {/* Brand & Logo Container */}
        <div 
          onClick={() => onSelectTab('dashboard')} 
          className="flex items-center gap-3 px-3 py-3 rounded-xl bg-white/[0.04] border border-white/10 backdrop-blur-md cursor-pointer hover:bg-white/[0.07] transition-all"
        >
          <div className="relative w-10 h-10 rounded-xl overflow-hidden p-1 bg-gradient-to-tr from-blue-600/40 via-indigo-500/30 to-cyan-400/30 border border-white/20 shadow-inner flex items-center justify-center">
            <span className="material-symbols-outlined text-[24px] text-cyan-300 drop-shadow-[0_0_8px_rgba(0,240,255,0.6)]">
              token
            </span>
          </div>
          <div className="flex flex-col min-w-0">
            <span className="font-display font-bold text-sm tracking-tight text-white flex items-center gap-1.5">
              HR AI Desk
              <span className="w-1.5 h-1.5 rounded-full bg-neon-cyan animate-pulse" />
            </span>
            <span className="text-[11px] font-mono text-cyan-300/70 tracking-wider">
              SPATIAL v3.4
            </span>
          </div>
        </div>

        {/* Operations Navigation */}
        <div>
          <p className="px-3 mb-2 font-mono text-[10px] text-white/40 uppercase tracking-widest font-semibold">
            Operations
          </p>
          <nav className="flex flex-col gap-1.5">
            {/* Dashboard */}
            <button
              onClick={() => onSelectTab('dashboard')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all duration-200 text-left relative group ${
                activeTab === 'dashboard'
                  ? 'bg-white/[0.12] text-white font-medium shadow-[inset_0_1px_1px_rgba(255,255,255,0.25)] border border-white/15'
                  : 'text-white/60 hover:text-white hover:bg-white/[0.06] border border-transparent'
              }`}
            >
              {activeTab === 'dashboard' && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 rounded-r-full bg-neon-cyan shadow-[0_0_10px_#00f0ff]" />
              )}
              <span className={`material-symbols-outlined text-[20px] ${
                activeTab === 'dashboard' ? 'text-neon-cyan drop-shadow-[0_0_6px_rgba(0,240,255,0.5)]' : 'group-hover:text-white'
              }`}>
                space_dashboard
              </span>
              <span className="text-sm">Dashboard</span>
            </button>

            {/* Requests */}
            <button
              onClick={() => onSelectTab('requests')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all duration-200 text-left relative group ${
                activeTab === 'requests'
                  ? 'bg-white/[0.12] text-white font-medium shadow-[inset_0_1px_1px_rgba(255,255,255,0.25)] border border-white/15'
                  : 'text-white/60 hover:text-white hover:bg-white/[0.06] border border-transparent'
              }`}
            >
              {activeTab === 'requests' && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 rounded-r-full bg-neon-cyan shadow-[0_0_10px_#00f0ff]" />
              )}
              <span className="material-symbols-outlined text-[20px] group-hover:text-white">
                inbox
              </span>
              <span className="text-sm">Requests</span>
              <span className="ml-auto text-[11px] font-mono px-2 py-0.5 rounded-full bg-white/10 text-white/80">
                {openRequestsCount}
              </span>
            </button>

            {/* AI Triage */}
            <button
              onClick={() => onSelectTab('ai-triage')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all duration-200 text-left relative group ${
                activeTab === 'ai-triage'
                  ? 'bg-white/[0.12] text-white font-medium shadow-[inset_0_1px_1px_rgba(255,255,255,0.25)] border border-white/15'
                  : 'text-white/60 hover:text-white hover:bg-white/[0.06] border border-transparent'
              }`}
            >
              {activeTab === 'ai-triage' && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 rounded-r-full bg-neon-cyan shadow-[0_0_10px_#00f0ff]" />
              )}
              <span className="material-symbols-outlined text-[20px] text-purple-400">
                auto_awesome
              </span>
              <span className="text-sm">AI Triage</span>
              <span className="ml-auto w-2 h-2 rounded-full bg-purple-400 animate-ping" />
            </button>

            {/* AI Assistance */}
            <button
              onClick={() => onSelectTab('ai-assistance')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all duration-200 text-left relative group ${
                activeTab === 'ai-assistance'
                  ? 'bg-white/[0.12] text-white font-medium shadow-[inset_0_1px_1px_rgba(255,255,255,0.25)] border border-white/15'
                  : 'text-white/60 hover:text-white hover:bg-white/[0.06] border border-transparent'
              }`}
            >
              {activeTab === 'ai-assistance' && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 rounded-r-full bg-neon-cyan shadow-[0_0_10px_#00f0ff]" />
              )}
              <span className="material-symbols-outlined text-[20px] text-cyan-400">
                smart_toy
              </span>
              <span className="text-sm">AI Assistance</span>
            </button>

            {/* Deliverables */}
            <button
              onClick={() => onSelectTab('deliverables')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all duration-200 text-left relative group ${
                activeTab === 'deliverables'
                  ? 'bg-white/[0.12] text-white font-medium shadow-[inset_0_1px_1px_rgba(255,255,255,0.25)] border border-white/15'
                  : 'text-white/60 hover:text-white hover:bg-white/[0.06] border border-transparent'
              }`}
            >
              {activeTab === 'deliverables' && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 rounded-r-full bg-neon-cyan shadow-[0_0_10px_#00f0ff]" />
              )}
              <span className="material-symbols-outlined text-[20px]">
                assignment_turned_in
              </span>
              <span className="text-sm">Deliverables</span>
            </button>

            {/* HR Actions */}
            <button
              onClick={() => onSelectTab('hr-actions')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all duration-200 text-left relative group ${
                activeTab === 'hr-actions'
                  ? 'bg-white/[0.12] text-white font-medium shadow-[inset_0_1px_1px_rgba(255,255,255,0.25)] border border-white/15'
                  : 'text-white/60 hover:text-white hover:bg-white/[0.06] border border-transparent'
              }`}
            >
              {activeTab === 'hr-actions' && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 rounded-r-full bg-neon-cyan shadow-[0_0_10px_#00f0ff]" />
              )}
              <span className="material-symbols-outlined text-[20px] text-amber-400">
                bolt
              </span>
              <span className="text-sm">HR Actions</span>
              <span className="ml-auto text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-semibold">
                {pendingActionsCount}
              </span>
            </button>

            {/* Insights */}
            <button
              onClick={() => onSelectTab('insights')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all duration-200 text-left relative group ${
                activeTab === 'insights'
                  ? 'bg-white/[0.12] text-white font-medium shadow-[inset_0_1px_1px_rgba(255,255,255,0.25)] border border-white/15'
                  : 'text-white/60 hover:text-white hover:bg-white/[0.06] border border-transparent'
              }`}
            >
              {activeTab === 'insights' && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 rounded-r-full bg-neon-cyan shadow-[0_0_10px_#00f0ff]" />
              )}
              <span className="material-symbols-outlined text-[20px]">
                insights
              </span>
              <span className="text-sm">Insights</span>
            </button>

            {/* Reports */}
            <button
              onClick={() => onSelectTab('reports')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all duration-200 text-left relative group ${
                activeTab === 'reports'
                  ? 'bg-white/[0.12] text-white font-medium shadow-[inset_0_1px_1px_rgba(255,255,255,0.25)] border border-white/15'
                  : 'text-white/60 hover:text-white hover:bg-white/[0.06] border border-transparent'
              }`}
            >
              {activeTab === 'reports' && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 rounded-r-full bg-neon-cyan shadow-[0_0_10px_#00f0ff]" />
              )}
              <span className="material-symbols-outlined text-[20px]">
                summarize
              </span>
              <span className="text-sm">Reports</span>
            </button>

            {/* Backend Integration Blueprint */}
            <button
              onClick={() => onSelectTab('backend-docs')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all duration-200 text-left relative group ${
                activeTab === 'backend-docs'
                  ? 'bg-cyan-500/20 text-cyan-300 font-medium shadow-[inset_0_1px_1px_rgba(255,255,255,0.25)] border border-cyan-400/40'
                  : 'text-cyan-400/70 hover:text-cyan-300 hover:bg-cyan-500/10 border border-transparent'
              }`}
            >
              {activeTab === 'backend-docs' && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 rounded-r-full bg-neon-cyan shadow-[0_0_10px_#00f0ff]" />
              )}
              <span className="material-symbols-outlined text-[20px] text-cyan-400">
                api
              </span>
              <span className="text-sm font-semibold">Backend API Docs</span>
              <span className="ml-auto text-[9px] font-mono px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300">
                SPEC
              </span>
            </button>
          </nav>
        </div>
      </div>

      {/* System & Telemetry Capsule */}
      <div className="flex flex-col gap-3 pt-3 border-t border-white/10">
        <p className="px-3 font-mono text-[10px] text-white/40 uppercase tracking-widest font-semibold">
          System
        </p>
        <nav className="flex flex-col gap-1">
          <button
            onClick={() => onSelectTab('settings')}
            className={`flex items-center gap-3 px-3.5 py-2 rounded-xl transition-colors text-left ${
              activeTab === 'settings' ? 'bg-white/10 text-white font-medium' : 'text-white/60 hover:text-white hover:bg-white/[0.06]'
            }`}
          >
            <span className="material-symbols-outlined text-[19px]">settings</span>
            <span className="text-sm">Settings</span>
          </button>
          <button
            onClick={() => onSelectTab('hr-profile')}
            className={`flex items-center gap-3 px-3.5 py-2 rounded-xl transition-colors text-left ${
              activeTab === 'hr-profile' ? 'bg-white/10 text-white font-medium' : 'text-white/60 hover:text-white hover:bg-white/[0.06]'
            }`}
          >
            <span className="material-symbols-outlined text-[19px]">account_box</span>
            <span className="text-sm">HR Profile</span>
          </button>
        </nav>

        {/* Live Node Status Capsule */}
        <div className="mt-2 p-3 rounded-xl bg-black/40 border border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span className="text-[11px] font-mono text-white/70">Neural Core OK</span>
          </div>
          <span className="text-[10px] font-mono text-cyan-300">99.8% SLA</span>
        </div>
      </div>
    </aside>
  );
};
