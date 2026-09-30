import React from 'react';
import { Sparkles } from 'lucide-react';

interface QuickQueryChipsProps {
  onSelectQuery: (query: string) => void;
  disabled?: boolean;
}

const HR_OPERATIONAL_CHIPS = [
  {
    category: 'Policy Review',
    label: 'Parental leave verification conditions',
    query: 'What policy conditions should HR verify before processing a parental leave request?'
  },
  {
    category: 'Case Resolution',
    label: 'Incomplete reimbursement audit checklist',
    query: 'An employee submitted an incomplete reimbursement claim. What should HR verify before processing it?'
  },
  {
    category: 'Documentation',
    label: 'Draft medical documents request email',
    query: 'Draft an email requesting missing medical leave documents from an employee.'
  },
  {
    category: 'Compliance',
    label: 'Remote work request audit steps',
    query: 'What steps should HR follow when reviewing a remote work request?'
  },
  {
    category: 'Policy Analysis',
    label: 'Compare annual vs sick leave eligibility',
    query: 'Compare the eligibility conditions for annual leave and sick leave.'
  },
  {
    category: 'Case Summary',
    label: 'Summarize medical leave grievance requirements',
    query: 'Summarize the key policy requirements relevant to an employee medical leave grievance.'
  }
];

export const QuickQueryChips: React.FC<QuickQueryChipsProps> = ({ onSelectQuery, disabled = false }) => {
  return (
    <div className="px-3 py-1.5 border-t border-white/5 bg-black/20 flex items-center gap-1.5 overflow-x-auto no-scrollbar flex-shrink-0">
      <div className="flex items-center gap-1 text-[10px] font-mono text-cyan-300/70 flex-shrink-0">
        <Sparkles className="w-3 h-3 text-cyan-400" />
        <span className="hidden sm:inline">Prompts:</span>
      </div>

      <div className="flex items-center gap-1.5 flex-nowrap">
        {HR_OPERATIONAL_CHIPS.map((chip, idx) => (
          <button
            key={idx}
            type="button"
            disabled={disabled}
            onClick={() => onSelectQuery(chip.query)}
            className="px-2 py-0.5 rounded-full bg-white/[0.03] hover:bg-cyan-500/10 border border-white/10 hover:border-cyan-400/40 text-white/70 hover:text-cyan-200 transition-all duration-150 text-[10px] whitespace-nowrap cursor-pointer disabled:opacity-40 flex items-center gap-1"
            title={chip.query}
          >
            <span className="font-mono text-cyan-400 font-semibold">{chip.category}:</span>
            <span>{chip.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};
