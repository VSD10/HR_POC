import React, { useState } from 'react';
import { VelocityData } from '../../types/hr';

interface VelocityChartProps {
  velocity: VelocityData;
  activeRange: '7D' | '30D' | '90D';
  onChangeRange: (range: '7D' | '30D' | '90D') => void;
}

export const VelocityChart: React.FC<VelocityChartProps> = ({
  velocity,
  activeRange,
  onChangeRange
}) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // SVG coordinate calculations
  const width = 640;
  const height = 220;
  const paddingLeft = 46;
  const paddingRight = 24;
  const paddingTop = 28;
  const paddingBottom = 28;

  const maxVal = Math.max(...velocity.incoming, ...velocity.resolved, 100);
  const minVal = 0;

  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;

  const getX = (index: number) => {
    return paddingLeft + (index / (velocity.labels.length - 1)) * chartWidth;
  };

  const getY = (val: number) => {
    return height - paddingBottom - (val / maxVal) * chartHeight;
  };

  // Build SVG paths
  const incomingPoints = velocity.incoming.map((val, i) => `${getX(i)},${getY(val)}`);
  const resolvedPoints = velocity.resolved.map((val, i) => `${getX(i)},${getY(val)}`);

  const incomingPath = `M ${incomingPoints.join(' L ')}`;
  const resolvedPath = `M ${resolvedPoints.join(' L ')}`;

  // Bounded polygon ambient fill (starts at first node x, ends at last node x)
  const startX = getX(0);
  const endX = getX(velocity.labels.length - 1);
  const baselineY = height - paddingBottom;
  const polygonPoints = `${startX},${baselineY} ${incomingPoints.join(' ')} ${endX},${baselineY}`;

  // Y-axis gridline steps
  const gridSteps = [
    { val: Math.round(maxVal), label: `${Math.round(maxVal)}` },
    { val: Math.round(maxVal * 0.66), label: `${Math.round(maxVal * 0.66)}` },
    { val: Math.round(maxVal * 0.33), label: `${Math.round(maxVal * 0.33)}` },
    { val: 0, label: '0' }
  ];

  return (
    <section className="lg:col-span-7 xl:col-span-8 rounded-3xl p-6 bg-white/[0.04] backdrop-blur-2xl border border-white/10 shadow-glass flex flex-col justify-between specular-border relative">
      <div>
        {/* Header with Title and Range Switcher */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
          <div>
            <h3 className="font-display text-lg font-bold text-white tracking-tight">
              Request Overview
            </h3>
            <p className="text-xs text-white/50">
              Velocity comparison: Incoming telemetry vs Autonomous resolutions
            </p>
          </div>

          {/* Frosted Time Range Switcher */}
          <div className="inline-flex p-1 bg-black/40 border border-white/10 rounded-xl backdrop-blur-xl text-xs font-mono">
            {(['7D', '30D', '90D'] as const).map((rng) => (
              <button
                key={rng}
                onClick={() => onChangeRange(rng)}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  activeRange === rng
                    ? 'bg-white/15 text-white font-medium shadow-sm'
                    : 'text-white/50 hover:text-white'
                }`}
                type="button"
              >
                {rng}
              </button>
            ))}
          </div>
        </div>

        {/* Interactive Glass Legend with Live Tooltip Display */}
        <div className="flex items-center justify-between gap-4 mb-4 text-xs font-mono">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <span className="w-3 h-1 bg-neon-cyan rounded-full shadow-[0_0_8px_#00f0ff]" />
              <span className="text-white/90">Incoming Requests</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-1 bg-neon-emerald rounded-full shadow-[0_0_8px_#10b981]" />
              <span className="text-white/60">Resolved Cases</span>
            </div>
          </div>

          {hoveredIndex !== null && (
            <div className="hidden sm:flex items-center gap-3 px-2.5 py-1 rounded-lg bg-black/60 border border-cyan-400/30 text-[11px] font-mono animate-fadeIn">
              <span className="text-white/60">{velocity.labels[hoveredIndex]}:</span>
              <span className="text-neon-cyan font-bold">{velocity.incoming[hoveredIndex]} in</span>
              <span className="text-white/20">/</span>
              <span className="text-neon-emerald font-bold">{velocity.resolved[hoveredIndex]} out</span>
            </div>
          )}
        </div>

        {/* Glowing Spatial SVG Chart Canvas */}
        <div className="w-full relative h-64 sm:h-72">
          <svg
            aria-label={`Request trend over ${activeRange}`}
            className="w-full h-full overflow-visible"
            preserveAspectRatio="none"
            viewBox={`0 0 ${width} ${height}`}
          >
            <defs>
              <linearGradient id="cyanGlow" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="#00f0ff" stopOpacity="0.32" />
                <stop offset="65%" stopColor="#3b82f6" stopOpacity="0.08" />
                <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0" />
              </linearGradient>
              <filter height="150%" id="neonBlur" width="150%" x="-25%" y="-25%">
                <feGaussianBlur result="blur" stdDeviation="3.5" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* Horizontal Gridlines & Y-Axis Reference Values */}
            {gridSteps.map((step, idx) => {
              const y = getY(step.val);
              return (
                <g key={`grid-${idx}`}>
                  <line
                    x1={paddingLeft}
                    y1={y}
                    x2={width - paddingRight}
                    y2={y}
                    stroke="rgba(255,255,255,0.06)"
                    strokeDasharray="4 4"
                    strokeWidth="1"
                  />
                  <text
                    x={paddingLeft - 8}
                    y={y + 3.5}
                    textAnchor="end"
                    fill="rgba(255,255,255,0.35)"
                    fontSize="10"
                    fontFamily="monospace"
                  >
                    {step.label}
                  </text>
                </g>
              );
            })}

            {/* Cyan Ambient Bounded Area Fill */}
            <polygon fill="url(#cyanGlow)" points={polygonPoints} />

            {/* Glow Underlying Path for bloom effect */}
            <path
              d={incomingPath}
              fill="none"
              filter="url(#neonBlur)"
              opacity="0.35"
              stroke="#00f0ff"
              strokeWidth="6"
            />

            {/* Incoming Line (Vivid Cyan Neon) */}
            <path
              d={incomingPath}
              fill="none"
              stroke="#00f0ff"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2.5"
            />

            {/* Resolved Line (Emerald Dashed Spatial line) */}
            <path
              d={resolvedPath}
              fill="none"
              opacity="0.85"
              stroke="#10b981"
              strokeDasharray="6 5"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
            />

            {/* Hover Crosshair Vertical Guide Line */}
            {hoveredIndex !== null && (
              <line
                x1={getX(hoveredIndex)}
                y1={paddingTop}
                x2={getX(hoveredIndex)}
                y2={baselineY}
                stroke="rgba(0, 240, 255, 0.4)"
                strokeDasharray="3 3"
                strokeWidth="1.5"
              />
            )}

            {/* Interactive Data Nodes */}
            {velocity.incoming.map((val, idx) => {
              const cx = getX(idx);
              const cy = getY(val);
              const isLast = idx === velocity.incoming.length - 1;
              const isHovered = hoveredIndex === idx;

              return (
                <g
                  key={`node-${idx}`}
                  onMouseEnter={() => setHoveredIndex(idx)}
                  onMouseLeave={() => setHoveredIndex(null)}
                  className="cursor-pointer"
                >
                  {/* Invisible enlarged hit target for effortless hover */}
                  <circle cx={cx} cy={cy} r="16" fill="transparent" />

                  {/* Pulsing halo if hovered or last */}
                  {(isLast || isHovered) && (
                    <circle
                      cx={cx}
                      cy={cy}
                      r="9"
                      fill="none"
                      stroke="#00f0ff"
                      strokeWidth="1"
                      opacity="0.5"
                      className="animate-ping"
                    />
                  )}

                  {/* Visual Circle */}
                  <circle
                    cx={cx}
                    cy={cy}
                    r={isLast || isHovered ? 5.5 : 3.5}
                    fill={isLast ? "#ffffff" : "#00f0ff"}
                    stroke="#00f0ff"
                    strokeWidth={isLast ? "2.5" : "1"}
                    className="transition-all duration-150"
                  />

                  {/* Floating Number Value on hover */}
                  {isHovered && (
                    <text
                      x={cx}
                      y={cy - 12}
                      textAnchor="middle"
                      fill="#00f0ff"
                      fontSize="11"
                      fontFamily="monospace"
                      fontWeight="bold"
                    >
                      {val}
                    </text>
                  )}
                </g>
              );
            })}
          </svg>

          {/* Perfectly Aligned X-Axis Day Labels */}
          <div className="relative w-full h-7 mt-3 pt-2 border-t border-white/10 font-mono text-[11px]">
            {velocity.labels.map((lbl, idx) => {
              const percentX = (getX(idx) / width) * 100;
              const isLast = idx === velocity.labels.length - 1;
              const isHovered = hoveredIndex === idx;

              return (
                <button
                  key={lbl}
                  type="button"
                  onMouseEnter={() => setHoveredIndex(idx)}
                  onMouseLeave={() => setHoveredIndex(null)}
                  style={{ left: `${percentX}%` }}
                  className={`absolute -translate-x-1/2 top-2 transition-all cursor-pointer whitespace-nowrap ${
                    isHovered
                      ? 'text-white font-bold scale-110'
                      : isLast
                      ? 'text-neon-cyan font-bold'
                      : 'text-white/40 hover:text-white/80'
                  }`}
                >
                  {lbl}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Chart Bottom Stat Capsule */}
      <div className="mt-8 p-3.5 bg-black/40 border border-white/10 rounded-2xl flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-neon-cyan shadow-[0_0_8px_#00f0ff]" />
          <span className="text-white font-bold">{velocity.openTotal}</span>
          <span className="text-white/50">open total</span>
        </div>
        <span className="text-white/20">|</span>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-blue-400" />
          <span className="text-white font-bold">{velocity.receivedToday}</span>
          <span className="text-white/50">received today</span>
        </div>
        <span className="text-white/20">|</span>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-neon-emerald shadow-[0_0_8px_#10b981]" />
          <span className="text-white font-bold">{velocity.resolvedToday}</span>
          <span className="text-white/50">resolved today</span>
        </div>
      </div>
    </section>
  );
};
