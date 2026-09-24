import React, { useState } from 'react';
import { X, Building2, CheckCircle2, ShieldCheck, AlertCircle } from 'lucide-react';
import { CURRENT_USER } from '../data/mockData';
import { HrRequest } from '../types';

export interface UpdateBankModalProps {
  currentBank?: string;
  currentAccountMasked?: string;
  currentIfsc?: string;
  onClose: () => void;
  onSubmitBankUpdate?: (newRequest: Partial<HrRequest>) => void;
  onSubmit?: (bankData: {
    accountNumber: string;
    ifsc: string;
    bankName: string;
    cancelledChequeName?: string;
  }) => void;
}

export const UpdateBankModal: React.FC<UpdateBankModalProps> = ({
  currentBank,
  currentAccountMasked,
  currentIfsc,
  onClose,
  onSubmitBankUpdate,
  onSubmit,
}) => {
  const [bankName, setBankName] = useState(currentBank || 'HDFC Bank Ltd');
  const [accountNumber, setAccountNumber] = useState('');
  const [confirmAccount, setConfirmAccount] = useState('');
  const [ifsc, setIfsc] = useState(currentIfsc || 'HDFC0001245');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!accountNumber || accountNumber !== confirmAccount) {
      setError('Account numbers do not match.');
      return;
    }
    setError('');

    const masked = '•••• •••• •••• ' + accountNumber.slice(-4);

    if (onSubmit) {
      onSubmit({
        bankName,
        accountNumber,
        ifsc,
      });
    } else if (onSubmitBankUpdate) {
      onSubmitBankUpdate({
        subject: `Update salary account to ${bankName} (${masked})`,
        category: 'Employee Info',
        status: 'SUBMITTED',
        description: `Employee initiated salary bank account change to ${bankName}. Account ending in ${accountNumber.slice(-4)}, IFSC: ${ifsc.toUpperCase()}. Penny-drop validation initiated.`,
        priority: 'Medium',
      });
    }

    setSubmitted(true);
    setTimeout(() => {
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <div className="relative w-full max-w-lg crystal-glass rounded-2xl shadow-2xl border border-white dark:border-white/10 p-6 z-10 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-4 border-b border-white/70 dark:border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-teal-500/15 dark:bg-teal-500/20 text-[#0D9488] dark:text-teal-400 flex items-center justify-center">
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-[17px] font-bold text-[#0F172A] dark:text-white">Update Bank Details</h3>
              <p className="text-[12px] text-slate-500 dark:text-slate-400">Configure salary disbursement account</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-white/80 dark:hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {submitted ? (
          <div className="py-10 flex flex-col items-center justify-center text-center space-y-3">
            <div className="w-14 h-14 rounded-full bg-teal-50 dark:bg-teal-500/20 text-[#0D9488] dark:text-teal-400 flex items-center justify-center ring-8 ring-teal-50/50 dark:ring-teal-500/10">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h4 className="text-[18px] font-bold text-[#0F172A] dark:text-white">Bank Update Request Logged</h4>
            <p className="text-[13px] text-slate-600 dark:text-slate-300 max-w-xs">
              Ticket generated and automated penny-drop verification initiated with your bank.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-4 space-y-4">
            <div className="p-3.5 rounded-xl bg-teal-50/70 dark:bg-teal-900/30 border border-teal-100 dark:border-teal-500/30 flex items-start gap-2.5 text-[12px] text-teal-900 dark:text-teal-200">
              <ShieldCheck className="w-4 h-4 text-[#0D9488] dark:text-teal-400 flex-shrink-0 mt-0.5" />
              <span>
                Current active account: <strong>{CURRENT_USER.bankName}</strong> ({CURRENT_USER.accountNumberMasked}).
                Changes take effect from the next payroll cycle.
              </span>
            </div>

            <div>
              <label className="block text-[12px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                Bank Name
              </label>
              <select
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                className="w-full bg-white/90 dark:bg-slate-800/90 border border-white dark:border-white/10 rounded-xl px-3 py-2 text-[13px] text-[#0F172A] dark:text-white shadow-2xs focus:ring-2 focus:ring-teal-500/30 focus:outline-none"
              >
                <option>HDFC Bank Ltd</option>
                <option>ICICI Bank Ltd</option>
                <option>State Bank of India (SBI)</option>
                <option>Axis Bank Ltd</option>
                <option>Kotak Mahindra Bank</option>
              </select>
            </div>

            <div>
              <label className="block text-[12px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                New Account Number
              </label>
              <input
                type="text"
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value.replace(/\D/g, ''))}
                placeholder="Enter 9 to 18 digits account number"
                className="w-full bg-white/90 dark:bg-slate-800/90 border border-white dark:border-white/10 rounded-xl px-3 py-2 text-[13px] text-[#0F172A] dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 shadow-2xs focus:ring-2 focus:ring-teal-500/30 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-[12px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                Confirm Account Number
              </label>
              <input
                type="text"
                value={confirmAccount}
                onChange={(e) => setConfirmAccount(e.target.value.replace(/\D/g, ''))}
                placeholder="Re-enter account number"
                className="w-full bg-white/90 dark:bg-slate-800/90 border border-white dark:border-white/10 rounded-xl px-3 py-2 text-[13px] text-[#0F172A] dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 shadow-2xs focus:ring-2 focus:ring-teal-500/30 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-[12px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                IFSC Code
              </label>
              <input
                type="text"
                value={ifsc}
                onChange={(e) => setIfsc(e.target.value.toUpperCase())}
                placeholder="e.g. HDFC0001245"
                className="w-full bg-white/90 dark:bg-slate-800/90 border border-white dark:border-white/10 rounded-xl px-3 py-2 text-[13px] text-[#0F172A] dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 shadow-2xs focus:ring-2 focus:ring-teal-500/30 focus:outline-none"
                required
              />
            </div>

            {error && (
              <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-900/30 border border-rose-200 dark:border-rose-500/30 text-rose-700 dark:text-rose-300 text-[12px] flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-500 dark:text-rose-400 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-[13px] font-medium text-slate-600 dark:text-slate-300 hover:bg-white/80 dark:hover:bg-white/10 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-[#0F172A] dark:bg-teal-600 hover:bg-slate-800 dark:hover:bg-teal-500 text-white text-[13px] font-semibold transition-all shadow-sm"
              >
                Submit Bank Change Request
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
