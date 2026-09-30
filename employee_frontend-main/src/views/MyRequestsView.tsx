import React, { useState } from 'react';
import {
  Search,
  Filter,
  PlusCircle,
  CheckCircle2,
  Clock,
  ArrowRight,
  FileText,
  AlertCircle,
  Eye,
} from 'lucide-react';
import { HrRequest, RequestCategory, RequestStatus, ScreenId } from '../types';

interface MyRequestsViewProps {
  requests: HrRequest[];
  onSelectRequest: (request: HrRequest) => void;
  onNavigate: (screen: ScreenId) => void;
}

export const MyRequestsView: React.FC<MyRequestsViewProps> = ({
  requests,
  onSelectRequest,
  onNavigate,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | RequestStatus>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<'ALL' | RequestCategory>('ALL');

  const categories: RequestCategory[] = [
    'Leave & Time',
    'Payroll',
    'Documents',
    'Employee Info',
    'HR Policies',
  ];

  const filteredRequests = requests.filter((r) => {
    const matchesSearch =
      r.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.assignedTo.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || r.status === statusFilter;
    const matchesCategory = categoryFilter === 'ALL' || r.category === categoryFilter;

    return matchesSearch && matchesStatus && matchesCategory;
  });

  const getStatusBadge = (status: RequestStatus) => {
    switch (status) {
      case 'RESOLVED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-teal-50/90 text-[#0D9488] text-[11px] font-semibold border border-teal-200/60 shadow-2xs">
            <CheckCircle2 className="w-3 h-3" />
            <span>RESOLVED</span>
          </span>
        );
      case 'IN PROGRESS':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-50/80 text-indigo-700 text-[11px] font-semibold border border-indigo-200/60 shadow-2xs">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-600"></span>
            <span>IN PROGRESS</span>
          </span>
        );
      case 'SUBMITTED':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50/80 text-blue-700 text-[11px] font-semibold border border-blue-200/60 shadow-2xs">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse"></span>
            <span>SUBMITTED</span>
          </span>
        );
    }
  };

  const getPriorityClass = (priority: string) => {
    switch (priority) {
      case 'Urgent':
        return 'text-rose-600 font-bold bg-rose-50 border-rose-200';
      case 'High':
        return 'text-amber-700 font-semibold bg-amber-50 border-amber-200';
      case 'Low':
        return 'text-slate-500 bg-slate-100 border-slate-200';
      default:
        return 'text-slate-700 bg-slate-50 border-slate-200';
    }
  };

  return (
    <div className="w-full max-w-[1560px] mx-auto space-y-6">
      {/* Header */}
      <div className="crystal-glass rounded-2xl p-6 shadow-glass flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-white/80 dark:border-white/10">
        <div>
          <h1 className="text-[24px] font-bold text-[#0F172A] dark:text-white">My Requests & Tickets</h1>
          <p className="text-[13px] text-[#334155] dark:text-slate-300 mt-0.5">
            Track real-time resolution status, conversation audit logs, and submit responses.
          </p>
        </div>
        <button
          onClick={() => onNavigate('raise-request')}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#0F172A] dark:bg-teal-600 hover:bg-slate-800 dark:hover:bg-teal-500 text-white text-[13px] font-semibold transition-all shadow-sm"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Raise New Request</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="crystal-glass rounded-2xl p-4 sm:p-5 shadow-glass space-y-3.5 border border-white dark:border-white/10">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          {/* Search */}
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 dark:text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none transition-colors" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by ticket ID, subject keyword, or assignee..."
              className="search-input-field w-full pl-10 pr-4 py-2 text-[13px] shadow-2xs"
            />
          </div>

          {/* Status Tabs */}
          <div className="flex items-center p-1 rounded-xl bg-white/60 dark:bg-slate-800/60 border border-white/80 dark:border-white/10 w-full sm:w-auto overflow-x-auto">
            {(['ALL', 'SUBMITTED', 'IN PROGRESS', 'RESOLVED'] as const).map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-all whitespace-nowrap ${
                  statusFilter === st
                    ? 'bg-[#0F172A] dark:bg-teal-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-300 hover:text-[#0F172A] dark:hover:text-white'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-[12px]">
          <span className="text-slate-400 dark:text-slate-400 font-semibold uppercase text-[11px] flex-shrink-0">
            Category:
          </span>
          <button
            onClick={() => setCategoryFilter('ALL')}
            className={`px-3 py-1 rounded-lg border transition-all ${
              categoryFilter === 'ALL'
                ? 'bg-teal-50 dark:bg-teal-500/20 text-[#0D9488] dark:text-teal-300 border-teal-200 dark:border-teal-500/30 font-semibold'
                : 'bg-white/60 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 border-white dark:border-white/10 hover:bg-white dark:hover:bg-slate-700'
            }`}
          >
            All Categories
          </button>
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setCategoryFilter(c)}
              className={`px-3 py-1 rounded-lg border transition-all whitespace-nowrap ${
                categoryFilter === c
                  ? 'bg-teal-50 dark:bg-teal-500/20 text-[#0D9488] dark:text-teal-300 border-teal-200 dark:border-teal-500/30 font-semibold'
                  : 'bg-white/60 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 border-white dark:border-white/10 hover:bg-white dark:hover:bg-slate-700'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Requests Table & Cards */}
      <div className="crystal-glass rounded-2xl shadow-glass overflow-hidden border border-white dark:border-white/10">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/40 dark:bg-slate-800/40 text-[#64748B] dark:text-slate-400 text-[11px] uppercase tracking-wider font-semibold border-b border-white/50 dark:border-white/10">
                <th className="py-3 px-6" scope="col">Request ID</th>
                <th className="py-3 px-6" scope="col">Subject</th>
                <th className="py-3 px-6" scope="col">Category</th>
                <th className="py-3 px-6" scope="col">Priority</th>
                <th className="py-3 px-6" scope="col">Status</th>
                <th className="py-3 px-6" scope="col">Assigned To</th>
                <th className="py-3 px-6" scope="col">Last Updated</th>
                <th className="py-3 px-6 text-right" scope="col">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/40 dark:divide-white/10 text-[#0F172A] dark:text-slate-100 text-[13px]">
              {filteredRequests.map((req) => (
                <tr
                  key={req.id}
                  onClick={() => onSelectRequest(req)}
                  className="hover:bg-white/70 dark:hover:bg-white/10 transition-colors cursor-pointer"
                >
                  <td className="py-3.5 px-6 font-mono font-semibold text-slate-500 dark:text-slate-400">
                    {req.id}
                  </td>
                  <td className="py-3.5 px-6 font-medium text-[#0F172A] dark:text-white max-w-sm truncate">
                    {req.subject}
                  </td>
                  <td className="py-3.5 px-6">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-white/80 dark:bg-white/10 border border-white/90 dark:border-white/15 text-[12px] text-slate-600 dark:text-slate-300 shadow-2xs">
                      {req.category}
                    </span>
                  </td>
                  <td className="py-3.5 px-6">
                    <span
                      className={`text-[11px] px-2 py-0.5 rounded-md border ${getPriorityClass(
                        req.priority
                      )}`}
                    >
                      {req.priority}
                    </span>
                  </td>
                  <td className="py-3.5 px-6">{getStatusBadge(req.status)}</td>
                  <td className="py-3.5 px-6 text-slate-600 dark:text-slate-300 text-[12px] truncate max-w-[150px]">
                    {req.assignedTo}
                  </td>
                  <td className="py-3.5 px-6 text-[#64748B] dark:text-slate-400 text-[12px]">
                    {req.lastUpdated}
                  </td>
                  <td className="py-3.5 px-6 text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectRequest(req);
                      }}
                      className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-white/80 dark:bg-white/10 hover:bg-white dark:hover:bg-white/20 text-[#0F172A] dark:text-white text-[12px] font-semibold border border-white dark:border-white/15 shadow-2xs transition-all"
                    >
                      <Eye className="w-3 h-3" />
                      <span>View</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredRequests.length === 0 && (
          <div className="p-12 text-center text-slate-500 space-y-2">
            <p className="text-[15px] font-medium text-[#0F172A]">No requests found</p>
            <p className="text-[13px] text-slate-400">
              Try adjusting your search query or status filter.
            </p>
          </div>
        )}

        <div className="px-6 py-3.5 bg-white/40 border-t border-white/50 text-[12px] text-[#64748B] flex justify-between items-center">
          <span>Showing {filteredRequests.length} total request records</span>
          <span className="font-medium text-slate-600">SLA active</span>
        </div>
      </div>
    </div>
  );
};
