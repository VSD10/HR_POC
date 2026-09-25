import React from 'react';
import {
  HelpCircle,
  Phone,
  Mail,
  Clock,
  ShieldCheck,
  AlertCircle,
  FileQuestion,
  UserCheck,
  ArrowRight,
  PlusCircle,
} from 'lucide-react';
import { ScreenId } from '../types';

interface HelpSupportViewProps {
  onNavigate: (screen: ScreenId) => void;
}

export const HelpSupportView: React.FC<HelpSupportViewProps> = ({ onNavigate }) => {
  const contacts = [
    {
      name: 'Pooja Nair',
      role: 'Lead People Partner (Engineering)',
      email: 'pooja.nair@enterprise.org',
      phone: '+91 80 4910 8821',
      timing: 'Mon - Fri, 09:30 AM - 06:30 PM',
      focus: 'Career progression, performance, grievance redressal',
    },
    {
      name: 'Kavita Menon',
      role: 'Senior Payroll Specialist',
      email: 'payroll-desk@enterprise.org',
      phone: '+91 80 4910 8844',
      timing: 'Mon - Fri, 10:00 AM - 05:30 PM',
      focus: 'TDS, Form 16, payslips, bank accounts',
    },
    {
      name: 'Siddharth Rao',
      role: 'HR Operations Lead',
      email: 'hr-ops@enterprise.org',
      phone: '+91 80 4910 8890',
      timing: 'Mon - Fri, 09:00 AM - 06:00 PM',
      focus: 'Letters, employment certificates, biometric attendance',
    },
  ];

  const emergencyContacts = [
    {
      title: '24/7 Medical Cashless Emergency (MediAssist TPA)',
      number: '1800-425-9449 / +91 80 2206 9449',
      desc: 'Immediate pre-authorization for emergency hospitalization network desks',
    },
    {
      title: 'Employee Mental Health & Wellbeing Helpline (1to1Help)',
      number: '1800-258-7799 (Toll Free, Anonymous)',
      desc: 'Confidential 24/7 counseling support for employees and immediate family',
    },
    {
      title: 'POSH Internal Complaints Committee',
      number: 'posh-committee@enterprise.org',
      desc: 'Strictly confidential redressal under Prevention of Sexual Harassment framework',
    },
  ];

  return (
    <div className="w-full max-w-[1560px] mx-auto space-y-6">
      {/* Header */}
      <div className="crystal-glass rounded-2xl p-6 shadow-glass flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-[24px] font-bold text-[#0F172A]">Help & Support Services</h1>
          <p className="text-[13px] text-[#334155] mt-0.5">
            Direct access to your dedicated People Partners, emergency lifelines, and ticket SLAs.
          </p>
        </div>
        <button
          onClick={() => onNavigate('raise-request')}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0F172A] hover:bg-slate-800 text-white text-[13px] font-semibold transition-all shadow-sm"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Submit Support Ticket</span>
        </button>
      </div>

      {/* Dedicated HR Contacts */}
      <div className="space-y-3">
        <h2 className="text-[18px] font-bold text-[#0F172A]">
          Your Dedicated People Operations Team
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {contacts.map((contact, idx) => (
            <div
              key={idx}
              className="crystal-glass-card rounded-2xl p-5 space-y-3 border border-white"
            >
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#0D9488]">
                  People Operations
                </span>
                <h3 className="text-[17px] font-bold text-[#0F172A] mt-0.5">
                  {contact.name}
                </h3>
                <p className="text-[12px] text-slate-600 font-medium">{contact.role}</p>
              </div>

              <div className="space-y-1.5 text-[12px] text-slate-600">
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  <a href={`mailto:${contact.email}`} className="text-teal-700 hover:underline">
                    {contact.email}
                  </a>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  <span>{contact.phone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>{contact.timing}</span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-500">
                Focus: {contact.focus}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Emergency & Lifelines */}
      <div className="crystal-glass rounded-2xl p-6 shadow-glass border border-white space-y-4">
        <h2 className="text-[18px] font-bold text-[#0F172A] flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-rose-500" />
          <span>24/7 Lifelines & Emergency Helplines</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {emergencyContacts.map((em, i) => (
            <div
              key={i}
              className="p-4 rounded-xl bg-white/70 border border-white space-y-1.5"
            >
              <h4 className="text-[14px] font-bold text-[#0F172A]">{em.title}</h4>
              <div className="font-mono text-[13px] font-bold text-teal-700">
                {em.number}
              </div>
              <p className="text-[12px] text-slate-500">{em.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* SLA Commitment Table */}
      <div className="crystal-glass rounded-2xl p-6 shadow-glass border border-white space-y-4">
        <h2 className="text-[18px] font-bold text-[#0F172A] flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-[#0D9488]" />
          <span>Service Level Agreement (SLA) Matrix</span>
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-[13px]">
            <thead>
              <tr className="border-b border-white/60 text-[#64748B] text-[11px] uppercase tracking-wider font-semibold">
                <th className="py-2.5 px-4">Priority</th>
                <th className="py-2.5 px-4">Initial Triage</th>
                <th className="py-2.5 px-4">Expected Resolution</th>
                <th className="py-2.5 px-4">Example Categories</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/40">
              <tr>
                <td className="py-3 px-4 font-bold text-rose-600">Urgent</td>
                <td className="py-3 px-4">Within 1 hour</td>
                <td className="py-3 px-4">4 business hours</td>
                <td className="py-3 px-4 text-slate-600">Emergency hospital cashless card issue, critical travel visa</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-bold text-amber-700">High</td>
                <td className="py-3 px-4">Within 4 hours</td>
                <td className="py-3 px-4">24 business hours</td>
                <td className="py-3 px-4 text-slate-600">Salary discrepancy, urgent leave handover approval</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-bold text-slate-700">Medium</td>
                <td className="py-3 px-4">Within 12 hours</td>
                <td className="py-3 px-4">48 business hours</td>
                <td className="py-3 px-4 text-slate-600">Employment verification, bank details change, tax claim</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-bold text-slate-500">Low</td>
                <td className="py-3 px-4">Within 24 hours</td>
                <td className="py-3 px-4">72 business hours</td>
                <td className="py-3 px-4 text-slate-600">General policy clarification, feedback, long-term leaves</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
