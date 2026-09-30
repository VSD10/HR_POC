import React from 'react';
import { CategoryVolume } from '../../types/hr';

interface CategoryBreakdownCardProps {
  categories: CategoryVolume[];
  onSelectCategory?: (categoryName: string) => void;
}

export const CategoryBreakdownCard: React.FC<CategoryBreakdownCardProps> = ({
  categories,
  onSelectCategory
}) => {
  return (
    <section className="rounded-3xl p-6 bg-white/[0.04] backdrop-blur-2xl border border-white/10 shadow-glass flex flex-col justify-between specular-border">
      <div>
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-purple-500/20 text-purple-300">
              <span className="material-symbols-outlined text-[18px]">pie_chart</span>
            </div>
            <h3 className="font-display text-lg font-bold text-white tracking-tight">
              Request Categories
            </h3>
          </div>
          <span className="font-mono text-[11px] text-white/40">Current Week Volume</span>
        </div>

        <div className="space-y-3.5 pt-1">
          {categories.map((cat) => (
            <div 
              key={cat.name} 
              onClick={() => onSelectCategory && onSelectCategory(cat.name)}
              className="cursor-pointer group"
            >
              <div className="flex justify-between text-xs font-mono mb-1.5">
                <span className="text-white group-hover:text-cyan-300 transition-colors">
                  {cat.name}
                </span>
                <span className="text-white/60">
                  {cat.count} requests ({cat.percent}%)
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden p-0.5 border border-white/5">
                <div
                  className={`h-full rounded-full transition-all duration-500 bg-gradient-to-r ${cat.colorGradient}`}
                  style={{ width: `${cat.barWidthPercent}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 pt-3 flex items-center justify-between text-[11px] font-mono text-white/40 border-t border-white/10">
        <span>Total Processed: 134</span>
        <span className="text-cyan-300">Auto-Classified: 96%</span>
      </div>
    </section>
  );
};
