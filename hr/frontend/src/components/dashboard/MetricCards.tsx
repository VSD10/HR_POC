import React from 'react';
import { DashboardMetrics } from '../../types/hr';

interface MetricCardsProps {
  metrics: DashboardMetrics;
  onFilterUrgent?: () => void;
  onNavigateActions?: () => void;
  onNavigateRequests?: () => void;
}

export const MetricCards: React.FC<MetricCardsProps> = ({
  metrics,
  onFilterUrgent,
  onNavigateActions,
  onNavigateRequests
}) => {
  return (
    <section aria-label="Key Operational Metrics" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
      {/* Card 1: Open Requests */}
      <div 
        onClick={onNavigateRequests}
        className="group rounded-2xl p-5 bg-white/[0.04] hover:bg-white/[0.07] backdrop-blur-2xl border border-white/10 hover:border-white/20 transition-all duration-300 shadow-glass specular-border flex flex-col justify-between relative overflow-hidden cursor-pointer"
      >
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-mono uppercase tracking-wider text-white/60">Open Requests</span>
          <div className="p-2 rounded-xl bg-white/5 border border-white/10 text-cyan-400 group-hover:shadow-neon-cyan transition-all">
            <span className="material-symbols-outlined text-[18px]">inbox</span>
          </div>
        </div>
        <div>
          <div className="font-display text-3xl md:text-4xl font-bold text-white tracking-tight">
            {metrics.openRequests.count}
          </div>
          <div className="mt-3 flex items-center justify-between pt-2 border-t border-white/5">
            <span className="inline-flex items-center gap-1 text-[11px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
              <span className="material-symbols-outlined text-[12px]">trending_up</span> {metrics.openRequests.comparisonText}
            </span>
            <span className="text-[11px] text-white/40 font-mono">vs prev period</span>
          </div>
        </div>
      </div>

      {/* Card 2: High Priority */}
      <div 
        onClick={onFilterUrgent}
        className="group rounded-2xl p-5 bg-white/[0.04] hover:bg-white/[0.07] backdrop-blur-2xl border border-rose-500/20 hover:border-rose-500/40 transition-all duration-300 shadow-glass specular-border flex flex-col justify-between relative overflow-hidden cursor-pointer"
      >
        <div className="absolute -right-10 -top-10 w-24 h-24 bg-rose-500/15 rounded-full blur-xl pointer-events-none" />
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-mono uppercase tracking-wider text-rose-200/70">High Priority</span>
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500 shadow-[0_0_8px_#f43f5e]" />
          </span>
        </div>
        <div>
          <div className="font-display text-3xl md:text-4xl font-bold text-white tracking-tight">
            {metrics.highPriority.count}
          </div>
          <div className="mt-3 flex items-center justify-between pt-2 border-t border-white/5">
            <span className="inline-flex items-center gap-1.5 text-[11px] font-mono px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-400 shadow-[0_0_6px_#f43f5e]" />
              {metrics.highPriority.requiresAttention} require attention
            </span>
            <span className="text-[11px] text-rose-300/50 font-mono">Urgent</span>
          </div>
        </div>
      </div>

      {/* Card 3: Pending HR Action */}
      <div 
        onClick={onNavigateActions}
        className="group rounded-2xl p-5 bg-white/[0.04] hover:bg-white/[0.07] backdrop-blur-2xl border border-white/10 hover:border-white/20 transition-all duration-300 shadow-glass specular-border flex flex-col justify-between relative overflow-hidden cursor-pointer"
      >
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-mono uppercase tracking-wider text-white/60">Pending HR Action</span>
          <div className="p-2 rounded-xl bg-white/5 border border-white/10 text-amber-400 group-hover:text-amber-300 transition-all">
            <span className="material-symbols-outlined text-[18px]">pending_actions</span>
          </div>
        </div>
        <div>
          <div className="font-display text-3xl md:text-4xl font-bold text-white tracking-tight">
            {metrics.pendingHRActions.count}
          </div>
          <div className="mt-3 flex items-center justify-between pt-2 border-t border-white/5">
            <span className="inline-flex items-center gap-1 text-[11px] font-mono px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" /> {metrics.pendingHRActions.waitingOver24h} waiting &gt;24h
            </span>
            <span className="text-[11px] text-white/40 font-mono">Queue</span>
          </div>
        </div>
      </div>

      {/* Card 4: SLA Compliance */}
      <div className="group rounded-2xl p-5 bg-white/[0.04] hover:bg-white/[0.07] backdrop-blur-2xl border border-emerald-500/20 hover:border-emerald-500/35 transition-all duration-300 shadow-glass specular-border flex flex-col justify-between relative overflow-hidden">
        <div className="absolute -right-10 -top-10 w-24 h-24 bg-emerald-500/15 rounded-full blur-xl pointer-events-none" />
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-mono uppercase tracking-wider text-emerald-200/70">SLA Compliance</span>
          <div className="p-2 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 shadow-neon-emerald">
            <span className="material-symbols-outlined text-[18px]">verified</span>
          </div>
        </div>
        <div>
          <div className="font-display text-3xl md:text-4xl font-bold text-white tracking-tight">
            {metrics.slaCompliance.percent}%
          </div>
          <div className="mt-3 flex items-center justify-between pt-2 border-t border-white/5">
            <span className="inline-flex items-center gap-1 text-[11px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 font-semibold">
              <span className="material-symbols-outlined text-[12px]">arrow_upward</span> +{metrics.slaCompliance.changePercent}%
            </span>
            <span className="text-[11px] text-emerald-300/50 font-mono">Target {metrics.slaCompliance.targetPercent}%</span>
          </div>
        </div>
      </div>
    </section>
  );
};
