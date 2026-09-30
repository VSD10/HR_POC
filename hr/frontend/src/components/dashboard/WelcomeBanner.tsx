import React from 'react';

interface WelcomeBannerProps {
  onNewAction: () => void;
  avgSla: string;
  resolvedCount: number;
  urgentCount: number;
}

export const WelcomeBanner: React.FC<WelcomeBannerProps> = ({
  onNewAction,
  avgSla,
  resolvedCount,
  urgentCount
}) => {
  return (
    <header className="rounded-3xl p-6 md:p-8 bg-gradient-to-r from-blue-900/25 via-indigo-900/20 to-purple-900/25 backdrop-blur-2xl border border-white/15 shadow-glass-elevated relative overflow-hidden specular-border">
      <div className="absolute -right-16 -top-16 w-64 h-64 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -left-16 -bottom-16 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-black/40 border border-white/15 backdrop-blur-xl text-xs font-mono text-cyan-300 mb-3 shadow-inner">
            <span className="w-2 h-2 rounded-full bg-neon-cyan shadow-[0_0_8px_#00f0ff] animate-pulse" />
            <span>Operational Queue Live</span>
            <span className="text-white/20">|</span>
            <span className="text-white/80">Triage Agent 3.4 Active</span>
          </div>
          <h2 className="font-display text-2xl md:text-3xl lg:text-4xl font-bold text-white tracking-tight">
            Good morning,{' '}
            <span className="bg-gradient-to-r from-white via-slate-100 to-cyan-200 bg-clip-text text-transparent">
              Sarah
            </span>
          </h2>
          <p className="text-white/60 text-sm md:text-base mt-1.5 max-w-2xl font-light">
            Autonomous agent flows resolved{' '}
            <span className="text-white font-medium">{resolvedCount} cases</span> overnight.{' '}
            <span className="text-rose-300 font-medium">{urgentCount} high-urgency items</span> currently require your review.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-black/40 border border-white/15 backdrop-blur-xl font-mono text-xs text-white/80 shadow-inner">
            <span className="material-symbols-outlined text-[18px] text-neon-cyan">
              timer
            </span>
            <span>
              Avg SLA: <strong className="text-white font-bold text-sm">{avgSla}</strong>
            </span>
          </div>
          <button
            onClick={onNewAction}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 text-white font-semibold text-sm shadow-[0_0_24px_rgba(59,130,246,0.5)] border border-white/25 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
            type="button"
          >
            <span className="material-symbols-outlined text-[18px]">add_circle</span>
            <span>New Action</span>
          </button>
        </div>
      </div>
    </header>
  );
};
