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
import { useAuth } from '../../context/AuthContext';

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
  const { user } = useAuth();

  const displayName = user?.name || CURRENT_USER.name;
  const displayEmail = user?.email || CURRENT_USER.email;
  const displayRole = user?.title || user?.role || CURRENT_USER.role;
  const displayDepartment = user?.department || CURRENT_USER.department;
  const displayId = user?.id || CURRENT_USER.employeeId;
  const displayAvatar = user?.avatar || user?.avatarUrl || ASSETS.avatar;

  const documents = [
    { name: 'Appointment & Employment Agreement', date: '15 Mar 2022', size: '2.4 MB' },
    { name: 'Annual Compensation Letter 2026', date: '01 Apr 2026', size: '480 KB' },
    { name: 'Corporate Group Health Card (MediAssist)', date: '01 Jul 2026', size: '1.2 MB' },
    { name: 'Proprietary Information & NDA Signed', date: '15 Mar 2022', size: '1.8 MB' },
  ];

  return (
    <div className="w-full max-w-[1560px] mx-auto space-y-6">
      {/* Profile Banner */}
      <div className="crystal-glass rounded-2xl p-6 sm:p-8 shadow-glass border border-white flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
          <img
            src={displayAvatar}
            alt={displayName}
            className="w-24 h-24 rounded-2xl object-cover ring-4 ring-white shadow-md flex-shrink-0"
          />
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-[26px] font-bold text-[#0F172A]">{displayName}</h1>
              <span className="bg-teal-50 text-[#0D9488] border border-teal-200/60 font-semibold px-2.5 py-0.5 rounded-full text-[12px]">
                Full Time • Permanent
              </span>
            </div>
            <p className="text-[15px] text-[#334155] font-medium">{displayRole}</p>
            <div className="flex flex-wrap items-center gap-4 text-[12px] text-slate-500 pt-1">
              <span className="flex items-center gap-1.5">
                <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                {displayDepartment}
              </span>
              <span className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                {CURRENT_USER.workLocation}
              </span>
              <span className="font-mono bg-white/80 px-2 py-0.5 rounded border border-white font-semibold text-teal-800">
                ID: {displayId}
              </span>
            </div>
          </div>
        </div>

        <button
          onClick={onOpenApplyLeave}
          className="px-5 py-2.5 rounded-xl bg-[#0F172A] hover:bg-slate-800 text-white text-[13px] font-semibold transition-all shadow-sm cursor-pointer"
        >
          Apply for Time Off
        </button>
      </div>

      {/* Grid: Employment Details & Bank Info */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Col 1 & 2: Employment particulars */}
        <div className="lg:col-span-2 space-y-6">
          <div className="crystal-glass rounded-2xl p-6 shadow-glass border border-white space-y-4">
            <h2 className="text-[17px] font-bold text-[#0F172A] flex items-center gap-2">
              <User className="w-5 h-5 text-[#0D9488]" />
              <span>Employment & Contact Information</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-[13px]">
              <div className="p-3.5 rounded-xl bg-white/60 border border-white space-y-1">
                <span className="text-[11px] text-slate-400 font-semibold uppercase">
                  Official Email
                </span>
                <div className="text-[#0F172A] font-medium flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  <span>{displayEmail}</span>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-white/60 border border-white space-y-1">
                <span className="text-[11px] text-slate-400 font-semibold uppercase">
                  Contact Phone
                </span>
                <div className="text-[#0F172A] font-medium flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  <span>{CURRENT_USER.phone}</span>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-white/60 border border-white space-y-1">
                <span className="text-[11px] text-slate-400 font-semibold uppercase">
                  Reporting Manager
                </span>
                <div className="text-[#0F172A] font-medium flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  <span>{CURRENT_USER.manager}</span>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-white/60 border border-white space-y-1">
                <span className="text-[11px] text-slate-400 font-semibold uppercase">
                  Employee ID
                </span>
                <div className="text-[#0F172A] font-medium flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
                  <span className="font-mono">{displayId}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Stored HR Documents */}
          <div className="crystal-glass rounded-2xl p-6 shadow-glass border border-white space-y-4">
            <h2 className="text-[17px] font-bold text-[#0F172A] flex items-center gap-2">
              <FileCheck className="w-5 h-5 text-[#0D9488]" />
              <span>Official Employee Documents & Letters</span>
            </h2>

            <div className="space-y-2">
              {documents.map((doc, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl bg-white/70 hover:bg-white border border-white flex items-center justify-between transition-all text-[13px]"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-teal-50 text-[#0D9488] flex items-center justify-center font-bold text-[11px]">
                      PDF
                    </div>
                    <div>
                      <div className="font-semibold text-[#0F172A]">{doc.name}</div>
                      <div className="text-[11px] text-slate-400">
                        Issued on {doc.date} • {doc.size}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => alert(`Downloading simulated document: ${doc.name}`)}
                    className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
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
          <div className="crystal-glass rounded-2xl p-6 shadow-glass border border-white space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-[16px] font-bold text-[#0F172A] flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-[#0D9488]" />
                <span>Salary Disbursement</span>
              </h3>
              <button
                onClick={onOpenBankUpdate}
                className="text-xs text-[#0D9488] font-semibold hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Edit className="w-3 h-3" />
                <span>Update</span>
              </button>
            </div>

            <div className="space-y-2.5 text-[12px]">
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Bank Name</span>
                <span className="font-semibold text-[#0F172A]">{CURRENT_USER.bankName}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Account</span>
                <span className="font-mono text-[#0F172A]">{CURRENT_USER.accountNumberMasked}</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-slate-500">IFSC / Routing</span>
                <span className="font-mono text-[#0F172A]">{CURRENT_USER.ifsc}</span>
              </div>
            </div>
          </div>

          {/* Quick Leave Balance summary */}
          <div className="crystal-glass rounded-2xl p-6 shadow-glass border border-white space-y-4">
            <h3 className="text-[16px] font-bold text-[#0F172A] flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#0D9488]" />
              <span>Available Time Off</span>
            </h3>

            <div className="space-y-2">
              <div className="p-3 rounded-xl bg-teal-50/70 border border-teal-100 flex items-center justify-between text-[12px]">
                <span className="text-teal-900 font-medium">Casual Leave</span>
                <span className="font-bold text-[#0D9488] text-[14px]">
                  {leaveBalance.casual.remaining} / {leaveBalance.casual.total}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-indigo-50/70 border border-indigo-100 flex items-center justify-between text-[12px]">
                <span className="text-indigo-900 font-medium">Sick / Medical Leave</span>
                <span className="font-bold text-indigo-700 text-[14px]">
                  {leaveBalance.sick.remaining} / {leaveBalance.sick.total}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-100 flex items-center justify-between text-[12px]">
                <span className="text-amber-900 font-medium">Earned / Privilege</span>
                <span className="font-bold text-amber-700 text-[14px]">
                  {leaveBalance.earned.remaining} / {leaveBalance.earned.total}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};