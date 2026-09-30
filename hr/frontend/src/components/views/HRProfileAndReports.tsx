import React from 'react';

export const HRProfileView: React.FC = () => {
  return (
    <div className="flex-1 flex flex-col gap-6 max-w-4xl">
      <div className="rounded-3xl p-6 bg-white/[0.04] backdrop-blur-2xl border border-white/10 shadow-glass specular-border space-y-6">
        <div className="flex items-center gap-4 pb-6 border-b border-white/10">
          <img
            alt="Sarah Jenkins Headshot"
            className="w-16 h-16 rounded-2xl object-cover ring-2 ring-cyan-400/50 shadow-neon-cyan"
            src="https://lh3.googleusercontent.com/aida/AEtjO1Xtd_6Zzb5GlqZHxkO20YhGWUIh5W6zeXIQMhT-wo_XWwgwVuROluO2YbW2xoNMM9EX4rSJ9HfXVhPfo0-FHKC9ypn5YpZDfKfjsev9tVACXOmHmujbKFBPnxdIa0mK0Il1qM1GRlo1u2Phyfe_WS_DSjxP_VA-_CcPCooGoexaXN5JJnUeX6ce0c_p78M6YXoqa2h8-dvIVVZUElaP5exk5NPsZxfpbZryLSyTPFga3mLVWeRTcUTS_B0"
          />
          <div>
            <h2 className="font-display text-xl font-bold text-white tracking-tight">
              Sarah Jenkins
            </h2>
            <p className="text-xs font-mono text-cyan-300">
              HR Operations Lead · Enterprise Global People Ops
            </p>
            <span className="inline-block mt-2 px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-[10px] font-mono">
              Role: HR_ADMIN · Security Clearance Level 3
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
          <div className="p-4 rounded-xl bg-black/40 border border-white/5 space-y-1">
            <span className="text-white/40">Email:</span>
            <p className="text-white font-medium">sarah.jenkins@enterprise.internal</p>
          </div>

          <div className="p-4 rounded-xl bg-black/40 border border-white/5 space-y-1">
            <span className="text-white/40">Jurisdiction:</span>
            <p className="text-white font-medium">Global (US, EMEA, APAC Coverage)</p>
          </div>

          <div className="p-4 rounded-xl bg-black/40 border border-white/5 space-y-1">
            <span className="text-white/40">Active Cases Supervised:</span>
            <p className="text-neon-cyan font-bold text-sm">128 Cases</p>
          </div>

          <div className="p-4 rounded-xl bg-black/40 border border-white/5 space-y-1">
            <span className="text-white/40">SLA Performance Rating:</span>
            <p className="text-neon-emerald font-bold text-sm">99.4% Exceeded</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Re-export dedicated ReportsView for seamless backwards compatibility
export { ReportsView } from './ReportsView';
