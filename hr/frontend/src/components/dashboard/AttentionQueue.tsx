import React from 'react';
import { RequestItem } from '../../types/hr';

interface AttentionQueueProps {
  items: RequestItem[];
  onReview: (item: RequestItem) => void;
  onViewAll: () => void;
}

export const AttentionQueue: React.FC<AttentionQueueProps> = ({
  items,
  onReview,
  onViewAll
}) => {
  return (
    <section className="lg:col-span-5 xl:col-span-4 rounded-3xl p-6 bg-white/[0.04] backdrop-blur-2xl border border-white/10 shadow-glass flex flex-col justify-between specular-border">
      <div>
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <h3 className="font-display text-lg font-bold text-white tracking-tight">
              Requires Your Attention
            </h3>
            <span className="px-2 py-0.5 rounded-full bg-rose-500/20 border border-rose-500/40 text-rose-300 font-mono text-xs font-bold shadow-[0_0_10px_rgba(244,63,94,0.3)]">
              {items.length}
            </span>
          </div>
          <button 
            onClick={onViewAll}
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/50 hover:text-white transition-colors cursor-pointer"
            title="Filter settings"
          >
            <span className="material-symbols-outlined text-[18px]">tune</span>
          </button>
        </div>

        {/* Priority Items List */}
        <div className="space-y-3">
          {items.map((item) => {
            const isHigh = item.priority === 'high';
            return (
              <article
                key={item.id}
                className={`p-3.5 rounded-2xl bg-white/[0.03] hover:bg-white/[0.08] border transition-all duration-200 group ${
                  isHigh
                    ? 'border-white/10 hover:border-rose-500/30'
                    : 'border-white/10 hover:border-amber-500/30'
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <h4 className="text-sm font-semibold text-white group-hover:text-cyan-300 transition-colors">
                      {item.title}
                    </h4>
                    <p className="text-xs text-white/50">
                      Employee: {item.employee.name}
                    </p>
                  </div>
                  <span
                    className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-mono whitespace-nowrap ${
                      isHigh
                        ? 'bg-rose-500/15 border border-rose-500/30 text-rose-300'
                        : 'bg-amber-500/15 border border-amber-500/30 text-amber-300'
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        isHigh ? 'bg-rose-500 animate-pulse' : 'bg-amber-400'
                      }`}
                    />
                    {isHigh ? 'High Priority' : 'Med Priority'}
                  </span>
                </div>

                <div className="flex items-center justify-between text-[11px] font-mono mt-3 pt-2 border-t border-white/5">
                  <span
                    className={`flex items-center gap-1 ${
                      isHigh ? 'text-rose-300/80' : 'text-white/50'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[14px]">
                      {isHigh ? 'hourglass_top' : 'schedule'}
                    </span>{' '}
                    Waiting {item.waitingTime}
                  </span>
                  <button
                    onClick={() => onReview(item)}
                    className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white font-medium flex items-center gap-1 border border-white/15 transition-all text-xs cursor-pointer hover:border-cyan-400/50"
                  >
                    Review <span className="text-cyan-300">→</span>
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-white/10">
        <button
          onClick={onViewAll}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-white/5 hover:bg-white/10 text-white font-semibold text-xs border border-white/10 transition-all text-center cursor-pointer"
        >
          <span>View all requests</span>
          <span className="material-symbols-outlined text-[16px] text-cyan-300">
            arrow_forward
          </span>
        </button>
      </div>
    </section>
  );
};
