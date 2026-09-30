import React, { useState, useEffect } from 'react';
import { Split, ExternalLink, RefreshCw, Sparkles, User, ShieldCheck, ArrowRight, Zap, CheckCircle2 } from 'lucide-react';
import { hrService } from '../../services/hrService';

export const SplitWorkflowView: React.FC = () => {
  const [splitRatio, setSplitRatio] = useState<'50-50' | '60-40' | '40-60'>('50-50');
  const [employeeFrameKey, setEmployeeFrameKey] = useState(0);
  const [hrFrameKey, setHrFrameKey] = useState(0);
  const [recentEvents, setRecentEvents] = useState<any[]>([]);

  // Listen for real-time events between the two portals
  useEffect(() => {
    const unsubscribe = hrService.subscribe((event) => {
      setRecentEvents((prev) => [
        {
          id: 'ev-' + Date.now() + Math.random(),
          time: new Date().toLocaleTimeString(),
          type: event.type,
          title: event.data?.request?.title || event.data?.activity?.actionText || 'Workflow Event',
          badge: event.type === 'REQUEST_CREATED' ? 'Employee Created' : 'HR Updated',
          color: event.type === 'REQUEST_CREATED' ? 'teal' : 'emerald'
        },
        ...prev.slice(0, 9)
      ]);
    });
    return unsubscribe;
  }, []);

  return (
    <div className="h-screen w-screen bg-[#050713] text-white flex flex-col overflow-hidden font-sans">
      {/* Top Split Control Bar */}
      <header className="h-14 px-4 bg-[#090d24]/90 border-b border-white/10 backdrop-blur-md flex items-center justify-between shrink-0 z-30">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center shadow-xs">
            <Split className="w-4 h-4 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-[14px] text-white tracking-tight">
                Simultaneous Dual-Portal Workflow Studio
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-medium tracking-wide bg-emerald-500/15 border border-emerald-400/30 text-emerald-300 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Live Port 8000 Sync Active
              </span>
            </div>
            <p className="text-[11px] text-white/50 hidden sm:block">
              Left: Employee Portal (Self-Service) &nbsp;•&nbsp; Right: HR Operations Cockpit (Specialist Queue)
            </p>
          </div>
        </div>

        {/* Center: Split Ratio Selector */}
        <div className="hidden md:flex items-center gap-1 bg-white/[0.06] p-1 rounded-xl border border-white/10">
          <button
            onClick={() => setSplitRatio('50-50')}
            className={`px-2.5 py-1 text-xs rounded-lg font-medium transition-colors ${
              splitRatio === '50-50' ? 'bg-white/20 text-white shadow-xs' : 'text-white/60 hover:text-white'
            }`}
          >
            50 / 50
          </button>
          <button
            onClick={() => setSplitRatio('60-40')}
            className={`px-2.5 py-1 text-xs rounded-lg font-medium transition-colors ${
              splitRatio === '60-40' ? 'bg-white/20 text-white shadow-xs' : 'text-white/60 hover:text-white'
            }`}
          >
            Employee 60%
          </button>
          <button
            onClick={() => setSplitRatio('40-60')}
            className={`px-2.5 py-1 text-xs rounded-lg font-medium transition-colors ${
              splitRatio === '40-60' ? 'bg-white/20 text-white shadow-xs' : 'text-white/60 hover:text-white'
            }`}
          >
            HR Desk 60%
          </button>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setEmployeeFrameKey((k) => k + 1);
              setHrFrameKey((k) => k + 1);
            }}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 hover:text-white transition-colors"
            title="Reload both portals"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          <a
            href="http://localhost:5174"
            target="_blank"
            rel="noreferrer"
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-teal-500/10 hover:bg-teal-500/20 border border-teal-500/30 text-teal-300 text-xs font-medium transition-all"
            title="Open Employee Portal in new window"
          >
            <User className="w-3.5 h-3.5" />
            <span>:5174 New Tab</span>
            <ExternalLink className="w-3 h-3 opacity-60" />
          </a>

          <a
            href="http://localhost:5173"
            target="_blank"
            rel="noreferrer"
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 text-xs font-medium transition-all"
            title="Open HR Operations in new window"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>:5173 New Tab</span>
            <ExternalLink className="w-3 h-3 opacity-60" />
          </a>

          <a
            href="/"
            className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-medium text-white transition-colors"
          >
            Exit Split
          </a>
        </div>
      </header>

      {/* Split Dual-Pane Viewports */}
      <div className="flex-1 flex min-h-0 overflow-hidden relative">
        {/* Left Pane: Employee Portal */}
        <div
          className={`h-full border-r border-white/15 flex flex-col relative transition-all duration-300 ${
            splitRatio === '50-50' ? 'w-1/2' : splitRatio === '60-40' ? 'w-[60%]' : 'w-[40%]'
          }`}
        >
          {/* Sub-header banner */}
          <div className="h-8 px-4 bg-teal-950/40 border-b border-teal-500/20 flex items-center justify-between text-[11px] font-mono text-teal-300 shrink-0">
            <span className="flex items-center gap-1.5">
              <User className="w-3.5 h-3.5" />
              <span>EMPLOYEE PORTAL (PORT 5174)</span>
            </span>
            <span className="text-white/50 text-[10px]">Self-Service Desk</span>
          </div>

          <iframe
            key={`emp-${employeeFrameKey}`}
            src="/?portal=employee"
            title="Employee Portal Viewport"
            className="flex-1 w-full border-0 bg-white"
          />
        </div>

        {/* Right Pane: HR Operations Cockpit */}
        <div
          className={`h-full flex flex-col relative transition-all duration-300 ${
            splitRatio === '50-50' ? 'w-1/2' : splitRatio === '60-40' ? 'w-[40%]' : 'w-[60%]'
          }`}
        >
          {/* Sub-header banner */}
          <div className="h-8 px-4 bg-cyan-950/40 border-b border-cyan-500/20 flex items-center justify-between text-[11px] font-mono text-cyan-300 shrink-0">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>HR OPERATIONS COCKPIT (PORT 5173)</span>
            </span>
            <span className="text-white/50 text-[10px]">Triage Queue & Service Desk</span>
          </div>

          <iframe
            key={`hr-${hrFrameKey}`}
            src="/?portal=hr"
            title="HR Operations Viewport"
            className="flex-1 w-full border-0 bg-[#050713]"
          />
        </div>
      </div>

      {/* Bottom Live Activity Ticker */}
      {recentEvents.length > 0 && (
        <footer className="h-8 px-4 bg-[#070b1a] border-t border-white/10 flex items-center gap-3 text-xs text-white/70 overflow-x-auto shrink-0 z-30">
          <span className="flex items-center gap-1 font-mono text-[10px] text-cyan-400 shrink-0 uppercase tracking-wider">
            <Zap className="w-3 h-3 text-cyan-400" />
            Live Sync:
          </span>
          <div className="flex items-center gap-4 overflow-x-auto whitespace-nowrap">
            {recentEvents.slice(0, 3).map((ev) => (
              <span key={ev.id} className="flex items-center gap-1.5 text-[11px]">
                <span className={`w-1.5 h-1.5 rounded-full ${ev.color === 'teal' ? 'bg-teal-400' : 'bg-emerald-400'}`} />
                <span className="font-mono text-white/40">{ev.time}</span>
                <span className="font-semibold text-white">{ev.title}</span>
                <span className="text-white/50">({ev.badge})</span>
              </span>
            ))}
          </div>
        </footer>
      )}
    </div>
  );
};

export default SplitWorkflowView;
