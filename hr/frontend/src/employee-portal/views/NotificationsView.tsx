import React, { useState } from 'react';
import {
  Bell,
  CheckCheck,
  Filter,
  FileText,
  Calendar,
  Info,
  Clock,
  ArrowRight,
} from 'lucide-react';
import { NotificationItem, HrRequest, PolicyItem, ScreenId } from '../types';

interface NotificationsViewProps {
  notifications: NotificationItem[];
  requests: HrRequest[];
  policies: PolicyItem[];
  onSelectRequest: (request: HrRequest) => void;
  onSelectPolicy: (policy: PolicyItem) => void;
  onMarkAllAsRead: () => void;
  onMarkSingleAsRead: (id: string) => void;
}

export const NotificationsView: React.FC<NotificationsViewProps> = ({
  notifications,
  requests,
  policies,
  onSelectRequest,
  onSelectPolicy,
  onMarkAllAsRead,
  onMarkSingleAsRead,
}) => {
  const [filterUnreadOnly, setFilterUnreadOnly] = useState(false);

  const displayedNotifs = filterUnreadOnly
    ? notifications.filter((n) => !n.read)
    : notifications;

  const handleClickNotif = (notif: NotificationItem) => {
    onMarkSingleAsRead(notif.id);
    if (notif.requestId) {
      const found = requests.find((r) => r.id === notif.requestId);
      if (found) onSelectRequest(found);
    } else if (notif.type === 'policy') {
      const pol = policies.find((p) => p.id === 'pol-3') || policies[0];
      onSelectPolicy(pol);
    }
  };

  return (
    <div className="w-full max-w-[1560px] mx-auto space-y-6">
      <div className="crystal-glass rounded-2xl p-6 shadow-glass flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-[24px] font-bold text-[#0F172A]">Notifications</h1>
            {notifications.filter((n) => !n.read).length > 0 && (
              <span className="bg-[#0D9488] text-white text-[11px] font-bold px-2 py-0.5 rounded-full">
                {notifications.filter((n) => !n.read).length} new
              </span>
            )}
          </div>
          <p className="text-[13px] text-[#334155] mt-0.5">
            Stay updated on ticket progress, approval milestones, and company policy bulletins.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setFilterUnreadOnly(!filterUnreadOnly)}
            className={`px-3.5 py-2 rounded-xl text-[13px] font-semibold border transition-all ${
              filterUnreadOnly
                ? 'bg-teal-50 text-[#0D9488] border-teal-200'
                : 'bg-white/70 text-slate-700 border-white hover:bg-white'
            }`}
          >
            {filterUnreadOnly ? 'Showing Unread' : 'Filter Unread'}
          </button>
          <button
            onClick={onMarkAllAsRead}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#0F172A] hover:bg-slate-800 text-white text-[13px] font-semibold transition-all shadow-sm"
          >
            <CheckCheck className="w-4 h-4" />
            <span>Mark All as Read</span>
          </button>
        </div>
      </div>

      {/* Feed */}
      <div className="crystal-glass rounded-2xl shadow-glass p-4 sm:p-6 space-y-2.5 border border-white">
        {displayedNotifs.map((item) => (
          <div
            key={item.id}
            onClick={() => handleClickNotif(item)}
            className={`p-4 rounded-xl transition-all flex items-start justify-between gap-4 cursor-pointer border ${
              !item.read
                ? 'bg-white/80 hover:bg-white border-white shadow-2xs'
                : 'hover:bg-white/60 border-transparent text-slate-700'
            }`}
          >
            <div className="flex items-start gap-3.5 min-w-0">
              <span
                className={`w-2.5 h-2.5 mt-1.5 rounded-full flex-shrink-0 ${
                  !item.read ? 'bg-[#0D9488]' : 'bg-slate-300'
                }`}
              />
              <div className="space-y-0.5 min-w-0">
                <p className="text-[14px] font-medium text-[#0F172A] leading-snug">
                  {item.title}
                </p>
                <div className="flex items-center gap-2 text-[12px] text-slate-400">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{item.time}</span>
                  {item.requestId && (
                    <>
                      <span>•</span>
                      <span className="font-mono font-semibold text-slate-600">
                        {item.requestId}
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>

            <button className="text-slate-400 hover:text-slate-700 p-1 flex-shrink-0">
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        ))}

        {displayedNotifs.length === 0 && (
          <div className="p-12 text-center text-slate-500">
            <Bell className="w-8 h-8 mx-auto text-slate-300 mb-2" />
            <p className="text-[15px] font-medium text-[#0F172A]">All caught up!</p>
            <p className="text-[13px] text-slate-400">No unread notifications at this time.</p>
          </div>
        )}
      </div>
    </div>
  );
};
