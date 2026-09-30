import React from 'react';
import { useTheme } from '../../context/ThemeContext';

export const SpatialBackground: React.FC = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 transition-colors duration-500">
      {/* Deep background gradient */}
      <div
        className={`absolute inset-0 transition-opacity duration-500 ${
          isDark
            ? 'bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(59,130,246,0.18),rgba(6,8,20,0.95))]'
            : 'bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(186,230,253,0.4),rgba(241,245,249,0.98))]'
        }`}
      />

      {/* Orb 1: Violet/Purple glow top-left */}
      <div
        className={`absolute -top-36 -left-32 w-[650px] h-[650px] rounded-full blur-[140px] animate-pulse-glow transition-all duration-500 ${
          isDark ? 'bg-purple-600/20' : 'bg-purple-400/20'
        }`}
      />

      {/* Orb 2: Cyan/Cobalt center-right */}
      <div
        className={`absolute top-1/4 -right-48 w-[600px] h-[600px] rounded-full blur-[150px] transition-all duration-500 ${
          isDark ? 'bg-cyan-500/15' : 'bg-sky-400/20'
        }`}
      />

      {/* Orb 3: Electric Indigo/Blue center */}
      <div
        className={`absolute top-2/3 left-1/4 w-[700px] h-[550px] rounded-full blur-[160px] transition-all duration-500 ${
          isDark ? 'bg-indigo-600/15' : 'bg-indigo-300/15'
        }`}
      />

      {/* Orb 4: Subtle Emerald/Teal bottom-right */}
      <div
        className={`absolute bottom-0 right-1/4 w-[500px] h-[500px] rounded-full blur-[140px] transition-all duration-500 ${
          isDark ? 'bg-emerald-500/10' : 'bg-emerald-400/15'
        }`}
      />

      {/* Fine geometric spatial grid overlay */}
      <div
        className={`absolute inset-0 [size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] ${
          isDark
            ? 'bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)]'
            : 'bg-[linear-gradient(to_right,rgba(0,0,0,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,0.03)_1px,transparent_1px)]'
        }`}
      />
    </div>
  );
};
