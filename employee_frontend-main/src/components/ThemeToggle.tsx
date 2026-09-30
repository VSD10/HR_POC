import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export const ThemeToggle: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <button
      onClick={toggleTheme}
      type="button"
      title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      aria-label="Toggle Theme"
      className={`relative inline-flex items-center justify-between p-1 w-14 h-8 rounded-xl bg-slate-200/70 dark:bg-white/10 border border-slate-300/80 dark:border-white/15 hover:border-teal-500/50 shadow-inner backdrop-blur-md transition-all duration-300 cursor-pointer ${className}`}
    >
      {/* Light Icon */}
      <span
        className={`flex items-center justify-center w-5 h-5 transition-colors duration-200 z-10 ${
          isDark ? 'text-slate-400' : 'text-amber-500'
        }`}
      >
        <Sun className="w-3.5 h-3.5" />
      </span>

      {/* Dark Icon */}
      <span
        className={`flex items-center justify-center w-5 h-5 transition-colors duration-200 z-10 ${
          isDark ? 'text-teal-300' : 'text-slate-400'
        }`}
      >
        <Moon className="w-3.5 h-3.5" />
      </span>

      {/* Sliding Pill Thumb */}
      <span
        className={`absolute top-1 bottom-1 w-6 rounded-lg bg-gradient-to-tr transition-transform duration-300 shadow-md ${
          isDark
            ? 'left-1 translate-x-6 from-teal-600 to-indigo-600 shadow-teal-500/30'
            : 'left-1 translate-x-0 from-amber-400 to-orange-400 shadow-amber-500/30'
        }`}
      />
    </button>
  );
};
