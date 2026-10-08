import React, { useState, useMemo, useEffect } from 'react';
import {
  Mail,
  Send,
  Sparkles,
  BookOpen,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  Search,
  SlidersHorizontal,
  X,
  ArrowRight,
  ShieldCheck,
  Check,
  Inbox,
  Clock,
  ExternalLink,
  ChevronRight,
  Filter,
  User,
  Paperclip,
  CheckCheck,
  RotateCcw,
  Heart,
  Shield,
  FileText,
  Wand2,
  Edit3,
  LogIn,
  KeyRound,
  Unlink,
  Link2,
  Globe,
  Users
} from 'lucide-react';
import { ConnectMailModal } from '../modals/ConnectMailModal';
import { hrService } from '../../services/hrService';
import { useAuth } from '../../context/AuthContext';
import { DeliverableItem, RequestItem } from '../../types/hr';

export interface DeliverablesViewProps {
  deliverables?: DeliverableItem[];
  requests?: RequestItem[];
  onApprove?: (id: string) => void;
  onUpdateDeliverable?: (id: string, updates: Partial<DeliverableItem>) => Promise<any>;
  onSendDeliverable?: (id: string) => Promise<any>;
  onCreateDeliverable?: (deliv: Partial<DeliverableItem>) => Promise<any>;
  onNavigateToRequest?: (requestId: string) => void;
}

type EmailFilterTab = 'all' | 'needs_triage' | 'draft_ready' | 'sent' | 'sensitive';

