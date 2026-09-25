import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  Send,
  Bot,
  PlusCircle,
  BookOpen,
  Check,
  RotateCcw,
  Mic,
  MicOff,
  Copy,
  ThumbsUp,
  ThumbsDown,
  Calendar,
  CreditCard,
  ShieldCheck,
  ChevronRight,
  UserCheck,
  PanelRightOpen,
  PanelRightClose,
  HelpCircle,
  ArrowUpRight,
  ExternalLink,
} from 'lucide-react';
import { ChatMessage, ScreenId, PolicyItem, LeaveBalance } from '../types';
import { ASSETS, CURRENT_USER } from '../data/mockData';

interface AskHrViewProps {
  onRaiseRequestWithTopic: (topic: string, category: string) => void;
  onNavigate: (screen: ScreenId) => void;
  onOpenApplyLeave?: () => void;
  onOpenPayslip?: () => void;
  onSelectPolicy?: (policy: PolicyItem) => void;
  policies?: PolicyItem[];
  leaveBalance?: LeaveBalance;
}

interface PromptCard {
  title: string;
  category: string;
  query: string;
  icon: React.ReactNode;
}

const QUICK_PROMPTS: PromptCard[] = [
  {
    title: 'Check Leave Balances',
    category: 'Leave & Time',
    query: 'How many leaves do I have left?',
    icon: <Calendar className="w-4 h-4 text-[#0D9488]" />,
  },
  {
    title: 'Parental Leave 2026',
    category: 'HR Policies',
    query: 'What is the parental leave policy for 2026?',
    icon: <ShieldCheck className="w-4 h-4 text-[#0D9488]" />,
  },
  {
    title: 'Tax Declaration (12BB)',
    category: 'Payroll & Tax',
    query: 'How do I submit investment proofs for tax declaration?',
    icon: <CreditCard className="w-4 h-4 text-[#0D9488]" />,
  },
  {
    title: 'Broadband & Remote Work',
    category: 'Benefits',
    query: 'What is the annual broadband reimbursement limit?',
    icon: <Sparkles className="w-4 h-4 text-[#0D9488]" />,
  },
];

