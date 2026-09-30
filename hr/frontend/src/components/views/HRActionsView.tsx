import React from 'react';
import { HRActionItem } from '../../types/hr';

interface HRActionsViewProps {
  actions: HRActionItem[];
  onExecute: (id: string) => void;
}

export const HRActionsView: React.FC<HRActionsViewProps> = ({
  actions,
  onExecute
}) => {
  return (
    <div className="flex-1 flex flex-col gap-6">
      {/* Header Info */}
      <div className="rounded-3xl p-6 bg-white/[0.04] backdrop-blur-2xl border border-white/10 shadow-glass specular-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-xl font-bold text-white tracking-tight">
            Operational HR Actions Queue
          </h2>
          <p className="text-xs text-white/50">
            One-click execution of verified employee lifecycle workflows
          </p>
        </div>
        <span className="text-xs font-mono px-3 py-1.5 rounded-xl bg-amber-500/15 text-amber-300 border border-amber-500/30">
          {actions.filter(a => a.status === 'pending').length} Actions Pending Execution
        </span>
      </div>

      {/* Grid of Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {actions.map((act) => {
          const isPending = act.status === 'pending';
          const isHigh = act.urgency === 'HIGH';

          return (
            <div
              key={act.id}
              className="rounded-2xl p-5 bg-white/[0.03] hover:bg-white/[0.06] border border-white/10 transition-all flex flex-col justify-between specular-border"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-mono text-cyan-300 font-bold bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-400/20">
                    {act.id}
                  </span>
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded-full uppercase font-semibold ${
                        isHigh
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                          : 'bg-white/10 text-white/70'
                      }`}
                    >
                      {act.urgency} Urgency
                    </span>
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded-full uppercase font-semibold ${
                        isPending
                          ? 'bg-amber-500/20 text-amber-300'
                          : 'bg-emerald-500/20 text-emerald-300'
                      }`}
                    >
                      {act.status}
                    </span>
                  </div>
                </div>

                <h3 className="text-sm font-bold text-white mb-1">{act.title}</h3>
                <p className="text-xs text-white/50 mb-3 font-mono">
                  Target: {act.employeeName} · {act.department} · Effective: {act.effectiveDate}
                </p>

                <div className="p-3.5 rounded-xl bg-black/40 border border-white/5 text-xs text-white/80 font-light leading-relaxed mb-4">
                  {act.summary}
                </div>
              </div>

              <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs font-mono">
                <span className="text-white/40">{act.timestamp}</span>
                {isPending ? (
                  <button
                    onClick={() => onExecute(act.id)}
                    className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-semibold text-xs shadow-neon-cyan transition-all cursor-pointer"
                  >
                    Execute Workflow
                  </button>
                ) : (
                  <span className="text-emerald-300 text-[11px] flex items-center gap-1 font-semibold">
                    <span className="material-symbols-outlined text-[16px]">check_circle</span>
                    Executed Successfully
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
