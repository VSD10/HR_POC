import React, { useState } from 'react';
import { X, Download, FileCheck, Check, Printer } from 'lucide-react';
import { CURRENT_USER } from '../data/mockData';

interface PayslipModalProps {
  onClose: () => void;
}

export const PayslipModal: React.FC<PayslipModalProps> = ({ onClose }) => {
  const [selectedMonth, setSelectedMonth] = useState('August 2026');
  const [downloading, setDownloading] = useState(false);
  const [downloaded, setDownloaded] = useState(false);

  const earnings = [
    { label: 'Basic Salary', amount: '₹ 85,000' },
    { label: 'House Rent Allowance (HRA)', amount: '₹ 42,500' },
    { label: 'Special Allowance', amount: '₹ 38,500' },
    { label: 'Flexible Benefit Plan (FBP)', amount: '₹ 15,000' },
    { label: 'Internet / Utility Reimbursement', amount: '₹ 4,500' },
  ];

  const deductions = [
    { label: 'Provident Fund (Employee)', amount: '₹ 10,200' },
    { label: 'Professional Tax', amount: '₹ 200' },
    { label: 'Income Tax (TDS)', amount: '₹ 18,600' },
    { label: 'Group Medical Voluntary Floater', amount: '₹ 1,500' },
  ];

  const grossEarnings = '₹ 1,85,500';
  const totalDeductions = '₹ 30,500';
  const netTakeHome = '₹ 1,55,000';

  const handleDownload = () => {
    setDownloading(true);
    setTimeout(() => {
      setDownloading(false);
      setDownloaded(true);
      setTimeout(() => setDownloaded(false), 3000);
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <div className="relative w-full max-w-2xl crystal-glass rounded-2xl shadow-2xl border border-white dark:border-white/10 p-6 z-10 max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/70 dark:border-white/10">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#0D9488] dark:text-teal-400">
              Payroll & Compensation
            </span>
            <h3 className="text-[19px] font-bold text-[#0F172A] dark:text-white">Employee Payslip</h3>
            <p className="text-[12px] text-slate-500 dark:text-slate-400">Official monthly remuneration breakdown</p>
          </div>
          <div className="flex items-center gap-2">
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="bg-white/90 dark:bg-slate-800/90 border border-white dark:border-white/10 rounded-xl px-3 py-1.5 text-[12px] font-semibold text-[#0F172A] dark:text-white shadow-xs focus:outline-none"
            >
              <option>August 2026</option>
              <option>July 2026</option>
              <option>June 2026</option>
              <option>May 2026</option>
            </select>
            <button
              onClick={onClose}
              className="p-1 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-white/80 dark:hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Payslip Document Body */}
        <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-1">
          {/* Employee summary strip */}
          <div className="p-4 rounded-xl bg-white/70 dark:bg-slate-800/70 border border-white/90 dark:border-white/10 grid grid-cols-2 sm:grid-cols-4 gap-3 text-[12px]">
            <div>
              <span className="text-slate-400 dark:text-slate-400 block text-[11px]">Employee Name</span>
              <span className="font-semibold text-[#0F172A] dark:text-white">{CURRENT_USER.name}</span>
            </div>
            <div>
              <span className="text-slate-400 dark:text-slate-400 block text-[11px]">Employee ID</span>
              <span className="font-semibold text-[#0F172A] dark:text-white">{CURRENT_USER.employeeId}</span>
            </div>
            <div>
              <span className="text-slate-400 dark:text-slate-400 block text-[11px]">Designation</span>
              <span className="font-semibold text-[#0F172A] dark:text-white">{CURRENT_USER.role}</span>
            </div>
            <div>
              <span className="text-slate-400 dark:text-slate-400 block text-[11px]">Bank Account</span>
              <span className="font-semibold text-[#0F172A] dark:text-white">{CURRENT_USER.accountNumberMasked}</span>
            </div>
          </div>

          {/* Earnings and Deductions tables */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Earnings */}
            <div className="p-4 rounded-xl bg-white/60 dark:bg-slate-800/70 border border-white/80 dark:border-white/10 space-y-2">
              <div className="text-[12px] font-bold text-teal-700 dark:text-teal-400 uppercase tracking-wider pb-1 border-b border-teal-100 dark:border-teal-500/20 flex justify-between">
                <span>Earnings</span>
                <span>Amount</span>
              </div>
              <div className="space-y-2 text-[13px]">
                {earnings.map((item, idx) => (
                  <div key={idx} className="flex justify-between">
                    <span className="text-slate-600 dark:text-slate-300">{item.label}</span>
                    <span className="font-medium text-[#0F172A] dark:text-white">{item.amount}</span>
                  </div>
                ))}
              </div>
              <div className="pt-2 border-t border-slate-200 dark:border-white/10 flex justify-between text-[13px] font-bold text-[#0F172A] dark:text-white">
                <span>Gross Earnings</span>
                <span className="text-teal-700 dark:text-teal-400">{grossEarnings}</span>
              </div>
            </div>

            {/* Deductions */}
            <div className="p-4 rounded-xl bg-white/60 dark:bg-slate-800/70 border border-white/80 dark:border-white/10 space-y-2">
              <div className="text-[12px] font-bold text-rose-700 dark:text-rose-400 uppercase tracking-wider pb-1 border-b border-rose-100 dark:border-rose-500/20 flex justify-between">
                <span>Deductions</span>
                <span>Amount</span>
              </div>
              <div className="space-y-2 text-[13px]">
                {deductions.map((item, idx) => (
                  <div key={idx} className="flex justify-between">
                    <span className="text-slate-600 dark:text-slate-300">{item.label}</span>
                    <span className="font-medium text-[#0F172A] dark:text-white">{item.amount}</span>
                  </div>
                ))}
              </div>
              <div className="pt-2 border-t border-slate-200 dark:border-white/10 flex justify-between text-[13px] font-bold text-[#0F172A] dark:text-white">
                <span>Total Deductions</span>
                <span className="text-rose-700 dark:text-rose-400">{totalDeductions}</span>
              </div>
            </div>
          </div>

          {/* Net Pay Callout */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-teal-500/10 via-cyan-500/10 to-transparent dark:from-teal-500/20 dark:via-cyan-500/20 border border-teal-200/60 dark:border-teal-500/30 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#0D9488] dark:text-teal-400">
                Net Take-Home Pay
              </span>
              <div className="text-[24px] font-bold text-[#0F172A] dark:text-white leading-tight">
                {netTakeHome}
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Credited to HDFC Bank on 31 August 2026</p>
            </div>
            <div className="px-3 py-1 rounded-full bg-teal-100 dark:bg-teal-500/20 text-teal-800 dark:text-teal-300 text-[12px] font-semibold">
              Disbursed
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="pt-3 border-t border-white/70 dark:border-white/10 flex items-center justify-between">
          <span className="text-[11px] text-slate-400 dark:text-slate-400">
            Digitally encrypted and tamper-evident • Form 16 compliant
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => window.print()}
              className="px-3 py-2 rounded-xl text-[12px] font-medium text-slate-600 dark:text-slate-300 hover:bg-white/80 dark:hover:bg-white/10 border border-white dark:border-white/10 flex items-center gap-1.5 transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print</span>
            </button>
            <button
              onClick={handleDownload}
              disabled={downloading}
              className="px-4 py-2 rounded-xl bg-[#0F172A] dark:bg-teal-600 hover:bg-slate-800 dark:hover:bg-teal-500 text-white text-[12px] font-semibold flex items-center gap-2 transition-all shadow-sm"
            >
              {downloaded ? (
                <>
                  <Check className="w-4 h-4 text-teal-300" />
                  <span>Downloaded!</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>{downloading ? 'Generating PDF...' : 'Download Payslip PDF'}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
