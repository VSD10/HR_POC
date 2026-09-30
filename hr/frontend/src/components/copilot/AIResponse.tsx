import React, { useMemo } from 'react';
import { Bot, ShieldCheck, Sparkles, AlertCircle } from 'lucide-react';
import { MarkdownRenderer } from './MarkdownRenderer';
import { SourceCitations, CitationItem } from './SourceCitations';
import { ResponseActions } from './ResponseActions';

interface AIResponseProps {
  id: string;
  text: string;
  timestamp: string;
  citations?: CitationItem[];
  suggestedActions?: string[];
  isError?: boolean;
  onSelectAction?: (actionText: string) => void;
  onFeedback?: (type: 'up' | 'down') => void;
  onRetry?: () => void;
}

export const AIResponse: React.FC<AIResponseProps> = ({
  id,
  text,
  timestamp,
  citations = [],
  suggestedActions = [],
  isError = false,
  onSelectAction,
  onFeedback,
  onRetry
}) => {
  // Extract key metrics/figures dynamically from the real response text for quick executive scanning
  const keyHighlights = useMemo(() => {
    if (!text || isError) return [];
    
    const highlights: Array<{ label: string; value: string }> = [];
    const seenValues = new Set<string>();

    // 1. Look for currency patterns like "$500" or "$65"
    const currencyMatches = text.match(/\$\d+(?:,\d+)*(?:\.\d+)?(?:\s*(?:per\s+day|stipend|limit|reimbursement))?/gi);
    if (currencyMatches) {
      currencyMatches.slice(0, 2).forEach(match => {
        const clean = match.trim();
        if (!seenValues.has(clean.toLowerCase())) {
          seenValues.add(clean.toLowerCase());
          highlights.push({
            value: clean,
            label: clean.toLowerCase().includes('day') ? 'Daily Rate' : 'Allowance / Limit'
          });
        }
      });
    }

    // 2. Look for day / time allocations like "20 business days", "10 paid sick days", "1.67 days", "16 weeks", "90 days"
    const timeMatches = text.match(/\b\d+(?:\.\d+)?\s+(?:business\s+days|sick\s+days|annual\s+leave\s+days|calendar\s+days|paid\s+days|days|weeks|months)\b/gi);
    if (timeMatches) {
      timeMatches.slice(0, 3).forEach(match => {
        const clean = match.trim();
        if (!seenValues.has(clean.toLowerCase()) && highlights.length < 3) {
          seenValues.add(clean.toLowerCase());
          let label = 'Policy Quota';
          const lower = clean.toLowerCase();
          if (lower.includes('business') || lower.includes('annual')) label = 'Annual Leave';
          else if (lower.includes('sick')) label = 'Sick Leave';
          else if (lower.includes('week')) label = 'Entitlement';
          else if (lower.includes('month')) label = 'Accrual Period';
          highlights.push({ value: clean, label });
        }
      });
    }

    return highlights;
  }, [text, isError]);

  // Check if there is an explicit notice or restriction mentioned in the text
  const importantNotice = useMemo(() => {
    if (!text || isError) return null;
    const lines = text.split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (/^(?:note|important|restriction|please note|warning|caution):/i.test(trimmed)) {
        return trimmed.replace(/^(?:note|important|restriction|please note|warning|caution):\s*/i, '');
      }
    }
    return null;
  }, [text, isError]);

  if (isError) {
    return (
      <div className="flex gap-3 sm:gap-4 max-w-4xl w-full animate-fadeIn">
        <div className="w-8 h-8 rounded-xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-rose-400 flex-shrink-0 shadow-sm">
          <AlertCircle className="w-4 h-4" />
        </div>
        <div className="flex-1 rounded-2xl p-4 bg-rose-950/20 border border-rose-500/30 text-rose-200 text-xs sm:text-sm space-y-2.5">
          <div className="flex items-center gap-2 font-semibold text-rose-300">
            <span>Unable to retrieve official policy answer</span>
          </div>
          <p className="text-white/80 leading-relaxed">
            {text || "I couldn't retrieve an answer right now. Please check if the RAG backend service is active."}
          </p>
          {onRetry && (
            <button
              type="button"
              onClick={onRetry}
              className="px-3 py-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 text-rose-200 text-xs font-mono transition-all cursor-pointer"
            >
              Try Again
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-3 sm:gap-4 max-w-4xl w-full group/response animate-fadeIn">
      {/* Bot Avatar */}
      <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-600 to-cyan-500 p-0.5 shadow-[0_0_16px_rgba(168,85,247,0.35)] flex-shrink-0 flex items-center justify-center">
        <div className="w-full h-full rounded-[10px] bg-[#0c1024] flex items-center justify-center text-cyan-300">
          <Bot className="w-4 h-4 text-cyan-400" />
        </div>
      </div>

      {/* Main Response Card */}
      <div className="flex-1 min-w-0 rounded-2xl bg-white/[0.04] backdrop-blur-xl border border-white/12 p-4 sm:p-5 shadow-glass-elevated specular-border transition-all">
        {/* Top Header metadata */}
        <div className="flex items-center justify-between gap-2 pb-2.5 mb-3 border-b border-white/10">
          <div className="flex items-center gap-2">
            <span className="font-display font-bold text-xs sm:text-sm text-white tracking-tight flex items-center gap-1.5">
              HR Policy Copilot
              <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
            </span>
            <span className="px-2 py-0.5 rounded-full bg-cyan-950/60 border border-cyan-400/30 text-[10px] font-mono text-cyan-300">
              Verified Grounded
            </span>
          </div>
          <span className="text-[10px] font-mono text-white/40">
            {timestamp}
          </span>
        </div>

        {/* Dynamic Key Takeaway Pills (only when figures exist) */}
        {keyHighlights.length > 0 && (
          <div className="mb-3.5 p-3 rounded-xl bg-black/40 border border-white/10 space-y-1.5">
            <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider text-white/50 font-semibold">
              <Sparkles className="w-3 h-3 text-cyan-400" />
              <span>Key Policy Details</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {keyHighlights.map((k, i) => (
                <div
                  key={i}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-gradient-to-r from-cyan-500/15 to-indigo-500/15 border border-cyan-400/30 text-xs"
                >
                  <span className="font-bold text-cyan-200 font-mono">[{k.value}]</span>
                  <span className="text-white/70 text-[11px] font-sans">{k.label}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Formatted Markdown Content */}
        <div className="text-slate-100 font-sans">
          <MarkdownRenderer content={text} />
        </div>

        {/* Highlighted Policy Note / Callout if extracted */}
        {importantNotice && (
          <div className="mt-3 p-3 rounded-xl bg-amber-950/25 border border-amber-500/30 flex items-start gap-2.5 text-xs text-amber-200">
            <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <span className="font-semibold text-amber-300 uppercase tracking-wide text-[10px] block">
                Policy Condition / Note
              </span>
              <p className="text-amber-100/90 leading-relaxed font-sans">
                {importantNotice}
              </p>
            </div>
          </div>
        )}

        {/* Source Citations Drawer */}
        <SourceCitations citations={citations} />

        {/* Response Action Bar */}
        <ResponseActions
          answerText={text}
          suggestedActions={suggestedActions}
          onSelectAction={onSelectAction}
          onFeedback={onFeedback}
        />
      </div>
    </div>
  );
};
