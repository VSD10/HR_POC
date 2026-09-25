import React, { useState } from 'react';
import {
  X,
  Clock,
  User,
  Send,
  CheckCircle2,
  AlertCircle,
  FileText,
  Calendar,
  MessageSquare,
} from 'lucide-react';
import { HrRequest, RequestStatus } from '../types';
import { ASSETS, CURRENT_USER } from '../data/mockData';

interface RequestDetailsModalProps {
  request: HrRequest | null;
  onClose: () => void;
  onAddComment: (requestId: string, text: string) => void;
}

export const RequestDetailsModal: React.FC<RequestDetailsModalProps> = ({
  request,
  onClose,
  onAddComment,
}) => {
  const [replyText, setReplyText] = useState('');

  if (!request) return null;

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    onAddComment(request.id, replyText.trim());
    setReplyText('');
  };

  const getStatusBadge = (status: RequestStatus) => {
    switch (status) {
      case 'RESOLVED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-teal-50/90 text-[#0D9488] text-[12px] font-semibold border border-teal-200/60 shadow-2xs">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>RESOLVED</span>
          </span>
        );
      case 'IN PROGRESS':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-50/80 text-indigo-700 text-[12px] font-semibold border border-indigo-200/60 shadow-2xs">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-600"></span>
            <span>IN PROGRESS</span>
          </span>
        );
      case 'SUBMITTED':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50/80 text-blue-700 text-[12px] font-semibold border border-blue-200/60 shadow-2xs">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse"></span>
            <span>SUBMITTED</span>
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-2xl max-h-[90vh] crystal-glass rounded-2xl shadow-2xl border border-white flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150 z-10">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-white/70 flex items-start justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2.5">
              <span className="font-mono text-[13px] font-bold text-slate-500 bg-white/70 px-2 py-0.5 rounded-md border border-white">
                {request.id}
              </span>
              <span className="px-2 py-0.5 rounded-md bg-white/80 border border-white/90 text-[12px] text-slate-600 font-medium">
                {request.category}
              </span>
              {getStatusBadge(request.status)}
            </div>
            <h3 className="text-[19px] sm:text-[21px] font-bold text-[#0F172A] leading-snug">
              {request.subject}
            </h3>
            <p className="text-[12px] text-[#64748B] flex items-center gap-2">
              <span>Assigned: {request.assignedTo}</span>
              <span>•</span>
              <span>Updated: {request.lastUpdated}</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-white/80 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Scrollable */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          {/* Description Section */}
          <div className="p-4 rounded-xl bg-white/60 border border-white/80 space-y-2 shadow-2xs">
            <h4 className="text-[12px] font-bold uppercase tracking-wider text-slate-500">
              Request Details
            </h4>
            <p className="text-[14px] text-[#0F172A] leading-relaxed">
              {request.description}
            </p>
          </div>

          {/* Timeline Audit */}
          <div className="space-y-3">
            <h4 className="text-[12px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              <span>Activity Timeline</span>
            </h4>
            <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
              {request.timeline.map((event, idx) => (
                <div key={idx} className="relative group">
                  <div className="absolute -left-6 top-1 w-2.5 h-2.5 rounded-full bg-[#0D9488] ring-4 ring-white" />
                  <div className="text-[13px] font-semibold text-[#0F172A]">
                    {event.title}
                  </div>
                  <div className="text-[12px] text-slate-600">{event.desc}</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    {event.date} • {event.actor}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Conversation & Updates */}
          <div className="space-y-3">
            <h4 className="text-[12px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Conversation Thread</span>
            </h4>

            {request.comments.length === 0 ? (
              <p className="text-[13px] text-slate-400 italic">
                No comments yet. You can send an update below.
              </p>
            ) : (
              <div className="space-y-3">
                {request.comments.map((c) => (
                  <div
                    key={c.id}
                    className={`p-3.5 rounded-xl text-[13px] border ${
                      c.isHr
                        ? 'bg-teal-50/70 border-teal-100 text-[#0F172A]'
                        : 'bg-white/80 border-white text-[#0F172A]'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-semibold text-[13px] flex items-center gap-1.5">
                        {c.author}
                        {c.isHr && (
                          <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-[#0D9488] text-white">
                            HR
                          </span>
                        )}
                      </span>
                      <span className="text-[11px] text-slate-400">{c.time}</span>
                    </div>
                    <p className="text-[13px] leading-normal">{c.text}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer: Quick Reply */}
        <div className="p-4 sm:p-5 border-t border-white/70 bg-white/40">
          <form onSubmit={handleSendReply} className="flex gap-2">
            <input
              type="text"
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder="Write a reply or provide additional details..."
              className="flex-1 bg-white/90 rounded-xl px-4 py-2.5 text-[13px] text-[#0F172A] placeholder:text-slate-400 border border-white shadow-xs focus:ring-2 focus:ring-teal-500/30 focus:outline-none"
            />
            <button
              type="submit"
              disabled={!replyText.trim()}
              className="px-4 py-2.5 rounded-xl bg-[#0F172A] text-white hover:bg-slate-800 disabled:opacity-50 text-[13px] font-semibold flex items-center gap-1.5 transition-all shadow-sm"
            >
              <span>Send</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
