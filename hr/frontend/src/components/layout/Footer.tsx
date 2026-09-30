import React from 'react';

interface FooterProps {
  onOpenCommandPalette: () => void;
  onQuickTriage: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  onOpenCommandPalette,
  onQuickTriage
}) => {
  return (
    <footer className="w-full flex flex-col sm:flex-row items-center justify-between gap-3 px-5 py-3 rounded-2xl bg-white/[0.03] border border-white/10 text-xs font-mono text-white/50 mb-4">
      <div className="flex items-center gap-4">
        <button
          onClick={onOpenCommandPalette}
          className="hover:text-white transition-colors cursor-pointer flex items-center gap-1.5 group"
        >
          <span>Command Bar:</span>
          <kbd className="px-2 py-0.5 bg-white/10 rounded-md border border-white/20 text-white font-semibold text-[11px] shadow-xs group-hover:border-cyan-400/50 transition-colors">
            ⌘K
          </kbd>
        </button>

        <button
          onClick={onQuickTriage}
          className="hover:text-white transition-colors cursor-pointer flex items-center gap-1.5 group"
        >
          <span>Quick Triage:</span>
          <kbd className="px-2 py-0.5 bg-white/10 rounded-md border border-white/20 text-white font-semibold text-[11px] shadow-xs group-hover:border-cyan-400/50 transition-colors">
            Alt + T
          </kbd>
        </button>
      </div>

      <div className="flex items-center gap-2">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_#10b981]" />
        <span>Encrypted &amp; HIPAA/SOC2 Compliant Enclave</span>
      </div>
    </footer>
  );
};