export const DeliverablesView: React.FC<DeliverablesViewProps> = () => {
  const { user } = useAuth();
  const [emails, setEmails] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [gmailStatus, setGmailStatus] = useState<any>(null);
  const [activeFilter, setActiveFilter] = useState<EmailFilterTab>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Email Connection Modal State
  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);
  const [connectTab, setConnectTab] = useState<'oauth' | 'custom'>('oauth');
  const [customEmailInput, setCustomEmailInput] = useState('');
  const [customNameInput, setCustomNameInput] = useState('');
  const [isConnectingEmail, setIsConnectingEmail] = useState(false);
  const [connectError, setConnectError] = useState('');
  const [connectSuccess, setConnectSuccess] = useState('');

  // Selected Email Drawer State
  const [selectedEmail, setSelectedEmail] = useState<any | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [emailTriage, setEmailTriage] = useState<any | null>(null);
  const [isTriaging, setIsTriaging] = useState(false);
  const [emailDraft, setEmailDraft] = useState<any | null>(null);
  const [isDrafting, setIsDrafting] = useState(false);
  const [draftTone, setDraftTone] = useState<'professional' | 'empathetic' | 'concise'>('professional');
  const [editableBody, setEditableBody] = useState('');
  const [customInstructions, setCustomInstructions] = useState('');
  const [showCustomGuidance, setShowCustomGuidance] = useState(false);
  const [regenerateSuccess, setRegenerateSuccess] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [sendSuccess, setSendSuccess] = useState(false);

  // Load Gmail Emails & Live Status
  const loadEmails = async () => {
    setLoading(true);
    try {
      const [emailList, status] = await Promise.all([
        hrService.getGmailEmails(),
        hrService.getGmailStatus(user?.id)
      ]);
      setEmails(emailList || []);
      setGmailStatus(status || null);
    } catch (err) {
      console.error('Error fetching Gmail deliverables:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEmails();
  }, [user]);

  // Open & Inspect an Email
  const handleOpenEmail = async (email: any) => {
    setSelectedEmail(email);
    setEmailDraft(null);
    setEmailTriage(null);
    setEditableBody('');
    setCustomInstructions('');
    setShowCustomGuidance(false);
    setRegenerateSuccess(false);
    setSendSuccess(false);
    setLoadingDetail(true);

    try {
      const detail = await hrService.getGmailEmailDetail(email.id);
      if (detail) {
        setSelectedEmail(detail);
        if (detail.draft) {
          setEmailDraft(detail.draft);
          setEditableBody(detail.draft.draft_body || '');
          if (detail.draft.tone) {
            setDraftTone(detail.draft.tone as any);
          }
        }
        if (detail.triage) {
          setEmailTriage(detail.triage);
        }
      }
    } catch (err) {
      console.warn('Could not load email detail:', err);
    } finally {
      setLoadingDetail(false);
    }
  };

  // Connect via Google OAuth
  const handleConnectGoogleOAuth = async () => {
    setIsConnectingEmail(true);
    setConnectError('');
    try {
      const data = await hrService.getGmailAuthUrl();
      if (data?.auth_url) {
        if (data.mode === 'live') {
          window.location.href = data.auth_url;
        } else {
          // Demo sandbox flow
          await fetch(data.auth_url);
          const st = await hrService.getGmailStatus();
          if (st) setGmailStatus(st);
          setConnectSuccess('Connected to Sandbox Demo Inbox successfully!');
          setTimeout(() => {
            setIsConnectModalOpen(false);
            setConnectSuccess('');
            loadEmails();
          }, 1200);
        }
      }
    } catch (e: any) {
      setConnectError('Failed to initiate Google OAuth: ' + (e?.message || 'Unknown error'));
    } finally {
      setIsConnectingEmail(false);
    }
  };

  // Connect Custom / Direct Email
  const handleConnectCustomEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customEmailInput.trim() || !customEmailInput.includes('@')) {
      setConnectError('Please enter a valid email address.');
      return;
    }
    setIsConnectingEmail(true);
    setConnectError('');
    try {
      const res = await hrService.connectCustomEmail(customEmailInput.trim(), customNameInput.trim() || undefined);
      if (res) {
        setGmailStatus(res);
        setConnectSuccess(`Successfully connected ${res.email}!`);
        setTimeout(() => {
          setIsConnectModalOpen(false);
          setConnectSuccess('');
          loadEmails();
        }, 1200);
      } else {
        setConnectError('Failed to connect email address.');
      }
    } catch (err: any) {
      setConnectError('Error connecting email: ' + (err?.message || 'Server error'));
    } finally {
      setIsConnectingEmail(false);
    }
  };

  // Disconnect Email
  const handleDisconnectEmail = async () => {
    setIsConnectingEmail(true);
    try {
      await hrService.disconnectGmail();
      setGmailStatus({ connected: false, mode: 'none' });
      loadEmails();
    } catch (err) {
      console.error('Failed to disconnect:', err);
    } finally {
      setIsConnectingEmail(false);
    }
  };

  // Run AI Policy Triage on Email
  const handleTriageEmail = async () => {
    if (!selectedEmail) return;
    setIsTriaging(true);
    try {
      const triage = await hrService.triageGmailEmail(selectedEmail.id);
      if (triage) {
        setEmailTriage(triage);
        setSelectedEmail((prev: any) => prev ? {
          ...prev,
          category: triage.category,
          is_sensitive: triage.is_sensitive,
          urgency: triage.urgency,
          triage_done: true
        } : prev);

        setEmails(prev => prev.map(e => e.id === selectedEmail.id ? {
          ...e,
          category: triage.category,
          is_sensitive: triage.is_sensitive,
          urgency: triage.urgency,
          triage_done: true
        } : e));
      }
    } finally {
      setIsTriaging(false);
    }
  };

  // Generate / Regenerate Policy-Grounded RAG Draft
  const handleGenerateDraft = async (
    tone = draftTone,
    refinement?: string,
    instructions?: string
  ) => {
    if (!selectedEmail) return;
    setIsDrafting(true);
    setRegenerateSuccess(false);
    try {
      const guidance = instructions !== undefined ? instructions : customInstructions;
      const effectiveRefinement = refinement || (emailDraft ? 'regenerate' : undefined);
      const draft = await hrService.generateGmailDraft(selectedEmail.id, {
        tone,
        refinement: effectiveRefinement,
        custom_instructions: guidance?.trim() ? guidance.trim() : undefined,
      });
      if (draft) {
        setEmailDraft(draft);
        setEditableBody(draft.draft_body || '');
        setSelectedEmail((prev: any) => prev ? { ...prev, has_draft: true } : prev);
        setEmails(prev => prev.map(e => e.id === selectedEmail.id ? { ...e, has_draft: true } : e));
        setRegenerateSuccess(true);
        setTimeout(() => setRegenerateSuccess(false), 3500);
      }
    } catch (err) {
      console.error('Error generating grounded draft:', err);
    } finally {
      setIsDrafting(false);
    }
  };

  // Dispatch Approved Reply via Gmail
  const handleSendReply = async () => {
    if (!selectedEmail || !editableBody) return;
    setIsSending(true);
    try {
      const res = await hrService.sendGmailReply(selectedEmail.id, {
        to: selectedEmail.sender?.email || selectedEmail.recipient,
        subject: selectedEmail.subject?.startsWith('Re:') ? selectedEmail.subject : `Re: ${selectedEmail.subject}`,
        body: editableBody,
        thread_id: selectedEmail.thread_id,
        approved_by_hr: true
      }, user?.id);

      if (res?.success) {
        setSendSuccess(true);
        setSelectedEmail((prev: any) => prev ? { ...prev, status: 'SENT', sent: true } : prev);
        setEmails(prev => prev.map(e => e.id === selectedEmail.id ? { ...e, status: 'SENT', sent: true } : e));

        setTimeout(() => {
          setSelectedEmail(null);
          loadEmails();
        }, 2000);
      }
    } catch (err) {
      console.error('Failed to send reply:', err);
    } finally {
      setIsSending(false);
    }
  };

  // Calculated Summary Metrics
  const metrics = useMemo(() => {
    const total = emails.length;
    const needsTriage = emails.filter(e => !e.category || e.category === 'General HR' || !e.triage_done).length;
    const draftReady = emails.filter(e => e.has_draft || e.status === 'READY' || e.draft_body).length;
    const sentCount = emails.filter(e => e.sent || e.status === 'SENT').length;
    const sensitiveCount = emails.filter(e => e.is_sensitive).length;

    return { total, needsTriage, draftReady, sentCount, sensitiveCount };
  }, [emails]);

  // Filtered List
  const filteredEmails = useMemo(() => {
    return emails.filter(e => {
      // Tab filter
      if (activeFilter === 'needs_triage') {
        if (e.sent || e.status === 'SENT') return false;
        if (e.triage_done && e.category && e.category !== 'General HR') return false;
      } else if (activeFilter === 'draft_ready') {
        if (!e.has_draft && e.status !== 'READY' && !e.draft_body) return false;
      } else if (activeFilter === 'sent') {
        if (!e.sent && e.status !== 'SENT') return false;
      } else if (activeFilter === 'sensitive') {
        if (!e.is_sensitive) return false;
      }

      // Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchSubj = (e.subject || '').toLowerCase().includes(q);
        const matchSenderName = (e.sender?.name || '').toLowerCase().includes(q);
        const matchSenderEmail = (e.sender?.email || '').toLowerCase().includes(q);
        const matchSnippet = (e.snippet || e.body_text || '').toLowerCase().includes(q);
        const matchCat = (e.category || '').toLowerCase().includes(q);
        return matchSubj || matchSenderName || matchSenderEmail || matchSnippet || matchCat;
      }

      return true;
    });
  }, [emails, activeFilter, searchQuery]);

  return (
    <div className="space-y-6 pb-20">
      {/* Header Banner */}
      <div className="rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-red-950/40 via-[#0a0f29]/70 to-[#050716]/90 border border-red-500/20 backdrop-blur-2xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-96 bg-gradient-to-l from-red-600/10 via-rose-500/5 to-transparent pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full bg-red-500/20 border border-red-500/40 text-[10px] font-mono font-bold text-red-300 tracking-wider uppercase flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
                Live Gmail Dispatcher
              </span>
              <span className="text-white/40 text-xs font-mono">• Google OAuth 2.0</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-display font-bold text-white tracking-tight">
              HR Deliverables &amp; Email Dispatch
            </h1>
            <p className="text-xs sm:text-sm text-white/60 mt-1 max-w-2xl leading-relaxed">
              Inbound employee emails automatically triaged against company policy PDFs. Synthesize RAG-grounded draft responses with exact page citations and dispatch approved replies directly from your connected inbox.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            {/* Live Connected Account Pill / Connect HR Email Button */}
            {gmailStatus?.connected ? (
              <div className="px-3.5 py-2 rounded-2xl bg-white/[0.04] border border-white/10 backdrop-blur-md flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-red-600 to-rose-500 flex items-center justify-center text-white font-bold text-xs shadow-md">
                  <Mail className="w-4 h-4" />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1 font-semibold">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    {gmailStatus.mode === 'live' ? 'Connected (Live OAuth)' : 'Connected (' + (gmailStatus.mode === 'custom' ? 'Custom' : 'Sandbox') + ')'}
                  </span>
                  <span className="text-xs text-white font-mono truncate max-w-[160px]" title={gmailStatus.email || 'hr.specialist@enterprise-solutions.internal'}>
                    {gmailStatus.email || 'hr.specialist@enterprise-solutions.internal'}
                  </span>
                </div>
                <div className="flex items-center gap-1 pl-1.5 border-l border-white/10">
                  <button
                    onClick={() => {
                      setCustomEmailInput(gmailStatus.email || '');
                      setCustomNameInput(gmailStatus.display_name || '');
                      setIsConnectModalOpen(true);
                    }}
                    className="px-2 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-cyan-200 hover:text-white text-[10px] font-mono transition-all cursor-pointer"
                    title="Change or re-authenticate email"
                  >
                    Change
                  </button>
                  <button
                    onClick={handleDisconnectEmail}
                    disabled={isConnectingEmail}
                    className="p-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 text-[10px] font-mono transition-all cursor-pointer"
                    title="Disconnect inbox"
                  >
                    <Unlink className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setIsConnectModalOpen(true)}
                className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-red-600 to-rose-500 hover:from-red-500 hover:to-rose-400 text-white font-semibold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-red-500/20 hover:scale-[1.02] active:scale-[0.98]"
              >
                <Mail className="w-4 h-4 animate-pulse" />
                <span>Connect HR Email</span>
              </button>
            )}

            {/* Sync Button */}
            <button
              onClick={loadEmails}
              disabled={loading}
              className="px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/15 text-white font-semibold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md hover:scale-[1.02] active:scale-[0.98]"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-cyan-300 ${loading ? 'animate-spin' : ''}`} />
              <span>{loading ? 'Fetching...' : 'Sync Inbox'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Metric Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-xl">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-mono uppercase text-white/50">Total Inbound</span>
            <Inbox className="w-3.5 h-3.5 text-cyan-400" />
          </div>
          <div className="text-2xl font-bold text-white font-display">{metrics.total}</div>
          <span className="text-[11px] font-mono text-cyan-300/80 mt-1 block">Live Inbound Inquiries</span>
        </div>

        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/25 backdrop-blur-xl">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-mono uppercase text-amber-300/70">Needs Triage</span>
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-amber-200 font-display">{metrics.needsTriage}</div>
          <span className="text-[11px] font-mono text-amber-300/80 mt-1 block">Awaiting Classification</span>
        </div>

        <div className="p-4 rounded-2xl bg-purple-500/10 border border-purple-500/25 backdrop-blur-xl">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-mono uppercase text-purple-300/70">Drafts Synthesized</span>
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
          </div>
          <div className="text-2xl font-bold text-purple-200 font-display">{metrics.draftReady}</div>
          <span className="text-[11px] font-mono text-purple-300/80 mt-1 block">Policy Grounded (RAG)</span>
        </div>

        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 backdrop-blur-xl">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-mono uppercase text-emerald-300/70">Dispatched &amp; Sent</span>
            <CheckCheck className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-emerald-200 font-display">{metrics.sentCount}</div>
          <span className="text-[11px] font-mono text-emerald-300/80 mt-1 block">Delivered via Gmail API</span>
        </div>
      </div>

      {/* Gmail API Not Enabled Warning Banner */}
      {gmailStatus?.api_error && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-transparent border border-amber-500/30 text-amber-200 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-amber-300 text-sm">Action Required: Enable Gmail API in Google Cloud</p>
              <p className="text-white/70 text-[11px] mt-0.5 max-w-xl">
                Google authenticated your account, but the <strong>Gmail API</strong> service is not enabled yet in project <code>596466540442</code>. Click below to enable it in 1 click, then hit <em>Sync Inbox</em>.
              </p>
            </div>
          </div>
          <a
            href={gmailStatus.api_enable_url || "https://console.developers.google.com/apis/api/gmail.googleapis.com/overview?project=596466540442"}
            target="_blank"
            rel="noreferrer"
            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-all flex items-center gap-1.5 shrink-0 shadow-md hover:scale-[1.02] active:scale-[0.98]"
          >
            <span>Enable Gmail API</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      )}

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-white/[0.03] border border-white/10 overflow-x-auto">
          <button
            onClick={() => setActiveFilter('all')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-mono font-medium transition-all whitespace-nowrap cursor-pointer ${
              activeFilter === 'all'
                ? 'bg-red-600 text-white font-bold shadow-sm'
                : 'text-white/60 hover:text-white'
            }`}
          >
            All Inbound ({metrics.total})
          </button>

          <button
            onClick={() => setActiveFilter('needs_triage')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-mono font-medium transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              activeFilter === 'needs_triage'
                ? 'bg-amber-500 text-black font-bold shadow-sm'
                : 'text-amber-300/80 hover:text-amber-200'
            }`}
          >
            <span>Needs Triage</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${activeFilter === 'needs_triage' ? 'bg-black/20 text-black' : 'bg-amber-500/20 text-amber-300'}`}>
              {metrics.needsTriage}
            </span>
          </button>

          <button
            onClick={() => setActiveFilter('draft_ready')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-mono font-medium transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              activeFilter === 'draft_ready'
                ? 'bg-purple-600 text-white font-bold shadow-sm'
                : 'text-purple-300/80 hover:text-purple-200'
            }`}
          >
            <span>Draft Ready</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${activeFilter === 'draft_ready' ? 'bg-white/20 text-white' : 'bg-purple-500/20 text-purple-300'}`}>
              {metrics.draftReady}
            </span>
          </button>

          <button
            onClick={() => setActiveFilter('sensitive')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-mono font-medium transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              activeFilter === 'sensitive'
                ? 'bg-rose-600 text-white font-bold shadow-sm'
                : 'text-rose-300/80 hover:text-rose-200'
            }`}
          >
            <span>Sensitive</span>
            {metrics.sensitiveCount > 0 && (
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${activeFilter === 'sensitive' ? 'bg-white/20 text-white' : 'bg-rose-500/20 text-rose-300'}`}>
                {metrics.sensitiveCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveFilter('sent')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-mono font-medium transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              activeFilter === 'sent'
                ? 'bg-emerald-600 text-white font-bold shadow-sm'
                : 'text-emerald-300/80 hover:text-emerald-200'
            }`}
          >
            <span>Sent ({metrics.sentCount})</span>
          </button>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-3.5 h-3.5 text-white/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search sender, subject, keywords..."
            className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-white placeholder:text-white/40 focus:outline-none focus:border-red-400"
          />
        </div>
      </div>

      {/* Inbound Emails Queue */}
      <div className="space-y-3.5">
        {loading && emails.length === 0 ? (
          <div className="rounded-3xl p-16 bg-white/[0.02] border border-white/10 text-center flex flex-col items-center justify-center gap-3">
            <RefreshCw className="w-8 h-8 text-red-400 animate-spin opacity-60" />
            <span className="text-white/60 text-sm font-mono">Syncing inbox messages from Gmail...</span>
          </div>
        ) : filteredEmails.length === 0 ? (
          <div className="rounded-3xl p-16 bg-white/[0.02] border border-white/10 text-center flex flex-col items-center justify-center gap-2">
            <Inbox className="w-10 h-10 text-white/20 mb-1" />
            <span className="text-white/60 text-sm font-medium">No emails matching current criteria</span>
            <span className="text-white/30 text-xs font-mono">Try selecting a different filter tab or clear search terms.</span>
          </div>
        ) : (
          filteredEmails.map((email) => {
            const isSensitive = email.is_sensitive;
            const category = email.category || 'General HR';
            const urgency = (email.urgency || 'MEDIUM').toUpperCase();
            const isSent = email.sent || email.status === 'SENT';
            const hasDraft = email.has_draft || email.draft_body;

            return (
              <div
                key={email.id}
                onClick={() => handleOpenEmail(email)}
                className={`rounded-2xl p-5 bg-white/[0.04] dark:bg-[#0a0e24]/95 hover:bg-white/[0.07] dark:hover:bg-[#0d1230] border transition-all specular-border flex flex-col gap-3.5 cursor-pointer shadow-lg ${
                  isSent
                    ? 'border-emerald-500/25 opacity-85'
                    : isSensitive
                    ? 'border-purple-500/35 shadow-[0_0_18px_rgba(168,85,247,0.12)]'
                    : 'border-white/10'
                }`}
              >
                {/* Header row: Category pill, badges, date, and review button */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="flex items-start gap-3.5 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-red-600/20 to-rose-500/20 border border-red-500/30 flex items-center justify-center shrink-0">
                      <Mail className="w-5 h-5 text-red-400" />
                    </div>

                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1.5">
                        <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-400/25 text-cyan-300 font-bold">
                          {category}
                        </span>

                        {urgency === 'CRITICAL' || urgency === 'HIGH' ? (
                          <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 text-[10px] font-mono font-semibold">
                            🔴 {urgency} Urgency
                          </span>
                        ) : null}

                        {isSensitive && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/40 text-[10px] font-mono font-semibold">
                            <AlertTriangle className="w-3 h-3 text-purple-400" />
                            <span>⚠ Sensitive</span>
                          </span>
                        )}

                        {isSent ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-mono font-semibold">
                            <Check className="w-3 h-3 text-emerald-400" />
                            <span>Sent via Gmail</span>
                          </span>
                        ) : hasDraft ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/40 text-[10px] font-mono font-semibold">
                            <Sparkles className="w-3 h-3 text-purple-400" />
                            <span>Draft Ready</span>
                          </span>
                        ) : null}

                        <span className="text-[10px] font-mono text-white/40 ml-auto sm:ml-0">
                          {email.date || 'Today'}
                        </span>
                      </div>

                      <h3 className="text-sm sm:text-base font-bold text-white tracking-tight truncate">
                        {email.subject || 'No Subject'}
                      </h3>

                      <p className="text-xs text-white/60 font-mono mt-0.5">
                        From: <strong className="text-white/80">{email.sender?.name || email.sender?.email}</strong> &lt;{email.sender?.email}&gt;
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-start">
                    <button
                      onClick={(e) => { e.stopPropagation(); handleOpenEmail(email); }}
                      className={`px-4 py-2 rounded-xl text-white font-semibold text-xs shadow-md transition-all cursor-pointer flex items-center gap-1.5 ${
                        isSent
                          ? 'bg-emerald-600/60 hover:bg-emerald-600 text-white'
                          : 'bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 shadow-red-500/20'
                      }`}
                    >
                      <span>{isSent ? 'View Thread' : 'Review & Dispatch'}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Email Snippet */}
                <p className="text-xs text-white/70 line-clamp-2 bg-black/50 p-3.5 rounded-xl border border-white/5 font-sans leading-relaxed">
                  {email.snippet || email.body_text || 'No snippet preview available.'}
                </p>
              </div>
            );
          })
        )}
      </div>

      {/* Review, Policy Triage & Dispatch Drawer Modal */}
      {selectedEmail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div
            className="w-full max-w-3xl max-h-[92vh] rounded-3xl bg-white/[0.96] dark:bg-[#060814]/95 backdrop-blur-2xl border border-white/10 shadow-2xl p-6 sm:p-7 overflow-y-auto no-scrollbar flex flex-col gap-5"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-4 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-red-500/20 border border-red-500/40 flex items-center justify-center shrink-0">
                  <Mail className="w-5 h-5 text-red-400" />
                </div>
                <div>
                  <h3 className="font-display text-base sm:text-lg font-bold text-white tracking-tight">
                    {selectedEmail.subject || 'Incoming Inbound Email'}
                  </h3>
                  <p className="text-xs text-white/50 font-mono mt-0.5">
                    From: <strong className="text-white/80">{selectedEmail.sender?.name || selectedEmail.sender?.email}</strong> &lt;{selectedEmail.sender?.email}&gt;
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedEmail(null)}
                className="p-1.5 rounded-xl hover:bg-white/10 text-white/50 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Email Message Body Preview */}
            <div className="p-4 rounded-2xl bg-black/40 border border-white/10 text-xs text-white/80 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase text-white/40 block">Inbound Message Body</span>
                <span className="text-[10px] font-mono text-white/40">{selectedEmail.date || 'Received'}</span>
              </div>
              {loadingDetail ? (
                <div className="flex items-center gap-2 text-white/50 py-4">
                  <RefreshCw className="w-4 h-4 animate-spin text-red-400" />
                  <span>Loading full email body from Gmail...</span>
                </div>
              ) : (
                <div className="whitespace-pre-wrap leading-relaxed max-h-52 overflow-y-auto pr-2 no-scrollbar font-sans text-xs bg-white/[0.02] p-3 rounded-xl border border-white/5">
                  {selectedEmail.body_text || selectedEmail.snippet || 'No message content available.'}
                </div>
              )}
            </div>

            {/* AI Policy Triage Section */}
            <div className="p-4 rounded-2xl bg-purple-500/10 border border-purple-500/25 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-purple-400" />
                  <span className="text-xs font-bold text-purple-200">Automated AI Policy Triage</span>
                </div>
                <button
                  onClick={handleTriageEmail}
                  disabled={isTriaging}
                  className="px-3.5 py-1.5 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/40 text-purple-300 text-xs font-mono transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isTriaging ? 'animate-spin' : ''}`} />
                  <span>{isTriaging ? 'Analyzing with Model...' : (emailTriage ? 'Re-Run Triage' : 'Run AI Triage')}</span>
                </button>
              </div>

              {emailTriage ? (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-xs">
                  <div className="p-2.5 rounded-xl bg-black/30 border border-white/5">
                    <span className="text-[10px] font-mono text-white/40 block">Category</span>
                    <span className="font-bold text-cyan-300 font-mono text-[11px] truncate block">{emailTriage.category}</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-black/30 border border-white/5">
                    <span className="text-[10px] font-mono text-white/40 block">Urgency</span>
                    <span className={`font-bold font-mono text-[11px] ${
                      emailTriage.urgency === 'High' || emailTriage.urgency === 'Urgent'
                        ? 'text-rose-400'
                        : 'text-amber-300'
                    }`}>
                      {emailTriage.urgency}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-black/30 border border-white/5">
                    <span className="text-[10px] font-mono text-white/40 block">Sensitivity</span>
                    <span className={`font-bold font-mono text-[11px] ${
                      emailTriage.is_sensitive ? 'text-amber-400' : 'text-emerald-400'
                    }`}>
                      {emailTriage.is_sensitive ? '⚠ SENSITIVE' : '✓ Standard'}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-black/30 border border-white/5">
                    <span className="text-[10px] font-mono text-white/40 block">Action</span>
                    <span className="font-bold text-indigo-300 font-mono text-[11px] truncate block">
                      {emailTriage.recommended_action || 'Draft Response'}
                    </span>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-purple-300/70 font-mono">
                  Click &lsquo;Run AI Triage&rsquo; to evaluate inquiry urgency, category, and sensitive policy topics before formulating the response.
                </p>
              )}
            </div>

            {/* AI Policy-Grounded Response Draft Generator (RAG) */}
            <div className="p-4 rounded-2xl bg-cyan-500/10 border border-cyan-500/25 space-y-3.5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-cyan-400" />
                  <span className="text-xs font-bold text-cyan-200">Policy-Grounded Reply Synthesis (RAG)</span>
                  {regenerateSuccess && (
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-[10px] font-mono flex items-center gap-1 animate-fadeIn font-semibold">
                      <Check className="w-3 h-3 text-emerald-400" />
                      Regenerated!
                    </span>
                  )}
                </div>

                {/* Tone Switcher & Primary Action */}
                <div className="flex flex-wrap items-center gap-2">
                  <div className="flex items-center p-0.5 rounded-lg bg-black/40 border border-white/10 text-[10px] font-mono">
                    <button
                      onClick={() => { setDraftTone('professional'); handleGenerateDraft('professional', undefined); }}
                      disabled={isDrafting}
                      className={`px-2.5 py-1 rounded-md cursor-pointer transition-all ${draftTone === 'professional' ? 'bg-cyan-500 text-white font-bold' : 'text-white/60 hover:text-white'}`}
                      title="Formal corporate HR tone"
                    >
                      Professional
                    </button>
                    <button
                      onClick={() => { setDraftTone('empathetic'); handleGenerateDraft('empathetic', undefined); }}
                      disabled={isDrafting}
                      className={`px-2.5 py-1 rounded-md cursor-pointer transition-all ${draftTone === 'empathetic' ? 'bg-purple-500 text-white font-bold' : 'text-white/60 hover:text-white'}`}
                      title="Warm and supportive tone"
                    >
                      Empathetic
                    </button>
                    <button
                      onClick={() => { setDraftTone('concise'); handleGenerateDraft('concise', undefined); }}
                      disabled={isDrafting}
                      className={`px-2.5 py-1 rounded-md cursor-pointer transition-all ${draftTone === 'concise' ? 'bg-blue-500 text-white font-bold' : 'text-white/60 hover:text-white'}`}
                      title="Direct and action-oriented tone"
                    >
                      Concise
                    </button>
                  </div>

                  <button
                    onClick={() => handleGenerateDraft(draftTone, emailDraft ? 'regenerate' : undefined)}
                    disabled={isDrafting}
                    className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-semibold text-xs transition-all cursor-pointer flex items-center gap-1.5 shadow-md hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                    title={emailDraft ? "Regenerate a fresh grounded variation of this email" : "Generate policy-grounded draft response"}
                  >
                    <Sparkles className={`w-3.5 h-3.5 ${isDrafting ? 'animate-spin' : ''}`} />
                    <span>{isDrafting ? 'Synthesizing...' : (emailDraft ? 'Regenerate Draft' : 'Generate Grounded Draft')}</span>
                  </button>
                </div>
              </div>

              {/* Generation Options & Refinements Toolbar */}
              <div className="flex flex-wrap items-center justify-between gap-2 p-2 rounded-xl bg-black/25 border border-white/10 text-xs">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-[10px] font-mono uppercase text-white/40 mr-1 flex items-center gap-1">
                    <SlidersHorizontal className="w-3 h-3 text-cyan-400" />
                    Refine Options:
                  </span>
                  <button
                    onClick={() => handleGenerateDraft(draftTone, 'shorten')}
                    disabled={isDrafting || !emailDraft}
                    className="px-2 py-0.5 rounded-md bg-white/5 hover:bg-white/10 border border-white/10 text-[10px] font-mono text-cyan-200 hover:text-white flex items-center gap-1 transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                    title="Shorten and condense the email response"
                  >
                    <FileText className="w-2.5 h-2.5 text-cyan-400" />
                    Shorten
                  </button>
                  <button
                    onClick={() => { setDraftTone('empathetic'); handleGenerateDraft('empathetic', 'make_empathetic'); }}
                    disabled={isDrafting || !emailDraft}
                    className="px-2 py-0.5 rounded-md bg-white/5 hover:bg-white/10 border border-white/10 text-[10px] font-mono text-purple-200 hover:text-white flex items-center gap-1 transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                    title="Enhance warmth, empathy, and employee wellness focus"
                  >
                    <Heart className="w-2.5 h-2.5 text-purple-400" />
                    More Empathetic
                  </button>
                  <button
                    onClick={() => { setDraftTone('professional'); handleGenerateDraft('professional', 'make_professional'); }}
                    disabled={isDrafting || !emailDraft}
                    className="px-2 py-0.5 rounded-md bg-white/5 hover:bg-white/10 border border-white/10 text-[10px] font-mono text-blue-200 hover:text-white flex items-center gap-1 transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                    title="Adopt strict formal corporate HR compliance terminology"
                  >
                    <Shield className="w-2.5 h-2.5 text-blue-400" />
                    Formal Compliance
                  </button>
                  <button
                    onClick={() => handleGenerateDraft(draftTone, 'regenerate')}
                    disabled={isDrafting || !emailDraft}
                    className="px-2 py-0.5 rounded-md bg-white/5 hover:bg-white/10 border border-white/10 text-[10px] font-mono text-amber-200 hover:text-white flex items-center gap-1 transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                    title="Generate alternative phrasing and sentence structure"
                  >
                    <RotateCcw className={`w-2.5 h-2.5 text-amber-400 ${isDrafting ? 'animate-spin' : ''}`} />
                    Fresh Variation
                  </button>
                </div>

                <button
                  onClick={() => setShowCustomGuidance(prev => !prev)}
                  className={`px-2.5 py-0.5 rounded-md text-[10px] font-mono flex items-center gap-1 transition-all cursor-pointer ${
                    showCustomGuidance || customInstructions
                      ? 'bg-cyan-500/20 text-cyan-200 border border-cyan-500/40'
                      : 'bg-white/5 text-white/60 hover:text-white border border-white/10'
                  }`}
                  title="Provide custom instructions to guide the AI draft"
                >
                  <Edit3 className="w-2.5 h-2.5" />
                  <span>Custom Guidance {customInstructions ? '• Active' : ''}</span>
                </button>
              </div>

              {/* Collapsible Custom HR Guidance Bar */}
              {showCustomGuidance && (
                <div className="p-2.5 rounded-xl bg-black/40 border border-cyan-500/30 space-y-2 animate-fadeIn">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-mono uppercase text-cyan-300/80 flex items-center gap-1">
                      <Wand2 className="w-3 h-3 text-cyan-400" />
                      Special HR Specialist Guidance / Policy Conditions:
                    </label>
                    {customInstructions && (
                      <button
                        onClick={() => setCustomInstructions('')}
                        className="text-[10px] font-mono text-white/40 hover:text-red-400 transition-colors"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={customInstructions}
                      onChange={(e) => setCustomInstructions(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleGenerateDraft(draftTone, emailDraft ? 'regenerate' : undefined, customInstructions);
                        }
                      }}
                      placeholder="e.g. Note that travel receipts must be submitted before Nov 15th, or manager approval is required..."
                      className="flex-1 px-3 py-1.5 rounded-lg bg-black/60 border border-white/15 text-white text-xs placeholder:text-white/30 focus:outline-none focus:border-cyan-400 font-sans"
                    />
                    <button
                      onClick={() => handleGenerateDraft(draftTone, emailDraft ? 'regenerate' : undefined, customInstructions)}
                      disabled={isDrafting}
                      className="px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs transition-all cursor-pointer flex items-center gap-1 whitespace-nowrap shadow-sm disabled:opacity-50"
                    >
                      <Sparkles className="w-3 h-3" />
                      <span>{emailDraft ? 'Regenerate with Guidance' : 'Apply & Generate'}</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Citations Preview */}
              {emailDraft?.citations && emailDraft.citations.length > 0 && (
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <span className="text-[10px] font-mono text-cyan-300/70">Verified Policy PDF Citations:</span>
                  {emailDraft.citations.map((c: any, idx: number) => (
                    <span
                      key={idx}
                      className="px-2.5 py-0.5 rounded-md bg-cyan-500/15 border border-cyan-500/30 text-cyan-200 text-[10px] font-mono flex items-center gap-1"
                    >
                      <BookOpen className="w-2.5 h-2.5" />
                      <span>{c.title || c.document} (Page {c.page})</span>
                    </span>
                  ))}
                </div>
              )}

              {/* Editable Draft Body */}
              <div>
                <label className="text-[10px] font-mono uppercase text-white/40 block mb-1">
                  HR Specialist Review &amp; Editable Reply
                </label>
                <textarea
                  rows={7}
                  value={editableBody}
                  onChange={(e) => setEditableBody(e.target.value)}
                  placeholder="Click 'Generate Grounded Draft' above to synthesize a response grounded in company policies..."
                  className="w-full p-3.5 rounded-xl bg-black/40 border border-white/15 text-white text-xs leading-relaxed focus:outline-none focus:border-cyan-400 font-sans"
                />
              </div>

              {/* Dispatch Footer */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-white/10">
                <span className="text-[11px] text-white/50 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Authenticated sender: <strong>{gmailStatus?.email || (gmailStatus?.connected ? 'hr.specialist@enterprise.internal' : 'No Email Connected (Connect Above)')}</strong></span>
                </span>

                <div className="flex items-center gap-3">
                  {sendSuccess && (
                    <span className="text-xs font-mono text-emerald-300 animate-fadeIn flex items-center gap-1.5 font-bold">
                      <Check className="w-4 h-4 text-emerald-400" />
                      <span>Reply dispatched successfully via Gmail!</span>
                    </span>
                  )}
                  <button
                    onClick={handleSendReply}
                    disabled={isSending || !editableBody}
                    className={`px-6 py-2.5 rounded-xl font-semibold text-xs flex items-center gap-2 shadow-lg transition-all cursor-pointer ${
                      isSending || !editableBody
                        ? 'bg-white/10 text-white/40 cursor-not-allowed'
                        : 'bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white shadow-emerald-500/20'
                    }`}
                  >
                    <Send className={`w-3.5 h-3.5 ${isSending ? 'animate-bounce' : ''}`} />
                    <span>{isSending ? 'Sending via Gmail API...' : 'Approve & Send via Gmail'}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Connect Email Modal */}
      <ConnectMailModal
        isOpen={isConnectModalOpen}
        onClose={() => setIsConnectModalOpen(false)}
        gmailStatus={gmailStatus}
        onStatusChange={(st) => {
          setGmailStatus(st);
          loadEmails();
        }}
      />
    </div>
  );
};
