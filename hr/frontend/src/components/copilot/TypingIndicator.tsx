import React, { useState, useEffect } from 'react';
import { Bot, Loader2, Sparkles } from 'lucide-react';

export const TypingIndicator: React.FC = () => {
  const [stage, setStage] = useState<'searching' | 'synthesizing'>('searching');

  useEffect(() => {
    const timer = setTimeout(() => {
      setStage('synthesizing');
    }, 1400);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="flex gap-3 sm:gap-4 max-w-xl animate-fadeIn">
      {/* Bot Icon with glowing orbit */}
      <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-600 to-cyan-500 p-0.5 shadow-[0_0_16px_rgba(168,85,247,0.35)] flex-shrink-0 flex items-center justify-center animate-pulse">
        <div className="w-full h-full rounded-[10px] bg-[#0c1024] flex items-center justify-center text-cyan-300">
          <Bot className="w-4 h-4 text-cyan-400" />
        </div>
      </div>

      {/* Typing Bubble */}
      <div className="p-4 rounded-2xl bg-white/[0.04] backdrop-blur-xl border border-white/12 shadow-glass flex flex-col gap-2">
        <div className="flex items-center gap-2.5 text-xs sm:text-sm font-mono text-cyan-300">
          <Loader2 className="w-3.5 h-3.5 text-cyan-400 animate-spin" />
          <span>
            {stage === 'searching'
              ? 'Searching company policy documents...'
              : 'Synthesizing verified policy response...'}
          </span>
        </div>

        <div className="flex items-center gap-1.5 text-[10px] font-mono text-white/40">
          <Sparkles className="w-3 h-3 text-cyan-400/70" />
          <span>LangChain RAG • ChromaDB Vector Store (:8001)</span>
        </div>
      </div>
    </div>
  );
};
