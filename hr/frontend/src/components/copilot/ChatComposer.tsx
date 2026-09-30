import React, { useState, useRef, useEffect } from 'react';
import { ArrowUp, Loader2, Sparkles, ChevronUp, ChevronDown, X, ArrowRight } from 'lucide-react';

interface ChatComposerProps {
  input: string;
  onChangeInput: (val: string) => void;
  onSend: (text?: string) => void;
  loading: boolean;
  placeholder?: string;
}

const HR_OPERATIONAL_PROMPTS = [
  {
    category: 'Policy Review',
    label: 'Parental leave verification conditions',
    query: 'What policy conditions should HR verify before processing a parental leave request?'
  },
  {
    category: 'Case Resolution',
    label: 'Incomplete reimbursement audit checklist',
    query: 'An employee submitted an incomplete reimbursement claim. What should HR verify before processing it?'
  },
  {
    category: 'Documentation',
    label: 'Draft medical documents request email',
    query: 'Draft an email requesting missing medical leave documents from an employee.'
  },
  {
    category: 'Compliance',
    label: 'Remote work request audit steps',
    query: 'What steps should HR follow when reviewing a remote work request?'
  },
  {
    category: 'Policy Analysis',
    label: 'Compare annual vs sick leave eligibility',
    query: 'Compare the eligibility conditions for annual leave and sick leave.'
  },
  {
    category: 'Case Summary',
    label: 'Summarize medical leave grievance requirements',
    query: 'Summarize the key policy requirements relevant to an employee medical leave grievance.'
  }
];

export const ChatComposer: React.FC<ChatComposerProps> = ({
  input,
  onChangeInput,
  onSend,
  loading,
  placeholder = "Ask about HR policies, employee cases, or HR operations..."
}) => {
  const [isSuggestionsOpen, setIsSuggestionsOpen] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Automatically shrink and close the suggestions pop-up after each response or during loading
  useEffect(() => {
    if (loading) {
      setIsSuggestionsOpen(false);
    }
  }, [loading]);

  // Auto-resize textarea height
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const scrollHeight = textareaRef.current.scrollHeight;
      textareaRef.current.style.height = `${Math.min(Math.max(scrollHeight, 38), 100)}px`;
    }
  }, [input]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (input.trim() && !loading) {
        setIsSuggestionsOpen(false);
        onSend();
      }
    }
  };

  const handleSelectPrompt = (query: string) => {
    setIsSuggestionsOpen(false);
    onSend(query);
  };

  return (
    <div className="p-2 sm:p-2.5 bg-[#070a18]/95 backdrop-blur-xl border-t border-white/10 flex-shrink-0 relative">
      <div className="rounded-2xl bg-white/[0.04] border border-white/15 focus-within:border-cyan-400/70 focus-within:ring-1 focus-within:ring-cyan-400/30 transition-all flex items-end gap-1.5 px-3 py-1.5 shadow-inner">
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => onChangeInput(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            // If user focuses to type a new request, close the popup if open
            if (isSuggestionsOpen) setIsSuggestionsOpen(false);
          }}
          placeholder={placeholder}
          rows={1}
          disabled={loading}
          className="flex-1 bg-transparent text-white text-xs sm:text-sm placeholder:text-white/40 focus:outline-none resize-none leading-relaxed py-1 font-sans max-h-[100px]"
        />

        {/* Right side: Minimal Suggestions Pop-up Toggle */}
        <div className="relative flex items-center flex-shrink-0 mb-0.5">
          <button
            type="button"
            onClick={() => setIsSuggestionsOpen(prev => !prev)}
            className={`px-2 py-1 rounded-lg text-[11px] font-mono transition-all flex items-center gap-1 cursor-pointer border ${
              isSuggestionsOpen
                ? 'bg-cyan-500/20 text-cyan-200 border-cyan-400/50 shadow-[0_0_8px_rgba(0,240,255,0.3)]'
                : 'bg-white/[0.04] hover:bg-white/[0.08] text-white/60 hover:text-white border-white/10'
            }`}
            title="HR Suggestions & Prompt Templates"
          >
            <Sparkles className="w-3 h-3 text-cyan-400" />
            <span className="hidden sm:inline">Suggestions</span>
            {isSuggestionsOpen ? <ChevronDown className="w-3 h-3" /> : <ChevronUp className="w-3 h-3" />}
          </button>

          {/* Minimal Floating Pop-up on the Right Side */}
          {isSuggestionsOpen && (
            <div className="absolute bottom-full right-0 mb-2 w-72 sm:w-84 rounded-2xl bg-[#0c1024]/95 backdrop-blur-2xl border border-white/15 shadow-glass-elevated p-2.5 z-50 animate-fadeIn space-y-1.5 specular-border">
              <div className="flex items-center justify-between px-1 pb-1.5 border-b border-white/10">
                <span className="text-[10px] font-mono uppercase tracking-wider text-cyan-300 font-semibold flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-cyan-400" />
                  HR Operational Prompts
                </span>
                <button
                  type="button"
                  onClick={() => setIsSuggestionsOpen(false)}
                  className="p-1 rounded-lg hover:bg-white/10 text-white/50 hover:text-white cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>

              <div className="space-y-1 max-h-56 overflow-y-auto pr-1">
                {HR_OPERATIONAL_PROMPTS.map((prompt, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectPrompt(prompt.query)}
                    className="w-full p-2 rounded-xl bg-white/[0.02] hover:bg-cyan-500/10 border border-white/5 hover:border-cyan-400/30 text-left transition-all group flex items-start justify-between gap-1.5 cursor-pointer"
                  >
                    <div className="flex flex-col min-w-0 pr-1">
                      <span className="text-[9px] font-mono font-bold text-cyan-400 uppercase">
                        {prompt.category}
                      </span>
                      <span className="text-xs text-white/85 group-hover:text-cyan-100 truncate">
                        {prompt.label}
                      </span>
                    </div>
                    <ArrowRight className="w-3 h-3 text-white/30 group-hover:text-cyan-400 group-hover:translate-x-0.5 transition-all flex-shrink-0 mt-1" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Send Button */}
        <button
          type="button"
          onClick={() => {
            setIsSuggestionsOpen(false);
            onSend();
          }}
          disabled={!input.trim() || loading}
          className={`w-7 h-7 sm:w-8 sm:h-8 rounded-xl flex items-center justify-center transition-all duration-150 cursor-pointer flex-shrink-0 mb-0.5 ${
            input.trim() && !loading
              ? 'bg-gradient-to-tr from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-[0_0_10px_rgba(0,240,255,0.4)] hover:scale-105'
              : 'bg-white/5 border border-white/10 text-white/30 cursor-not-allowed'
          }`}
          title="Send query (Enter)"
        >
          {loading ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <ArrowUp className="w-4 h-4" />
          )}
        </button>
      </div>
    </div>
  );
};
