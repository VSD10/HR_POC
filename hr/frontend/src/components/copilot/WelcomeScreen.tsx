import React from 'react';
import {
  Sparkles,
  ClipboardCheck,
  Scale,
  MailCheck,
  FileText,
  ArrowRight
} from 'lucide-react';

interface WelcomeScreenProps {
  onSelectQuery: (query: string) => void;
  kbFilesCount?: number;
}

interface SuggestionCard {
  title: string;
  query: string;
  icon: React.ReactNode;
}

const TASK_SUGGESTIONS: SuggestionCard[] = [
  {
    title: 'Review an employee leave request',
    query: 'What conditions should HR verify before processing a parental leave request?',
    icon: <ClipboardCheck className="w-4 h-4 text-cyan-400" />
  },
  {
    title: 'Analyze an HR policy',
    query: 'Compare the eligibility conditions for annual leave and sick leave.',
    icon: <Scale className="w-4 h-4 text-indigo-400" />
  },
  {
    title: 'Draft an employee communication',
    query: 'Draft an email requesting missing documentation for a medical leave case.',
    icon: <MailCheck className="w-4 h-4 text-emerald-400" />
  },
  {
    title: 'Summarize policy requirements',
    query: 'Summarize the policy requirements relevant to an employee medical leave grievance.',
    icon: <FileText className="w-4 h-4 text-purple-400" />
  }
];

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onSelectQuery }) => {
  return (
    <div className="flex-1 flex flex-col justify-center items-center py-6 px-4 max-w-2xl mx-auto w-full my-auto animate-fadeIn">
      {/* Compact Bot Orb */}
      <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-400/20 via-indigo-600/30 to-purple-600/30 p-0.5 border border-white/15 shadow-sm flex items-center justify-center mb-3">
        <div className="w-full h-full rounded-[9px] bg-[#0c1024] flex items-center justify-center">
          <Sparkles className="w-5 h-5 text-cyan-300 animate-pulse" />
        </div>
      </div>

      {/* Heading & Subtitle */}
      <div className="text-center space-y-1 mb-5">
        <h2 className="font-display text-base sm:text-lg font-bold text-white tracking-tight">
          Your HR AI Assistant
        </h2>
        <p className="text-xs text-white/55 leading-relaxed max-w-md mx-auto font-sans">
          Analyze HR cases, interpret company policies, and prepare HR communications using official company documents.
        </p>
      </div>

      {/* 4 Compact Task Suggestion Cards (2x2 grid) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 w-full">
        {TASK_SUGGESTIONS.map((item, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => onSelectQuery(item.query)}
            className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/10 hover:border-cyan-400/40 shadow-sm transition-all duration-150 cursor-pointer group text-left"
          >
            <div className="flex items-center gap-2.5 min-w-0 pr-2">
              <div className="p-1.5 rounded-lg bg-black/40 border border-white/5 flex-shrink-0">
                {item.icon}
              </div>
              <span className="text-xs font-medium text-white/90 group-hover:text-cyan-200 transition-colors leading-snug truncate">
                {item.title}
              </span>
            </div>
            <ArrowRight className="w-3.5 h-3.5 text-white/30 group-hover:text-cyan-400 group-hover:translate-x-0.5 transition-all flex-shrink-0" />
          </button>
        ))}
      </div>
    </div>
  );
};
