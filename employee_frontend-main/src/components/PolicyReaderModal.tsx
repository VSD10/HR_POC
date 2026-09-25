import React from 'react';
import { X, BookOpen, Calendar, Clock, Share2, Check } from 'lucide-react';
import { PolicyItem } from '../types';

interface PolicyReaderModalProps {
  policy: PolicyItem | null;
  onClose: () => void;
}

export const PolicyReaderModal: React.FC<PolicyReaderModalProps> = ({
  policy,
  onClose,
}) => {
  if (!policy) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <div className="relative w-full max-w-2xl crystal-glass rounded-2xl shadow-2xl border border-white p-6 z-10 max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-white/70 gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#0D9488] bg-teal-50 px-2 py-0.5 rounded-md border border-teal-200/60">
                {policy.category}
              </span>
              <span className="text-[11px] text-slate-400 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {policy.readTime}
              </span>
            </div>
            <h3 className="text-[20px] font-bold text-[#0F172A] leading-snug">
              {policy.title}
            </h3>
            <p className="text-[12px] text-[#64748B] mt-0.5">
              Last revised: {policy.lastUpdated} • Approved by People Operations
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-white/80"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto py-5 space-y-4 pr-1">
          {policy.image && (
            <div className="w-full h-48 rounded-xl overflow-hidden shadow-xs border border-white">
              <img
                src={policy.image}
                alt={policy.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          <div className="p-4 rounded-xl bg-teal-50/60 border border-teal-100 text-[13px] text-teal-900 leading-relaxed font-medium">
            {policy.summary}
          </div>

          <div className="space-y-3 pt-1">
            <h4 className="text-[13px] font-bold uppercase tracking-wider text-slate-500">
              Policy Clauses & Eligibility
            </h4>
            <div className="space-y-2.5">
              {policy.content.map((clause, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl bg-white/70 border border-white/90 text-[13.5px] text-[#0F172A] leading-relaxed flex items-start gap-2.5"
                >
                  <div className="w-5 h-5 rounded-full bg-teal-500/10 text-[#0D9488] flex items-center justify-center text-[11px] font-bold mt-0.5 flex-shrink-0">
                    {idx + 1}
                  </div>
                  <span>{clause}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-white/70 flex items-center justify-between">
          <span className="text-[12px] text-slate-500">
            Questions? Ask via <strong className="text-[#0D9488]">Ask HR Assistant</strong>
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-[#0F172A] hover:bg-slate-800 text-white text-[13px] font-semibold transition-all shadow-sm"
          >
            Done Reading
          </button>
        </div>
      </div>
    </div>
  );
};
