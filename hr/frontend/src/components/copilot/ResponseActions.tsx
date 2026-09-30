import React, { useState } from 'react';
import { Copy, Check, ThumbsUp, ThumbsDown, Sparkles, ArrowRight } from 'lucide-react';

interface ResponseActionsProps {
  answerText: string;
  suggestedActions?: string[];
  onSelectAction?: (actionText: string) => void;
  onFeedback?: (type: 'up' | 'down') => void;
  initialFeedback?: 'up' | 'down';
}

export const ResponseActions: React.FC<ResponseActionsProps> = ({
  answerText,
  suggestedActions = [],
  onSelectAction,
  onFeedback,
  initialFeedback
}) => {
  const [copied, setCopied] = useState(false);
  const [feedback, setFeedback] = useState<'up' | 'down' | null>(initialFeedback || null);

  const isEmailDraft = /(?:subject:|dear\s+[a-z]+|hi\s+[a-z]+)/i.test(answerText);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(answerText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
      const textArea = document.createElement('textarea');
      textArea.value = answerText;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleCopyDraft = async () => {
    // Extract subject/body draft if available or whole text
    try {
      await navigator.clipboard.writeText(answerText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  const handleFeedback = (type: 'up' | 'down') => {
    const next = feedback === type ? null : type;
    setFeedback(next);
    if (next && onFeedback) {
      onFeedback(next);
    }
  };

  return (
    <div className="mt-3.5 space-y-3 pt-2.5 border-t border-white/10">
      {/* Contextual Follow-up Suggestions */}
      {suggestedActions && suggestedActions.length > 0 && onSelectAction && (
        <div className="space-y-1.5">
          <div className="flex items-center gap-1.5 text-[11px] font-mono text-cyan-300/80 font-medium">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>Recommended HR Follow-up Actions:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {suggestedActions.map((action, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => onSelectAction(action)}
                className="group inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-950/40 hover:bg-cyan-900/50 border border-cyan-500/25 hover:border-cyan-400/50 text-cyan-200 hover:text-white text-xs transition-all duration-150 cursor-pointer shadow-sm hover:shadow-[0_0_12px_rgba(0,240,255,0.2)]"
              >
                <span>{action}</span>
                <ArrowRight className="w-3 h-3 text-cyan-400 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Action Toolbar */}
      <div className="flex items-center justify-between gap-3 text-xs text-white/60">
        <div className="flex items-center gap-2">
          {/* Copy Full Guidance */}
          <button
            type="button"
            onClick={handleCopy}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
              copied
                ? 'bg-emerald-500/20 border-emerald-400/40 text-emerald-300'
                : 'bg-white/[0.04] hover:bg-white/[0.08] border-white/10 text-white/70 hover:text-white'
            }`}
            title="Copy guidance to clipboard"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="font-mono text-[11px] text-emerald-300">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span className="font-mono text-[11px]">{isEmailDraft ? 'Copy Full Draft' : 'Copy Guidance'}</span>
              </>
            )}
          </button>

          {/* Feedback Thumbs */}
          <div className="flex items-center gap-1 ml-1 px-1.5 py-0.5 rounded-lg bg-white/[0.02] border border-white/5">
            <button
              type="button"
              onClick={() => handleFeedback('up')}
              className={`p-1 rounded-md transition-colors cursor-pointer ${
                feedback === 'up'
                  ? 'bg-cyan-500/20 text-cyan-300'
                  : 'hover:bg-white/10 text-white/50 hover:text-white'
              }`}
              title="Good response"
            >
              <ThumbsUp className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => handleFeedback('down')}
              className={`p-1 rounded-md transition-colors cursor-pointer ${
                feedback === 'down'
                  ? 'bg-rose-500/20 text-rose-300'
                  : 'hover:bg-white/10 text-white/50 hover:text-white'
              }`}
              title="Poor response"
            >
              <ThumbsDown className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <span className="font-mono text-[10px] text-white/40">
          Official HR Knowledge Base Grounded
        </span>
      </div>
    </div>
  );
};
