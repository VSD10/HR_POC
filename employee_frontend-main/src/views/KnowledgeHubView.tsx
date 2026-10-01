import React, { useState } from 'react';
import {
  BookOpen,
  Search,
  Clock,
  ArrowRight,
  HelpCircle,
  ChevronDown,
  FileCheck,
  ShieldCheck,
  Sparkles,
  FileText,
  Eye,
  ExternalLink,
  Download,
  LayoutGrid,
  List,
  CheckCircle2,
} from 'lucide-react';
import { PolicyItem } from '../types';
import { KNOWLEDGE_FAQS } from '../data/mockData';

interface KnowledgeHubViewProps {
  policies: PolicyItem[];
  onSelectPolicy: (policy: PolicyItem, mode?: 'pdf' | 'clauses') => void;
}

const FAQ_DOCUMENT_MAP: Record<string, string> = {
  'How do I claim medical insurance cashless reimbursement?': 'benefits_guide.pdf',
  'What is the cutoff date for submitting monthly expense reimbursements?': 'expense_policy.pdf',
  'How can I request an experience or tenure certificate?': 'employee_handbook.pdf',
  'What is the procedure for encashing unutilized earned leaves?': 'leave_policy.pdf',
};

export const KnowledgeHubView: React.FC<KnowledgeHubViewProps> = ({
  policies,
  onSelectPolicy,
}) => {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [displayView, setDisplayView] = useState<'grid' | 'table'>('grid');

  const defaultCategories = [
    'All',
    'Leave & Family',
    'Payroll & Tax',
    'Workplace & IT',
    'Benefits & Wellness',
    'Finance & Travel',
    'Security & Compliance',
    'Performance & Growth'
  ];

  // Derive unique categories from dynamic policies
  const dynamicCategorySet = new Set<string>(['All']);
  policies.forEach(p => {
    if (p.category) dynamicCategorySet.add(p.category);
  });
  defaultCategories.forEach(c => dynamicCategorySet.add(c));
  const categories = Array.from(dynamicCategorySet);

  const filtered = policies.filter((p) => {
    const matchesCategory = activeCategory === 'All' || p.category === activeCategory;
    const matchesSearch =
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.summary.toLowerCase().includes(search.toLowerCase()) ||
      (p.documentName && p.documentName.toLowerCase().includes(search.toLowerCase())) ||
      (p.category && p.category.toLowerCase().includes(search.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const getPdfUrl = (pol: PolicyItem) => {
    const docName = pol.documentName || (pol.title.toLowerCase().replace(/\s+/g, '_') + '.pdf');
    return pol.documentUrl || `/policies/${docName}`;
  };

  const getDocumentName = (pol: PolicyItem) => {
    return pol.documentName || (pol.title.toLowerCase().replace(/\s+/g, '_') + '.pdf');
  };

  // Find spotlight policies
  const spotlightDocs = policies.slice(0, 4);

  return (
    <div className="w-full max-w-[1560px] mx-auto space-y-6">
      {/* 1. Header Component */}
      <div className="crystal-glass rounded-2xl p-6 shadow-glass flex flex-col md:flex-row md:items-center justify-between gap-4 border border-white/80 dark:border-white/10">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-[24px] font-bold text-[#0F172A] dark:text-white">Knowledge Hub & HR Policies</h1>
            <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-teal-50 dark:bg-teal-500/20 text-[#0D9488] dark:text-teal-300 border border-teal-200/50 dark:border-teal-500/30 flex items-center gap-1">
              <FileCheck className="w-3 h-3" />
              {policies.length} Verified Documents
            </span>
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-200/50 flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-emerald-600" />
              Sangharsh Docs Synced
            </span>
          </div>
          <p className="text-[13px] text-[#334155] dark:text-slate-300 mt-1">
            Verified corporate guidelines, benefits documentation, and official PDF policies synchronized from the Sangharsh repository.
          </p>
        </div>

        {/* Search & View Switcher */}
        <div className="flex items-center gap-2.5 w-full md:w-auto">
          <div className="relative flex-1 md:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search policies or PDF files..."
              className="search-input-field w-full pl-10 pr-4 py-2 text-[13px] shadow-2xs"
            />
          </div>

          <div className="flex items-center gap-1 bg-white/70 dark:bg-white/10 p-1 rounded-xl border border-white/80 dark:border-white/10">
            <button
              onClick={() => setDisplayView('grid')}
              title="Grid View"
              className={`p-1.5 rounded-lg transition-colors ${
                displayView === 'grid'
                  ? 'bg-teal-600 text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:text-slate-300'
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setDisplayView('table')}
              title="Document List View"
              className={`p-1.5 rounded-lg transition-colors ${
                displayView === 'table'
                  ? 'bg-teal-600 text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:text-slate-300'
              }`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* 2. Spotlight Component: Core Handbooks & Sangharsh Documents */}
      {spotlightDocs.length > 0 && (
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[12px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              Essential Policy Documents Spotlight
            </span>
            <span className="text-[11px] text-slate-400">Direct 1-Click Document Access</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            {spotlightDocs.map((doc) => (
              <div
                key={doc.id}
                className="p-3.5 rounded-xl bg-gradient-to-br from-white/90 to-teal-50/40 dark:from-slate-800/90 dark:to-teal-950/20 border border-white/90 dark:border-white/10 shadow-xs flex flex-col justify-between hover:shadow-md transition-all group"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-teal-700 dark:text-teal-400 bg-teal-50 dark:bg-teal-500/20 px-2 py-0.5 rounded-md">
                      {doc.category}
                    </span>
                    <span className="text-[10px] text-slate-400 flex items-center gap-0.5">
                      <Clock className="w-2.5 h-2.5" />
                      {doc.readTime || '5 min'}
                    </span>
                  </div>
                  <h4 className="text-[13.5px] font-bold text-[#0F172A] dark:text-white line-clamp-1 group-hover:text-teal-600 transition-colors">
                    {doc.title}
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-300 font-mono flex items-center gap-1 truncate">
                    <FileText className="w-3 h-3 text-teal-600 flex-shrink-0" />
                    {getDocumentName(doc)}
                  </p>
                </div>

                <div className="pt-2.5 mt-2.5 border-t border-slate-100 dark:border-white/10 flex items-center gap-1.5">
                  <button
                    onClick={() => onSelectPolicy(doc, 'pdf')}
                    className="flex-1 py-1 px-2 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-[11px] font-semibold flex items-center justify-center gap-1 transition-colors shadow-xs"
                  >
                    <Eye className="w-3 h-3" />
                    View Document
                  </button>
                  <a
                    href={getPdfUrl(doc)}
                    target="_blank"
                    rel="noopener noreferrer"
                    title="Open PDF in new window"
                    className="p-1 rounded-lg bg-white dark:bg-white/10 text-slate-600 dark:text-slate-200 hover:bg-slate-100 text-[11px] border border-slate-200 dark:border-white/10"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. Category Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-[13px]">
        {categories.map((c) => (
          <button
            key={c}
            onClick={() => setActiveCategory(c)}
            className={`px-4 py-2 rounded-xl font-medium border transition-all whitespace-nowrap ${
              activeCategory === c
                ? 'bg-[#0F172A] dark:bg-teal-600 text-white shadow-xs border-transparent'
                : 'bg-white/70 dark:bg-white/10 text-slate-700 dark:text-slate-200 border-white dark:border-white/10 hover:bg-white dark:hover:bg-white/20'
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {/* 4. Policy Grid or Table View */}
      {displayView === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((pol) => (
            <div
              key={pol.id}
              className="crystal-glass-card rounded-2xl p-5 hover:bg-white/95 dark:hover:bg-slate-800/90 hover:shadow-glass hover:-translate-y-0.5 transition-all flex flex-col justify-between border border-white dark:border-white/10 group"
            >
              <div className="space-y-3">
                {/* PDF Header Ribbon */}
                <div className="w-full h-24 rounded-xl bg-gradient-to-tr from-slate-100 to-teal-50 dark:from-slate-800 dark:to-teal-900/30 flex items-center justify-between px-4 border border-white/80 dark:border-white/10">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-teal-700 dark:text-teal-400 uppercase tracking-wider flex items-center gap-1">
                      <FileCheck className="w-3 h-3 text-teal-600" />
                      Official Policy Release
                    </span>
                    <h4 className="text-[14px] font-bold text-[#0F172A] dark:text-white line-clamp-1">{pol.title}</h4>
                    <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400 block truncate">
                      {getDocumentName(pol)}
                    </span>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-teal-500/10 text-teal-700 dark:text-teal-400 flex flex-col items-center justify-center font-bold text-[10px] border border-teal-500/20 flex-shrink-0">
                    <span>PDF</span>
                    <span className="text-[8px] font-normal">6 pgs</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#0D9488] dark:text-teal-400 bg-teal-50 dark:bg-teal-500/20 px-2 py-0.5 rounded-md border border-teal-200/50 dark:border-teal-500/30">
                    {pol.category}
                  </span>
                  <span className="text-[11px] text-slate-400 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {pol.readTime || '5 min read'}
                  </span>
                </div>

                <div>
                  <h3 className="text-[16px] font-bold text-[#0F172A] dark:text-white group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                    {pol.title}
                  </h3>
                  <p className="text-[13px] text-[#64748B] dark:text-slate-300 mt-1.5 line-clamp-2">
                    {pol.summary}
                  </p>
                </div>
              </div>

              {/* Action Buttons for Document Viewing */}
              <div className="pt-4 mt-3 border-t border-slate-100 dark:border-white/10 flex items-center gap-2">
                <button
                  onClick={() => onSelectPolicy(pol, 'pdf')}
                  className="flex-1 py-2 px-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-[12px] font-semibold flex items-center justify-center gap-1.5 transition-all shadow-xs"
                >
                  <Eye className="w-3.5 h-3.5" />
                  View Document
                </button>
                <a
                  href={getPdfUrl(pol)}
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Open PDF in new browser tab"
                  className="p-2 rounded-xl bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-slate-200 hover:bg-slate-200 text-[12px] border border-slate-200 dark:border-white/10 transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
                <button
                  onClick={() => onSelectPolicy(pol, 'clauses')}
                  title="View summary and clauses breakdown"
                  className="py-2 px-3 rounded-xl bg-white/80 dark:bg-white/10 text-slate-700 dark:text-slate-200 hover:bg-white text-[12px] font-medium border border-slate-200 dark:border-white/10 transition-colors"
                >
                  Clauses
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Table / Directory List View */
        <div className="crystal-glass rounded-2xl overflow-hidden shadow-glass border border-white/80 dark:border-white/10">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[13px]">
              <thead className="bg-slate-50/80 dark:bg-white/5 border-b border-slate-200/80 dark:border-white/10 text-slate-500 dark:text-slate-400 font-semibold">
                <tr>
                  <th className="py-3.5 px-4">Document / File</th>
                  <th className="py-3.5 px-4">Policy Title</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Est. Read Time</th>
                  <th className="py-3.5 px-4 text-right">Document Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/10">
                {filtered.map((pol) => (
                  <tr key={pol.id} className="hover:bg-white/60 dark:hover:bg-white/5 transition-colors">
                    <td className="py-3 px-4 font-mono font-medium text-slate-700 dark:text-slate-200 flex items-center gap-2">
                      <FileText className="w-4 h-4 text-teal-600 flex-shrink-0" />
                      {getDocumentName(pol)}
                    </td>
                    <td className="py-3 px-4 font-semibold text-[#0F172A] dark:text-white">
                      {pol.title}
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-[11px] font-bold text-teal-700 dark:text-teal-400 bg-teal-50 dark:bg-teal-500/20 px-2 py-0.5 rounded-md">
                        {pol.category}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-500 dark:text-slate-400">
                      {pol.readTime || '5 min'}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => onSelectPolicy(pol, 'pdf')}
                          className="px-2.5 py-1 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-[11.5px] font-semibold flex items-center gap-1 shadow-xs transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          View Document
                        </button>
                        <a
                          href={getPdfUrl(pol)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1 rounded-lg bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-slate-200 hover:bg-slate-200 transition-colors"
                          title="Open in new window"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                        <a
                          href={getPdfUrl(pol)}
                          download={getDocumentName(pol)}
                          className="p-1 rounded-lg bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-slate-200 hover:bg-slate-200 transition-colors"
                          title="Download PDF"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 5. Frequently Asked Questions Accordion with Direct Policy Document Options */}
      <div className="crystal-glass rounded-2xl shadow-glass p-6 space-y-4 border border-white dark:border-white/10 mt-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-[#0D9488] dark:text-teal-400" />
            <h2 className="text-[18px] font-bold text-[#0F172A] dark:text-white">
              Frequently Asked HR Questions & Associated Policies
            </h2>
          </div>
          <span className="text-[11px] text-slate-400">Click question to view answer & official PDF document</span>
        </div>

        <div className="space-y-2.5">
          {KNOWLEDGE_FAQS.map((faq, idx) => {
            const isExpanded = expandedFaq === idx;
            const mappedDocName = FAQ_DOCUMENT_MAP[faq.question];
            const associatedPolicy = mappedDocName
              ? policies.find(p => (p.documentName && p.documentName.toLowerCase() === mappedDocName.toLowerCase()) || p.title.toLowerCase().includes(faq.category?.toLowerCase() || ''))
              : null;

            return (
              <div
                key={idx}
                className="p-4 rounded-xl bg-white/70 dark:bg-slate-800/70 hover:bg-white dark:hover:bg-slate-800 border border-white/80 dark:border-white/10 transition-all"
              >
                <button
                  onClick={() => setExpandedFaq(isExpanded ? null : idx)}
                  className="w-full flex items-center justify-between text-left font-semibold text-[14px] text-[#0F172A] dark:text-white"
                >
                  <span className="pr-4">{faq.question}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-slate-400 flex-shrink-0 transition-transform ${
                      isExpanded ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                {isExpanded && (
                  <div className="mt-2.5 pt-2.5 border-t border-slate-100 dark:border-white/10 space-y-3">
                    <p className="text-[13px] text-slate-600 dark:text-slate-300 leading-relaxed">
                      {faq.answer}
                    </p>

                    {/* Official Governing Document Option */}
                    <div className="p-3 rounded-xl bg-slate-50/80 dark:bg-slate-900/40 border border-slate-200/80 dark:border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-teal-600 flex-shrink-0" />
                        <span className="text-[12px] font-medium text-slate-700 dark:text-slate-200">
                          Governing Document: <strong className="text-teal-700 dark:text-teal-400">{mappedDocName || 'Official Policy PDF'}</strong>
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        {associatedPolicy && (
                          <button
                            onClick={() => onSelectPolicy(associatedPolicy, 'pdf')}
                            className="px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-[11.5px] font-semibold flex items-center gap-1 shadow-xs transition-colors"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            View Policy Document (PDF)
                          </button>
                        )}
                        {mappedDocName && (
                          <a
                            href={`/policies/${mappedDocName}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-1.5 rounded-lg bg-white dark:bg-white/10 text-slate-700 dark:text-slate-200 hover:bg-slate-100 text-[11.5px] font-medium border border-slate-200 dark:border-white/10 flex items-center gap-1 transition-colors"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                            Open in New Tab
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
