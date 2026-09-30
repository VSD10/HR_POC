import React, { useState } from 'react';
import { BookOpen, ChevronDown, ChevronUp, FileText, CheckCircle2, ExternalLink } from 'lucide-react';

export interface CitationItem {
  title: string;
  section?: string;
  page?: number;
}

interface SourceCitationsProps {
  citations: CitationItem[];
}

export const SourceCitations: React.FC<SourceCitationsProps> = ({ citations }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!citations || citations.length === 0) return null;

  // Deduplicate and group citations by document name
  const uniqueSources = citations.reduce<Array<{ title: string; filename: string; pages: number[] }>>((acc, item) => {
    const filename = item.section || item.title || 'Official Policy';
    const cleanTitle = item.title && !item.title.endsWith('.pdf') 
      ? item.title 
      : filename.replace('.pdf', '').replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
    
    const existing = acc.find(s => s.filename.toLowerCase() === filename.toLowerCase());
    if (existing) {
      if (item.page && !existing.pages.includes(item.page)) {
        existing.pages.push(item.page);
        existing.pages.sort((a, b) => a - b);
      }
    } else {
      acc.push({
        title: cleanTitle,
        filename: filename,
        pages: item.page ? [item.page] : []
      });
    }
    return acc;
  }, []);

  return (
    <div className="mt-3.5 rounded-2xl bg-gradient-to-r from-cyan-950/25 via-blue-950/20 to-slate-900/30 border border-cyan-500/20 shadow-sm overflow-hidden transition-all duration-200">
      {/* Header bar with toggle */}
      <button
        type="button"
        onClick={() => setIsExpanded(prev => !prev)}
        className="w-full px-3.5 py-2.5 flex items-center justify-between text-left hover:bg-white/[0.04] transition-colors cursor-pointer group"
      >
        <div className="flex items-center gap-2.5">
          <div className="w-6 h-6 rounded-lg bg-cyan-500/20 border border-cyan-400/30 flex items-center justify-center text-cyan-300">
            <BookOpen className="w-3.5 h-3.5" />
          </div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-semibold uppercase tracking-wider text-cyan-200">
              Verified Policy Grounding Sources
            </span>
            <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 border border-cyan-400/30 font-mono text-[10px] text-cyan-300">
              {uniqueSources.length} {uniqueSources.length === 1 ? 'Document' : 'Documents'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-white/50 group-hover:text-cyan-300 transition-colors">
          <span className="font-mono text-[11px] hidden sm:inline">
            {isExpanded ? 'Hide Details' : 'View Citations'}
          </span>
          {isExpanded ? (
            <ChevronUp className="w-4 h-4 text-cyan-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-white/60 group-hover:text-cyan-300" />
          )}
        </div>
      </button>

      {/* Citations Grid */}
      {isExpanded ? (
        <div className="p-3 pt-1 border-t border-white/10 space-y-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {uniqueSources.map((source, index) => (
              <div
                key={index}
                className="p-2.5 rounded-xl bg-black/40 border border-white/10 hover:border-cyan-400/30 transition-all flex flex-col justify-between gap-1.5 group/item"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <FileText className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                    <span className="text-xs font-semibold text-white truncate" title={source.title}>
                      {source.title}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-cyan-300/80 flex items-center gap-0.5 flex-shrink-0">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                    RAG Verified
                  </span>
                </div>

                <div className="flex items-center justify-between text-[11px] text-white/60 font-mono pt-1 border-t border-white/5">
                  <span className="truncate text-white/40 text-[10px]" title={source.filename}>
                    {source.filename}
                  </span>
                  {source.pages.length > 0 && (
                    <div className="flex items-center gap-1">
                      {source.pages.map(page => (
                        <span
                          key={page}
                          className="px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-200 border border-cyan-500/30 text-[10px] font-semibold"
                        >
                          Page {page}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          <p className="text-[10px] text-white/40 font-mono italic text-right pt-1">
            Indexed in Vector Knowledge Base via LangChain &amp; ChromaDB
          </p>
        </div>
      ) : (
        /* Collapsed pill preview */
        <div className="px-3.5 pb-2.5 flex flex-wrap gap-1.5 items-center">
          {uniqueSources.map((source, index) => (
            <span
              key={index}
              className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-black/30 border border-white/10 text-[11px] text-white/80 font-mono"
            >
              <FileText className="w-3 h-3 text-cyan-400" />
              <span className="truncate max-w-[160px] text-white/90">{source.title}</span>
              {source.pages.length > 0 && (
                <span className="text-cyan-300 text-[10px]">
                  (p. {source.pages.join(', ')})
                </span>
              )}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};
