import React, { useState } from 'react';
import {
  PlusCircle,
  Calendar,
  CreditCard,
  BookOpen,
  FileText,
  User,
  UploadCloud,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  X,
} from 'lucide-react';
import { HrRequest, RequestCategory, RequestPriority, ScreenId } from '../types';
import { CURRENT_USER } from '../data/mockData';

interface RaiseRequestViewProps {
  initialSubject?: string;
  initialCategory?: RequestCategory;
  onSubmitRequest: (request: Partial<HrRequest>) => void;
  onNavigate: (screen: ScreenId) => void;
}

export const RaiseRequestView: React.FC<RaiseRequestViewProps> = ({
  initialSubject = '',
  initialCategory = 'Leave & Time',
  onSubmitRequest,
  onNavigate,
}) => {
  const [category, setCategory] = useState<RequestCategory>(initialCategory);
  const [subject, setSubject] = useState(initialSubject);
  const [priority, setPriority] = useState<RequestPriority>('Medium');
  const [description, setDescription] = useState('');
  const [attachedFile, setAttachedFile] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [createdId, setCreatedId] = useState('');

  const categories: Array<{ id: RequestCategory; label: string; icon: any; desc: string }> = [
    {
      id: 'Leave & Time',
      label: 'Leave & Time',
      icon: Calendar,
      desc: 'Annual leave, maternity/paternity, attendance adjustments',
    },
    {
      id: 'Payroll',
      label: 'Payroll',
      icon: CreditCard,
      desc: 'Salary slip query, tax deductions, expense reimbursements',
    },
    {
      id: 'Documents',
      label: 'Documents',
      icon: FileText,
      desc: 'Employment verification, experience certificate, visa letter',
    },
    {
      id: 'Employee Info',
      label: 'Employee Info',
      icon: User,
      desc: 'Bank account change, address update, insurance dependents',
    },
    {
      id: 'HR Policies',
      label: 'HR Policies',
      icon: BookOpen,
      desc: 'Hybrid work rules, company benefits, code of conduct',
    },
  ];

  const quickTemplates: Record<RequestCategory, string[]> = {
    'Leave & Time': [
      'Casual Leave application for family event',
      'Sick leave medical certificate submission',
      'Attendance regularization for biometric missed punch',
    ],
    Payroll: [
      'Discrepancy in August monthly payslip deduction',
      'Quarterly internet allowance reimbursement claim',
      'Form 16 part B request for tax filing',
    ],
    Documents: [
      'Employment verification letter for Schengen visa',
      'Experience letter and tenure certificate',
      'Salary certificate for home loan application',
    ],
    'Employee Info': [
      'Update salary disbursement bank account details',
      'Addition of spouse to corporate health insurance',
      'Update permanent residential address',
    ],
    'HR Policies': [
      'Clarification regarding remote work allowance',
      'Maternity / Parental leave return schedule',
      'Higher education sponsorship eligibility query',
    ],
  };

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setAttachedFile(e.dataTransfer.files[0].name);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setAttachedFile(e.target.files[0].name);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !description.trim()) return;

    const newId = `REQ-${Math.floor(1024 + Math.random() * 800)}`;
    setCreatedId(newId);

    onSubmitRequest({
      id: newId,
      subject: subject.trim(),
      category,
      priority,
      description: description.trim(),
      attachmentName: attachedFile || undefined,
      status: 'SUBMITTED',
    });

    setSubmitted(true);
  };

  return (
    <div className="w-full max-w-[1560px] mx-auto space-y-6">
      {/* Header Banner */}
      <div className="crystal-glass rounded-2xl p-6 shadow-glass flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-[24px] font-bold text-[#0F172A]">Raise an HR Request</h1>
          <p className="text-[13px] text-[#334155] mt-0.5">
            Submit inquiries, document requests, and exceptions directly to People Operations.
          </p>
        </div>
        <button
          onClick={() => onNavigate('my-requests')}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/70 hover:bg-white text-[13px] font-semibold text-[#0F172A] border border-white shadow-xs"
        >
          <span>View My Existing Tickets</span>
        </button>
      </div>

      {submitted ? (
        <div className="crystal-glass rounded-2xl shadow-glass p-12 text-center flex flex-col items-center justify-center space-y-4 max-w-xl mx-auto border border-white">
          <div className="w-16 h-16 rounded-full bg-teal-50 text-[#0D9488] flex items-center justify-center ring-8 ring-teal-50/60">
            <CheckCircle2 className="w-9 h-9" />
          </div>
          <h3 className="text-[22px] font-bold text-[#0F172A]">Ticket Created Successfully!</h3>
          <p className="text-[14px] text-slate-600">
            Your request <strong className="font-mono text-[#0D9488]">{createdId}</strong> has been logged and assigned to the relevant HR triage queue.
          </p>
          <div className="p-4 rounded-xl bg-white/70 border border-white text-left w-full text-[13px] space-y-1 text-slate-700">
            <div><strong>Subject:</strong> {subject}</div>
            <div><strong>Category:</strong> {category}</div>
            <div><strong>Priority:</strong> {priority}</div>
            <div><strong>Estimated Resolution:</strong> Within 24-48 business hours</div>
          </div>
          <div className="flex gap-3 pt-2">
            <button
              onClick={() => onNavigate('my-requests')}
              className="px-5 py-2.5 rounded-xl bg-[#0F172A] text-white text-[13px] font-semibold hover:bg-slate-800 transition-all shadow-sm"
            >
              Track in My Requests
            </button>
            <button
              onClick={() => {
                setSubmitted(false);
                setSubject('');
                setDescription('');
                setAttachedFile(null);
              }}
              className="px-5 py-2.5 rounded-xl bg-white/80 hover:bg-white text-[13px] font-semibold text-[#0F172A] border border-white transition-all"
            >
              Submit Another Request
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="crystal-glass rounded-2xl shadow-glass p-6 sm:p-8 space-y-6 border border-white">
          {/* 1. Category Selection */}
          <div className="space-y-3">
            <label className="block text-[13px] font-bold uppercase tracking-wider text-slate-500">
              1. Select Request Category
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              {categories.map((c) => {
                const Icon = c.icon;
                const isSelected = category === c.id;
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setCategory(c.id)}
                    className={`p-4 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                      isSelected
                        ? 'bg-white text-[#0F172A] border-teal-500 ring-2 ring-teal-500/20 shadow-md'
                        : 'bg-white/60 border-white text-slate-700 hover:bg-white/90'
                    }`}
                  >
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${
                        isSelected
                          ? 'bg-[#0D9488] text-white'
                          : 'bg-teal-500/10 text-[#0D9488]'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-[14px] font-bold leading-snug">{c.label}</div>
                      <div className="text-[11px] text-slate-500 mt-1 line-clamp-2">
                        {c.desc}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quick template suggestions */}
          <div className="space-y-1.5">
            <span className="text-[12px] font-semibold text-slate-500">
              Frequently requested for {category}:
            </span>
            <div className="flex flex-wrap gap-2">
              {quickTemplates[category].map((tpl, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setSubject(tpl)}
                  className="px-3 py-1 rounded-lg bg-white/70 hover:bg-white text-[12px] text-slate-700 border border-white shadow-2xs transition-colors"
                >
                  + {tpl}
                </button>
              ))}
            </div>
          </div>

          {/* 2. Subject and Priority */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2 space-y-1">
              <label className="block text-[13px] font-semibold text-[#0F172A]">
                Subject / Summary <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Brief summary of your request"
                className="w-full bg-white/90 border border-white rounded-xl px-4 py-2.5 text-[14px] text-[#0F172A] shadow-2xs focus:ring-2 focus:ring-teal-500/30 focus:outline-none"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="block text-[13px] font-semibold text-[#0F172A]">
                Priority Level
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as RequestPriority)}
                className="w-full bg-white/90 border border-white rounded-xl px-4 py-2.5 text-[14px] text-[#0F172A] shadow-2xs focus:ring-2 focus:ring-teal-500/30 focus:outline-none"
              >
                <option value="Low">Low (Standard 48-72 hrs)</option>
                <option value="Medium">Medium (Standard 24-48 hrs)</option>
                <option value="High">High (Within 24 hrs)</option>
                <option value="Urgent">Urgent (Within 4 hrs)</option>
              </select>
            </div>
          </div>

          {/* 3. Detailed Description */}
          <div className="space-y-1">
            <label className="block text-[13px] font-semibold text-[#0F172A]">
              Detailed Description <span className="text-rose-500">*</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide all context, dates, reason, or specific particulars required by the HR team..."
              rows={4}
              className="w-full bg-white/90 border border-white rounded-xl p-4 text-[14px] text-[#0F172A] placeholder:text-slate-400 shadow-2xs focus:ring-2 focus:ring-teal-500/30 focus:outline-none resize-none"
              required
            />
          </div>

          {/* 4. File Attachment Dropzone */}
          <div className="space-y-1.5">
            <label className="block text-[13px] font-semibold text-[#0F172A]">
              Supporting Documents (Optional)
            </label>
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleFileDrop}
              className="p-6 rounded-2xl bg-white/50 border-2 border-dashed border-white hover:border-teal-400/60 transition-all flex flex-col items-center justify-center text-center space-y-2 cursor-pointer"
              onClick={() => document.getElementById('file-upload-input')?.click()}
            >
              <UploadCloud className="w-8 h-8 text-[#0D9488]" />
              <div className="text-[13px] font-semibold text-[#0F172A]">
                Drag & drop files here, or <span className="text-[#0D9488]">browse files</span>
              </div>
              <p className="text-[11px] text-slate-400">
                Supports PDF, DOCX, PNG, JPG up to 25MB (e.g., medical certificates, receipts, cancelled cheque)
              </p>
              <input
                id="file-upload-input"
                type="file"
                className="hidden"
                onChange={handleFileInput}
              />
            </div>

            {attachedFile && (
              <div className="p-3 rounded-xl bg-teal-50 border border-teal-200/80 flex items-center justify-between text-[13px]">
                <div className="flex items-center gap-2 text-teal-900 font-medium">
                  <FileText className="w-4 h-4 text-[#0D9488]" />
                  <span>{attachedFile}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setAttachedFile(null)}
                  className="p-1 text-slate-400 hover:text-slate-700"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* Submitter details notice */}
          <div className="p-3.5 rounded-xl bg-slate-100/70 text-[12px] text-slate-600 flex items-center justify-between">
            <span>
              Submitting as: <strong>{CURRENT_USER.name}</strong> ({CURRENT_USER.employeeId}) • Department: {CURRENT_USER.department}
            </span>
            <span>Manager: {CURRENT_USER.manager.split('(')[0]}</span>
          </div>

          {/* Action buttons */}
          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => onNavigate('dashboard')}
              className="px-5 py-2.5 rounded-xl text-[13px] font-semibold text-slate-600 hover:bg-white/80 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-[#0F172A] hover:bg-slate-800 text-white text-[13px] font-semibold transition-all shadow-md active:scale-[0.98]"
            >
              Submit Ticket to HR
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
