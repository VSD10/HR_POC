import React from 'react';
import { DashboardMetrics } from '../../types/hr';

interface AIOperationsCardProps {
  metrics: DashboardMetrics;
  onNavigateTriage: () => void;
  onNavigateCopilot: () => void;
  onNavigateDeliverables: () => void;
}

export const AIOperationsCard: React.FC<AIOperationsCardProps> = ({
  metrics,
  onNavigateTriage,
  onNavigateCopilot,
  onNavigateDeliverables
}) => {
  return (
    <section
      aria-label="AI Operations"
      className="rounded-3xl p-6 bg-gradient-to-r from-blue-950/40 via-purple-950/30 to-indigo-950/40 backdrop-blur-2xl border border-white/15 shadow-glass relative overflow-hidden specular-border"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white shadow-neon-violet border border-white/25">
            <span className="material-symbols-outlined text-[22px]">smart_toy</span>
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h3 className="font-display text-lg font-bold text-white tracking-tight">
                AI Operations
              </h3>
              <span className="px-2.5 py-0.5 rounded-full bg-purple-500/20 border border-purple-500/40 text-purple-300 font-mono text-[10px] tracking-wide font-medium">
                REAL-TIME TELEMETRY
              </span>
            </div>
            <p className="text-xs text-white/50">
              Automated classification, contextual grounding, and deliverable drafting
            </p>
          </div>
        </div>

        <button
          onClick={onNavigateTriage}
          className="text-xs font-mono text-cyan-300 hover:text-white inline-flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <span>View AI activity</span>
          <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
        </button>
      </div>

      {/* 3 Frosted Metric Capsules */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Capsule 1 */}
        <div 
          onClick={onNavigateTriage}
          className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 flex items-start gap-3.5 hover:bg-white/[0.06] transition-all cursor-pointer"
        >
          <div className="p-2 rounded-xl bg-cyan-500/15 border border-cyan-500/30 text-neon-cyan shadow-neon-cyan">
            <span className="material-symbols-outlined text-[22px]">auto_awesome</span>
          </div>
          <div>
            <div className="font-display text-2xl font-bold text-white tracking-tight">
              {metrics.aiTriagedToday}
            </div>
            <div className="text-xs font-semibold text-white/90 mt-0.5">
              AI Triaged Today
            </div>
            <p className="text-[11px] text-white/50 mt-1">
              99.1% routing accuracy without human re-route
            </p>
          </div>
        </div>

        {/* Capsule 2 */}
        <div 
          onClick={onNavigateCopilot}
          className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 flex items-start gap-3.5 hover:bg-white/[0.06] transition-all cursor-pointer"
        >
          <div className="p-2 rounded-xl bg-purple-500/15 border border-purple-500/30 text-purple-300 shadow-neon-violet">
            <span className="material-symbols-outlined text-[22px]">psychology</span>
          </div>
          <div>
            <div className="font-display text-2xl font-bold text-white tracking-tight">
              {metrics.aiAssistedCases}
            </div>
            <div className="text-xs font-semibold text-white/90 mt-0.5">
              AI Assisted Cases
            </div>
            <p className="text-[11px] text-white/50 mt-1">
              Policy citations &amp; benefit calculators delivered
            </p>
          </div>
        </div>

        {/* Capsule 3 */}
        <div 
          onClick={onNavigateDeliverables}
          className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 flex items-start gap-3.5 hover:bg-white/[0.06] transition-all cursor-pointer"
        >
          <div className="p-2 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-neon-emerald shadow-neon-emerald">
            <span className="material-symbols-outlined text-[22px]">edit_note</span>
          </div>
          <div>
            <div className="font-display text-2xl font-bold text-white tracking-tight">
              {metrics.draftsGenerated}
            </div>
            <div className="text-xs font-semibold text-white/90 mt-0.5">
              Drafts Generated
            </div>
            <p className="text-[11px] text-white/50 mt-1">
              Response letters ready in HR review queue
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