export const AskHrView: React.FC<AskHrViewProps> = ({
  onRaiseRequestWithTopic,
  onNavigate,
  onOpenApplyLeave,
  onOpenPayslip,
  onSelectPolicy,
  policies = [],
  leaveBalance,
}) => {
  const [showSideContext, setShowSideContext] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [feedbackState, setFeedbackState] = useState<Record<string, 'up' | 'down'>>({});
  const [isRecording, setIsRecording] = useState(false);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'm1',
      sender: 'assistant',
      text: `Hello ${CURRENT_USER.name.split(' ')[0]}! I'm your instantaneous HR Assistant.\n\nI can answer questions regarding your leave balances, parental benefits, tax submission windows, or medical insurance. You can also turn any answer into an HR Service Desk ticket with one click.`,
      timestamp: 'Today, 09:30 AM',
      sources: ['Enterprise People Operations Handbook 2026'],
    },
  ]);

  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleFeedback = (id: string, type: 'up' | 'down') => {
    setFeedbackState((prev) => ({ ...prev, [id]: type }));
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: 'm-init-' + Date.now(),
        sender: 'assistant',
        text: `New conversation started. How can I assist you with your HR policies or employee services today, ${
          CURRENT_USER.name.split(' ')[0]
        }?`,
        timestamp: 'Just now',
        sources: ['Enterprise People Operations Handbook 2026'],
      },
    ]);
    if (inputRef.current) inputRef.current.focus();
  };

  const handleMicToggle = () => {
    if (!isRecording) {
      setIsRecording(true);
      setTimeout(() => {
        setInputValue('What is the procedure for maternity and parental leave?');
        setIsRecording(false);
        if (inputRef.current) inputRef.current.focus();
      }, 2000);
    } else {
      setIsRecording(false);
    }
  };

  const handleSend = (textToSend?: string) => {
    const query = (textToSend || inputValue).trim();
    if (!query) return;

    const userMsg: ChatMessage = {
      id: 'user-' + Date.now(),
      sender: 'user',
      text: query,
      timestamp: 'Just now',
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputValue('');
    setIsTyping(true);

    setTimeout(async () => {
      setIsTyping(false);
      
      try {
        const { hrService } = await import('../../services/hrService');
        const response = await hrService.queryCopilot(query);
        
        const assistantMsg: ChatMessage = {
          id: response.id,
          sender: 'assistant',
          text: response.text,
          timestamp: response.timestamp,
          sources: response.citations?.map(c => c.title) || [],
        };
        setMessages((prev) => [...prev, assistantMsg]);
      } catch (err) {
        setMessages((prev) => [
          ...prev,
          {
            id: 'bot-' + Date.now(),
            sender: 'assistant',
            text: "I am unable to retrieve a verified answer from the knowledge base right now. Please try again later.",
            timestamp: 'Just now',
          }
        ]);
      }
    }, 650);
  };

  const isInitialState = messages.length <= 1;

  return (
    <div className="h-full flex flex-col max-w-5xl mx-auto">
      {/* Top Navigation & Status Bar */}
      <div className="crystal-glass rounded-2xl px-5 py-3.5 shadow-glass flex items-center justify-between gap-3 mb-3 shrink-0 border border-white/70">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#0D9488] to-[#06B6D4] text-white flex items-center justify-center shadow-sm shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-[17px] font-bold text-[#0F172A] tracking-tight">Ask HR Assistant</h1>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-teal-50 border border-teal-200 text-[#0F766E] text-[10px] font-bold uppercase tracking-wider">
                <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse"></span>
                Live Grounding
              </span>
            </div>
            <p className="text-[12px] text-slate-500 hidden sm:block">
              Answers verified against 14 official 2026 company policy handbooks
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleClearChat}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/80 hover:bg-white text-slate-700 text-[12px] font-medium border border-white/80 shadow-2xs transition-all"
            title="Start fresh conversation"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
            <span className="hidden md:inline">Reset</span>
          </button>

          <button
            onClick={() => onNavigate('raise-request')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0F172A] hover:bg-slate-800 text-white text-[12px] font-semibold transition-all shadow-xs"
          >
            <PlusCircle className="w-3.5 h-3.5 text-teal-400" />
            <span>Raise Ticket</span>
          </button>

          <button
            onClick={() => setShowSideContext(!showSideContext)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[12px] font-medium border transition-all ${
              showSideContext
                ? 'bg-teal-50 border-teal-200 text-[#0F766E]'
                : 'bg-white/80 hover:bg-white text-slate-700 border-white/80 shadow-2xs'
            }`}
            title="Toggle HR context panel"
          >
            {showSideContext ? (
              <PanelRightClose className="w-4 h-4 text-[#0D9488]" />
            ) : (
              <PanelRightOpen className="w-4 h-4 text-slate-600" />
            )}
            <span className="hidden sm:inline">{showSideContext ? 'Hide Context' : 'HR Info'}</span>
          </button>
        </div>
      </div>

      {/* Main Chat Layout Area (Split if Context is open, else generous centered stage) */}
      <div className="flex-1 flex gap-4 min-h-0 relative">
        {/* Chat Feed Column */}
        <div className="flex-1 flex flex-col crystal-glass rounded-2xl shadow-glass border border-white/80 overflow-hidden">
          {/* Scrollable Conversation Container */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
            {messages.map((m) => {
              const isUser = m.sender === 'user';
              const hasFeedback = feedbackState[m.id];
              return (
                <div
                  key={m.id}
                  className={`flex gap-3.5 max-w-3xl ${isUser ? 'ml-auto flex-row-reverse' : ''}`}
                >
                  {/* Avatar */}
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 shadow-xs ${
                      isUser
                        ? 'bg-slate-900 text-white overflow-hidden'
                        : 'bg-gradient-to-tr from-[#0D9488] to-[#06B6D4] text-white'
                    }`}
                  >
                    {isUser ? (
                      <img src={ASSETS.avatar} alt="User" className="w-full h-full object-cover" />
                    ) : (
                      <Bot className="w-4 h-4" />
                    )}
                  </div>

                  {/* Message Bubble Container */}
                  <div
                    className={`p-4 sm:p-5 rounded-2xl text-[14px] leading-relaxed shadow-glass-sm flex flex-col justify-between ${
                      isUser
                        ? 'bg-[#0F172A] text-white rounded-tr-xs'
                        : 'bg-white/95 text-[#0F172A] border border-white/90 rounded-tl-xs'
                    }`}
                  >
                    {/* Message Body */}
                    <div className="whitespace-pre-line font-normal space-y-2.5">
                      {m.text.split('\n\n').map((para, pIdx) => {
                        const renderedPara = para.split('**').map((part, i) =>
                          i % 2 === 1 ? (
                            <strong key={i} className={isUser ? 'text-teal-200' : 'text-teal-950 font-semibold'}>
                              {part}
                            </strong>
                          ) : (
                            part
                          )
                        );
                        return (
                          <p key={pIdx} className="text-[14px]">
                            {renderedPara}
                          </p>
                        );
                      })}
                    </div>

                    {/* Verified Policy Citations */}
                    {m.sources && m.sources.length > 0 && (
                      <div className="mt-3.5 pt-3 border-t border-slate-100 flex flex-wrap items-center gap-1.5 text-[11px] text-slate-500">
                        <BookOpen className="w-3.5 h-3.5 text-[#0D9488] shrink-0" />
                        <span className="font-semibold text-slate-600">Verified Sources:</span>
                        {m.sources.map((s, idx) => (
                          <span
                            key={idx}
                            className="bg-teal-50 text-teal-800 px-2 py-0.5 rounded-md font-medium border border-teal-200/60"
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Contextual Action Bar for Assistant Messages */}
                    {!isUser && m.id !== 'm1' && (
                      <div className="mt-3.5 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2.5">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              const lastUserQuery =
                                messages[messages.findIndex((x) => x.id === m.id) - 1]?.text ||
                                'HR Policy Inquiry';
                              onRaiseRequestWithTopic(`Inquiry: ${lastUserQuery}`, 'HR Policies');
                            }}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-50 hover:bg-teal-100 text-[#0D9488] text-[12px] font-semibold border border-teal-200 transition-colors"
                          >
                            <PlusCircle className="w-3.5 h-3.5" />
                            <span>Create Ticket</span>
                          </button>

                          {m.text.toLowerCase().includes('leave') && onOpenApplyLeave && (
                            <button
                              onClick={onOpenApplyLeave}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[12px] font-medium transition-colors"
                            >
                              <Calendar className="w-3.5 h-3.5 text-slate-600" />
                              <span>Apply Leave</span>
                            </button>
                          )}

                          {m.text.toLowerCase().includes('payroll') && onOpenPayslip && (
                            <button
                              onClick={onOpenPayslip}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[12px] font-medium transition-colors"
                            >
                              <CreditCard className="w-3.5 h-3.5 text-slate-600" />
                              <span>View Payslips</span>
                            </button>
                          )}
                        </div>

                        {/* Thumbs / Copy */}
                        <div className="flex items-center gap-1 text-slate-400">
                          <button
                            onClick={() => handleCopy(m.id, m.text)}
                            className="p-1.5 rounded-lg hover:bg-slate-100 hover:text-slate-700 transition-colors"
                            title="Copy response"
                          >
                            {copiedId === m.id ? (
                              <Check className="w-3.5 h-3.5 text-teal-600" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>

                          <button
                            onClick={() => handleFeedback(m.id, 'up')}
                            className={`p-1.5 rounded-lg transition-colors ${
                              hasFeedback === 'up'
                                ? 'text-teal-600 bg-teal-50'
                                : 'hover:bg-slate-100 hover:text-slate-700'
                            }`}
                            title="Helpful"
                          >
                            <ThumbsUp className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => handleFeedback(m.id, 'down')}
                            className={`p-1.5 rounded-lg transition-colors ${
                              hasFeedback === 'down'
                                ? 'text-red-500 bg-red-50'
                                : 'hover:bg-slate-100 hover:text-slate-700'
                            }`}
                            title="Not helpful"
                          >
                            <ThumbsDown className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    )}

                    <div
                      className={`text-[10.5px] mt-2 ${
                        isUser ? 'text-slate-400 text-right' : 'text-slate-400'
                      }`}
                    >
                      {m.timestamp}
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex gap-3 max-w-md">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#0D9488] to-[#06B6D4] text-white flex items-center justify-center shrink-0 shadow-xs">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="px-4 py-3 rounded-2xl bg-white/95 text-[13px] border border-white flex items-center gap-2.5 text-slate-600 shadow-glass-sm">
                  <span className="w-2 h-2 rounded-full bg-[#0D9488] animate-ping"></span>
                  <span>Consulting enterprise HR handbook & policy repository...</span>
                </div>
              </div>
            )}

            {/* Spacious Welcome Prompt Cards if initial conversation */}
            {isInitialState && (
              <div className="pt-2 pb-4">
                <div className="text-[12px] font-semibold text-slate-400 uppercase tracking-wider mb-3">
                  Suggested Questions
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {QUICK_PROMPTS.map((card, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSend(card.query)}
                      className="p-3.5 rounded-xl bg-white/80 hover:bg-white border border-white/80 hover:border-teal-200 shadow-2xs hover:shadow-sm text-left transition-all group flex items-start justify-between gap-3"
                    >
                      <div>
                        <div className="flex items-center gap-2 text-[12px] font-semibold text-teal-800 mb-1">
                          {card.icon}
                          <span>{card.category}</span>
                        </div>
                        <h3 className="text-[13.5px] font-bold text-[#0F172A] group-hover:text-[#0D9488] transition-colors">
                          {card.title}
                        </h3>
                        <p className="text-[12px] text-slate-500 mt-0.5">{card.query}</p>
                      </div>
                      <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-[#0D9488] transition-colors shrink-0 mt-1" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div ref={chatBottomRef} />
          </div>

          {/* Quick Filter Prompt Chips (Single Clean Line) */}
          {!isInitialState && (
            <div className="px-4 py-2 bg-slate-50/70 border-t border-slate-200/60 flex items-center gap-2 overflow-x-auto shrink-0">
              <span className="text-[11px] font-medium text-slate-400 shrink-0">Suggested:</span>
              {[
                'How many leaves do I have left?',
                'Parental leave policy 2026',
                'Investment declaration deadline',
                'Broadband reimbursement limit',
                'Work from home guidelines',
              ].map((pill, i) => (
                <button
                  key={i}
                  onClick={() => handleSend(pill)}
                  className="px-2.5 py-1 rounded-lg bg-white hover:bg-slate-100 text-slate-700 text-[11.5px] font-medium border border-slate-200/80 shadow-2xs whitespace-nowrap transition-all shrink-0 hover:text-[#0D9488]"
                >
                  {pill}
                </button>
              ))}
            </div>
          )}

          {/* Docked Input Box */}
          <div className="p-3 sm:p-4 bg-white/85 border-t border-white/80 shrink-0">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex items-center gap-2"
            >
              <div className="relative flex-1">
                <input
                  ref={inputRef}
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder={
                    isRecording
                      ? 'Listening to speech prompt...'
                      : 'Ask about leaves, tax declaration, medical insurance, payroll...'
                  }
                  className="w-full bg-white rounded-xl pl-4 pr-11 py-3 text-[14px] text-[#0F172A] placeholder:text-slate-400 border border-slate-200 shadow-xs focus:ring-2 focus:ring-teal-500/25 focus:border-teal-500 focus:outline-none transition-all"
                />
                <button
                  type="button"
                  onClick={handleMicToggle}
                  className={`absolute right-2.5 top-1/2 -translate-y-1/2 p-1.5 rounded-lg transition-all ${
                    isRecording
                      ? 'bg-red-500 text-white animate-pulse'
                      : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'
                  }`}
                  title={isRecording ? 'Stop listening' : 'Voice prompt'}
                >
                  {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                </button>
              </div>

              <button
                type="submit"
                disabled={!inputValue.trim() || isTyping}
                className="px-5 py-3 rounded-xl bg-[#0F172A] hover:bg-slate-800 disabled:opacity-40 disabled:hover:bg-[#0F172A] text-white text-[13.5px] font-semibold flex items-center gap-2 transition-all shadow-sm shrink-0"
              >
                <span>Send</span>
                <Send className="w-4 h-4" />
              </button>
            </form>

            <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400 px-1">
              <span>Press Enter to send. Strictly private & verified.</span>
              <span className="hidden sm:inline">Enterprise People Operations 2026</span>
            </div>
          </div>
        </div>

        {/* Optional Collapsible Right Slide Drawer for HR Context */}
        {showSideContext && (
          <div className="w-72 shrink-0 flex flex-col gap-3">
            {/* Live Balance Card */}
            <div className="crystal-glass rounded-2xl p-4 shadow-glass border border-white/80">
              <div className="flex items-center justify-between mb-2.5 pb-2 border-b border-slate-200/60">
                <span className="text-[13px] font-bold text-[#0F172A]">Employee Snapshot</span>
                <span className="text-[10.5px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-semibold">
                  EMP-84920
                </span>
              </div>

              <div className="space-y-2 text-[12.5px]">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Available Leaves</span>
                  <span className="font-bold text-[#0D9488]">18 Days Left</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Upcoming Holiday</span>
                  <span className="font-medium text-slate-800">02 Oct (Gandhi Jayanti)</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Next Salary Day</span>
                  <span className="font-medium text-slate-800">30 Sep 2026</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Active Tickets</span>
                  <span className="font-medium text-amber-700">1 In Progress</span>
                </div>
              </div>

              <div className="mt-3 pt-2.5 border-t border-slate-200/60 flex items-center gap-2">
                {onOpenApplyLeave && (
                  <button
                    onClick={onOpenApplyLeave}
                    className="flex-1 py-1.5 rounded-lg bg-white hover:bg-slate-50 text-slate-800 text-[11.5px] font-semibold border border-slate-200 text-center transition-colors"
                  >
                    Apply Leave
                  </button>
                )}
                {onOpenPayslip && (
                  <button
                    onClick={onOpenPayslip}
                    className="flex-1 py-1.5 rounded-lg bg-white hover:bg-slate-50 text-slate-800 text-[11.5px] font-semibold border border-slate-200 text-center transition-colors"
                  >
                    Payslip
                  </button>
                )}
              </div>
            </div>

            {/* Assigned Partner */}
            <div className="crystal-glass rounded-2xl p-4 shadow-glass border border-white/80">
              <div className="flex items-center gap-2 mb-2 pb-2 border-b border-slate-200/60">
                <UserCheck className="w-4 h-4 text-[#0D9488]" />
                <h3 className="text-[13px] font-bold text-[#0F172A]">Assigned People Partner</h3>
              </div>
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-teal-500 to-cyan-500 text-white flex items-center justify-center font-bold text-xs shadow-xs shrink-0">
                  PD
                </div>
                <div className="min-w-0">
                  <h4 className="text-[13px] font-bold text-[#0F172A] truncate">Priya Deshmukh</h4>
                  <p className="text-[11px] text-slate-500 truncate">Lead People Partner (Eng)</p>
                </div>
              </div>
              <button
                onClick={() =>
                  onRaiseRequestWithTopic('Request 1:1 Consultation with Priya Deshmukh', 'HR Policies')
                }
                className="mt-3 w-full py-1.5 rounded-xl bg-[#0F172A] hover:bg-slate-800 text-white text-[11.5px] font-semibold transition-all text-center"
              >
                Schedule 1:1 with Priya
              </button>
            </div>

            {/* Policy Reference */}
            <div className="crystal-glass rounded-2xl p-4 shadow-glass border border-white/80">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[12.5px] font-bold text-[#0F172A]">Policy Library</span>
                <button
                  onClick={() => onNavigate('knowledge-hub')}
                  className="text-[11px] font-semibold text-[#0D9488] hover:text-[#0F766E] flex items-center gap-0.5"
                >
                  <span>View All</span>
                  <ChevronRight className="w-3 h-3" />
                </button>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed mb-2.5">
                Need to read official clauses directly? Explore 14 published enterprise documents in the Knowledge Hub.
              </p>
              <button
                onClick={() => onNavigate('knowledge-hub')}
                className="w-full py-1.5 rounded-lg bg-white/80 hover:bg-white text-slate-700 text-[11.5px] font-medium border border-slate-200 transition-colors"
              >
                Open Policy Repository
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
