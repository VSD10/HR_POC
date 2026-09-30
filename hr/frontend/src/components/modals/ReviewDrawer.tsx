import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Send,
  Sparkles,
  Bot,
  Copy,
  Check,
  RefreshCw,
  MessageSquare,
  Clock,
  ShieldCheck,
  BookOpen,
  ArrowRight,
  User,
  CheckCircle2,
  CornerDownRight,
  ChevronRight,
  Maximize2,
  Minimize2,
  FileText
} from 'lucide-react';
import { RequestItem, RequestComment } from '../../types/hr';
import { hrService } from '../../services/hrService';
import { MarkdownRenderer } from '../copilot/MarkdownRenderer';

interface ReviewDrawerProps {
  item: RequestItem | null;
  onClose: () => void;
  onResolve: (id: string, notes: string) => void;
  onEscalate?: (id: string, notes: string) => void;
  onAddComment?: (id: string, text: string) => Promise<any>;
}

export const ReviewDrawer: React.FC<ReviewDrawerProps> = ({
  item,
  onClose,
  onResolve,
  onEscalate,
  onAddComment
}) => {
  // State
  const [draftReply, setDraftReply] = useState('');
  const [isSendingReply, setIsSendingReply] = useState(false);
  const [replyError, setReplyError] = useState<string | null>(null);

  // AI Copilot Expand / Collapse State (collapsible as a badge)
  const [isAiExpanded, setIsAiExpanded] = useState(false);

  // AI Copilot State
  const [aiOutput, setAiOutput] = useState<{
    type: 'draft' | 'summary' | 'policy' | 'custom';
    text: string;
    citations?: Array<{ title: string; section?: string; page?: number }>;
  } | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiQuery, setAiQuery] = useState('');
  const [copied, setCopied] = useState(false);

  // Resolution state
  const [isResolving, setIsResolving] = useState(false);

  // Refs
  const threadEndRef = useRef<HTMLDivElement>(null);
  const replyInputRef = useRef<HTMLTextAreaElement>(null);

  // Reset state when case changes
  useEffect(() => {
    if (!item) return;
    setDraftReply('');
    setReplyError(null);
    setAiQuery('');
    setAiOutput(null);
  }, [item?.id]);

  // Auto-scroll conversation
  useEffect(() => {
    if (threadEndRef.current) {
      threadEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [item?.comments?.length]);

  if (!item) return null;

  // Safe employee extraction
  const empName = typeof item.employee === 'object' && item.employee ? (item.employee.name || 'Employee') : (item.employee || 'Employee');
  const empDept = typeof item.employee === 'object' && item.employee ? (item.employee.department || 'Operations') : 'Operations';
  const empEmail = typeof item.employee === 'object' && item.employee ? (item.employee.email || '') : '';
  const empAvatar = typeof item.employee === 'object' && item.employee && item.employee.avatar
    ? item.employee.avatar
    : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80';
  const commentsList: RequestComment[] = Array.isArray(item.comments) ? item.comments : [];

  // =========================================================================
  // AI COPILOT HANDLERS
  // =========================================================================
  const runAiAction = async (action: 'draft_reply' | 'summarize' | 'check_policy' | 'custom_query', customText?: string) => {
    if (isAiLoading) return;
    setIsAiLoading(true);
    setIsAiExpanded(true); // Auto-expand when AI is triggered

    try {
      const res = await hrService.queryCaseCopilot(item, action, customText);
      const actionType = action === 'draft_reply' ? 'draft'
        : action === 'summarize' ? 'summary'
        : action === 'check_policy' ? 'policy'
        : 'custom';

      setAiOutput({
        type: actionType,
        text: res.text,
        citations: res.citations
      });
    } catch {
      setAiOutput({
        type: 'custom',
        text: 'Unable to connect to policy agent. Please try again.'
      });
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleUseReply = (text: string) => {
    setDraftReply(text);
    if (replyInputRef.current) {
      replyInputRef.current.focus();
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // =========================================================================
  // SEND REPLY
  // =========================================================================
  const handleSend = async () => {
    if (!draftReply.trim() || isSendingReply) return;
    setIsSendingReply(true);
    setReplyError(null);

    try {
      if (onAddComment) {
        await onAddComment(item.id, draftReply.trim());
      } else {
        await hrService.addComment(item.id, draftReply.trim(), 'Sarah Jenkins (HR Ops)', true);
      }
      setDraftReply('');
    } catch (err: any) {
      setReplyError(err.message || 'Failed to send reply. Please try again.');
    } finally {
      setIsSendingReply(false);
    }
  };

  const handleResolve = async () => {
    setIsResolving(true);
    await onResolve(item.id, 'Case verified and resolved per company policy.');
    setIsResolving(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-xl animate-fadeIn">
      {/* Clean Obsidian Modal Window Aligned with Main App Theme */}
      <div
        className="w-full max-w-6xl h-[92vh] max-h-[880px] rounded-3xl bg-[#060814]/95 backdrop-blur-2xl border border-white/10 shadow-2xl flex flex-col overflow-hidden text-slate-100 transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ================================================================= */}
        {/* 1. TOP HEADER: Case Identity, Employee, Status & Action Controls  */}
        {/* ================================================================= */}
        <div className="px-6 py-3.5 border-b border-white/10 bg-white/[0.03] flex items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <span className="font-mono text-xs px-2.5 py-1 rounded-xl bg-cyan-500/15 border border-cyan-400/30 text-neon-cyan font-bold tracking-wide shrink-0">
              {item.id}
            </span>
            <span className="font-mono text-[11px] uppercase px-2 py-0.5 rounded-full bg-white/10 border border-white/10 text-white/70 shrink-0">
              {item.category}
            </span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono uppercase font-semibold shrink-0 border ${
              item.priority === 'high' ? 'bg-rose-500/20 text-rose-300 border-rose-500/30' : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
            }`}>
              {item.priority}
            </span>
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase shrink-0 border ${
              item.status === 'resolved' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30' : 'bg-cyan-500/20 text-cyan-300 border-cyan-400/30'
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${item.status === 'resolved' ? 'bg-emerald-400' : 'bg-cyan-400 animate-pulse'}`} />
              {item.statusUpper || item.status}
            </span>

            <h2 className="text-sm sm:text-base font-bold text-white truncate max-w-xs md:max-w-md" title={item.title || item.subject}>
              {item.title || item.subject || 'Case Details'}
            </h2>
          </div>

          {/* Right Action Bar: AI Copilot Badge + Resolve Button + Close */}
          <div className="flex items-center gap-2.5 shrink-0 ml-auto">
            {/* AI Copilot Badge Button (Expands/Collapses on click) */}
            <button
              onClick={() => setIsAiExpanded(prev => !prev)}
              className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                isAiExpanded
                  ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400/50 shadow-[0_0_12px_rgba(6,182,212,0.25)]'
                  : 'bg-white/[0.06] hover:bg-white/10 text-white/80 border-white/15 hover:border-cyan-400/40'
              }`}
              title={isAiExpanded ? 'Collapse AI Copilot panel' : 'Open AI Copilot assistance'}
            >
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>AI Copilot</span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-cyan-400/20 text-cyan-300">
                {isAiExpanded ? 'Active' : 'Badge'}
              </span>
            </button>

            {/* Resolve Case Button */}
            <button
              disabled={isResolving}
              onClick={handleResolve}
              className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-semibold text-xs shadow-neon-emerald transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isResolving ? 'Resolving...' : 'Resolve Case'}</span>
            </button>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-white/50 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              title="Close Workspace"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ================================================================= */}
        {/* 2. THE EMPLOYEE PROBLEM STATEMENT (PROMINENT & UN-COLLAPSED)      */}
        {/* ================================================================= */}
        <div className="px-6 py-3.5 bg-black/40 border-b border-white/10 shrink-0">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-cyan-500/10 border border-cyan-400/30 flex items-center justify-center shrink-0 mt-0.5">
              <FileText className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <span className="text-[11px] font-mono uppercase font-bold text-cyan-400 tracking-wider">
                  Employee Issue & Problem Description
                </span>
                <span className="text-[11px] font-mono text-white/50">
                  • Submitted by <strong className="text-white/90">{empName}</strong> ({empDept}) • {empEmail}
                </span>
              </div>
              <div className="text-xs sm:text-sm text-white/95 font-light leading-relaxed whitespace-pre-line bg-white/[0.02] p-3 rounded-xl border border-white/5">
                {item.description || 'No description provided.'}
              </div>
            </div>
          </div>
        </div>

        {/* ================================================================= */}
        {/* 3. MAIN WORKSPACE: Conversation Thread + Optional AI Copilot Split */}
        {/* ================================================================= */}
        <div className="flex-1 flex overflow-hidden min-h-0">
          
          {/* MAIN COLUMN: Conversation Stream & Attached Reply Box */}
          <div className={`flex flex-col h-full overflow-hidden transition-all duration-300 ${
            isAiExpanded ? 'w-full lg:w-[60%] border-r border-white/10' : 'w-full'
          }`}>
            {/* Thread Header */}
            <div className="px-6 py-2.5 border-b border-white/10 bg-white/[0.02] flex items-center justify-between text-xs font-semibold text-white/80 shrink-0">
              <span className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-cyan-400" />
                <span>Conversation Thread ({commentsList.length})</span>
              </span>

              {/* Quick AI Trigger Shortcut if AI panel is currently collapsed */}
              {!isAiExpanded && (
                <button
                  onClick={() => runAiAction('draft_reply')}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-400/30 text-xs font-medium transition-all cursor-pointer"
                  title="Open AI Copilot and generate draft"
                >
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Draft with AI Copilot</span>
                </button>
              )}
            </div>

            {/* Conversation Messages */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3.5">
              {commentsList.length === 0 ? (
                <div className="h-40 flex flex-col items-center justify-center text-white/40 text-xs">
                  <MessageSquare className="w-8 h-8 opacity-25 text-cyan-400 mb-2" />
                  <p className="font-medium text-white/70">No message history yet</p>
                  <p className="text-[11px] text-white/30 mt-1">Use the AI Copilot badge above or write a reply below.</p>
                </div>
              ) : (
                commentsList.map((c) => (
                  <div
                    key={c.id}
                    className={`flex flex-col ${c.isHr ? 'items-end' : 'items-start'}`}
                  >
                    <div
                      className={`max-w-[88%] sm:max-w-[80%] rounded-2xl p-3.5 text-xs shadow-md transition-all ${
                        c.isHr
                          ? 'bg-gradient-to-r from-teal-950/70 via-emerald-950/60 to-teal-900/70 border border-teal-500/30 text-white'
                          : 'bg-white/[0.05] border border-white/10 text-white/95'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3 text-[10px] text-white/50 mb-1.5 pb-1 border-b border-white/10">
                        <span className="font-semibold text-white/90 flex items-center gap-1.5">
                          {c.isHr ? (
                            <>
                              <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />
                              <span className="text-teal-200">Sarah Jenkins</span>
                              <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-[#0D9488] text-white uppercase">
                                HR Ops
                              </span>
                            </>
                          ) : (
                            <>
                              <User className="w-3.5 h-3.5 text-cyan-300" />
                              <span className="text-white/90">{c.author || empName}</span>
                              <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-white/10 text-white/60">
                                Employee
                              </span>
                            </>
                          )}
                        </span>
                        <span>{c.time}</span>
                      </div>
                      <p className="whitespace-pre-line leading-relaxed font-light">{c.text}</p>
                    </div>
                  </div>
                ))
              )}
              <div ref={threadEndRef} />
            </div>

            {/* Attached Reply Box (Docked right under thread) */}
            <div className="p-4 border-t border-white/10 bg-black/40 shrink-0">
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-mono uppercase font-bold text-white/70 flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Reply to {empName}</span>
                </label>

                {!isAiExpanded && (
                  <button
                    onClick={() => runAiAction('draft_reply')}
                    className="text-xs text-cyan-300 hover:text-cyan-200 flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>Auto-draft with AI</span>
                  </button>
                )}
              </div>

              <textarea
                ref={replyInputRef}
                rows={2}
                value={draftReply}
                onChange={(e) => setDraftReply(e.target.value)}
                onKeyDown={(e) => {
                  if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder={`Write official reply to ${empName}... (Ctrl+Enter to send)`}
                className="w-full p-3 rounded-xl bg-white/[0.04] border border-white/15 text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-cyan-400 transition-all font-sans leading-relaxed"
              />

              {replyError && (
                <p className="text-xs text-rose-400 mt-1">{replyError}</p>
              )}

              <div className="flex items-center justify-between mt-2.5">
                <span className="text-[10px] font-mono text-white/40">
                  Ctrl+Enter sends reply directly to employee portal
                </span>
                <button
                  disabled={!draftReply.trim() || isSendingReply}
                  onClick={handleSend}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold text-xs flex items-center gap-1.5 shadow-neon-cyan transition-all disabled:opacity-40 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isSendingReply ? 'Sending...' : 'Send Reply'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* AI COPILOT EXPANDED PANE (Toggled via AI Copilot Badge) */}
          {isAiExpanded && (
            <div className="w-full lg:w-[40%] flex flex-col h-full bg-[#06091a] border-l border-white/10 overflow-hidden animate-in fade-in slide-in-from-right-4 duration-200">
              {/* AI Header */}
              <div className="px-5 py-3 border-b border-white/10 bg-white/[0.02] flex items-center justify-between text-xs font-semibold shrink-0">
                <span className="flex items-center gap-1.5 text-cyan-300">
                  <Sparkles className="w-4 h-4 text-cyan-400" />
                  <span>AI Copilot Intelligence</span>
                </span>

                <button
                  onClick={() => setIsAiExpanded(false)}
                  className="p-1 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                  title="Collapse AI panel back to badge"
                >
                  <Minimize2 className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Action Buttons */}
              <div className="p-3 border-b border-white/5 flex flex-wrap gap-2 shrink-0 bg-black/20">
                <button
                  disabled={isAiLoading}
                  onClick={() => runAiAction('draft_reply')}
                  className="px-3 py-1.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400/40 text-cyan-200 text-xs font-medium transition-all flex items-center gap-1 cursor-pointer disabled:opacity-40 shadow-xs"
                >
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Draft Reply</span>
                </button>
                <button
                  disabled={isAiLoading}
                  onClick={() => runAiAction('summarize')}
                  className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-white/80 text-xs font-medium transition-all cursor-pointer disabled:opacity-40"
                >
                  <span>Summarize</span>
                </button>
                <button
                  disabled={isAiLoading}
                  onClick={() => runAiAction('check_policy')}
                  className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-white/80 text-xs font-medium transition-all cursor-pointer disabled:opacity-40"
                >
                  <span>Check Policy</span>
                </button>
              </div>

              {/* Output Display with MarkdownRenderer (NO RAW ASTERISKS!) */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {isAiLoading ? (
                  <div className="h-40 flex flex-col items-center justify-center text-xs text-cyan-300 gap-2">
                    <div className="w-5 h-5 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin" />
                    <p className="font-mono text-[11px] animate-pulse">Reviewing policy & drafting response...</p>
                  </div>
                ) : aiOutput ? (
                  <div className="p-4 rounded-2xl bg-white/[0.03] border border-cyan-500/30 text-xs space-y-3 shadow-inner">
                    <div className="flex items-center justify-between text-[11px] text-cyan-300 font-semibold border-b border-white/10 pb-2">
                      <span className="uppercase font-mono tracking-wider">
                        {aiOutput.type === 'draft' ? 'Suggested Employee Reply'
                          : aiOutput.type === 'summary' ? 'Case Executive Summary'
                          : aiOutput.type === 'policy' ? 'Policy Verification'
                          : 'AI Assistant Response'}
                      </span>
                      <button
                        onClick={() => handleCopy(aiOutput.text)}
                        className="text-white/60 hover:text-white flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copied ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>

                    {/* Rich Formatted Markdown Output (Clean, No Asterisks) */}
                    <div className="text-white/95 leading-relaxed font-light text-xs">
                      <MarkdownRenderer content={aiOutput.text} />
                    </div>

                    {/* Policy citations */}
                    {aiOutput.citations && aiOutput.citations.length > 0 && (
                      <div className="flex flex-wrap items-center gap-1 text-[10px] text-cyan-300 font-mono pt-2 border-t border-white/5">
                        <BookOpen className="w-3 h-3" />
                        <span>Sources:</span>
                        {aiOutput.citations.map((c, idx) => (
                          <span key={idx} className="px-1.5 py-0.5 rounded bg-cyan-950/60 border border-cyan-400/30">
                            {c.title} {c.page ? `(p.${c.page})` : ''}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Action Button: Use in Reply */}
                    <div className="pt-2 border-t border-white/10 flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleUseReply(aiOutput.text)}
                        className="px-3.5 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-semibold text-xs flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
                      >
                        <CornerDownRight className="w-3.5 h-3.5" />
                        <span>Use in Reply</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="h-40 flex flex-col items-center justify-center text-center text-white/40 text-xs px-4">
                    <Bot className="w-8 h-8 text-cyan-400/50 mb-2" />
                    <p className="font-medium text-white/70">Click "Draft Reply" above</p>
                    <p className="text-[11px] text-white/30 mt-1">
                      AI will analyze {empName}'s issue against company policies and generate a ready-to-send reply.
                    </p>
                  </div>
                )}
              </div>

              {/* Custom AI Query Box */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!aiQuery.trim()) return;
                  runAiAction('custom_query', aiQuery.trim());
                  setAiQuery('');
                }}
                className="p-3 border-t border-white/10 bg-black/40 flex gap-2 shrink-0"
              >
                <input
                  type="text"
                  value={aiQuery}
                  onChange={(e) => setAiQuery(e.target.value)}
                  placeholder="Ask AI anything about this case..."
                  className="flex-1 bg-white/[0.05] border border-white/15 rounded-xl px-3 py-1.5 text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-cyan-400"
                />
                <button
                  type="submit"
                  disabled={!aiQuery.trim() || isAiLoading}
                  className="px-3 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold disabled:opacity-40 transition-colors cursor-pointer"
                >
                  Ask
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
