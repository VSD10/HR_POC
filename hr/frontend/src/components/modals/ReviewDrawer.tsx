import React, { useState, useEffect } from 'react';
import { RequestItem, RequestComment } from '../../types/hr';
import { HR_USERS, getUserById } from '../../data/mockUsers';
import { useAuth } from '../../context/AuthContext';
import { hrService } from '../../services/hrService';
import { ShieldCheck, Send, MessageSquare, Clock, User, CheckCircle2 } from 'lucide-react';

interface ReviewDrawerProps {
  item: RequestItem | null;
  onClose: () => void;
  onResolve: (id: string, notes: string) => void;
  onEscalate?: (id: string, notes: string) => void;
  onAssign?: (id: string, assignedToId: string, assignedToName: string) => void;
}

export const ReviewDrawer: React.FC<ReviewDrawerProps> = ({
  item,
  onClose,
  onResolve,
  onAssign
}) => {
  const { user } = useAuth();
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [assignedToId, setAssignedToId] = useState<string>('HR001');
  const [assignedToName, setAssignedToName] = useState<string>('Sarah Jenkins');
  const [comments, setComments] = useState<RequestComment[]>([]);
  const [newCommentText, setNewCommentText] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [assignmentSuccess, setAssignmentSuccess] = useState(false);

  useEffect(() => {
    if (item) {
      setNotes(item.resolutionNotes || '');
      setAssignedToId(item.assignedToId || 'HR001');
      const defaultHr = getUserById(item.assignedToId || 'HR001');
      setAssignedToName(item.assignedTo || defaultHr?.name || 'Sarah Jenkins');
      setComments(item.comments || []);
      setNewCommentText('');
      setAssignmentSuccess(false);
    }
  }, [item]);

  if (!item) return null;

  const handleAssignmentChange = async (newId: string) => {
    const hr = getUserById(newId);
    if (!hr) return;
    setAssignedToId(newId);
    setAssignedToName(hr.name);

    try {
      await hrService.assignRequest(item.id, newId, hr.name);
      item.assignedToId = newId;
      item.assignedTo = hr.name;
      if (onAssign) {
        onAssign(item.id, newId, hr.name);
      }
      setAssignmentSuccess(true);
      setTimeout(() => setAssignmentSuccess(false), 3000);
    } catch (err) {
      console.warn('Assignment error:', err);
    }
  };

  const handlePostComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentText.trim() || isSubmittingComment) return;

    setIsSubmittingComment(true);
    const commentData: Partial<RequestComment> = {
      authorId: user?.id || (user?.isHr ? 'HR001' : 'EMP001'),
      author: user?.name || (user?.isHr ? 'HR Specialist' : 'Employee'),
      avatar: user?.avatar || user?.avatarUrl,
      text: newCommentText.trim(),
      isHr: user ? user.isHr : true,
      time: 'Just now'
    };

    try {
      const created = await hrService.addComment(item.id, commentData);
      setComments(prev => [...prev, created]);
      if (!item.comments) item.comments = [];
      item.comments.push(created);
      setNewCommentText('');
    } catch (err) {
      console.warn('Failed to add comment:', err);
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleResolve = async () => {
    setIsSubmitting(true);
    const resolver = user ? `${user.name} (HR Ops)` : 'HR Operations Lead';
    await onResolve(item.id, notes || `Case reviewed and verified against internal HR handbook policies by ${resolver}.`);
    setIsSubmitting(false);
    onClose();
  };

  const currentHr = getUserById(assignedToId) || HR_USERS[0];

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div 
        className="w-full max-w-2xl bg-[#090c1e] border-l border-white/20 shadow-2xl h-full flex flex-col justify-between overflow-y-auto specular-border"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-white/10 bg-white/[0.02]">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs px-2.5 py-1 rounded-lg bg-cyan-500/15 border border-cyan-400/30 text-neon-cyan font-bold">
                {item.id}
              </span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono uppercase font-semibold ${
                item.priority === 'high'
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                  : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
              }`}>
                {item.priority} priority
              </span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono uppercase font-semibold ${
                item.status === 'resolved'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
              }`}>
                {item.status}
              </span>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-white/50 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>

          <h2 className="font-display text-lg font-bold text-white leading-tight">
            {item.title}
          </h2>
          <p className="text-xs font-mono text-white/40 mt-1">
            Waiting time: {item.waitingTime} • Submitted {new Date(item.createdAt).toLocaleDateString()}
          </p>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 flex-1 overflow-y-auto">
          {/* Employee Card */}
          <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img
                src={item.employee.avatar}
                alt={item.employee.name}
                className="w-12 h-12 rounded-xl object-cover ring-1 ring-white/20"
              />
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-semibold text-white">{item.employee.name}</h4>
                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-white/10 text-cyan-300 border border-white/15">
                    {item.employeeId || item.employee.id}
                  </span>
                </div>
                <p className="text-xs text-white/50">{item.employee.title || item.employee.department}</p>
                <span className="text-[11px] font-mono text-cyan-300/70">{item.employee.email}</span>
              </div>
            </div>
            {item.employee.tenure && (
              <span className="text-xs font-mono px-2.5 py-1 rounded-lg bg-black/40 border border-white/10 text-white/70">
                Tenure: {item.employee.tenure}
              </span>
            )}
          </div>

          {/* HR Ticket Assignment Section */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-950/40 to-cyan-950/30 border border-cyan-500/30 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-cyan-400" />
                <span className="text-xs font-mono uppercase tracking-wider text-cyan-300 font-semibold">
                  HR Specialist Assignment
                </span>
              </div>
              {assignmentSuccess && (
                <span className="text-[11px] font-mono text-emerald-400 flex items-center gap-1 animate-pulse">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Assigned to {assignedToName}</span>
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
              <div>
                <label className="block text-[11px] font-mono text-white/60 mb-1">
                  Assignee (HR Specialist)
                </label>
                <select
                  value={assignedToId}
                  onChange={(e) => handleAssignmentChange(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-black/60 border border-cyan-400/40 text-xs text-white focus:outline-none focus:border-neon-cyan font-mono cursor-pointer"
                >
                  {HR_USERS.map((hr) => (
                    <option key={hr.id} value={hr.id} className="bg-[#0b0e22] text-white">
                      {hr.name} ({hr.id}) - {hr.role}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-3 p-2 rounded-xl bg-black/30 border border-white/10">
                <img
                  src={currentHr?.avatar}
                  alt={currentHr?.name}
                  className="w-8 h-8 rounded-lg object-cover ring-1 ring-cyan-400/40"
                />
                <div className="min-w-0">
                  <div className="text-xs font-semibold text-white truncate">
                    Assigned to {currentHr?.name}
                  </div>
                  <div className="text-[10px] text-cyan-300/70 font-mono truncate">
                    {currentHr?.id} • {currentHr?.role}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Issue Description */}
          <div>
            <h4 className="text-xs font-mono uppercase tracking-wider text-white/50 mb-2">
              Case Narrative
            </h4>
            <div className="p-4 rounded-2xl bg-black/30 border border-white/10 text-xs text-white/90 leading-relaxed font-light">
              {item.description || 'No additional narrative provided.'}
            </div>
          </div>

          {/* AI Autonomous Triage Telemetry */}
          {item.aiTriage && (
            <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-950/40 via-indigo-950/30 to-blue-950/40 border border-purple-500/30 shadow-neon-violet">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-purple-400 text-[18px]">
                    auto_awesome
                  </span>
                  <span className="text-xs font-bold text-white tracking-wide">
                    Autonomous AI Assessment
                  </span>
                </div>
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 font-bold border border-purple-400/30">
                  {Math.round(item.aiTriage.confidence * 100)}% Confidence
                </span>
              </div>
              <p className="text-xs text-white/80 font-mono">
                Classification: <span className="text-cyan-300">{item.aiTriage.classification}</span>
              </p>
              <p className="text-xs text-white/60 mt-2 font-light">
                Recommendation: Standard policy clauses match handbook article. Response staged in triage queue.
              </p>
            </div>
          )}

          {/* Communication & Comments Thread */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-mono uppercase tracking-wider text-white/70 flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-cyan-400" />
                <span>Ticket Communication Thread ({comments.length})</span>
              </h4>
              <span className="text-[10px] font-mono text-white/40">
                Replying as: <strong className="text-cyan-300">{user?.name || 'HR Specialist'}</strong> ({user?.isHr ? 'HR' : 'Employee'})
              </span>
            </div>

            {/* Comment list */}
            <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
              {comments.length === 0 ? (
                <div className="p-4 rounded-xl bg-black/20 border border-white/5 text-center text-xs text-white/40 font-mono">
                  No comments yet in this conversation thread.
                </div>
              ) : (
                comments.map((c, idx) => (
                  <div
                    key={c.id || idx}
                    className={`p-3.5 rounded-2xl border text-xs transition-all ${
                      c.isHr
                        ? 'bg-gradient-to-r from-purple-950/30 to-indigo-950/20 border-purple-500/30 ml-4'
                        : 'bg-white/[0.03] border-white/10 mr-4'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        {c.avatar ? (
                          <img
                            src={c.avatar}
                            alt={c.author}
                            className="w-5 h-5 rounded-full object-cover ring-1 ring-white/20"
                          />
                        ) : (
                          <User className="w-4 h-4 text-white/60" />
                        )}
                        <span className="font-semibold text-white">{c.author}</span>
                        {c.authorId && (
                          <span className="text-[9px] font-mono text-white/40">({c.authorId})</span>
                        )}
                        {c.isHr ? (
                          <span className="px-1.5 py-0.2 rounded-full text-[9px] font-mono bg-purple-500/20 text-purple-300 border border-purple-400/30 font-semibold">
                            HR Specialist
                          </span>
                        ) : (
                          <span className="px-1.5 py-0.2 rounded-full text-[9px] font-mono bg-teal-500/20 text-teal-300 border border-teal-500/30">
                            Employee
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] font-mono text-white/40 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {c.time || 'Just now'}
                      </span>
                    </div>
                    <p className="text-white/80 leading-relaxed pl-7">{c.text}</p>
                  </div>
                ))
              )}
            </div>

            {/* Post comment input */}
            <form onSubmit={handlePostComment} className="flex gap-2">
              <input
                type="text"
                value={newCommentText}
                onChange={(e) => setNewCommentText(e.target.value)}
                placeholder={`Post update to thread as ${user?.name || 'HR Specialist'}...`}
                className="flex-1 px-3.5 py-2 rounded-xl bg-black/40 border border-white/15 text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-neon-cyan"
              />
              <button
                type="submit"
                disabled={!newCommentText.trim() || isSubmittingComment}
                className="px-3.5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-neon-cyan"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send</span>
              </button>
            </form>
          </div>

          {/* Action Resolution Form */}
          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-white/70 mb-2">
              HR Resolution Notes (Signing Off as {user?.name || 'Sarah Jenkins'})
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Verified policy guidelines and executed request resolution..."
              className="w-full p-3.5 rounded-2xl bg-black/40 border border-white/15 text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-neon-cyan"
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-white/10 bg-black/50 flex flex-wrap items-center justify-between gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 text-xs font-medium transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <div className="flex items-center gap-2">
            <button
              disabled={isSubmitting}
              onClick={() => {
                alert(`Case ${item.id} escalated to Tier-2 Operations Lead.`);
                onClose();
              }}
              className="px-3.5 py-2.5 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-300 text-xs font-medium transition-all cursor-pointer"
            >
              Escalate
            </button>
            <button
              disabled={isSubmitting}
              onClick={handleResolve}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-semibold text-xs shadow-neon-emerald transition-all cursor-pointer"
            >
              {isSubmitting ? 'Resolving...' : `Approve & Resolve as ${user?.name || 'HR'}`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};