import React, { useState, useMemo } from 'react';
import {
  AlertTriangle,
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Search,
  Filter,
  ArrowRight,
  BookOpen,
  Sparkles,
  SlidersHorizontal,
  ChevronDown,
  RefreshCw,
  Edit2,
  X,
  FileText,
  User,
  Zap,
  HelpCircle
} from 'lucide-react';
import { RequestItem, TriagePriority, TriageSensitivity, Category } from '../../types/hr';

interface AITriageViewProps {
  requests: RequestItem[];
  onSelectRequest: (item: RequestItem) => void;
  onOverrideTriage?: (requestId: string, humanPriority?: string, humanCategory?: string, notes?: string) => Promise<any>;
  onRetryTriage?: (requestId: string) => Promise<any>;
}

type TriageFilter = 'all' | 'needs_review' | 'high_priority' | 'sensitive' | 'policy_related';

export const AITriageView: React.FC<AITriageViewProps> = ({
  requests = [],
  onSelectRequest,
  onOverrideTriage,
  onRetryTriage
}) => {
  const [activeFilter, setActiveFilter] = useState<TriageFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [overrideModalItem, setOverrideModalItem] = useState<RequestItem | null>(null);
  const [overridePriority, setOverridePriority] = useState<TriagePriority>('MEDIUM');
  const [overrideCategory, setOverrideCategory] = useState<string>('leave');
  const [overrideNotes, setOverrideNotes] = useState('');
  const [isSubmittingOverride, setIsSubmittingOverride] = useState(false);
  const [retryingId, setRetryingId] = useState<string | null>(null);

  // Derive Real Summary Numbers from active request/triage data
  const summary = useMemo(() => {
    const totalRequests = requests.length;
    const needReview = requests.filter(r => {
      const sens = r.triage?.sensitivity;
      const status = r.triage?.status;
      return sens === 'HIGHLY_SENSITIVE' || sens === 'SENSITIVE' || sens === 'NEEDS_REVIEW' || status === 'NEEDS_REVIEW';
    }).length;

    const highPriority = requests.filter(r => {
      const p = (r.triage?.humanPriority || r.triage?.priority || r.priority || '').toUpperCase();
      return p === 'CRITICAL' || p === 'HIGH';
    }).length;

    const sensitiveCount = requests.filter(r => {
      const s = r.triage?.sensitivity;
      return s === 'HIGHLY_SENSITIVE' || s === 'SENSITIVE';
    }).length;

    return {
      total: totalRequests,
      needReview,
      highPriority,
      sensitive: sensitiveCount
    };
  }, [requests]);

  // Priority sorting helper: CRITICAL -> HIGH -> MEDIUM -> LOW
  const getPriorityWeight = (p?: string) => {
    switch ((p || '').toUpperCase()) {
      case 'CRITICAL': return 4;
      case 'HIGH': return 3;
      case 'MEDIUM': return 2;
      case 'LOW': return 1;
      default: return 0;
    }
  };

  // Filtered & Prioritized Queue
  const triageQueue = useMemo(() => {
    return requests
      .filter(r => {
        const triage = r.triage;
        const effectivePriority = (triage?.humanPriority || triage?.priority || r.priority || '').toUpperCase();
        const sensitivity = triage?.sensitivity || 'NORMAL';
        const hasPolicy = !!triage?.relevantPolicy && triage.relevantPolicy !== 'Standard Company Policies';

        // Filter tabs
        if (activeFilter === 'needs_review') {
          const isNeeds = sensitivity === 'HIGHLY_SENSITIVE' || sensitivity === 'SENSITIVE' || sensitivity === 'NEEDS_REVIEW' || triage?.status === 'NEEDS_REVIEW';
          if (!isNeeds) return false;
        } else if (activeFilter === 'high_priority') {
          if (effectivePriority !== 'CRITICAL' && effectivePriority !== 'HIGH') return false;
        } else if (activeFilter === 'sensitive') {
          if (sensitivity !== 'HIGHLY_SENSITIVE' && sensitivity !== 'SENSITIVE') return false;
        } else if (activeFilter === 'policy_related') {
          if (!hasPolicy) return false;
        }

        // Search
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchTitle = (r.title || '').toLowerCase().includes(q);
          const matchDesc = (r.description || '').toLowerCase().includes(q);
          const matchId = (r.id || '').toLowerCase().includes(q);
          const matchEmp = (typeof r.employee === 'object' ? r.employee?.name : r.employee || '').toLowerCase().includes(q);
          const matchCat = (triage?.categoryDisplay || r.categoryDisplay || r.category || '').toLowerCase().includes(q);
          const matchPol = (triage?.relevantPolicy || '').toLowerCase().includes(q);
          return matchTitle || matchDesc || matchId || matchEmp || matchCat || matchPol;
        }

        return true;
      })
      .sort((a, b) => {
        // Sort first by priority weight, then by sensitivity, then by creation date
        const prioA = getPriorityWeight(a.triage?.humanPriority || a.triage?.priority || a.priority);
        const prioB = getPriorityWeight(b.triage?.humanPriority || b.triage?.priority || b.priority);
        if (prioB !== prioA) return prioB - prioA;

        const isSensA = a.triage?.sensitivity === 'HIGHLY_SENSITIVE' ? 2 : a.triage?.sensitivity === 'SENSITIVE' ? 1 : 0;
        const isSensB = b.triage?.sensitivity === 'HIGHLY_SENSITIVE' ? 2 : b.triage?.sensitivity === 'SENSITIVE' ? 1 : 0;
        if (isSensB !== isSensA) return isSensB - isSensA;

        return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
      });
  }, [requests, activeFilter, searchQuery]);

  const handleOpenOverride = (item: RequestItem, e: React.MouseEvent) => {
    e.stopPropagation();
    setOverrideModalItem(item);
    setOverridePriority(item.triage?.humanPriority || item.triage?.priority || 'MEDIUM');
    setOverrideCategory(item.triage?.humanCategory || item.triage?.category || item.category || 'leave');
    setOverrideNotes(item.triage?.overrideNotes || '');
  };

  const handleSubmitOverride = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!overrideModalItem || !onOverrideTriage) return;
    setIsSubmittingOverride(true);
    try {
      await onOverrideTriage(overrideModalItem.id, overridePriority, overrideCategory, overrideNotes);
      setOverrideModalItem(null);
    } finally {
      setIsSubmittingOverride(false);
    }
  };

  const handleRetry = async (requestId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!onRetryTriage || retryingId) return;
    setRetryingId(requestId);
    try {
      await onRetryTriage(requestId);
    } finally {
      setRetryingId(null);
    }
  };

  const getPriorityStyle = (priority: string) => {
    switch (priority.toUpperCase()) {
      case 'CRITICAL':
        return {
          dot: 'bg-rose-500',
          badge: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
          indicator: '🔴 CRITICAL'
        };
      case 'HIGH':
        return {
          dot: 'bg-orange-500',
          badge: 'bg-orange-500/20 text-orange-300 border-orange-500/40',
          indicator: '🟠 HIGH'
        };
      case 'MEDIUM':
        return {
          dot: 'bg-amber-400',
          badge: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
          indicator: '🟡 MEDIUM'
        };
      case 'LOW':
      default:
        return {
          dot: 'bg-blue-400',
          badge: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
          indicator: '🔵 LOW'
        };
    }
  };

  return (
    <div className="flex-1 flex flex-col gap-5">
      {/* Header */}
      <div className="rounded-3xl p-6 bg-white/[0.04] backdrop-blur-2xl border border-white/10 shadow-glass specular-border flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <span className="p-2 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
              <Zap className="w-5 h-5" />
            </span>
            <h1 className="font-display text-xl font-bold text-white tracking-tight">
              AI TRIAGE
            </h1>
          </div>
          <p className="text-xs text-white/50">
            AI-powered request classification and HR attention queue. What should HR look at first?
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono px-3 py-1.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-300 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            <span>Policy Vector Grounding Active</span>
          </span>
        </div>
      </div>

      {/* Top Summary Stat Pills (From Real Request/Triage Data) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-xl">
          <span className="text-[10px] font-mono uppercase text-white/40 block mb-1">Total Queue</span>
          <div className="text-2xl font-bold text-white font-display">{summary.total} Requests</div>
          <span className="text-[11px] font-mono text-cyan-300/80 mt-1 block">Live Intake Stream</span>
        </div>

        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/25 backdrop-blur-xl">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-mono uppercase text-amber-300/70">Needs Attention</span>
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
          </div>
          <div className="text-2xl font-bold text-amber-200 font-display">{summary.needReview} Need Review</div>
          <span className="text-[11px] font-mono text-amber-300/80 mt-1 block">Awaiting Specialist Action</span>
        </div>

        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/25 backdrop-blur-xl">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-mono uppercase text-rose-300/70">Urgent Cases</span>
            <span className="w-2 h-2 rounded-full bg-rose-400" />
          </div>
          <div className="text-2xl font-bold text-rose-200 font-display">{summary.highPriority} High Priority</div>
          <span className="text-[11px] font-mono text-rose-300/80 mt-1 block">Suggested Critical / High</span>
        </div>

        <div className="p-4 rounded-2xl bg-purple-500/10 border border-purple-500/25 backdrop-blur-xl">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-mono uppercase text-purple-300/70">Sensitive Cases</span>
            <AlertTriangle className="w-3.5 h-3.5 text-purple-400" />
          </div>
          <div className="text-2xl font-bold text-purple-200 font-display">{summary.sensitive} Sensitive</div>
          <span className="text-[11px] font-mono text-purple-300/80 mt-1 block">Mandatory Human Review</span>
        </div>
      </div>


          {/* Filters & Search */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-white/[0.03] border border-white/10 overflow-x-auto">
              <button
                onClick={() => setActiveFilter('all')}
                className={`px-3 py-1.5 rounded-xl text-xs font-mono font-medium transition-all whitespace-nowrap cursor-pointer ${
                  activeFilter === 'all'
                    ? 'bg-cyan-600 text-white shadow-sm'
                    : 'text-white/60 hover:text-white'
                }`}
              >
                All ({requests.length})
              </button>

              <button
                onClick={() => setActiveFilter('needs_review')}
                className={`px-3 py-1.5 rounded-xl text-xs font-mono font-medium transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                  activeFilter === 'needs_review'
                    ? 'bg-amber-500 text-black font-bold shadow-sm'
                    : 'text-amber-300/80 hover:text-amber-200'
                }`}
              >
                <span>Needs Review</span>
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${activeFilter === 'needs_review' ? 'bg-black/20 text-black' : 'bg-amber-500/20 text-amber-300'}`}>
                  {summary.needReview}
                </span>
              </button>

              <button
                onClick={() => setActiveFilter('high_priority')}
                className={`px-3 py-1.5 rounded-xl text-xs font-mono font-medium transition-all whitespace-nowrap cursor-pointer ${
                  activeFilter === 'high_priority'
                    ? 'bg-rose-600 text-white shadow-sm'
                    : 'text-white/60 hover:text-white'
                }`}
              >
                High Priority ({summary.highPriority})
              </button>

              <button
                onClick={() => setActiveFilter('sensitive')}
                className={`px-3 py-1.5 rounded-xl text-xs font-mono font-medium transition-all whitespace-nowrap cursor-pointer ${
                  activeFilter === 'sensitive'
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'text-white/60 hover:text-white'
                }`}
              >
                Sensitive ({summary.sensitive})
              </button>

              <button
                onClick={() => setActiveFilter('policy_related')}
                className={`px-3 py-1.5 rounded-xl text-xs font-mono font-medium transition-all whitespace-nowrap cursor-pointer ${
                  activeFilter === 'policy_related'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-white/60 hover:text-white'
                }`}
              >
                Policy Related
              </button>
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 text-white/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search requests, policies, names..."
                className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-white placeholder:text-white/40 focus:outline-none focus:border-cyan-400"
              />
            </div>
          </div>

          {/* Main Prioritized Triage Queue */}
          <div className="space-y-3.5">
            {triageQueue.length === 0 ? (
              <div className="rounded-3xl p-12 bg-white/[0.02] border border-white/10 text-center text-white/40">
                <Zap className="w-8 h-8 mx-auto mb-2 opacity-30 text-white" />
                <span>No incoming requests match the selected triage filter.</span>
              </div>
            ) : (
          triageQueue.map((req) => {
            const triage = req.triage;
            const effectivePriority = (triage?.humanPriority || triage?.priority || req.priority || 'MEDIUM').toUpperCase();
            const priorityStyle = getPriorityStyle(effectivePriority);
            const isOverridden = !!triage?.humanPriority || !!triage?.humanCategory;
            const sensitivity = triage?.sensitivity || 'NORMAL';
            const isSensitive = sensitivity === 'HIGHLY_SENSITIVE' || sensitivity === 'SENSITIVE';

            const empName = typeof req.employee === 'object' ? req.employee?.name : (req.employee || 'Employee');
            const empDept = typeof req.employee === 'object' ? req.employee?.department : (req.department || 'Operations');
            const empAvatar = typeof req.employee === 'object' ? req.employee?.avatar : undefined;

            return (
              <div
                key={req.id}
                className={`rounded-2xl p-5 bg-white/[0.03] hover:bg-white/[0.05] border transition-all specular-border flex flex-col gap-4 ${
                  isSensitive
                    ? 'border-purple-500/30 shadow-[0_0_15px_rgba(168,85,247,0.06)]'
                    : 'border-white/10'
                }`}
              >
                {/* Top Row: AI Priority, Title, Sensitivity, and Controls */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="flex items-start gap-3 min-w-0">
                    <span className="font-mono text-xs px-2.5 py-1 rounded-xl bg-cyan-500/10 border border-cyan-400/25 text-cyan-300 font-bold tracking-wide shrink-0">
                      {req.id}
                    </span>

                    <div>
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase border ${priorityStyle.badge}`}
                          title={isOverridden ? 'Human Overridden Priority' : 'AI Suggested Priority'}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${priorityStyle.dot}`} />
                          <span>{effectivePriority}</span>
                          <span className="text-[9px] opacity-70">
                            {isOverridden ? '(HR Override)' : '(AI Suggested)'}
                          </span>
                        </span>

                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/10 text-white/70">
                          {triage?.categoryDisplay || req.categoryDisplay || req.category}
                        </span>

                        {isSensitive && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-mono font-semibold">
                            <AlertTriangle className="w-3 h-3 text-amber-400" />
                            <span>⚠ Sensitive Case</span>
                          </span>
                        )}

                        <span className="text-[10px] font-mono text-white/40">
                          {req.waitingTime || 'Just now'}
                        </span>
                      </div>

                      <h3 className="text-sm sm:text-base font-bold text-white tracking-tight">
                        {req.title || req.subject || 'Incoming HR Inquiry'}
                      </h3>

                      <p className="text-xs text-white/60 font-mono mt-0.5 flex items-center gap-1.5">
                        <User className="w-3 h-3 text-white/40" />
                        <span>Employee: <strong className="text-white/80">{empName}</strong> ({empDept})</span>
                      </p>
                    </div>
                  </div>

                  {/* Actions: Review Request (Opens existing ReviewDrawer) & Override */}
                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-start">
                    <button
                      onClick={(e) => handleOpenOverride(req, e)}
                      className="px-3 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-white/70 hover:text-white font-mono text-xs transition-colors cursor-pointer flex items-center gap-1.5"
                      title="Adjust AI suggested classification or priority"
                    >
                      <SlidersHorizontal className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Override</span>
                    </button>

                    <button
                      onClick={() => onSelectRequest(req)}
                      className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-semibold text-xs shadow-md shadow-cyan-500/20 transition-all cursor-pointer flex items-center gap-1.5"
                    >
                      <span>Review Request</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Sensitive Warning Alert Banner (If Sensitive Case) */}
                {isSensitive && (
                  <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between text-xs text-amber-200">
                    <div className="flex items-center gap-2">
                      <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
                      <span>
                        <strong>⚠ Sensitive HR Case:</strong> Human review required before automated communication.
                      </span>
                    </div>
                    <span className="text-[11px] font-mono text-amber-300/70 hidden md:inline">
                      Automated dispatch locked
                    </span>
                  </div>
                )}

                {/* AI Intelligence Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-3.5 rounded-2xl bg-black/40 border border-white/5 text-xs">
                  {/* Confidence & Reason */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[11px] font-mono">
                      <span className="text-white/40 uppercase">AI Confidence</span>
                      <span className="text-cyan-300 font-bold">
                        {Math.round((triage?.confidence || 0.95) * 100)}%
                      </span>
                    </div>
                    <p className="text-[11px] text-white/70 line-clamp-2 leading-relaxed">
                      {triage?.reason || 'Intake narrative matched against standard operational ticketing heuristics.'}
                    </p>
                  </div>

                  {/* Suggested Action */}
                  <div className="space-y-1">
                    <span className="text-[11px] font-mono text-white/40 uppercase block">Suggested Action</span>
                    <p className="text-[11px] font-mono font-medium text-purple-300 line-clamp-2">
                      {triage?.suggestedAction || 'Review case documentation & route to specialist queue.'}
                    </p>
                  </div>

                  {/* Relevant Policy */}
                  <div className="space-y-1">
                    <div className="flex items-center gap-1 text-[11px] font-mono text-cyan-300/70 uppercase">
                      <BookOpen className="w-3 h-3 text-cyan-400" />
                      <span>Relevant Policy</span>
                    </div>
                    <p className="text-[11px] text-white/80 font-medium line-clamp-2">
                      {triage?.relevantPolicy || 'Corporate Employee Handbook'}
                    </p>
                  </div>
                </div>

                {/* Override Notes (If Present) */}
                {triage?.overrideNotes && (
                  <div className="px-3.5 py-2 rounded-xl bg-purple-950/20 border border-purple-500/20 text-[11px] text-purple-200/90 font-mono">
                    <strong className="text-purple-300">Specialist Override Note:</strong> {triage.overrideNotes}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>



      {/* Human Override Modal */}
      {overrideModalItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div
            className="w-full max-w-lg rounded-3xl bg-[#060814]/95 backdrop-blur-2xl border border-white/10 shadow-2xl p-6 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-white/10">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-xl bg-cyan-500/20 text-cyan-300">
                  <SlidersHorizontal className="w-4 h-4" />
                </span>
                <h3 className="font-display text-base font-bold text-white">
                  Human Override for {overrideModalItem.id}
                </h3>
              </div>
              <button
                onClick={() => setOverrideModalItem(null)}
                className="p-1.5 rounded-xl hover:bg-white/10 text-white/50 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-white/60 mb-4">
              Override AI suggestions. Your override is recorded separately to maintain transparent model telemetry.
            </p>

            <form onSubmit={handleSubmitOverride} className="space-y-4 text-xs">
              <div>
                <label className="text-[11px] font-mono uppercase text-white/50 block mb-1">
                  Human Priority Override
                </label>
                <select
                  value={overridePriority}
                  onChange={(e) => setOverridePriority(e.target.value as TriagePriority)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/15 text-white text-xs focus:outline-none focus:border-cyan-400"
                >
                  <option value="CRITICAL" className="bg-[#0b0e24]">🔴 CRITICAL — Urgent Business Escalation</option>
                  <option value="HIGH" className="bg-[#0b0e24]">🟠 HIGH — Priority SLA Attention</option>
                  <option value="MEDIUM" className="bg-[#0b0e24]">🟡 MEDIUM — Standard Operational Cadence</option>
                  <option value="LOW" className="bg-[#0b0e24]">🔵 LOW — Informational Inquiry</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-mono uppercase text-white/50 block mb-1">
                  Human Category Override
                </label>
                <select
                  value={overrideCategory}
                  onChange={(e) => setOverrideCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/15 text-white text-xs focus:outline-none focus:border-cyan-400"
                >
                  <option value="leave" className="bg-[#0b0e24]">Leave &amp; Attendance</option>
                  <option value="payroll" className="bg-[#0b0e24]">Payroll &amp; Compensation</option>
                  <option value="benefits" className="bg-[#0b0e24]">Benefits &amp; Health Insurance</option>
                  <option value="reimbursement" className="bg-[#0b0e24]">Reimbursement &amp; Expenses</option>
                  <option value="remote_work" className="bg-[#0b0e24]">Remote Work &amp; Travel</option>
                  <option value="documents" className="bg-[#0b0e24]">HR Documentation &amp; Letters</option>
                  <option value="employee_relations" className="bg-[#0b0e24]">Employee Relations &amp; Grievances</option>
                  <option value="recruitment" className="bg-[#0b0e24]">Recruitment &amp; Onboarding</option>
                  <option value="compliance" className="bg-[#0b0e24]">Compliance &amp; Policy</option>
                  <option value="general_hr" className="bg-[#0b0e24]">General HR Inquiry</option>
                  <option value="other" className="bg-[#0b0e24]">Other</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-mono uppercase text-white/50 block mb-1">
                  Specialist Rationale / Override Note
                </label>
                <textarea
                  rows={3}
                  value={overrideNotes}
                  onChange={(e) => setOverrideNotes(e.target.value)}
                  placeholder="Explain why you changed priority or category (e.g., manager verbal alignment, medical exemption)..."
                  className="w-full p-3 rounded-xl bg-black/40 border border-white/15 text-white text-xs leading-relaxed focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div className="pt-3 border-t border-white/10 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setOverrideModalItem(null)}
                  className="px-4 py-2 rounded-xl text-white/60 hover:text-white transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingOverride}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-semibold text-xs shadow-md shadow-cyan-500/20 transition-all cursor-pointer"
                >
                  {isSubmittingOverride ? 'Saving Override...' : 'Apply Human Override'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
