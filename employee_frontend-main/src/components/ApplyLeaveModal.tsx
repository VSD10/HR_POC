import React, { useState } from 'react';
import { X, Calendar, CheckCircle, Info } from 'lucide-react';
import { LeaveBalance, HrRequest } from '../types';

interface ApplyLeaveModalProps {
  balance: LeaveBalance;
  onClose: () => void;
  onSubmitLeave: (newRequest: Partial<HrRequest>, daysCount: number, leaveType: 'casual' | 'sick' | 'earned') => void;
}

export const ApplyLeaveModal: React.FC<ApplyLeaveModalProps> = ({
  balance,
  onClose,
  onSubmitLeave,
}) => {
  const [leaveType, setLeaveType] = useState<'casual' | 'sick' | 'earned'>('casual');
  const [fromDate, setFromDate] = useState('2026-09-28');
  const [toDate, setToDate] = useState('2026-09-29');
  const [isHalfDay, setIsHalfDay] = useState(false);
  const [reason, setReason] = useState('');
  const [submittedSuccess, setSubmittedSuccess] = useState(false);

  const calculateDays = () => {
    if (isHalfDay) return 0.5;
    const from = new Date(fromDate);
    const to = new Date(toDate);
    const diffTime = Math.abs(to.getTime() - from.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return isNaN(diffDays) || diffDays < 1 ? 1 : diffDays;
  };

  const days = calculateDays();
  const currentRemaining = balance[leaveType].remaining;
  const isExceeded = days > currentRemaining;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isExceeded || !reason.trim()) return;

    const leaveTypeLabel =
      leaveType === 'casual'
        ? 'Casual Leave'
        : leaveType === 'sick'
        ? 'Sick Leave'
        : 'Earned Leave';

    onSubmitLeave(
      {
        subject: `${leaveTypeLabel} application (${days} ${days === 1 ? 'day' : 'days'})`,
        category: 'Leave & Time',
        status: 'SUBMITTED',
        description: `Applied for ${days} days of ${leaveTypeLabel} from ${fromDate} to ${toDate}. Reason: ${reason}`,
        priority: 'Medium',
      },
      days,
      leaveType
    );

    setSubmittedSuccess(true);
    setTimeout(() => {
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <div className="relative w-full max-w-lg crystal-glass rounded-2xl shadow-2xl border border-white p-6 z-10 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-4 border-b border-white/70">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-teal-500/15 text-[#0D9488] flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-[17px] font-bold text-[#0F172A]">Apply for Leave</h3>
              <p className="text-[12px] text-slate-500">Submit time-off request for manager approval</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-white/80"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {submittedSuccess ? (
          <div className="py-12 flex flex-col items-center justify-center text-center space-y-3">
            <div className="w-14 h-14 rounded-full bg-teal-50 text-[#0D9488] flex items-center justify-center ring-8 ring-teal-50/50 animate-bounce">
              <CheckCircle className="w-8 h-8" />
            </div>
            <h4 className="text-[18px] font-bold text-[#0F172A]">Leave Request Submitted!</h4>
            <p className="text-[13px] text-slate-600 max-w-xs">
              Your leave request has been submitted and routed to your reporting manager and HR queue.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-4 space-y-4">
            {/* Balances summary */}
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setLeaveType('casual')}
                className={`p-2.5 rounded-xl border text-center transition-all ${
                  leaveType === 'casual'
                    ? 'bg-teal-50 border-teal-400 ring-2 ring-teal-500/20'
                    : 'bg-white/60 border-white hover:bg-white'
                }`}
              >
                <div className="text-[11px] font-semibold text-slate-500">Casual</div>
                <div className="text-[16px] font-bold text-[#0F172A] mt-0.5">
                  {balance.casual.remaining}{' '}
                  <span className="text-[11px] font-normal text-slate-400">/{balance.casual.total}</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setLeaveType('sick')}
                className={`p-2.5 rounded-xl border text-center transition-all ${
                  leaveType === 'sick'
                    ? 'bg-teal-50 border-teal-400 ring-2 ring-teal-500/20'
                    : 'bg-white/60 border-white hover:bg-white'
                }`}
              >
                <div className="text-[11px] font-semibold text-slate-500">Sick</div>
                <div className="text-[16px] font-bold text-[#0F172A] mt-0.5">
                  {balance.sick.remaining}{' '}
                  <span className="text-[11px] font-normal text-slate-400">/{balance.sick.total}</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setLeaveType('earned')}
                className={`p-2.5 rounded-xl border text-center transition-all ${
                  leaveType === 'earned'
                    ? 'bg-teal-50 border-teal-400 ring-2 ring-teal-500/20'
                    : 'bg-white/60 border-white hover:bg-white'
                }`}
              >
                <div className="text-[11px] font-semibold text-slate-500">Earned</div>
                <div className="text-[16px] font-bold text-[#0F172A] mt-0.5">
                  {balance.earned.remaining}{' '}
                  <span className="text-[11px] font-normal text-slate-400">/{balance.earned.total}</span>
                </div>
              </button>
            </div>

            {/* Dates */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[12px] font-semibold text-slate-600 mb-1">
                  From Date
                </label>
                <input
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  className="w-full bg-white/90 border border-white rounded-xl px-3 py-2 text-[13px] text-[#0F172A] shadow-2xs focus:ring-2 focus:ring-teal-500/30 focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-[12px] font-semibold text-slate-600 mb-1">
                  To Date
                </label>
                <input
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  disabled={isHalfDay}
                  className="w-full bg-white/90 border border-white rounded-xl px-3 py-2 text-[13px] text-[#0F172A] shadow-2xs focus:ring-2 focus:ring-teal-500/30 focus:outline-none disabled:opacity-50"
                  required
                />
              </div>
            </div>

            {/* Half day toggle */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-white/60 border border-white/80">
              <span className="text-[13px] font-medium text-[#0F172A]">Half Day Leave</span>
              <input
                type="checkbox"
                checked={isHalfDay}
                onChange={(e) => setIsHalfDay(e.target.checked)}
                className="w-4 h-4 text-[#0D9488] rounded accent-teal-600 cursor-pointer"
              />
            </div>

            {/* Reason */}
            <div>
              <label className="block text-[12px] font-semibold text-slate-600 mb-1">
                Reason & Handover Details
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Specify reason for time off and emergency contact info..."
                rows={3}
                className="w-full bg-white/90 border border-white rounded-xl p-3 text-[13px] text-[#0F172A] placeholder:text-slate-400 shadow-2xs focus:ring-2 focus:ring-teal-500/30 focus:outline-none resize-none"
                required
              />
            </div>

            {/* Warning if exceeded */}
            {isExceeded && (
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200/80 text-amber-800 text-[12px] flex items-center gap-2">
                <Info className="w-4 h-4 text-amber-600 flex-shrink-0" />
                <span>Requested days ({days}) exceed your available balance ({currentRemaining}).</span>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-[13px] font-medium text-slate-600 hover:bg-white/80"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isExceeded || !reason.trim()}
                className="px-5 py-2 rounded-xl bg-[#0F172A] hover:bg-slate-800 text-white text-[13px] font-semibold transition-all disabled:opacity-40 shadow-sm"
              >
                Submit Request ({days} {days === 1 ? 'day' : 'days'})
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
