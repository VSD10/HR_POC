import React from 'react';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  Building2,
  Calendar,
  CreditCard,
  FileCheck,
  Download,
  Edit,
  ShieldCheck,
} from 'lucide-react';
import { LeaveBalance, ScreenId } from '../types';
import { ASSETS, CURRENT_USER } from '../data/mockData';

interface MyProfileViewProps {
  leaveBalance: LeaveBalance;
  onOpenBankUpdate: () => void;
  onOpenApplyLeave: () => void;
  onNavigate: (screen: ScreenId) => void;
}

export const MyProfileView: React.FC<MyProfileViewProps> = ({
  leaveBalance,
  onOpenBankUpdate,
  onOpenApplyLeave,
  onNavigate,
}) => {
  const documents = [
    { name: 'Appointment & Employment Agreement', date: '15 Mar 2022', size: '2.4 MB' },
    { name: 'Annual Compensation Letter 2026', date: '01 Apr 2026', size: '480 KB' },
    { name: 'Corporate Group Health Card (MediAssist)', date: '01 Jul 2026', size: '1.2 MB' },
    { name: 'Proprietary Information & NDA Signed', date: '15 Mar 2022', size: '1.8 MB' },
  ];

  return (
    <div className="w-full max-w-[1560px] mx-auto space-y-6">
      {/* Profile Banner */}
      <div className="crystal-glass rounded-2xl p-6 sm:p-8 shadow-glass border border-white/80 dark:border-white/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
          <img
            src={ASSETS.avatar}
            alt={CURRENT_USER.name}
            className="w-24 h-24 rounded-2xl object-cover ring-4 ring-white dark:ring-white/20 shadow-md flex-shrink-0"
          />
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-[26px] font-bold text-[#0F172A] dark:text-white">{CURRENT_USER.name}</h1>
              <span className="bg-teal-50 dark:bg-teal-500/20 text-[#0D9488] dark:text-teal-400 border border-teal-200/60 dark:border-teal-500/30 font-semibold px-2.5 py-0.5 rounded-full text-[12px]">
                Full Time • Permanent
              </span>
            </div>
            <p className="text-[15px] text-[#334155] dark:text-slate-300 font-medium">{CURRENT_USER.role}</p>
            <div className="flex flex-wrap items-center gap-4 text-[12px] text-slate-500 dark:text-slate-400 pt-1">
              <span className="flex items-center gap-1.5">
                <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                {CURRENT_USER.department}
              </span>
              <span className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                {CURRENT_USER.workLocation}
              </span>
              <span className="font-mono bg-white/80 dark:bg-white/10 px-2 py-0.5 rounded border border-white dark:border-white/10 text-slate-700 dark:text-slate-300">
                ID: {CURRENT_USER.employeeId}
              </span>
            </div>
          </div>
        </div>

        <button
          onClick={onOpenApplyLeave}
          className="px-5 py-2.5 rounded-xl bg-[#0F172A] dark:bg-teal-600 hover:bg-slate-800 dark:hover:bg-teal-500 text-white text-[13px] font-semibold transition-all shadow-sm"
        >
          Apply for Time Off
        </button>
      </div>

      {/* Grid: Employment Details & Bank Info */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Col 1 & 2: Employment particulars */}
        <div className="lg:col-span-2 space-y-6">
          <div className="crystal-glass rounded-2xl p-6 shadow-glass border border-white dark:border-white/10 space-y-4">
            <h2 className="text-[17px] font-bold text-[#0F172A] dark:text-white flex items-center gap-2">
              <User className="w-5 h-5 text-[#0D9488] dark:text-teal-400" />
              <span>Employment & Contact Information</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-[13px]">
              <div className="p-3.5 rounded-xl bg-white/60 dark:bg-slate-800/70 border border-white dark:border-white/10 space-y-1">
                <span className="text-[11px] text-slate-400 dark:text-slate-400 font-semibold uppercase">
                  Official Email
                </span>
                <div className="text-[#0F172A] dark:text-white font-medium flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  <span>{CURRENT_USER.email}</span>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-white/60 dark:bg-slate-800/70 border border-white dark:border-white/10 space-y-1">
                <span className="text-[11px] text-slate-400 dark:text-slate-400 font-semibold uppercase">
                  Contact Phone
                </span>
                <div className="text-[#0F172A] dark:text-white font-medium flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  <span>{CURRENT_USER.phone}</span>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-white/60 dark:bg-slate-800/70 border border-white dark:border-white/10 space-y-1">
                <span className="text-[11px] text-slate-400 dark:text-slate-400 font-semibold uppercase">
                  Reporting Manager
                </span>
                <div className="text-[#0F172A] dark:text-white font-medium flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  <span>{CURRENT_USER.manager}</span>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-white/60 dark:bg-slate-800/70 border border-white dark:border-white/10 space-y-1">
                <span className="text-[11px] text-slate-400 dark:text-slate-400 font-semibold uppercase">
                  Joining Date
                </span>
                <div className="text-[#0F172A] dark:text-white font-medium flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>{CURRENT_USER.joiningDate} (4+ years tenure)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Stored HR Documents */}
          <div className="crystal-glass rounded-2xl p-6 shadow-glass border border-white dark:border-white/10 space-y-4">
            <h2 className="text-[17px] font-bold text-[#0F172A] dark:text-white flex items-center gap-2">
              <FileCheck className="w-5 h-5 text-[#0D9488] dark:text-teal-400" />
              <span>Official Employee Documents & Letters</span>
            </h2>

            <div className="space-y-2">
              {documents.map((doc, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl bg-white/70 dark:bg-slate-800/70 hover:bg-white dark:hover:bg-slate-800 border border-white/80 dark:border-white/10 flex items-center justify-between transition-all text-[13px]"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-teal-50 dark:bg-teal-500/20 text-[#0D9488] dark:text-teal-400 flex items-center justify-center font-bold text-[11px]">
                      PDF
                    </div>
                    <div>
                      <div className="font-semibold text-[#0F172A] dark:text-white">{doc.name}</div>
                      <div className="text-[11px] text-slate-400">
                        Issued on {doc.date} • {doc.size}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => alert(`Downloading simulated document: ${doc.name}`)}
                    className="p-2 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 rounded-lg transition-colors"
                    title="Download document"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Col 3: Bank Details & Leave breakdown */}
        <div className="space-y-6">
          {/* Bank details */}
          <div className="crystal-glass rounded-2xl p-6 shadow-glass border border-white dark:border-white/10 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-[16px] font-bold text-[#0F172A] dark:text-white flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-[#0D9488] dark:text-teal-400" />
                <span>Salary Disbursement</span>
              </h3>
              <button
                onClick={onOpenBankUpdate}
                className="text-[12px] font-semibold text-[#0D9488] dark:text-teal-400 hover:text-[#0F766E] dark:hover:text-teal-300 flex items-center gap-1"
              >
                <Edit className="w-3.5 h-3.5" />
                <span>Edit</span>
              </button>
            </div>

            <div className="p-4 rounded-xl bg-white/70 dark:bg-slate-800/70 border border-white dark:border-white/10 space-y-2 text-[13px]">
              <div>
                <span className="text-[11px] text-slate-400 block">Bank Name</span>
                <span className="font-semibold text-[#0F172A] dark:text-white">{CURRENT_USER.bankName}</span>
              </div>
              <div>
                <span className="text-[11px] text-slate-400 block">Account Number</span>
                <span className="font-mono font-medium text-[#0F172A] dark:text-white">
                  {CURRENT_USER.accountNumberMasked}
                </span>
              </div>
              <div>
                <span className="text-[11px] text-slate-400 block">IFSC Code</span>
                <span className="font-mono text-slate-600 dark:text-slate-300">{CURRENT_USER.ifsc}</span>
              </div>
              <div className="pt-2 flex items-center gap-1.5 text-[11px] text-teal-700 dark:text-teal-400 font-medium">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Verified via automated penny-drop validation</span>
              </div>
            </div>
          </div>

          {/* Leave snapshot summary */}
          <div className="crystal-glass rounded-2xl p-6 shadow-glass border border-white dark:border-white/10 space-y-4">
            <h3 className="text-[16px] font-bold text-[#0F172A] dark:text-white flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#0D9488] dark:text-teal-400" />
              <span>Leave Summary</span>
            </h3>

            <div className="space-y-3 text-[13px]">
              <div>
                <div className="flex justify-between text-slate-700 dark:text-slate-300">
                  <span>Casual Leave</span>
                  <span className="font-semibold text-[#0F172A] dark:text-white">
                    {leaveBalance.casual.remaining} / {leaveBalance.casual.total}
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full mt-1 overflow-hidden">
                  <div
                    className="h-full bg-teal-500 rounded-full"
                    style={{
                      width: `${(leaveBalance.casual.remaining / leaveBalance.casual.total) * 100}%`,
                    }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-slate-700 dark:text-slate-300">
                  <span>Sick Leave</span>
                  <span className="font-semibold text-[#0F172A] dark:text-white">
                    {leaveBalance.sick.remaining} / {leaveBalance.sick.total}
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full mt-1 overflow-hidden">
                  <div
                    className="h-full bg-cyan-500 rounded-full"
                    style={{
                      width: `${(leaveBalance.sick.remaining / leaveBalance.sick.total) * 100}%`,
                    }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-slate-700 dark:text-slate-300">
                  <span>Earned Leave</span>
                  <span className="font-semibold text-[#0F172A] dark:text-white">
                    {leaveBalance.earned.remaining} / {leaveBalance.earned.total}
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full mt-1 overflow-hidden">
                  <div
                    className="h-full bg-indigo-500 rounded-full"
                    style={{
                      width: `${(leaveBalance.earned.remaining / leaveBalance.earned.total) * 100}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
