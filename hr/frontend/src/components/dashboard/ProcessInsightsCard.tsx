import React from 'react';
import { InsightItem } from '../../types/hr';

interface ProcessInsightsCardProps {
  insights: InsightItem[];
  onViewAll: () => void;
}

export const ProcessInsightsCard: React.FC<ProcessInsightsCardProps> = ({
  insights,
  onViewAll
}) => {
  return (
    <section className="rounded-3xl p-6 bg-white/[0.04] backdrop-blur-2xl border border-white/10 shadow-glass flex flex-col justify-between specular-border">
      <div>
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-blue-500/20 text-cyan-300">
              <span className="material-symbols-outlined text-[18px]">trending_up</span>
            </div>
            <h3 className="font-display text-lg font-bold text-white tracking-tight">
              Process Improvement
            </h3>
          </div>
          <span className="font-mono text-[11px] text-white/40">Automated Insights</span>
        </div>

        <div className="space-y-3">
          {insights.map((insight) => {
            const isWarning = insight.type === 'warning';
            const isEmerald = insight.type === 'emerald';

            return (
              <div
                key={insight.id}
                className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 flex items-start justify-between gap-3 hover:bg-white/[0.06] transition-all"
              >
                <div className="flex gap-3">
                  <span
                    className={`material-symbols-outlined text-[20px] mt-0.5 ${
                      isWarning
                        ? 'text-rose-400'
                        : isEmerald
                        ? 'text-emerald-400'
                        : 'text-cyan-400'
                    }`}
                  >
                    {insight.icon}
                  </span>
                  <div>
                    <h4 className="text-xs font-bold text-white">{insight.title}</h4>
                    <p className="text-xs text-white/50 mt-0.5">{insight.description}</p>
                  </div>
                </div>
                <button
                  onClick={onViewAll}
                  className={`font-mono text-xs whitespace-nowrap pt-1 transition-colors cursor-pointer ${
                    isWarning
                      ? 'text-rose-300 hover:text-white'
                      : isEmerald
                      ? 'text-emerald-300 hover:text-white'
                      : 'text-cyan-300 hover:text-white'
                  }`}
                >
                  View insight →
                </button>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-white/10">
        <button
          onClick={onViewAll}
          className="text-xs font-mono text-cyan-300 hover:text-white inline-flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <span>View all insights</span>
          <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
        </button>
      </div>
    </section>
  );
};
