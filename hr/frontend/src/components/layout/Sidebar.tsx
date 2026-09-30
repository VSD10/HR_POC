import React, { useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Sparkles
} from 'lucide-react';

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
  | 'hr-profile';

interface SidebarProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  openRequestsCount: number;
  pendingActionsCount: number;
  defaultCollapsed?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  openRequestsCount,
  pendingActionsCount,
  defaultCollapsed = false
}) => {
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);

  return (
    <aside
      className={`transition-all duration-300 ease-in-out flex-shrink-0 h-full rounded-2xl bg-white/[0.04] backdrop-blur-2xl border border-white/10 shadow-glass flex flex-col justify-between z-30 specular-border hidden md:flex overflow-x-hidden ${
        isCollapsed ? 'w-20 p-2 overflow-hidden' : 'w-64 p-3'
      }`}
    >
      <div className={`flex flex-col ${isCollapsed ? 'gap-2 overflow-hidden' : 'gap-4 overflow-y-auto pr-1 no-scrollbar'}`}>
        {/* Brand & Logo Container with Collapse Toggle */}
        <div className={`flex items-center ${isCollapsed ? 'flex-col gap-2 pb-2 border-b border-white/10' : 'justify-between gap-2 pb-1'}`}>
          <div 
            onClick={() => onSelectTab('dashboard')} 
            className={`flex items-center rounded-xl bg-white/[0.04] border border-white/10 backdrop-blur-md cursor-pointer hover:bg-white/[0.08] transition-all ${
              isCollapsed ? 'w-10 h-10 justify-center p-0 mx-auto' : 'gap-3 p-2.5 flex-1'
            }`}
            title="HR AI Desk"
          >
            <div className="relative w-8 h-8 rounded-lg overflow-hidden p-1 bg-gradient-to-tr from-blue-600/40 via-indigo-500/30 to-cyan-400/30 border border-white/20 shadow-inner flex-shrink-0 flex items-center justify-center">
              <span className="material-symbols-outlined text-[20px] text-cyan-300 drop-shadow-[0_0_8px_rgba(0,240,255,0.6)]">
                token
              </span>
            </div>
            {!isCollapsed && (
              <div className="flex flex-col min-w-0">
                <span className="font-display font-bold text-sm tracking-tight text-white flex items-center gap-1.5">
                  HR AI Desk
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                </span>
                <span className="text-[10px] font-mono text-cyan-300/70 tracking-wider">
                  ENTERPRISE v3.5
                </span>
              </div>
            )}
          </div>

          {/* Collapse / Expand Toggle Button */}
          <button
            type="button"
            onClick={() => setIsCollapsed(prev => !prev)}
            className={`rounded-xl bg-white/[0.03] hover:bg-white/[0.1] border border-white/10 text-white/60 hover:text-white transition-all cursor-pointer flex items-center justify-center flex-shrink-0 ${
              isCollapsed ? 'w-10 h-7 mx-auto' : 'p-2'
            }`}
            title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            {isCollapsed ? (
              <ChevronRight className="w-4 h-4 text-cyan-400" />
            ) : (
              <ChevronLeft className="w-4 h-4 text-white/70" />
            )}
          </button>
        </div>

        {/* Operations Navigation */}
        <div className="flex flex-col">
          {!isCollapsed && (
            <p className="px-3 mb-1.5 font-mono text-[10px] text-white/40 uppercase tracking-widest font-semibold">
              Operations
            </p>
          )}
          <nav className={`flex flex-col ${isCollapsed ? 'gap-1' : 'gap-1.5'}`}>
            {/* Dashboard */}
            <button
              onClick={() => onSelectTab('dashboard')}
              className={`rounded-xl transition-all duration-200 text-left relative group ${
                isCollapsed 
                  ? 'w-10 h-10 p-0 flex items-center justify-center mx-auto' 
                  : 'w-full flex items-center gap-3 px-3 py-2.5'
              } ${
                activeTab === 'dashboard'
                  ? 'bg-white/[0.12] text-white font-medium shadow-[inset_0_1px_1px_rgba(255,255,255,0.25)] border border-cyan-400/40'
                  : 'text-white/60 hover:text-white hover:bg-white/[0.06] border border-transparent'
              }`}
            >
              {activeTab === 'dashboard' && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 rounded-r-full bg-cyan-400 shadow-[0_0_10px_#00f0ff]" />
              )}
              <span className={`material-symbols-outlined text-[20px] ${
                activeTab === 'dashboard' ? 'text-cyan-400 drop-shadow-[0_0_6px_rgba(0,240,255,0.5)]' : 'group-hover:text-white'
              }`}>
                space_dashboard
              </span>
              {!isCollapsed && <span className="text-sm">Dashboard</span>}
              {isCollapsed && (
                <div className="absolute left-full ml-3 px-2.5 py-1 bg-[#0c1024] border border-white/15 rounded-lg text-xs text-white whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 shadow-lg">
                  Dashboard
                </div>
              )}
            </button>

            {/* Requests */}
            <button
              onClick={() => onSelectTab('requests')}
              className={`rounded-xl transition-all duration-200 text-left relative group ${
                isCollapsed 
                  ? 'w-10 h-10 p-0 flex items-center justify-center mx-auto' 
                  : 'w-full flex items-center gap-3 px-3 py-2.5'
              } ${
                activeTab === 'requests'
                  ? 'bg-white/[0.12] text-white font-medium shadow-[inset_0_1px_1px_rgba(255,255,255,0.25)] border border-cyan-400/40'
                  : 'text-white/60 hover:text-white hover:bg-white/[0.06] border border-transparent'
              }`}
            >
              {activeTab === 'requests' && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 rounded-r-full bg-cyan-400 shadow-[0_0_10px_#00f0ff]" />
              )}
              <span className="material-symbols-outlined text-[20px] group-hover:text-white">
                inbox
              </span>
              {!isCollapsed && (
                <>
                  <span className="text-sm">Requests</span>
                  <span className="ml-auto text-[11px] font-mono px-2 py-0.5 rounded-full bg-white/10 text-white/80">
                    {openRequestsCount}
                  </span>
                </>
              )}
              {isCollapsed && (
                <div className="absolute left-full ml-3 px-2.5 py-1 bg-[#0c1024] border border-white/15 rounded-lg text-xs text-white whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 shadow-lg flex items-center gap-1.5">
                  <span>Requests</span>
                  <span className="px-1.5 py-0.2 rounded bg-white/10 text-[10px]">{openRequestsCount}</span>
                </div>
              )}
            </button>

            {/* AI Assistance / Copilot */}
            <button
              onClick={() => onSelectTab('ai-assistance')}
              className={`rounded-xl transition-all duration-200 text-left relative group ${
                isCollapsed 
                  ? 'w-10 h-10 p-0 flex items-center justify-center mx-auto' 
                  : 'w-full flex items-center gap-3 px-3 py-2.5'
              } ${
                activeTab === 'ai-assistance'
                  ? 'bg-gradient-to-r from-cyan-500/20 via-blue-500/15 to-indigo-500/20 text-white font-medium shadow-[inset_0_1px_1px_rgba(255,255,255,0.3)] border border-cyan-400/40 shadow-[0_0_16px_rgba(0,240,255,0.25)]'
                  : 'text-cyan-300/80 hover:text-white hover:bg-white/[0.06] border border-transparent'
              }`}
            >
              {activeTab === 'ai-assistance' && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 rounded-r-full bg-cyan-400 shadow-[0_0_12px_#00f0ff]" />
              )}
              <span className="material-symbols-outlined text-[20px] text-cyan-400 drop-shadow-[0_0_8px_rgba(0,240,255,0.6)]">
                smart_toy
              </span>
              {!isCollapsed && (
                <>
                  <span className="text-sm font-semibold">AI Copilot</span>
                  <span className="ml-auto text-[9px] font-mono px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-400/30">
                    RAG
                  </span>
                </>
              )}
              {isCollapsed && (
                <div className="absolute left-full ml-3 px-2.5 py-1 bg-[#0c1024] border border-cyan-400/30 rounded-lg text-xs text-cyan-300 whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 shadow-lg flex items-center gap-1">
                  <span>AI Copilot</span>
                  <span className="text-[9px] font-mono text-cyan-400">RAG</span>
                </div>
              )}
            </button>

            {/* AI Triage */}
            <button
              onClick={() => onSelectTab('ai-triage')}
              className={`rounded-xl transition-all duration-200 text-left relative group ${
                isCollapsed 
                  ? 'w-10 h-10 p-0 flex items-center justify-center mx-auto' 
                  : 'w-full flex items-center gap-3 px-3 py-2.5'
              } ${
                activeTab === 'ai-triage'
                  ? 'bg-white/[0.12] text-white font-medium shadow-[inset_0_1px_1px_rgba(255,255,255,0.25)] border border-cyan-400/40'
                  : 'text-white/60 hover:text-white hover:bg-white/[0.06] border border-transparent'
              }`}
            >
              {activeTab === 'ai-triage' && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 rounded-r-full bg-cyan-400 shadow-[0_0_10px_#00f0ff]" />
              )}
              <span className="material-symbols-outlined text-[20px] text-purple-400">
                auto_awesome
              </span>
              {!isCollapsed && (
                <>
                  <span className="text-sm">AI Triage</span>
                  <span className="ml-auto w-2 h-2 rounded-full bg-purple-400 animate-ping" />
                </>
              )}
              {isCollapsed && (
                <div className="absolute left-full ml-3 px-2.5 py-1 bg-[#0c1024] border border-white/15 rounded-lg text-xs text-white whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 shadow-lg">
                  AI Triage
                </div>
              )}
            </button>

            {/* Deliverables / Gmail Dispatch */}
            <button
              onClick={() => onSelectTab('deliverables')}
              className={`rounded-xl transition-all duration-200 text-left relative group ${
                isCollapsed 
                  ? 'w-10 h-10 p-0 flex items-center justify-center mx-auto' 
                  : 'w-full flex items-center gap-3 px-3 py-2.5'
              } ${
                activeTab === 'deliverables'
                  ? 'bg-gradient-to-r from-red-600/20 via-rose-500/15 to-white/[0.08] text-white font-medium shadow-[inset_0_1px_1px_rgba(255,255,255,0.25)] border border-red-500/40 shadow-[0_0_15px_rgba(239,68,68,0.2)]'
                  : 'text-white/60 hover:text-white hover:bg-white/[0.06] border border-transparent'
              }`}
            >
              {activeTab === 'deliverables' && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 rounded-r-full bg-red-400 shadow-[0_0_10px_#ef4444]" />
              )}
              <span className="material-symbols-outlined text-[20px] text-red-400">
                mail
              </span>
              {!isCollapsed && (
                <>
                  <span className="text-sm">Deliverables</span>
                  <span className="ml-auto text-[9px] font-mono px-1.5 py-0.5 rounded bg-red-500/20 text-red-300 border border-red-500/30 flex items-center gap-1 font-semibold">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Gmail
                  </span>
                </>
              )}
              {isCollapsed && (
                <div className="absolute left-full ml-3 px-2.5 py-1 bg-[#0c1024] border border-red-500/30 rounded-lg text-xs text-white whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 shadow-lg flex items-center gap-1.5">
                  <span>Deliverables</span>
                  <span className="text-[9px] font-mono text-emerald-400">• Gmail</span>
                </div>
              )}
            </button>

            {/* HR Actions */}
            <button
              onClick={() => onSelectTab('hr-actions')}
              className={`rounded-xl transition-all duration-200 text-left relative group ${
                isCollapsed 
                  ? 'w-10 h-10 p-0 flex items-center justify-center mx-auto' 
                  : 'w-full flex items-center gap-3 px-3 py-2.5'
              } ${
                activeTab === 'hr-actions'
                  ? 'bg-white/[0.12] text-white font-medium shadow-[inset_0_1px_1px_rgba(255,255,255,0.25)] border border-cyan-400/40'
                  : 'text-white/60 hover:text-white hover:bg-white/[0.06] border border-transparent'
              }`}
            >
              {activeTab === 'hr-actions' && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 rounded-r-full bg-cyan-400 shadow-[0_0_10px_#00f0ff]" />
              )}
              <span className="material-symbols-outlined text-[20px] text-amber-400">
                bolt
              </span>
              {!isCollapsed && (
                <>
                  <span className="text-sm">HR Actions</span>
                  <span className="ml-auto text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-semibold">
                    {pendingActionsCount}
                  </span>
                </>
              )}
              {isCollapsed && (
                <div className="absolute left-full ml-3 px-2.5 py-1 bg-[#0c1024] border border-white/15 rounded-lg text-xs text-white whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 shadow-lg">
                  HR Actions ({pendingActionsCount})
                </div>
              )}
            </button>
          </nav>
        </div>

        {/* Intelligence & Analytics */}
        <div className="flex flex-col">
          {!isCollapsed && (
            <p className="px-3 mb-1.5 font-mono text-[10px] text-white/40 uppercase tracking-widest font-semibold">
              Intelligence
            </p>
          )}
          <nav className={`flex flex-col ${isCollapsed ? 'gap-1' : 'gap-1.5'}`}>
            {/* Insights */}
            <button
              onClick={() => onSelectTab('insights')}
              className={`rounded-xl transition-all duration-200 text-left relative group ${
                isCollapsed 
                  ? 'w-10 h-10 p-0 flex items-center justify-center mx-auto' 
                  : 'w-full flex items-center gap-3 px-3 py-2.5'
              } ${
                activeTab === 'insights'
                  ? 'bg-white/[0.12] text-white font-medium shadow-[inset_0_1px_1px_rgba(255,255,255,0.25)] border border-cyan-400/40'
                  : 'text-white/60 hover:text-white hover:bg-white/[0.06] border border-transparent'
              }`}
            >
              {activeTab === 'insights' && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 rounded-r-full bg-cyan-400 shadow-[0_0_10px_#00f0ff]" />
              )}
              <span className="material-symbols-outlined text-[20px]">
                insights
              </span>
              {!isCollapsed && <span className="text-sm">Insights</span>}
              {isCollapsed && (
                <div className="absolute left-full ml-3 px-2.5 py-1 bg-[#0c1024] border border-white/15 rounded-lg text-xs text-white whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 shadow-lg">
                  Insights
                </div>
              )}
            </button>

            {/* Reports */}
            <button
              onClick={() => onSelectTab('reports')}
              className={`rounded-xl transition-all duration-200 text-left relative group ${
                isCollapsed 
                  ? 'w-10 h-10 p-0 flex items-center justify-center mx-auto' 
                  : 'w-full flex items-center gap-3 px-3 py-2.5'
              } ${
                activeTab === 'reports'
                  ? 'bg-white/[0.12] text-white font-medium shadow-[inset_0_1px_1px_rgba(255,255,255,0.25)] border border-cyan-400/40'
                  : 'text-white/60 hover:text-white hover:bg-white/[0.06] border border-transparent'
              }`}
            >
              {activeTab === 'reports' && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 rounded-r-full bg-cyan-400 shadow-[0_0_10px_#00f0ff]" />
              )}
              <span className="material-symbols-outlined text-[20px]">
                summarize
              </span>
              {!isCollapsed && <span className="text-sm">Reports</span>}
              {isCollapsed && (
                <div className="absolute left-full ml-3 px-2.5 py-1 bg-[#0c1024] border border-white/15 rounded-lg text-xs text-white whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 shadow-lg">
                  Reports
                </div>
              )}
            </button>
          </nav>
        </div>
      </div>

      {/* System & Telemetry Capsule */}
      <div className={`flex flex-col ${isCollapsed ? 'gap-1 pt-2 border-t border-white/10' : 'gap-2 pt-3 border-t border-white/10'}`}>
        {!isCollapsed && (
          <p className="px-3 font-mono text-[10px] text-white/40 uppercase tracking-widest font-semibold">
            System
          </p>
        )}
        <nav className={`flex flex-col ${isCollapsed ? 'gap-1' : 'gap-1'}`}>
          <button
            onClick={() => onSelectTab('settings')}
            className={`rounded-xl transition-colors text-left group relative ${
              isCollapsed 
                ? 'w-10 h-10 p-0 flex items-center justify-center mx-auto' 
                : 'w-full flex items-center gap-3 px-3 py-2'
            } ${
              activeTab === 'settings' ? 'bg-white/10 text-white font-medium border border-cyan-400/40' : 'text-white/60 hover:text-white hover:bg-white/[0.06] border border-transparent'
            }`}
          >
            <span className="material-symbols-outlined text-[19px]">settings</span>
            {!isCollapsed && <span className="text-sm">Settings</span>}
            {isCollapsed && (
              <div className="absolute left-full ml-3 px-2.5 py-1 bg-[#0c1024] border border-white/15 rounded-lg text-xs text-white whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 shadow-lg">
                Settings
              </div>
            )}
          </button>
          <button
            onClick={() => onSelectTab('hr-profile')}
            className={`rounded-xl transition-colors text-left group relative ${
              isCollapsed 
                ? 'w-10 h-10 p-0 flex items-center justify-center mx-auto' 
                : 'w-full flex items-center gap-3 px-3 py-2'
            } ${
              activeTab === 'hr-profile' ? 'bg-white/10 text-white font-medium border border-cyan-400/40' : 'text-white/60 hover:text-white hover:bg-white/[0.06] border border-transparent'
            }`}
          >
            <span className="material-symbols-outlined text-[19px]">account_box</span>
            {!isCollapsed && <span className="text-sm">HR Profile</span>}
            {isCollapsed && (
              <div className="absolute left-full ml-3 px-2.5 py-1 bg-[#0c1024] border border-white/15 rounded-lg text-xs text-white whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 shadow-lg">
                HR Profile
              </div>
            )}
          </button>
        </nav>

        {/* Live Node Status Capsule */}
        <div 
          className={`mt-1 rounded-xl bg-black/40 border border-white/10 flex items-center ${
            isCollapsed ? 'w-10 h-10 justify-center mx-auto p-0' : 'p-2.5 justify-between'
          }`}
          title={isCollapsed ? "Neural Core OK • 99.8% SLA" : undefined}
        >
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            {!isCollapsed && <span className="text-[11px] font-mono text-white/70">Neural Core OK</span>}
          </div>
          {!isCollapsed && <span className="text-[10px] font-mono text-cyan-300">99.8% SLA</span>}
        </div>
      </div>
    </aside>
  );
};
