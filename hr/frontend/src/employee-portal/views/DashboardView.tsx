import React, { useState } from 'react';
import {
  Sparkles,
  Send,
  Calendar,
  CreditCard,
  BookOpen,
  BadgeAlert,
  ArrowRight,
  Clock,
  CheckCircle2,
  Umbrella,
  Check,
  Bot,
  PlusCircle,
  Briefcase,
  Layers,
  ChevronRight,
  HelpCircle,
} from 'lucide-react';
import {
  HrRequest,
  NotificationItem,
  HolidayItem,
  LeaveBalance,
  PolicyItem,
  ScreenId,
} from '../types';
import { ASSETS, CURRENT_USER } from '../data/mockData';

interface DashboardViewProps {
  requests: HrRequest[];
  notifications: NotificationItem[];
  holidays: HolidayItem[];
  leaveBalance: LeaveBalance;
  policies: PolicyItem[];
  onSelectRequest: (request: HrRequest) => void;
  onSelectPolicy: (policy: PolicyItem) => void;
  onNavigate: (screen: ScreenId) => void;
  onOpenApplyLeave: () => void;
  onOpenPayslip: () => void;
  onOpenBankUpdate: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  requests,
  notifications,
  holidays,
  leaveBalance,
  policies,
  onSelectRequest,
  onSelectPolicy,
  onNavigate,
  onOpenApplyLeave,
  onOpenPayslip,
  onOpenBankUpdate,
}) => {
  const [aiQuery, setAiQuery] = useState('');
  const [aiAnswer, setAiAnswer] = useState<{
    query: string;
    answer: string;
    source: string;
  } | null>(null);
  const [isAsking, setIsAsking] = useState(false);
  const [showExtraPills, setShowExtraPills] = useState(false);

  // Pagination state for table
  const [page, setPage] = useState(1);
  const pageSize = 5;
  const totalPages = Math.ceil(requests.length / pageSize);
  const displayedRequests = requests.slice((page - 1) * pageSize, page * pageSize);

  // Quick prompt submission
  const handleAiSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const q = aiQuery.trim();
    if (!q) return;

    setIsAsking(true);
    setTimeout(() => {
      setIsAsking(false);
      let answer = '';
      let source = 'Company People Policy Portal (HR-Handbook-v4.2)';

      const lower = q.toLowerCase();
      if (lower.includes('leave') || lower.includes('balance') || lower.includes('days')) {
        answer = `You currently have 18 total available leave days valid thru Dec 2026: 8 Casual Leaves (out of 12), 6 Sick Leaves (out of 10), and 12 Earned Leaves (out of 18). You can submit a new leave request anytime from the Raise Request section.`;
        source = 'Enterprise Leave Policy & Employee Records Database';
      } else if (lower.includes('reimbursement') || lower.includes('expense')) {
        answer = `Broadband & utility reimbursements can be filed up to ₹4,500/quarter under Quick Links > Payroll. Expense submissions are reimbursed along with your monthly payroll if submitted before the 20th of the month.`;
        source = 'Travel & Expense Reimbursement Policy 2026 (Section 3.1)';
      } else if (lower.includes('experience') || lower.includes('letter') || lower.includes('certificate')) {
        answer = `You can request digitally signed Employment Verification or Experience Certificates instantly through "Raise Request" > "Documents".`;
        source = 'Employee Self-Service Documentation Guidelines';
      } else if (lower.includes('work from home') || lower.includes('hybrid') || lower.includes('remote')) {
        answer = `Our Hybrid Workplace Guidelines 2026 mandate 2-3 days of in-office presence per week with flexible core hours from 10:30 AM to 4:30 PM. Eligible hybrid staff may also claim a one-time ergonomic setup allowance of ₹25,000.`;
        source = 'Hybrid Workplace Guidelines 2026';
      } else {
        answer = `Here is what the HR policy states regarding "${q}": Full details can be accessed in our Knowledge Hub or submitted as a support ticket to your dedicated People Partner.`;
      }

      setAiAnswer({
        query: q,
        answer,
        source,
      });
    }, 500);
  };

  const handlePromptClick = (text: string) => {
    setAiQuery(text);
    // trigger answer
    setIsAsking(true);
    setTimeout(() => {
      setIsAsking(false);
      let answer = '';
      let source = 'Company HR Handbook & Portal';
      if (text.includes('leaves')) {
        answer = `You have 18 total available leave days: 8 Casual Leaves, 6 Sick Leaves, and 12 Earned Leaves valid through Dec 2026.`;
        source = 'Enterprise Leave Policy (Section 2.4)';
      } else if (text.includes('reimbursement')) {
        answer = `All operational and utility reimbursements can be submitted under Quick Links > Payroll. Claims submitted prior to the 20th are paid in the current month's salary.`;
        source = 'Financial Expense Policy 2026';
      } else {
        answer = `Employment Verification Letters and Experience Letters can be requested directly via "Raise Request" > "Documents" and are digitally issued within 2 business days.`;
        source = 'Document Services Guidelines';
      }
      setAiAnswer({
        query: text,
        answer,
        source,
      });
    }, 450);
  };

  // Find policies for the featured cards
  const parentalPolicy = policies.find((p) => p.id === 'pol-1') || policies[0];
  const taxPolicy = policies.find((p) => p.id === 'pol-2') || policies[1];
  const hybridPolicy = policies.find((p) => p.id === 'pol-3') || policies[2];

  // Request counts
  const openCount = requests.filter((r) => r.status === 'SUBMITTED').length || 5;
  const inProgressCount = requests.filter((r) => r.status === 'IN PROGRESS').length || 2;
  const resolvedCount = requests.filter((r) => r.status === 'RESOLVED').length || 12;

  return (
    <div className="flex flex-col w-full max-w-[1560px] mx-auto space-y-6">
      {/* 1. WELCOME SECTION */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-[32px] leading-tight text-[#0F172A] font-bold tracking-tight">
            Good morning, Rupam! 👋
          </h1>
          <p className="text-[16px] text-[#334155]">How can we help you today?</p>
        </div>

        {/* Quick Suggestion Pills */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={onOpenApplyLeave}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full crystal-glass text-[#0F172A] text-[13px] font-medium shadow-glass-sm hover:bg-white hover:scale-[1.02] active:scale-[0.98] transition-all"
            type="button"
          >
            <Calendar className="w-4 h-4 text-[#0D9488]" />
            <span>Check my leave balance</span>
          </button>

          <button
            onClick={onOpenPayslip}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full crystal-glass text-[#0F172A] text-[13px] font-medium shadow-glass-sm hover:bg-white hover:scale-[1.02] active:scale-[0.98] transition-all"
            type="button"
          >
            <CreditCard className="w-4 h-4 text-[#0D9488]" />
            <span>Download payslip</span>
          </button>

          <button
            onClick={() => onSelectPolicy(hybridPolicy)}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full crystal-glass text-[#0F172A] text-[13px] font-medium shadow-glass-sm hover:bg-white hover:scale-[1.02] active:scale-[0.98] transition-all"
            type="button"
          >
            <Briefcase className="w-4 h-4 text-[#0D9488]" />
            <span>Work from home policy</span>
          </button>

          <button
            onClick={onOpenBankUpdate}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full crystal-glass text-[#0F172A] text-[13px] font-medium shadow-glass-sm hover:bg-white hover:scale-[1.02] active:scale-[0.98] transition-all"
            type="button"
          >
            <CreditCard className="w-4 h-4 text-[#0D9488]" />
            <span>Update bank details</span>
          </button>

          <button
            onClick={() => setShowExtraPills(!showExtraPills)}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-white/50 text-[#334155] text-[13px] font-medium hover:bg-white/80 transition-all border border-white/60"
            type="button"
          >
            <span>{showExtraPills ? 'Less' : 'More'}</span>
            <ArrowRight className={`w-4 h-4 transition-transform ${showExtraPills ? 'rotate-90' : ''}`} />
          </button>

          {showExtraPills && (
            <>
              <button
                onClick={() => onSelectPolicy(taxPolicy)}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full crystal-glass text-[#0F172A] text-[13px] font-medium shadow-glass-sm hover:bg-white transition-all animate-in fade-in"
              >
                <Layers className="w-4 h-4 text-[#0D9488]" />
                <span>Annual Tax Declaration</span>
              </button>
              <button
                onClick={() => onNavigate('raise-request')}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full crystal-glass text-[#0F172A] text-[13px] font-medium shadow-glass-sm hover:bg-white transition-all animate-in fade-in"
              >
                <PlusCircle className="w-4 h-4 text-[#0D9488]" />
                <span>Submit Expense Claim</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* 2. AI HR ASSISTANT CARD */}
      <div className="relative overflow-hidden rounded-2xl crystal-glass p-6 shadow-glass border border-white/85">
        <div className="absolute -right-8 -bottom-8 w-72 h-72 bg-gradient-to-br from-teal-200/40 via-blue-200/30 to-purple-200/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-col space-y-4">
          {/* Header */}
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#0D9488] to-[#06B6D4] text-white flex items-center justify-center shadow-md shadow-teal-600/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-[20px] text-[#0F172A] font-bold">Ask HR Assistant</h2>
                <span className="px-2.5 py-0.5 rounded-full bg-teal-100 text-[#0F766E] text-[11px] font-bold uppercase tracking-wider border border-teal-200/60 shadow-2xs">
                  Instant AI
                </span>
              </div>
              <p className="text-[13px] text-[#334155]">
                Get instant answers from company policies and approved HR information.
              </p>
            </div>
          </div>

          {/* Interactive Search / Chat Bar */}
          <form
            onSubmit={handleAiSubmit}
            className="flex flex-col sm:flex-row items-center gap-2 p-1.5 bg-white/90 backdrop-blur-md rounded-xl shadow-glass-sm border border-white"
          >
            <div className="flex items-center flex-1 w-full px-3">
              <span className="text-[#0D9488] mr-2.5 font-bold text-[18px]">✦</span>
              <input
                type="text"
                value={aiQuery}
                onChange={(e) => setAiQuery(e.target.value)}
                placeholder="Type your HR question here..."
                className="w-full bg-transparent border-none outline-none text-[14px] text-[#0F172A] placeholder:text-slate-400 py-2 font-normal"
              />
            </div>
            <button
              type="submit"
              disabled={isAsking}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-[#0F172A] text-white hover:bg-slate-800 font-medium text-[13px] transition-all shadow-sm active:scale-[0.98]"
            >
              <span>{isAsking ? 'Thinking...' : 'Ask Assistant'}</span>
              <Send className="w-4 h-4" />
            </button>
          </form>

          {/* Prompt suggestions */}
          <div className="flex flex-wrap items-center gap-2 pt-0.5">
            <span className="text-[12px] text-[#64748B] font-medium">Try asking:</span>
            <button
              type="button"
              onClick={() => handlePromptClick('How many leaves do I have?')}
              className="px-3 py-1 rounded-lg bg-white/60 hover:bg-white text-[#0F172A] text-[12px] font-normal border border-white/80 shadow-2xs transition-all"
            >
              "How many leaves do I have?"
            </button>
            <button
              type="button"
              onClick={() => handlePromptClick('What is the reimbursement policy?')}
              className="px-3 py-1 rounded-lg bg-white/60 hover:bg-white text-[#0F172A] text-[12px] font-normal border border-white/80 shadow-2xs transition-all"
            >
              "What is the reimbursement policy?"
            </button>
            <button
              type="button"
              onClick={() => handlePromptClick('How can I get an experience letter?')}
              className="px-3 py-1 rounded-lg bg-white/60 hover:bg-white text-[#0F172A] text-[12px] font-normal border border-white/80 shadow-2xs transition-all"
            >
              "How can I get an experience letter?"
            </button>
          </div>

          {/* Instant AI Answer Card Display */}
          {aiAnswer && (
            <div className="p-4 rounded-xl bg-white/95 border border-teal-200/80 shadow-glass-sm space-y-2.5 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-md bg-teal-600 text-white flex items-center justify-center text-[11px] font-bold">
                    AI
                  </div>
                  <span className="text-[13px] font-semibold text-[#0F172A]">
                    Q: "{aiAnswer.query}"
                  </span>
                </div>
                <button
                  onClick={() => setAiAnswer(null)}
                  className="text-slate-400 hover:text-slate-600 text-[12px]"
                >
                  Dismiss
                </button>
              </div>
              <p className="text-[13.5px] text-[#0F172A] leading-relaxed">
                {aiAnswer.answer}
              </p>
              <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-[11px]">
                <span className="text-slate-500">
                  Grounding: <strong>{aiAnswer.source}</strong>
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => onNavigate('ask-hr')}
                    className="text-[#0D9488] hover:underline font-semibold"
                  >
                    Open in Full AI Chat →
                  </button>
                  <button
                    onClick={() => onNavigate('raise-request')}
                    className="text-slate-700 hover:text-black font-semibold"
                  >
                    Raise Ticket
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 3. QUICK ACTIONS (4 Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Leave & Time */}
        <button
          onClick={onOpenApplyLeave}
          className="group flex flex-col justify-between p-5 crystal-glass-card rounded-2xl hover:bg-white/90 hover:shadow-glass hover:-translate-y-1 transition-all text-left"
        >
          <div className="flex items-start justify-between mb-4 w-full">
            <div className="w-12 h-12 rounded-xl bg-teal-500/10 text-[#0D9488] flex items-center justify-center group-hover:bg-[#0D9488] group-hover:text-white transition-all shadow-xs">
              <Calendar className="w-6 h-6" />
            </div>
            <ArrowRight className="w-5 h-5 text-slate-300 group-hover:text-[#0D9488] group-hover:translate-x-1 transition-all" />
          </div>
          <div>
            <h3 className="text-[16px] text-[#0F172A] font-semibold group-hover:text-[#0D9488] transition-colors">
              Leave & Time
            </h3>
            <p className="text-[13px] text-[#64748B] mt-1">
              Apply for leave, check balance and more
            </p>
          </div>
        </button>

        {/* Card 2: Payroll */}
        <button
          onClick={onOpenPayslip}
          className="group flex flex-col justify-between p-5 crystal-glass-card rounded-2xl hover:bg-white/90 hover:shadow-glass hover:-translate-y-1 transition-all text-left"
        >
          <div className="flex items-start justify-between mb-4 w-full">
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-[#2563EB] flex items-center justify-center group-hover:bg-[#2563EB] group-hover:text-white transition-all shadow-xs">
              <CreditCard className="w-6 h-6" />
            </div>
            <ArrowRight className="w-5 h-5 text-slate-300 group-hover:text-[#2563EB] group-hover:translate-x-1 transition-all" />
          </div>
          <div>
            <h3 className="text-[16px] text-[#0F172A] font-semibold group-hover:text-[#2563EB] transition-colors">
              Payroll
            </h3>
            <p className="text-[13px] text-[#64748B] mt-1">
              Payslip, reimbursements and salary details
            </p>
          </div>
        </button>

        {/* Card 3: HR Policies */}
        <button
          onClick={() => onNavigate('knowledge-hub')}
          className="group flex flex-col justify-between p-5 crystal-glass-card rounded-2xl hover:bg-white/90 hover:shadow-glass hover:-translate-y-1 transition-all text-left"
        >
          <div className="flex items-start justify-between mb-4 w-full">
            <div className="w-12 h-12 rounded-xl bg-teal-500/10 text-[#0D9488] flex items-center justify-center group-hover:bg-[#0D9488] group-hover:text-white transition-all shadow-xs">
              <BookOpen className="w-6 h-6" />
            </div>
            <ArrowRight className="w-5 h-5 text-slate-300 group-hover:text-[#0D9488] group-hover:translate-x-1 transition-all" />
          </div>
          <div>
            <h3 className="text-[16px] text-[#0F172A] font-semibold group-hover:text-[#0D9488] transition-colors">
              HR Policies
            </h3>
            <p className="text-[13px] text-[#64748B] mt-1">
              Browse company policies and guidelines
            </p>
          </div>
        </button>

        {/* Card 4: Employee Services */}
        <button
          onClick={() => onNavigate('raise-request')}
          className="group flex flex-col justify-between p-5 crystal-glass-card rounded-2xl hover:bg-white/90 hover:shadow-glass hover:-translate-y-1 transition-all text-left"
        >
          <div className="flex items-start justify-between mb-4 w-full">
            <div className="w-12 h-12 rounded-xl bg-indigo-500/10 text-indigo-600 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-xs">
              <BadgeAlert className="w-6 h-6" />
            </div>
            <ArrowRight className="w-5 h-5 text-slate-300 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all" />
          </div>
          <div>
            <h3 className="text-[16px] text-[#0F172A] font-semibold group-hover:text-indigo-600 transition-colors">
              Employee Services
            </h3>
            <p className="text-[13px] text-[#64748B] mt-1">
              ID, documents, certificates and more
            </p>
          </div>
        </button>
      </div>

      {/* 4. HR AT A GLANCE (Summary Stats) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-[20px] text-[#0F172A] font-bold">Your HR at a Glance</h2>
          <span className="text-[12px] text-[#64748B] font-medium">
            Live metrics sync: Today, 10:45 AM
          </span>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Open Requests */}
          <div
            onClick={() => onNavigate('my-requests')}
            className="p-5 crystal-glass-card rounded-2xl flex items-center justify-between cursor-pointer hover:bg-white/90 transition-all"
          >
            <div className="space-y-1">
              <span className="text-[12px] text-[#64748B] font-medium">Open Requests</span>
              <div className="text-[32px] leading-tight font-bold text-[#0F172A]">{openCount}</div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                <span className="text-[11px] text-[#64748B] font-medium">Requires triage</span>
              </div>
            </div>
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 border border-amber-200/50 flex items-center justify-center shadow-xs">
              <Clock className="w-6 h-6" />
            </div>
          </div>

          {/* In Progress */}
          <div
            onClick={() => onNavigate('my-requests')}
            className="p-5 crystal-glass-card rounded-2xl flex items-center justify-between cursor-pointer hover:bg-white/90 transition-all"
          >
            <div className="space-y-1">
              <span className="text-[12px] text-[#64748B] font-medium">In Progress</span>
              <div className="text-[32px] leading-tight font-bold text-[#0F172A]">{inProgressCount}</div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                <span className="text-[11px] text-[#64748B] font-medium">Assigned to HR</span>
              </div>
            </div>
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 border border-blue-200/50 flex items-center justify-center shadow-xs">
              <Clock className="w-6 h-6" />
            </div>
          </div>

          {/* Resolved */}
          <div
            onClick={() => onNavigate('my-requests')}
            className="p-5 crystal-glass-card rounded-2xl flex items-center justify-between cursor-pointer hover:bg-white/90 transition-all"
          >
            <div className="space-y-1">
              <span className="text-[12px] text-[#64748B] font-medium">Resolved</span>
              <div className="text-[32px] leading-tight font-bold text-[#0F172A]">{resolvedCount}</div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#0D9488]"></span>
                <span className="text-[11px] text-[#0D9488] font-semibold">Past 90 days</span>
              </div>
            </div>
            <div className="w-12 h-12 rounded-xl bg-teal-50 text-[#0D9488] border border-teal-200/50 flex items-center justify-center shadow-xs">
              <CheckCircle2 className="w-6 h-6" />
            </div>
          </div>

          {/* Available Leaves */}
          <div
            onClick={onOpenApplyLeave}
            className="p-5 crystal-glass-card rounded-2xl flex items-center justify-between cursor-pointer hover:bg-white/90 transition-all"
          >
            <div className="space-y-1">
              <span className="text-[12px] text-[#64748B] font-medium">Available Leaves</span>
              <div className="text-[32px] leading-tight font-bold text-[#0F172A]">
                18 <span className="text-[14px] text-[#64748B] font-normal">days</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#0D9488]"></span>
                <span className="text-[11px] text-[#64748B] font-medium">Valid thru Dec 2026</span>
              </div>
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200/50 flex items-center justify-center shadow-xs">
              <Umbrella className="w-6 h-6" />
            </div>
          </div>
        </div>
      </div>

      {/* 5. MAIN TWO-COLUMN WORKSPACE */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN (Approx 68% -> 8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* MY RECENT REQUESTS TABLE CARD */}
          <div className="crystal-glass rounded-2xl shadow-glass overflow-hidden">
            <div className="p-5 sm:px-6 sm:py-5 flex items-center justify-between border-b border-white/60">
              <div className="flex items-center gap-3">
                <h2 className="text-[20px] text-[#0F172A] font-bold">My Recent Requests</h2>
                <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-[#334155] text-[11px] font-semibold border border-slate-200/60">
                  {requests.filter((r) => r.status !== 'RESOLVED').length} Active
                </span>
              </div>
              <button
                onClick={() => onNavigate('my-requests')}
                className="inline-flex items-center gap-1 text-[13px] text-[#0D9488] hover:text-[#0F766E] font-semibold transition-colors"
              >
                <span>View All</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Frosted Interactive Glass Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-white/40 text-[#64748B] text-[11px] uppercase tracking-wider font-semibold border-b border-white/50">
                    <th className="py-3 px-6" scope="col">Request ID</th>
                    <th className="py-3 px-6" scope="col">Subject</th>
                    <th className="py-3 px-6" scope="col">Category</th>
                    <th className="py-3 px-6" scope="col">Status</th>
                    <th className="py-3 px-6" scope="col">Last Updated</th>
                    <th className="py-3 px-6 text-right" scope="col">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/40 text-[#0F172A] text-[13px]">
                  {displayedRequests.map((req) => (
                    <tr
                      key={req.id}
                      onClick={() => onSelectRequest(req)}
                      className="hover:bg-white/70 transition-colors cursor-pointer"
                    >
                      <td className="py-3.5 px-6 font-mono font-semibold text-slate-500">
                        {req.id}
                      </td>
                      <td className="py-3.5 px-6 font-medium text-[#0F172A] max-w-xs truncate">
                        {req.subject}
                      </td>
                      <td className="py-3.5 px-6">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-white/80 border border-white/90 text-[12px] text-slate-600 shadow-2xs">
                          {req.category}
                        </span>
                      </td>
                      <td className="py-3.5 px-6">
                        {req.status === 'RESOLVED' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-teal-50/90 text-[#0D9488] text-[11px] font-semibold border border-teal-200/60 shadow-2xs">
                            <Check className="w-3.5 h-3.5" />
                            <span>RESOLVED</span>
                          </span>
                        ) : req.status === 'IN PROGRESS' ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-50/80 text-indigo-700 text-[11px] font-semibold border border-indigo-200/60 shadow-2xs">
                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-600"></span>
                            <span>IN PROGRESS</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50/80 text-blue-700 text-[11px] font-semibold border border-blue-200/60 shadow-2xs">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse"></span>
                            <span>SUBMITTED</span>
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-6 text-[#64748B] text-[12px]">
                        {req.lastUpdated}
                      </td>
                      <td className="py-3.5 px-6 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectRequest(req);
                          }}
                          className="inline-flex items-center px-3 py-1 rounded-lg bg-white/80 hover:bg-white text-[#0F172A] text-[12px] font-semibold border border-white shadow-2xs transition-all"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Footer */}
            <div className="px-6 py-3.5 bg-white/40 border-t border-white/50 flex items-center justify-between text-[12px] text-[#64748B]">
              <span>
                Showing {Math.min(displayedRequests.length, requests.length)} of {requests.length} requests
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="px-2.5 py-1 rounded-lg bg-white/70 text-[#0F172A] hover:bg-white disabled:opacity-40 border border-white shadow-2xs"
                >
                  Previous
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                  className="px-2.5 py-1 rounded-lg bg-white/70 text-[#0F172A] hover:bg-white disabled:opacity-40 border border-white shadow-2xs"
                >
                  Next
                </button>
              </div>
            </div>
          </div>

          {/* VISUAL ENRICHMENT: Knowledge Hub Spotlight Card */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Spotlight 1 */}
            <div
              onClick={() => onSelectPolicy(parentalPolicy)}
              className="p-4 crystal-glass-card rounded-2xl flex items-center gap-4 hover:bg-white/90 hover:shadow-glass transition-all cursor-pointer"
            >
              <img
                src={parentalPolicy.image}
                alt="Parental Leave"
                className="w-20 h-20 rounded-xl object-cover flex-shrink-0 ring-1 ring-white shadow-xs"
              />
              <div className="space-y-1 min-w-0">
                <span className="text-[11px] uppercase tracking-wider text-[#0D9488] font-bold">
                  Featured Policy
                </span>
                <h4 className="text-[15px] text-[#0F172A] font-semibold truncate">
                  {parentalPolicy.title}
                </h4>
                <p className="text-[12px] text-[#64748B] line-clamp-2">
                  {parentalPolicy.summary}
                </p>
              </div>
            </div>

            {/* Spotlight 2 */}
            <div
              onClick={() => onSelectPolicy(taxPolicy)}
              className="p-4 crystal-glass-card rounded-2xl flex items-center gap-4 hover:bg-white/90 hover:shadow-glass transition-all cursor-pointer"
            >
              <img
                src={taxPolicy.image}
                alt="Annual Tax Declaration"
                className="w-20 h-20 rounded-xl object-cover flex-shrink-0 ring-1 ring-white shadow-xs"
              />
              <div className="space-y-1 min-w-0">
                <span className="text-[11px] uppercase tracking-wider text-[#0D9488] font-bold">
                  Self Service
                </span>
                <h4 className="text-[15px] text-[#0F172A] font-semibold truncate">
                  {taxPolicy.title}
                </h4>
                <p className="text-[12px] text-[#64748B] line-clamp-2">
                  {taxPolicy.summary}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN (Approx 32% -> 4 cols) */}
        <div className="lg:col-span-4 space-y-5">
          {/* LATEST NOTIFICATIONS */}
          <div className="p-5 crystal-glass rounded-2xl shadow-glass space-y-3.5">
            <div className="flex items-center justify-between pb-1 border-b border-white/60">
              <h3 className="text-[16px] text-[#0F172A] font-semibold">Latest Notifications</h3>
              <button
                onClick={() => onNavigate('notifications')}
                className="text-[12px] text-[#0D9488] hover:text-[#0F766E] font-semibold"
              >
                View All →
              </button>
            </div>

            <div className="space-y-1.5">
              {notifications.slice(0, 4).map((notif) => (
                <div
                  key={notif.id}
                  onClick={() => {
                    if (notif.requestId) {
                      const req = requests.find((r) => r.id === notif.requestId);
                      if (req) onSelectRequest(req);
                    } else {
                      onNavigate('notifications');
                    }
                  }}
                  className={`p-3 rounded-xl transition-all flex items-start gap-3 cursor-pointer ${
                    !notif.read
                      ? 'bg-white/70 hover:bg-white border border-white/80 shadow-2xs'
                      : 'hover:bg-white/60'
                  }`}
                >
                  <span
                    className={`w-2 h-2 mt-1.5 rounded-full flex-shrink-0 ${
                      !notif.read ? 'bg-[#0D9488]' : 'bg-slate-300'
                    }`}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] text-[#0F172A] font-medium truncate">
                      {notif.title}
                    </p>
                    <span className="text-[11px] text-[#64748B]">{notif.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* UPCOMING HOLIDAYS */}
          <div className="p-5 crystal-glass rounded-2xl shadow-glass space-y-3.5">
            <div className="flex items-center justify-between pb-1 border-b border-white/60">
              <h3 className="text-[16px] text-[#0F172A] font-semibold">Upcoming Holidays</h3>
              <Calendar className="w-4 h-4 text-slate-400" />
            </div>

            <div className="space-y-2">
              {holidays.slice(0, 3).map((h) => (
                <div
                  key={h.id}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-white/50 border border-white/60 hover:bg-white/80 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex flex-col items-center justify-center w-10 h-10 rounded-lg bg-teal-500/10 text-[#0D9488]">
                      <span className="text-[13px] font-bold leading-none">{h.dateNum}</span>
                      <span className="text-[9px] uppercase font-semibold">{h.monthText}</span>
                    </div>
                    <div>
                      <h4 className="text-[14px] font-semibold text-[#0F172A]">{h.name}</h4>
                      <p className="text-[11px] text-[#64748B]">
                        {h.type} • {h.dayOfWeek}
                      </p>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-md bg-white/80 text-[11px] text-[#334155] border border-white shadow-2xs font-medium">
                    {h.fullDate.split(' ')[0]} {h.fullDate.split(' ')[1]}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* LEAVE SNAPSHOT */}
          <div className="p-5 crystal-glass rounded-2xl shadow-glass space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-[16px] text-[#0F172A] font-semibold">Leave Snapshot</h3>
              <button
                onClick={onOpenApplyLeave}
                className="text-[12px] text-[#0D9488] hover:underline font-semibold"
              >
                History
              </button>
            </div>

            <div className="space-y-3.5">
              {/* Casual Leave */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-[13px]">
                  <span className="text-[#0F172A] font-medium">Casual Leave</span>
                  <span className="text-[#64748B]">
                    <span className="font-semibold text-[#0F172A]">
                      {leaveBalance.casual.remaining}
                    </span>{' '}
                    of {leaveBalance.casual.total} remaining
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-200/70 rounded-full overflow-hidden p-0.5">
                  <div
                    className="h-full bg-gradient-to-r from-teal-500 to-[#0D9488] rounded-full"
                    style={{
                      width: `${(leaveBalance.casual.remaining / leaveBalance.casual.total) * 100}%`,
                    }}
                  ></div>
                </div>
              </div>

              {/* Sick Leave */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-[13px]">
                  <span className="text-[#0F172A] font-medium">Sick Leave</span>
                  <span className="text-[#64748B]">
                    <span className="font-semibold text-[#0F172A]">
                      {leaveBalance.sick.remaining}
                    </span>{' '}
                    of {leaveBalance.sick.total} remaining
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-200/70 rounded-full overflow-hidden p-0.5">
                  <div
                    className="h-full bg-gradient-to-r from-cyan-500 to-teal-400 rounded-full"
                    style={{
                      width: `${(leaveBalance.sick.remaining / leaveBalance.sick.total) * 100}%`,
                    }}
                  ></div>
                </div>
              </div>

              {/* Earned Leave */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-[13px]">
                  <span className="text-[#0F172A] font-medium">Earned Leave</span>
                  <span className="text-[#64748B]">
                    <span className="font-semibold text-[#0F172A]">
                      {leaveBalance.earned.remaining}
                    </span>{' '}
                    of {leaveBalance.earned.total} remaining
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-200/70 rounded-full overflow-hidden p-0.5">
                  <div
                    className="h-full bg-gradient-to-r from-indigo-500 to-blue-600 rounded-full"
                    style={{
                      width: `${(leaveBalance.earned.remaining / leaveBalance.earned.total) * 100}%`,
                    }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          {/* NEED HELP? CARD (Crystal Dark Glass Variant) */}
          <div className="p-5 crystal-glass-dark rounded-2xl text-white shadow-xl space-y-3 relative overflow-hidden">
            <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-[#0D9488]/30 rounded-full blur-2xl pointer-events-none"></div>
            <div className="relative z-10 space-y-1">
              <div className="flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-[#2DD4BF]" />
                <h3 className="text-[16px] text-white font-semibold">Need help?</h3>
              </div>
              <p className="text-[13px] text-slate-300">Can't find what you're looking for?</p>
            </div>
            <div className="relative z-10 grid grid-cols-2 gap-2 pt-1">
              <button
                onClick={() => onNavigate('ask-hr')}
                className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-[13px] transition-all font-medium border border-white/15 backdrop-blur-md shadow-xs active:scale-[0.98]"
                type="button"
              >
                <Bot className="w-4 h-4 text-teal-300" />
                <span>Ask HR</span>
              </button>
              <button
                onClick={() => onNavigate('raise-request')}
                className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-gradient-to-r from-[#0D9488] to-[#0F766E] text-white text-[13px] hover:brightness-110 transition-all font-medium shadow-md shadow-teal-900/30 active:scale-[0.98]"
                type="button"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Raise Request</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
