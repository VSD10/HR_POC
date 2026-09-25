import React from 'react';
import { useAuth } from '../../context/AuthContext';

export const HRProfileView: React.FC = () => {
  const { user } = useAuth();

  const displayName = user?.name || 'Sarah Jenkins';
  const displayTitle = user?.title || user?.role || 'HR Operations Lead';
  const displayDepartment = user?.department || 'HR Operations';
  const displayEmail = user?.email || 'sarah.jenkins@enterprise.internal';
  const displayId = user?.id || 'HR001';
  const displayAvatar = user?.avatar || user?.avatarUrl || "https://lh3.googleusercontent.com/aida/AEtjO1Xtd_6Zzb5GlqZHxkO20YhGWUIh5W6zeXIQMhT-wo_XWwgwVuROluO2YbW2xoNMM9EX4rSJ9HfXVhPfo0-FHKC9ypn5YpZDfKfjsev9tVACXOmHmujbKFBPnxdIa0mK0Il1qM1GRlo1u2Phyfe_WS_DSjxP_VA-_CcPCooGoexaXN5JJnUeX6ce0c_p78M6YXoqa2h8-dvIVVZUElaP5exk5NPsZxfpbZryLSyTPFga3mLVWeRTcUTS_B0";
  const securityLevel = user?.securityLevel || 3;
  const tenure = user?.tenure || '3+ years';

  return (
    <div className="flex-1 flex flex-col gap-6 max-w-4xl">
      <div className="rounded-3xl p-6 bg-white/[0.04] backdrop-blur-2xl border border-white/10 shadow-glass specular-border space-y-6">
        <div className="flex items-center gap-4 pb-6 border-b border-white/10">
          <img
            alt={displayName}
            className="w-16 h-16 rounded-2xl object-cover ring-2 ring-cyan-400/50 shadow-neon-cyan"
            src={displayAvatar}
          />
          <div>
            <h2 className="font-display text-xl font-bold text-white tracking-tight">
              {displayName}
            </h2>
            <p className="text-xs font-mono text-cyan-300">
              {displayTitle} • {displayDepartment}
            </p>
            <span className="inline-block mt-2 px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-[10px] font-mono">
              ID: {displayId} • Security Clearance Level {securityLevel}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
          <div className="p-4 rounded-xl bg-black/40 border border-white/5 space-y-1">
            <span className="text-white/40">Email:</span>
            <p className="text-white font-medium">{displayEmail}</p>
          </div>

          <div className="p-4 rounded-xl bg-black/40 border border-white/5 space-y-1">
            <span className="text-white/40">Jurisdiction & Coverage:</span>
            <p className="text-white font-medium">Enterprise Global Operations ({displayDepartment})</p>
          </div>

          <div className="p-4 rounded-xl bg-black/40 border border-white/5 space-y-1">
            <span className="text-white/40">Tenure at Enterprise:</span>
            <p className="text-neon-cyan font-bold text-sm">{tenure}</p>
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

export const ReportsView: React.FC = () => {
  return (
    <div className="flex-1 flex flex-col gap-6 max-w-4xl">
      <div className="rounded-3xl p-6 bg-white/[0.04] backdrop-blur-2xl border border-white/10 shadow-glass specular-border space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-display text-xl font-bold text-white tracking-tight">
              Executive Audits &amp; Compliance Reports
            </h2>
            <p className="text-xs text-white/50">
              Cryptographically signed SLA reports for HIPAA, SOC2 Type II, and EEOC compliance
            </p>
          </div>
          <button 
            onClick={() => alert("Generating Q3 Full Compliance Audit Package (PDF)...")}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-xs transition-all cursor-pointer"
          >
            Generate Q3 Package
          </button>
        </div>

        <div className="space-y-3">
          {[
            { title: "Monthly SLA Compliance Audit (October 2026)", size: "2.4 MB", date: "Oct 24, 2026", hash: "sha256:4a8b...19e0" },
            { title: "Autonomous AI Routing Safety & Anti-Bias Audit", size: "1.8 MB", date: "Oct 20, 2026", hash: "sha256:91ce...f881" },
            { title: "Payroll Dispute Resolution Ledger (Q3 2026)", size: "4.1 MB", date: "Oct 15, 2026", hash: "sha256:77bc...3312" },
            { title: "SOC2 Security Enclave Access Logs", size: "1.1 MB", date: "Oct 01, 2026", hash: "sha256:ee04...aa55" }
          ].map((rep, i) => (
            <div key={i} className="p-4 rounded-xl bg-black/40 border border-white/5 flex items-center justify-between hover:bg-white/5 transition-all">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-cyan-400 text-[20px]">
                  description
                </span>
                <div>
                  <h4 className="text-xs font-semibold text-white">{rep.title}</h4>
                  <div className="text-[10px] text-white/40 flex items-center gap-3 mt-0.5">
                    <span>{rep.size}</span>
                    <span>•</span>
                    <span>{rep.date}</span>
                    <span>•</span>
                    <span className="text-cyan-300 font-mono">{rep.hash}</span>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => alert(`Downloading verified audit bundle for: ${rep.title}`)}
                className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white text-xs border border-white/10 hover:border-cyan-400/40 transition-all cursor-pointer"
              >
                Download
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};