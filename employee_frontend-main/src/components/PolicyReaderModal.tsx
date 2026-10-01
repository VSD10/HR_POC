import React, { useState, useEffect } from 'react';
import { X, BookOpen, Clock, FileText, ExternalLink, Download, Layers, ShieldCheck } from 'lucide-react';
import { PolicyItem } from '../types';

interface PolicyReaderModalProps {
  policy: PolicyItem | null;
  initialMode?: 'pdf' | 'clauses';
  onClose: () => void;
}

export const PolicyReaderModal: React.FC<PolicyReaderModalProps> = ({
  policy,
  initialMode = 'pdf',
  onClose,
}) => {
  const [viewMode, setViewMode] = useState<'pdf' | 'clauses'>(initialMode);

  useEffect(() => {
    if (initialMode) {
      setViewMode(initialMode);
    }
  }, [initialMode, policy]);

  if (!policy) return null;

  const documentName = policy.documentName || (policy.title.toLowerCase().replace(/\s+/g, '_') + '.pdf');
  const pdfUrl = policy.documentUrl || `/policies/${documentName}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <div className="relative w-full max-w-4xl crystal-glass rounded-2xl shadow-2xl border border-white dark:border-white/10 p-5 sm:p-6 z-10 max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-white/70 dark:border-white/10 gap-3">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#0D9488] dark:text-teal-400 bg-teal-50 dark:bg-teal-500/20 px-2 py-0.5 rounded-md border border-teal-200/60 dark:border-teal-500/30">
                {policy.category}
              </span>
              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1 bg-white/60 dark:bg-white/10 px-2 py-0.5 rounded-md">
                <FileText className="w-3 h-3 text-teal-600 dark:text-teal-400" />
                {documentName}
              </span>
              <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-300 flex items-center gap-1 bg-emerald-50 dark:bg-emerald-500/20 px-2 py-0.5 rounded-md border border-emerald-200/50">
                <ShieldCheck className="w-3 h-3 text-emerald-600" />
                Verified Sangharsh Docs
              </span>
            </div>
            <h3 className="text-[20px] font-bold text-[#0F172A] dark:text-white leading-snug">
              {policy.title}
            </h3>
            <p className="text-[12px] text-[#64748B] dark:text-slate-300 mt-0.5">
              Last revised: {policy.lastUpdated} • Approved by People Operations
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-white/80 dark:hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* View Mode Tabs & Quick Links */}
        <div className="flex items-center justify-between gap-2 py-3 border-b border-white/60 dark:border-white/10 flex-wrap">
          <div className="flex items-center gap-1.5 bg-slate-100/80 dark:bg-white/10 p-1 rounded-xl">
            <button
              onClick={() => setViewMode('pdf')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-all ${
                viewMode === 'pdf'
                  ? 'bg-white dark:bg-teal-600 text-teal-700 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              View Policy Document (PDF)
            </button>
            <button
              onClick={() => setViewMode('clauses')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-all ${
                viewMode === 'clauses'
                  ? 'bg-white dark:bg-teal-600 text-teal-700 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              Summary & Clauses
            </button>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-teal-50 dark:bg-teal-500/20 text-[#0D9488] dark:text-teal-300 hover:bg-teal-100 text-[12px] font-semibold border border-teal-200/60 dark:border-teal-500/30 transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Open PDF in New Window
            </a>
            <a
              href={pdfUrl}
              download={documentName}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-slate-200 hover:bg-slate-200 text-[12px] font-semibold border border-slate-200 dark:border-white/10 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              Download
            </a>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto py-4 space-y-4">
          {viewMode === 'pdf' ? (
            <div className="w-full flex flex-col h-[560px] bg-slate-100 dark:bg-slate-900/60 rounded-xl overflow-hidden border border-slate-200 dark:border-white/10">
              <iframe
                src={`${pdfUrl}#toolbar=1&navpanes=1`}
                title={policy.title}
                className="w-full h-full border-none"
              />
            </div>
          ) : (
            <div className="space-y-4 pr-1">
              {policy.image && (
                <div className="w-full h-44 rounded-xl overflow-hidden shadow-xs border border-white dark:border-white/10">
                  <img
                    src={policy.image}
                    alt={policy.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              <div className="p-4 rounded-xl bg-teal-50/60 dark:bg-teal-900/30 border border-teal-100 dark:border-teal-500/30 text-[13px] text-teal-900 dark:text-teal-200 leading-relaxed font-medium">
                {policy.summary}
              </div>

              <div className="space-y-3 pt-1">
                <h4 className="text-[13px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Policy Clauses & Eligibility Criteria
                </h4>
                <div className="space-y-2.5">
                  {policy.content && policy.content.map((clause, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-xl bg-white/70 dark:bg-slate-800/70 border border-white/90 dark:border-white/10 text-[13.5px] text-[#0F172A] dark:text-slate-100 leading-relaxed flex items-start gap-2.5"
                    >
                      <div className="w-5 h-5 rounded-full bg-teal-500/10 dark:bg-teal-500/20 text-[#0D9488] dark:text-teal-400 flex items-center justify-center text-[11px] font-bold mt-0.5 flex-shrink-0">
                        {idx + 1}
                      </div>
                      <span>{clause}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pt-3.5 border-t border-white/70 dark:border-white/10 flex items-center justify-between">
          <span className="text-[12px] text-slate-500 dark:text-slate-400">
            Source file: <strong className="text-[#0D9488] dark:text-teal-400">{documentName}</strong> (Sangharsh Docs Collection)
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode(viewMode === 'pdf' ? 'clauses' : 'pdf')}
              className="px-3.5 py-2 rounded-xl bg-white/80 dark:bg-white/10 hover:bg-white text-slate-700 dark:text-slate-200 text-[12.5px] font-semibold border border-slate-200 dark:border-white/10 transition-all"
            >
              {viewMode === 'pdf' ? 'Show Clauses Summary' : 'Show PDF Viewer'}
            </button>
            <button
              onClick={onClose}
              className="px-5 py-2 rounded-xl bg-[#0F172A] dark:bg-teal-600 hover:bg-slate-800 dark:hover:bg-teal-500 text-white text-[13px] font-semibold transition-all shadow-sm"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
