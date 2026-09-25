import React, { useState } from 'react';
import {
  BookOpen,
  Search,
  Clock,
  ArrowRight,
  HelpCircle,
  ChevronDown,
  FileCheck,
  ShieldAlert,
  Sparkles,
} from 'lucide-react';
import { PolicyItem } from '../types';
import { KNOWLEDGE_FAQS } from '../data/mockData';

interface KnowledgeHubViewProps {
  policies: PolicyItem[];
  onSelectPolicy: (policy: PolicyItem) => void;
}

export const KnowledgeHubView: React.FC<KnowledgeHubViewProps> = ({
  policies,
  onSelectPolicy,
}) => {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  const categories = [
    'All',
    'Leave & Family',
    'Payroll & Tax',
    'Workplace & IT',
    'Benefits & Wellness',
  ];

  const filtered = policies.filter((p) => {
    const matchesCategory = activeCategory === 'All' || p.category === activeCategory;
    const matchesSearch =
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.summary.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="w-full max-w-[1560px] mx-auto space-y-6">
      {/* Header */}
      <div className="crystal-glass rounded-2xl p-6 shadow-glass flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-[24px] font-bold text-[#0F172A]">Knowledge Hub & HR Policies</h1>
          <p className="text-[13px] text-[#334155] mt-0.5">
            Verified corporate guidelines, benefits documentation, and standard operating procedures.
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search policies or terms..."
            className="w-full bg-white/80 border border-white rounded-xl pl-10 pr-4 py-2 text-[13px] text-[#0F172A] placeholder:text-slate-400 shadow-2xs focus:ring-2 focus:ring-teal-500/30 focus:outline-none"
          />
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-[13px]">
        {categories.map((c) => (
          <button
            key={c}
            onClick={() => setActiveCategory(c)}
            className={`px-4 py-2 rounded-xl font-medium border transition-all whitespace-nowrap ${
              activeCategory === c
                ? 'bg-[#0F172A] text-white shadow-xs'
                : 'bg-white/70 text-slate-700 border-white hover:bg-white'
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {/* Policy Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((pol) => (
          <div
            key={pol.id}
            onClick={() => onSelectPolicy(pol)}
            className="crystal-glass-card rounded-2xl p-5 hover:bg-white/95 hover:shadow-glass hover:-translate-y-1 transition-all cursor-pointer flex flex-col justify-between border border-white"
          >
            <div className="space-y-3">
              {pol.image && (
                <div className="w-full h-40 rounded-xl overflow-hidden shadow-xs border border-white">
                  <img
                    src={pol.image}
                    alt={pol.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#0D9488] bg-teal-50 px-2 py-0.5 rounded-md border border-teal-200/50">
                  {pol.category}
                </span>
                <span className="text-[11px] text-slate-400 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {pol.readTime}
                </span>
              </div>

              <div>
                <h3 className="text-[16px] font-bold text-[#0F172A] group-hover:text-teal-700 transition-colors">
                  {pol.title}
                </h3>
                <p className="text-[13px] text-[#64748B] mt-1.5 line-clamp-2">
                  {pol.summary}
                </p>
              </div>
            </div>

            <div className="pt-4 mt-3 border-t border-slate-100 flex items-center justify-between text-[12px] font-semibold text-[#0D9488]">
              <span>Read Full Policy</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </div>
        ))}
      </div>

      {/* Frequently Asked Questions Accordion */}
      <div className="crystal-glass rounded-2xl shadow-glass p-6 space-y-4 border border-white mt-8">
        <div className="flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-[#0D9488]" />
          <h2 className="text-[18px] font-bold text-[#0F172A]">
            Frequently Asked HR Questions
          </h2>
        </div>

        <div className="space-y-2.5">
          {KNOWLEDGE_FAQS.map((faq, idx) => {
            const isExpanded = expandedFaq === idx;
            return (
              <div
                key={idx}
                className="p-4 rounded-xl bg-white/70 hover:bg-white border border-white/80 transition-all"
              >
                <button
                  onClick={() => setExpandedFaq(isExpanded ? null : idx)}
                  className="w-full flex items-center justify-between text-left font-semibold text-[14px] text-[#0F172A]"
                >
                  <span className="pr-4">{faq.question}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-slate-400 flex-shrink-0 transition-transform ${
                      isExpanded ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                {isExpanded && (
                  <p className="mt-2.5 text-[13px] text-slate-600 leading-relaxed border-t border-slate-100 pt-2.5">
                    {faq.answer}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
