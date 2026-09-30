import React from 'react';
import { ActivityEvent } from '../../types/hr';

interface RecentActivityFeedProps {
  activities: ActivityEvent[];
  onViewAll: () => void;
}

export const RecentActivityFeed: React.FC<RecentActivityFeedProps> = ({
  activities,
  onViewAll
}) => {
  return (
    <section
      aria-label="Recent Activity"
      className="rounded-3xl p-6 bg-white/[0.04] backdrop-blur-2xl border border-white/10 shadow-glass mb-6 specular-border"
    >
      <div className="flex items-center justify-between pb-4 mb-4 border-b border-white/10">
        <div className="flex items-center gap-2.5">
          <span className="material-symbols-outlined text-[20px] text-cyan-400">
            history
          </span>
          <h3 className="font-display text-lg font-bold text-white tracking-tight">
            Recent Activity
          </h3>
        </div>
        <button
          onClick={onViewAll}
          className="text-xs font-mono text-cyan-300 hover:text-white inline-flex items-center gap-1 transition-colors cursor-pointer"
        >
          <span>View activity</span>
          <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
        </button>
      </div>

      <div className="space-y-3">
        {activities.map((event) => {
          const isAI = event.actorType === 'ai';
          const isUser = event.actorType === 'user';
          const isResolved = event.actorType === 'resolved';

          const icon = isAI ? 'smart_toy' : isUser ? 'person' : 'check_circle';
          const iconBg = isAI
            ? 'bg-purple-500/20 text-purple-300 border-purple-500/30'
            : isUser
            ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30'
            : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';

          return (
            <div
              key={event.id}
              className="flex items-center justify-between p-3.5 rounded-2xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/10 transition-all"
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <span
                  className={`inline-flex items-center justify-center w-9 h-9 rounded-xl border ${iconBg}`}
                >
                  <span className="material-symbols-outlined text-[18px]">{icon}</span>
                </span>
                <div className="truncate">
                  <span
                    className={`inline-flex items-center gap-1 font-mono text-[10px] border px-2 py-0.5 rounded-md mr-2 font-semibold ${iconBg}`}
                  >
                    {event.actorName}
                  </span>
                  <span className="text-sm text-white font-medium">
                    {event.actionText}
                  </span>
                  {event.subText && (
                    <>
                      <span className="text-white/30 mx-1.5">·</span>
                      <span className="text-xs text-white/50">{event.subText}</span>
                    </>
                  )}
                  {event.tag && (
                    <>
                      <span className="text-white/30 mx-1.5">·</span>
                      <span
                        className={`font-mono text-xs font-medium ${
                          event.tag.color === 'rose'
                            ? 'text-rose-400'
                            : event.tag.color === 'emerald'
                            ? 'text-emerald-400'
                            : 'text-cyan-400'
                        }`}
                      >
                        {event.tag.text}
                      </span>
                    </>
                  )}
                </div>
              </div>
              <span className="font-mono text-xs text-white/40 whitespace-nowrap ml-4">
                {event.timeAgo}
              </span>
            </div>
          );
        })}
      </div>
    </section>
  );
};
