import React from 'react';
import { Bot, RotateCcw, ShieldCheck, Sparkles, Plus } from 'lucide-react';

interface ChatHeaderProps {
  onNewChat: () => void;
  messageCount: number;
  ragStatus?: {
    status: string;
    knowledge_base_files: number;
    vector_store_ready: boolean;
  } | null;
  onOpenNewAction?: () => void;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({
  onNewChat,
  messageCount,
  ragStatus,
  onOpenNewAction
}) => {
  return (
    <div className="px-4 py-2 bg-white/[0.03] backdrop-blur-xl border-b border-white/10 flex items-center justify-between gap-3 flex-shrink-0">
      {/* Left side: Small AI icon, "AI Assistant", small subtle badge, status dot */}
      <div className="flex items-center gap-2.5 min-w-0">
        <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-cyan-400 via-indigo-500 to-purple-600 p-0.5 shadow-sm flex items-center justify-center flex-shrink-0">
          <div className="w-full h-full rounded-[6px] bg-[#0c1024] flex items-center justify-center text-cyan-300">
            <Bot className="w-3.5 h-3.5 text-cyan-400" />
          </div>
        </div>

        <span className="font-display font-semibold text-xs sm:text-sm text-white tracking-tight truncate">
          AI Assistant
        </span>

        <span className="hidden sm:inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-cyan-950/60 border border-cyan-400/25 text-[10px] font-mono text-cyan-300 flex-shrink-0">
          <ShieldCheck className="w-3 h-3 text-cyan-400" />
          HR Copilot
        </span>

        {/* Subtle RAG active indicator */}
        <div className="flex items-center gap-1.5 pl-1.5 border-l border-white/10 text-[10px] font-mono text-white/50 flex-shrink-0">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="hidden md:inline">RAG Active</span>
          {ragStatus?.knowledge_base_files ? (
            <span className="text-white/40 font-normal">({ragStatus.knowledge_base_files} policies)</span>
          ) : null}
        </div>
      </div>

      {/* Right side: New Chat button & optional quick actions */}
      <div className="flex items-center gap-2 flex-shrink-0">
        {onOpenNewAction && (
          <button
            type="button"
            onClick={onOpenNewAction}
            className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-white/70 hover:text-white text-xs font-mono transition-all cursor-pointer"
            title="Log HR Action"
          >
            <Plus className="w-3 h-3 text-cyan-400" />
            <span>Action</span>
          </button>
        )}

        <button
          type="button"
          onClick={onNewChat}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/[0.05] hover:bg-cyan-500/15 border border-white/10 hover:border-cyan-400/30 text-white/80 hover:text-cyan-200 text-xs font-mono transition-all cursor-pointer"
          title="Start fresh conversation"
        >
          <RotateCcw className="w-3 h-3 text-cyan-400" />
          <span>New Chat</span>
        </button>
      </div>
    </div>
  );
};
