import React, { useState } from 'react';
import { Category, Priority, RequestItem } from '../../types/hr';

interface NewActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<RequestItem>) => void;
}

export const NewActionModal: React.FC<NewActionModalProps> = ({
  isOpen,
  onClose,
  onSubmit
}) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<Category>('payroll');
  const [priority, setPriority] = useState<Priority>('medium');
  const [employeeName, setEmployeeName] = useState('Alex Johnson');
  const [department, setDepartment] = useState('Platform Engineering');
  const [description, setDescription] = useState('');
  const [autoTriage, setAutoTriage] = useState(true);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onSubmit({
      title,
      category,
      priority,
      description,
      employee: {
        id: `EMP-${Math.floor(Math.random() * 800) + 100}`,
        name: employeeName,
        department,
        email: `${employeeName.toLowerCase().replace(/\s+/g, '.')}@enterprise.internal`,
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80'
      }
    });

    setTitle('');
    setDescription('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
      <div 
        className="w-full max-w-lg rounded-3xl bg-[#0b0e22]/95 border border-white/20 shadow-glass-elevated overflow-hidden specular-border"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-white/[0.02]">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-blue-500/20 text-cyan-300">
              <span className="material-symbols-outlined text-[20px]">add_circle</span>
            </span>
            <div>
              <h3 className="font-display text-base font-bold text-white">
                Initialize New HR Action / Ticket
              </h3>
              <p className="text-xs text-white/50">Submit case to Autonomous AI Pipeline</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-mono text-white/70 mb-1.5 uppercase">
              Action Title / Summary
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Sabbatical extension review for Q1"
              className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/15 text-white text-xs placeholder:text-white/30 focus:outline-none focus:border-neon-cyan focus:ring-1 focus:ring-neon-cyan"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-mono text-white/70 mb-1.5 uppercase">
                Employee Name
              </label>
              <input
                type="text"
                value={employeeName}
                onChange={(e) => setEmployeeName(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-black/40 border border-white/15 text-white text-xs focus:outline-none focus:border-neon-cyan"
              />
            </div>
            <div>
              <label className="block text-xs font-mono text-white/70 mb-1.5 uppercase">
                Department
              </label>
              <input
                type="text"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-black/40 border border-white/15 text-white text-xs focus:outline-none focus:border-neon-cyan"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-mono text-white/70 mb-1.5 uppercase">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as Category)}
                className="w-full px-3 py-2 rounded-xl bg-black/60 border border-white/15 text-white text-xs focus:outline-none focus:border-neon-cyan"
              >
                <option value="payroll">Payroll</option>
                <option value="benefits">Benefits</option>
                <option value="leave">Leave &amp; Attendance</option>
                <option value="documents">Documents</option>
                <option value="compliance">Policy &amp; Compliance</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-mono text-white/70 mb-1.5 uppercase">
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as Priority)}
                className="w-full px-3 py-2 rounded-xl bg-black/60 border border-white/15 text-white text-xs focus:outline-none focus:border-neon-cyan"
              >
                <option value="high">High Priority (Urgent)</option>
                <option value="medium">Medium Priority</option>
                <option value="low">Low Priority</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono text-white/70 mb-1.5 uppercase">
              Description &amp; Operational Notes
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide background context, amounts, or specific clauses..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/15 text-white text-xs placeholder:text-white/30 focus:outline-none focus:border-neon-cyan"
            />
          </div>

          {/* AI Autonomous Triage checkbox */}
          <div className="p-3 rounded-xl bg-white/[0.03] border border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-neon-cyan text-[18px]">auto_awesome</span>
              <div>
                <span className="text-xs font-semibold text-white">Enable AI Autonomous Triage</span>
                <p className="text-[10px] text-white/50">Auto-match policies and prepare response draft</p>
              </div>
            </div>
            <input
              type="checkbox"
              checked={autoTriage}
              onChange={(e) => setAutoTriage(e.target.checked)}
              className="w-4 h-4 accent-cyan-400 rounded cursor-pointer"
            />
          </div>

          <div className="pt-3 border-t border-white/10 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 text-xs font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-semibold text-xs shadow-neon-cyan transition-all"
            >
              Dispatch Case
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
