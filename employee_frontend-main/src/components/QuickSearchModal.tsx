import React, { useState, useEffect } from 'react';
import {
  Search,
  X,
  FileText,
  Calendar,
  CreditCard,
  BookOpen,
  ArrowRight,
  Bot,
  User,
} from 'lucide-react';
import { HrRequest, PolicyItem, ScreenId } from '../types';

interface QuickSearchModalProps {
  onClose: () => void;
  requests: HrRequest[];
  policies: PolicyItem[];
  onSelectRequest: (request: HrRequest) => void;
  onSelectPolicy: (policy: PolicyItem) => void;
  onNavigate: (screen: ScreenId) => void;
  onOpenQuickAction: (action: 'leave' | 'payslip' | 'bank') => void;
}

export const QuickSearchModal: React.FC<QuickSearchModalProps> = ({
  onClose,
  requests,
  policies,
  onSelectRequest,
  onSelectPolicy,
  onNavigate,
  onOpenQuickAction,
}) => {
  const [query, setQuery] = useState('');

  // Keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const q = query.toLowerCase().trim();

  const filteredRequests = requests.filter(
    (r) =>
      r.id.toLowerCase().includes(q) ||
      r.subject.toLowerCase().includes(q) ||
      r.category.toLowerCase().includes(q)
  );

  const filteredPolicies = policies.filter(
    (p) =>
      p.title.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q) ||
      p.summary.toLowerCase().includes(q)
  );

  const quickActions = [
    { label: 'Check / Apply Leave Balance', icon: Calendar, action: () => onOpenQuickAction('leave') },
    { label: 'Download August 2026 Payslip', icon: CreditCard, action: () => onOpenQuickAction('payslip') },
    { label: 'Update Bank Account Details', icon: CreditCard, action: () => onOpenQuickAction('bank') },
    { label: 'Chat with Ask HR Assistant', icon: Bot, action: () => onNavigate('ask-hr') },
    { label: 'View My Profile & Employee Card', icon: User, action: () => onNavigate('my-profile') },
  ].filter((a) => !q || a.label.toLowerCase().includes(q));

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 p-4">
      <div
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <div className="relative w-full max-w-xl crystal-glass rounded-2xl shadow-2xl border border-white overflow-hidden z-10 flex flex-col max-h-[80vh] animate-in fade-in zoom-in-95 duration-100">
        {/* Search Input Bar */}
        <div className="p-4 border-b border-white/70 flex items-center gap-3 bg-white/60">
          <Search className="w-5 h-5 text-slate-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
            placeholder="Type to search requests, policies, or actions..."
            className="flex-1 bg-transparent border-none outline-none text-[15px] text-[#0F172A] placeholder:text-slate-400 font-normal"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 rounded text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="px-2 py-0.5 rounded bg-slate-100 text-slate-500 text-[11px] font-semibold border border-slate-200">
            ESC
          </kbd>
        </div>

        {/* Results Container */}
        <div className="flex-1 overflow-y-auto p-3 space-y-4">
          {/* Quick Actions */}
          {quickActions.length > 0 && (
            <div>
              <div className="px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-[#64748B]">
                Actions & Quick Links
              </div>
              <div className="mt-1 space-y-1">
                {quickActions.map((qa, idx) => {
                  const Icon = qa.icon;
                  return (
                    <button
                      key={idx}
                      onClick={() => {
                        qa.action();
                        onClose();
                      }}
                      className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-white/80 transition-colors text-left group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-7 h-7 rounded-lg bg-teal-500/10 text-[#0D9488] flex items-center justify-center">
                          <Icon className="w-4 h-4" />
                        </div>
                        <span className="text-[13px] font-medium text-[#0F172A]">
                          {qa.label}
                        </span>
                      </div>
                      <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-teal-600 group-hover:translate-x-1 transition-all" />
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Requests */}
          {filteredRequests.length > 0 && (
            <div>
              <div className="px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-[#64748B]">
                HR Requests ({filteredRequests.length})
              </div>
              <div className="mt-1 space-y-1">
                {filteredRequests.slice(0, 5).map((r) => (
                  <button
                    key={r.id}
                    onClick={() => {
                      onSelectRequest(r);
                      onClose();
                    }}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-white/80 transition-colors text-left"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="font-mono text-[12px] font-bold text-slate-500 bg-white/80 px-2 py-0.5 rounded border border-white flex-shrink-0">
                        {r.id}
                      </span>
                      <span className="text-[13px] font-medium text-[#0F172A] truncate">
                        {r.subject}
                      </span>
                    </div>
                    <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-semibold flex-shrink-0">
                      {r.status}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Policies */}
          {filteredPolicies.length > 0 && (
            <div>
              <div className="px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-[#64748B]">
                Policies & Guides ({filteredPolicies.length})
              </div>
              <div className="mt-1 space-y-1">
                {filteredPolicies.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => {
                      onSelectPolicy(p);
                      onClose();
                    }}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-white/80 transition-colors text-left group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <BookOpen className="w-4 h-4 text-[#0D9488] flex-shrink-0" />
                      <div className="min-w-0">
                        <div className="text-[13px] font-medium text-[#0F172A] truncate">
                          {p.title}
                        </div>
                        <div className="text-[11px] text-slate-400 truncate">
                          {p.summary}
                        </div>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-teal-600 group-hover:translate-x-1 transition-all flex-shrink-0" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {quickActions.length === 0 &&
            filteredRequests.length === 0 &&
            filteredPolicies.length === 0 && (
              <div className="py-8 text-center text-slate-400 text-[13px]">
                No matching results found for "{query}"
              </div>
            )}
        </div>
      </div>
    </div>
  );
};
