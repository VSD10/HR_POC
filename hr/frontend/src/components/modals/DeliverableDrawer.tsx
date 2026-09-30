import React, { useState, useEffect } from 'react';
import {
  X,
  Copy,
  Check,
  Send,
  Download,
  CheckCircle2,
  Archive,
  Edit3,
  Save,
  FileText,
  AlertTriangle,
  Sparkles,
  ExternalLink,
  BookOpen,
  User,
  Building,
  Clock,
  ShieldCheck,
  RotateCcw
} from 'lucide-react';
import { DeliverableItem, DeliverableStatus, DeliverableType } from '../../types/hr';

interface DeliverableDrawerProps {
  deliverable: DeliverableItem | null;
  onClose: () => void;
  onUpdate: (id: string, updates: Partial<DeliverableItem>) => Promise<any>;
  onSend: (id: string) => Promise<any>;
  onNavigateToRequest?: (requestId: string) => void;
}

export const DeliverableDrawer: React.FC<DeliverableDrawerProps> = ({
  deliverable,
  onClose,
  onUpdate,
  onSend,
  onNavigateToRequest
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('');
  const [recipient, setRecipient] = useState('');
  const [content, setContent] = useState('');
  const [status, setStatus] = useState<DeliverableStatus>('NEEDS_REVIEW');
  const [copied, setCopied] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    if (!deliverable) return;
    setTitle(deliverable.title || '');
    setSubject(deliverable.subject || deliverable.title || '');
    setRecipient(deliverable.recipient || deliverable.employeeName || '');
    setContent(deliverable.content || '');
    setStatus(deliverable.status);
    setIsEditing(false);
  }, [deliverable]);

  if (!deliverable) return null;

  const isSent = status === 'SENT';
  const isArchived = status === 'ARCHIVED';

  const handleCopy = async () => {
    const fullText = subject ? `Subject: ${subject}\n\n${content}` : content;
    try {
      await navigator.clipboard.writeText(fullText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  const handleDownload = () => {
    const filename = `${deliverable.id}_${deliverable.title.replace(/\s+/g, '_')}.txt`;
    const fullText = `HR DELIVERABLE\nID: ${deliverable.id}\nTitle: ${deliverable.title}\nType: ${deliverable.type}\nStatus: ${status}\nRecipient: ${recipient}\nSubject: ${subject}\n\n==============================\n\n${content}`;
    const blob = new Blob([fullText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleSaveEdit = async () => {
    setIsSaving(true);
    try {
      await onUpdate(deliverable.id, {
        title,
        subject,
        recipient,
        content,
        status: status === 'AI_GENERATED' || status === 'NEEDS_REVIEW' ? 'EDITED' : status
      });
      setStatus(prev => (prev === 'AI_GENERATED' || prev === 'NEEDS_REVIEW' ? 'EDITED' : prev));
      setIsEditing(false);
    } finally {
      setIsSaving(false);
    }
  };

  const handleMarkReady = async () => {
    setIsSaving(true);
    try {
      await onUpdate(deliverable.id, { status: 'READY' });
      setStatus('READY');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSendUse = async () => {
    setIsSending(true);
    try {
      await onSend(deliverable.id);
      setStatus('SENT');
    } finally {
      setIsSending(false);
    }
  };

  const handleArchive = async () => {
    setIsSaving(true);
    try {
      await onUpdate(deliverable.id, { status: 'ARCHIVED' });
      setStatus('ARCHIVED');
    } finally {
      setIsSaving(false);
    }
  };

  const getStatusBadge = (st: DeliverableStatus) => {
    switch (st) {
      case 'NEEDS_REVIEW':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
      case 'AI_GENERATED':
        return 'bg-purple-500/20 text-purple-300 border-purple-500/40';
      case 'EDITED':
        return 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40';
      case 'READY':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
      case 'SENT':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/40';
      case 'ARCHIVED':
        return 'bg-white/10 text-white/50 border-white/10';
      default:
        return 'bg-white/10 text-white/70 border-white/15';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/75 backdrop-blur-md animate-fadeIn">
      {/* Right-Side Slide-Over Detail Drawer */}
      <div
        className="w-full max-w-2xl h-full bg-[#060814]/95 backdrop-blur-2xl border-l border-white/10 shadow-2xl flex flex-col overflow-hidden text-slate-100 animate-slideLeft"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drawer Header */}
        <div className="px-6 py-4 border-b border-white/10 bg-white/[0.03] flex items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="font-mono text-xs px-2.5 py-1 rounded-xl bg-purple-500/15 border border-purple-400/30 text-purple-300 font-bold tracking-wide shrink-0">
              {deliverable.id}
            </span>
            <span className="font-mono text-[11px] uppercase px-2.5 py-0.5 rounded-full bg-white/10 border border-white/10 text-white/70 shrink-0">
              {deliverable.type}
            </span>
            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase font-semibold shrink-0 border ${getStatusBadge(status)}`}>
              {status.replace('_', ' ')}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl hover:bg-white/10 text-white/60 hover:text-white transition-colors cursor-pointer"
              title="Close drawer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Human Review Required Notice Banner */}
        <div className="px-6 py-3 bg-amber-500/10 border-b border-amber-500/20 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2 text-amber-300 text-xs">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
            <span className="font-semibold">AI Generated — HR Review Required</span>
            <span className="text-amber-300/70 hidden sm:inline">Verify and edit all content before dispatch.</span>
          </div>
          {deliverable.requestId && (
            <button
              onClick={() => onNavigateToRequest && onNavigateToRequest(deliverable.requestId!)}
              className="inline-flex items-center gap-1 text-[11px] font-mono text-cyan-300 hover:text-cyan-200 transition-colors cursor-pointer bg-cyan-950/40 px-2.5 py-1 rounded-lg border border-cyan-500/30"
              title="View source request"
            >
              <span>Linked: {deliverable.requestId}</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          )}
        </div>

        {/* Drawer Body Scrollable */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Metadata Card */}
          <div className="rounded-2xl p-4 bg-white/[0.03] border border-white/10 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div>
              <span className="text-[10px] font-mono uppercase text-white/40 block mb-0.5">Author</span>
              <span className="font-medium text-white truncate block">{deliverable.createdBy || 'AI Assistant'}</span>
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase text-white/40 block mb-0.5">Created</span>
              <span className="font-mono text-white/70 block">
                {new Date(deliverable.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase text-white/40 block mb-0.5">Last Updated</span>
              <span className="font-mono text-white/70 block">
                {new Date(deliverable.updatedAt || deliverable.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase text-white/40 block mb-0.5">Originating Case</span>
              <span className="font-mono font-bold text-cyan-300 block">{deliverable.requestId || 'General / Copilot'}</span>
            </div>
          </div>

          {/* Title & Subject */}
          <div className="space-y-4">
            <div>
              <label className="text-[11px] font-mono uppercase tracking-wider text-white/50 block mb-1.5">
                Deliverable Title
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-purple-500/30 text-white text-sm focus:outline-none focus:border-purple-400"
                />
              ) : (
                <h2 className="text-lg font-bold text-white tracking-tight">{title}</h2>
              )}
            </div>

            {/* Recipient & Subject fields for communications */}
            {(deliverable.type === 'HR Communication' || deliverable.type === 'Employee Notice') && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 rounded-2xl bg-white/[0.02] border border-white/10">
                <div>
                  <label className="text-[10px] font-mono uppercase text-white/40 block mb-1">
                    Recipient Address
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={recipient}
                      onChange={(e) => setRecipient(e.target.value)}
                      placeholder="e.g. employee@enterprise.internal"
                      className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/15 text-white text-xs focus:outline-none focus:border-cyan-400"
                    />
                  ) : (
                    <span className="text-xs font-mono text-cyan-300 block">{recipient || 'Not specified'}</span>
                  )}
                </div>
                <div>
                  <label className="text-[10px] font-mono uppercase text-white/40 block mb-1">
                    Email Subject
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      placeholder="Subject line"
                      className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/15 text-white text-xs focus:outline-none focus:border-cyan-400"
                    />
                  ) : (
                    <span className="text-xs font-medium text-white/90 block truncate">{subject || title}</span>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Generated Content Body */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-mono uppercase tracking-wider text-white/50 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-purple-400" />
                <span>Generated Content</span>
              </label>
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="inline-flex items-center gap-1 text-xs font-mono text-purple-300 hover:text-white px-2.5 py-1 rounded-lg bg-purple-950/40 border border-purple-500/30 transition-all cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Edit Content</span>
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setContent(deliverable.content || '');
                      setIsEditing(false);
                    }}
                    className="text-xs text-white/50 hover:text-white px-2 py-1 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveEdit}
                    disabled={isSaving}
                    className="inline-flex items-center gap-1 text-xs font-semibold px-3 py-1 rounded-lg bg-purple-600 hover:bg-purple-500 text-white transition-all cursor-pointer"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>{isSaving ? 'Saving...' : 'Save Draft'}</span>
                  </button>
                </div>
              )}
            </div>

            {isEditing ? (
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={12}
                className="w-full p-4 rounded-2xl bg-black/50 border border-purple-500/40 text-xs sm:text-sm text-slate-100 leading-relaxed font-mono focus:outline-none focus:border-purple-400 shadow-inner"
              />
            ) : (
              <div className="p-4 rounded-2xl bg-black/40 border border-white/10 text-xs sm:text-sm text-slate-200 leading-relaxed whitespace-pre-wrap font-sans">
                {content}
              </div>
            )}
          </div>

          {/* Policy Sources Grounding */}
          {Array.isArray(deliverable.policySources) && deliverable.policySources.length > 0 && (
            <div className="space-y-2">
              <label className="text-[11px] font-mono uppercase tracking-wider text-cyan-300/80 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
                <span>Policy Grounding &amp; Citations</span>
              </label>
              <div className="space-y-2">
                {deliverable.policySources.map((src, i) => (
                  <div
                    key={i}
                    className="p-3 rounded-xl bg-cyan-950/20 border border-cyan-500/25 flex items-start gap-2.5 text-xs"
                  >
                    <ShieldCheck className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-mono font-semibold text-cyan-300">
                        {src.document} {src.page ? `· Page ${src.page}` : ''}
                      </span>
                      {src.excerpt && (
                        <p className="text-white/70 italic text-[11px] mt-1">"{src.excerpt}"</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Drawer Action Footer */}
        <div className="px-6 py-4 border-t border-white/10 bg-white/[0.02] flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-mono border transition-all cursor-pointer ${
                copied
                  ? 'bg-emerald-500/20 border-emerald-400/40 text-emerald-300'
                  : 'bg-white/[0.04] hover:bg-white/[0.08] border-white/10 text-white/70 hover:text-white'
              }`}
              title="Copy deliverable content"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>

            <button
              onClick={handleDownload}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-mono bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-white/70 hover:text-white transition-all cursor-pointer"
              title="Download text file"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download</span>
            </button>

            {!isArchived && (
              <button
                onClick={handleArchive}
                disabled={isSaving}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-mono bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-white/50 hover:text-white/80 transition-all cursor-pointer"
                title="Archive deliverable"
              >
                <Archive className="w-3.5 h-3.5" />
                <span>Archive</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2.5">
            {status !== 'READY' && !isSent && (
              <button
                onClick={handleMarkReady}
                disabled={isSaving}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-teal-600/30 hover:bg-teal-600/40 border border-teal-500/40 text-teal-200 text-xs font-semibold transition-all cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4 text-teal-400" />
                <span>Mark Ready</span>
              </button>
            )}

            {!isSent ? (
              <button
                onClick={handleSendUse}
                disabled={isSending}
                className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-semibold shadow-lg shadow-cyan-500/20 transition-all cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isSending ? 'Sending...' : 'Send / Use Deliverable'}</span>
              </button>
            ) : (
              <div className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-mono">
                <CheckCircle2 className="w-4 h-4 text-blue-400" />
                <span>Dispatched &amp; Synchronized</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
