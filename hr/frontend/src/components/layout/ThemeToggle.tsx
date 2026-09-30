import React from 'react';
import { useTheme } from '../../context/ThemeContext';

export const ThemeToggle: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <button
      onClick={toggleTheme}
      type="button"
      title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
      aria-label="Toggle Theme"
      className={`relative inline-flex items-center justify-between p-1 w-14 h-8 rounded-xl bg-white/[0.06] border border-white/15 hover:border-cyan-400/50 shadow-inner backdrop-blur-md transition-all duration-300 cursor-pointer ${className}`}
    >
      {/* Light Icon */}
      <span className={`material-symbols-outlined text-[16px] transition-colors duration-200 z-10 ${
        isDark ? 'text-white/40' : 'text-amber-500 font-bold'
      }`}>
        light_mode
      </span>

      {/* Dark Icon */}
      <span className={`material-symbols-outlined text-[16px] transition-colors duration-200 z-10 ${
        isDark ? 'text-cyan-300 font-bold' : 'text-slate-400'
      }`}>
        dark_mode
      </span>

      {/* Sliding Pill Thumb */}
      <span
        className={`absolute top-1 bottom-1 w-6 rounded-lg bg-gradient-to-tr transition-transform duration-300 shadow-md ${
          isDark
            ? 'left-1 translate-x-6 from-indigo-600 to-cyan-500 shadow-neon-cyan'
            : 'left-1 translate-x-0 from-amber-400 to-orange-400 shadow-[0_0_12px_rgba(245,158,11,0.4)]'
        }`}
      />
    </button>
  );
};
