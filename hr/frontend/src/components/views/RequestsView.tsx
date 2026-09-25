import React, { useState } from 'react';
import { Category, Priority, RequestItem } from '../../types/hr';

interface RequestsViewProps {
  requests: RequestItem[];
  onSelectRequest: (item: RequestItem) => void;
  onNewRequest: () => void;
  onResolveDirect?: (id: string) => void;
}

export const RequestsView: React.FC<RequestsViewProps> = ({
  requests,
  onSelectRequest,
  onNewRequest,
  onResolveDirect
}) => {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  const filtered = requests.filter((r) => {
    if (selectedCategory !== 'all' && r.category !== selectedCategory) return false;
    if (selectedPriority !== 'all' && r.priority !== selectedPriority) return false;
    if (selectedStatus !== 'all' && r.status !== selectedStatus) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        r.title.toLowerCase().includes(q) ||
        r.id.toLowerCase().includes(q) ||
        r.employee.name.toLowerCase().includes(q) ||
        r.employee.department.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="flex-1 flex flex-col gap-6">
      {/* Header filter capsule */}
      <div className="rounded-3xl p-6 bg-white/[0.04] backdrop-blur-2xl border border-white/10 shadow-glass specular-border flex flex-col gap-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="font-display text-xl font-bold text-white tracking-tight">
              Service Requests Queue
            </h2>
            <p className="text-xs text-white/50">
              Showing {filtered.length} of {requests.length} total operational cases
            </p>
          </div>
          <button
            onClick={onNewRequest}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-semibold text-xs shadow-neon-cyan transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            <span>Create Case</span>
          </button>
        </div>

        {/* Filters Bar */}
        <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-white/10">
          {/* Search input */}
          <div className="relative flex-1 min-w-[240px]">
            <span className="material-symbols-outlined absolute left-3 top-2.5 text-white/40 text-[18px]">
              search
            </span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by case ID, title, employee..."
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-black/40 border border-white/10 text-xs text-white placeholder:text-white/40 focus:outline-none focus:border-neon-cyan"
            />
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1.5">
            {[
              { id: 'all', label: 'All Status' },
              { id: 'open', label: 'Open' },
              { id: 'in_review', label: 'In Review' },
              { id: 'resolved', label: 'Resolved' }
            ].map((st) => (
              <button
                key={st.id}
                onClick={() => setSelectedStatus(st.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-mono transition-all cursor-pointer ${
                  selectedStatus === st.id
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 font-semibold'
                    : 'bg-white/5 text-white/60 hover:text-white border border-transparent'
                }`}
              >
                {st.label}
              </button>
            ))}
          </div>

          {/* Category Filter */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
            {['all', 'payroll', 'benefits', 'leave', 'documents', 'compliance'].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-mono capitalize transition-all cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 font-medium'
                    : 'bg-white/5 text-white/60 hover:text-white border border-transparent'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Priority Filter */}
          <div className="flex items-center gap-1.5">
            {['all', 'high', 'medium', 'low'].map((prio) => (
              <button
                key={prio}
                onClick={() => setSelectedPriority(prio)}
                className={`px-2.5 py-1.5 rounded-xl text-xs font-mono uppercase text-[11px] transition-all cursor-pointer ${
                  selectedPriority === prio
                    ? 'bg-white/15 text-white font-bold border border-white/20'
                    : 'bg-white/5 text-white/50 hover:text-white border border-transparent'
                }`}
              >
                {prio}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Requests Table */}
      <div className="rounded-3xl bg-white/[0.04] backdrop-blur-2xl border border-white/10 shadow-glass overflow-hidden specular-border">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-black/40 border-b border-white/10 font-mono text-[11px] text-white/50 uppercase tracking-wider">
              <tr>
                <th className="px-5 py-3.5">Case ID</th>
                <th className="px-5 py-3.5">Employee</th>
                <th className="px-5 py-3.5">Summary</th>
                <th className="px-5 py-3.5">Category</th>
                <th className="px-5 py-3.5">AI Confidence</th>
                <th className="px-5 py-3.5">Priority</th>
                <th className="px-5 py-3.5">Waiting</th>
                <th className="px-5 py-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filtered.map((req) => {
                const isHigh = req.priority === 'high';
                return (
                  <tr
                    key={req.id}
                    onClick={() => onSelectRequest(req)}
                    className="hover:bg-white/[0.06] transition-colors cursor-pointer group"
                  >
                    <td className="px-5 py-4 font-mono font-bold text-cyan-300 whitespace-nowrap">
                      {req.id}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={req.employee.avatar}
                          alt={req.employee.name}
                          className="w-8 h-8 rounded-lg object-cover ring-1 ring-white/15"
                        />
                        <div>
                          <div className="font-semibold text-white group-hover:text-cyan-300 transition-colors">
                            {req.employee.name}
                          </div>
                          <div className="text-[11px] text-white/40">
                            {req.employee.department}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 max-w-xs">
                      <p className="font-medium text-white line-clamp-1">{req.title}</p>
                      <p className="text-[11px] text-white/40 line-clamp-1">{req.description}</p>
                    </td>
                    <td className="px-5 py-4 font-mono uppercase text-[11px] text-white/70">
                      {req.category}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs text-purple-300 font-semibold">
                          {Math.round(req.aiTriage.confidence * 100)}%
                        </span>
                        <div className="w-12 h-1.5 rounded-full bg-white/10 overflow-hidden">
                          <div
                            className="h-full bg-purple-400 rounded-full"
                            style={{ width: `${req.aiTriage.confidence * 100}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono whitespace-nowrap font-medium ${
                          isHigh
                            ? 'bg-rose-500/15 border border-rose-500/30 text-rose-300'
                            : req.priority === 'medium'
                            ? 'bg-amber-500/15 border border-amber-500/30 text-amber-300'
                            : 'bg-white/10 text-white/70'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            isHigh ? 'bg-rose-500 animate-pulse' : 'bg-amber-400'
                          }`}
                        />
                        {req.priority}
                      </span>
                    </td>
                    <td className="px-5 py-4 font-mono text-white/50 whitespace-nowrap">
                      {req.waitingTime}
                    </td>
                    <td className="px-5 py-4 text-right whitespace-nowrap">
                      {req.status === 'resolved' ? (
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 font-semibold text-xs">
                          <span className="material-symbols-outlined text-[14px]">check_circle</span>
                          Resolved
                        </span>
                      ) : (
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (onResolveDirect) {
                                onResolveDirect(req.id);
                              } else {
                                onSelectRequest(req);
                              }
                            }}
                            className="px-2.5 py-1 rounded-lg bg-emerald-600/90 hover:bg-emerald-500 text-white font-semibold text-xs border border-emerald-400/40 shadow-xs transition-all inline-flex items-center gap-1 cursor-pointer"
                          >
                            <span className="material-symbols-outlined text-[14px]">check</span>
                            Approve
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onSelectRequest(req);
                            }}
                            className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white font-medium text-xs border border-white/15 transition-all inline-flex items-center gap-1 hover:border-cyan-400/50 cursor-pointer"
                          >
                            Review <span className="text-cyan-300">→</span>
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
