import React, { useState } from 'react';
import {
  X,
  Plus,
  Sparkles,
  FileText,
  Send,
  Building,
  User,
  ShieldCheck,
  BookOpen
} from 'lucide-react';
import { DeliverableItem, DeliverableType, RequestItem } from '../../types/hr';

interface CreateDeliverableModalProps {
  isOpen: boolean;
  onClose: () => void;
  requests: RequestItem[];
  onCreate: (deliv: Partial<DeliverableItem>) => Promise<any>;
}

export const CreateDeliverableModal: React.FC<CreateDeliverableModalProps> = ({
  isOpen,
  onClose,
  requests,
  onCreate
}) => {
  const [type, setType] = useState<DeliverableType>('HR Communication');
  const [title, setTitle] = useState('');
  const [selectedRequestId, setSelectedRequestId] = useState('');
  const [recipient, setRecipient] = useState('');
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleRequestChange = (reqId: string) => {
    setSelectedRequestId(reqId);
    if (!reqId) return;
    const found = requests.find(r => r.id === reqId);
    if (found) {
      const empName = typeof found.employee === 'object' ? found.employee?.name : found.employee;
      const empEmail = typeof found.employee === 'object' ? found.employee?.email : '';
      if (!title) setTitle(`${type} for ${empName} (${found.id})`);
      if (!recipient && empEmail) setRecipient(empEmail);
      if (!subject) setSubject(`Regarding: ${found.title || found.subject || found.id}`);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    setIsSubmitting(true);
    try {
      const found = requests.find(r => r.id === selectedRequestId);
      const empName = found ? (typeof found.employee === 'object' ? found.employee?.name : found.employee) : undefined;
      const empDept = found ? (typeof found.employee === 'object' ? found.employee?.department : found.department) : undefined;

      await onCreate({
        title: title.trim(),
        type,
        status: 'NEEDS_REVIEW',
        requestId: selectedRequestId || undefined,
        employeeName: empName || 'Employee',
        department: empDept || 'Operations',
        recipient: recipient.trim(),
        subject: subject.trim() || title.trim(),
        content: content.trim(),
        policySources: [
          { document: 'employee_handbook.pdf', page: 1, excerpt: 'HR operational policy guidelines and communication standard.' }
        ],
        createdBy: 'Sarah Jenkins (HR Ops)'
      });
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div
        className="w-full max-w-2xl rounded-3xl bg-[#060814]/95 backdrop-blur-2xl border border-white/10 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-white/10 bg-white/[0.03] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30">
              <Sparkles className="w-4 h-4" />
            </span>
            <div>
              <h3 className="font-display text-base font-bold text-white">Create HR Deliverable</h3>
              <p className="text-[11px] text-white/50">Draft official AI-assisted or structured HR output</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-white/10 text-white/60 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-[11px] font-mono uppercase text-white/50 block mb-1">
                Deliverable Type
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as DeliverableType)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/15 text-white text-xs focus:outline-none focus:border-cyan-400"
              >
                <option value="HR Communication" className="bg-[#0b0e24]">HR Communication</option>
                <option value="Case Summary" className="bg-[#0b0e24]">Case Summary</option>
                <option value="Policy Analysis" className="bg-[#0b0e24]">Policy Analysis</option>
                <option value="Compliance Checklist" className="bg-[#0b0e24]">Compliance Checklist</option>
                <option value="Employee Notice" className="bg-[#0b0e24]">Employee Notice</option>
                <option value="Investigation Summary" className="bg-[#0b0e24]">Investigation Summary</option>
                <option value="HR Report" className="bg-[#0b0e24]">HR Report</option>
                <option value="Policy Comparison" className="bg-[#0b0e24]">Policy Comparison</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] font-mono uppercase text-white/50 block mb-1">
                Related Request (Optional)
              </label>
              <select
                value={selectedRequestId}
                onChange={(e) => handleRequestChange(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/15 text-white text-xs focus:outline-none focus:border-cyan-400"
              >
                <option value="" className="bg-[#0b0e24]">None / Standalone Deliverable</option>
                {requests.map(r => (
                  <option key={r.id} value={r.id} className="bg-[#0b0e24]">
                    {r.id} - {typeof r.employee === 'object' ? r.employee?.name : r.employee} ({r.title || r.subject})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="text-[11px] font-mono uppercase text-white/50 block mb-1">
              Title
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Parental Leave Schedule & Return-to-Work Notice"
              className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/15 text-white text-xs focus:outline-none focus:border-cyan-400"
            />
          </div>

          {(type === 'HR Communication' || type === 'Employee Notice') && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-3.5 rounded-2xl bg-white/[0.02] border border-white/10">
              <div>
                <label className="text-[10px] font-mono uppercase text-white/40 block mb-1">
                  Recipient
                </label>
                <input
                  type="text"
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                  placeholder="employee@enterprise.internal"
                  className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/15 text-white text-xs focus:outline-none focus:border-cyan-400"
                />
              </div>
              <div>
                <label className="text-[10px] font-mono uppercase text-white/40 block mb-1">
                  Subject Line
                </label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Subject line"
                  className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/15 text-white text-xs focus:outline-none focus:border-cyan-400"
                />
              </div>
            </div>
          )}

          <div>
            <label className="text-[11px] font-mono uppercase text-white/50 block mb-1">
              Content / Document Body
            </label>
            <textarea
              required
              rows={8}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Enter official deliverable content, executive brief, or communication..."
              className="w-full p-3.5 rounded-2xl bg-black/50 border border-white/15 text-white text-xs leading-relaxed font-sans focus:outline-none focus:border-purple-400"
            />
          </div>

          <div className="pt-3 border-t border-white/10 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs text-white/60 hover:text-white transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-semibold shadow-lg shadow-purple-500/20 transition-all cursor-pointer"
            >
              {isSubmitting ? 'Creating...' : 'Create Deliverable (Needs Review)'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
