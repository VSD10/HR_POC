import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { DashboardView } from './views/DashboardView';
import { AskHrView } from './views/AskHrView';
import { RaiseRequestView } from './views/RaiseRequestView';
import { MyRequestsView } from './views/MyRequestsView';
import { NotificationsView } from './views/NotificationsView';
import { KnowledgeHubView } from './views/KnowledgeHubView';
import { MyProfileView } from './views/MyProfileView';
import { HelpSupportView } from './views/HelpSupportView';

// Modals
import { RequestDetailsModal } from './components/RequestDetailsModal';
import { ApplyLeaveModal } from './components/ApplyLeaveModal';
import { PayslipModal } from './components/PayslipModal';
import { PolicyReaderModal } from './components/PolicyReaderModal';
import { UpdateBankModal } from './components/UpdateBankModal';
import { QuickSearchModal } from './components/QuickSearchModal';

import {
  HrRequest,
  NotificationItem,
  PolicyItem,
  ScreenId,
  LeaveBalance,
  RequestCategory,
} from './types';
import {
  INITIAL_REQUESTS,
  INITIAL_NOTIFICATIONS,
  UPCOMING_HOLIDAYS,
  INITIAL_LEAVE_BALANCE,
  POLICIES,
  CURRENT_USER,
  ASSETS,
} from './data/mockData';

export default function App() {
  // Navigation State
  const [activeScreen, setActiveScreen] = useState<ScreenId>('dashboard');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Core Data State - with localStorage persistence
  const [requests, setRequests] = useState<HrRequest[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const cached = localStorage.getItem('hr_employee_portal_requests');
        if (cached) {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
      } catch {}
    }
    return INITIAL_REQUESTS;
  });

  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);
  const [leaveBalance, setLeaveBalance] = useState<LeaveBalance>(INITIAL_LEAVE_BALANCE);
  const [policies, setPolicies] = useState<PolicyItem[]>(POLICIES);

  // Modal States
  const [selectedRequest, setSelectedRequest] = useState<HrRequest | null>(null);
  const [selectedPolicy, setSelectedPolicy] = useState<PolicyItem | null>(null);
  const [showApplyLeaveModal, setShowApplyLeaveModal] = useState(false);
  const [showPayslipModal, setShowPayslipModal] = useState(false);
  const [showUpdateBankModal, setShowUpdateBankModal] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    try {
      return localStorage.getItem('hr_sidebar_collapsed') === 'true';
    } catch {
      return false;
    }
  });

  const handleToggleSidebarCollapse = () => {
    setIsSidebarCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('hr_sidebar_collapsed', String(next));
      } catch {}
      return next;
    });
  };

  // Pre-fill state for Raise Request
  const [raiseRequestTopic, setRaiseRequestTopic] = useState<{
    subject: string;
    category: RequestCategory;
  }>({
    subject: '',
    category: 'Leave & Time',
  });

  // Toast Notification state
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((current) => (current === msg ? null : current));
    }, 4000);
  };

  // Load from Central Sync Server / Database on Mount
  useEffect(() => {
    async function loadRequestsFromDatabase() {
      try {
        const res = await fetch('http://localhost:8000/api/v1/requests');
        if (res.ok) {
          const serverReqs = await res.json();
          if (Array.isArray(serverReqs)) {
            const mapped: HrRequest[] = serverReqs.map((r: any) => {
              const cat = (r.category === 'leave' || r.category?.toLowerCase() === 'leave') ? 'Leave & Time'
                : (r.category === 'payroll' || r.category?.toLowerCase() === 'payroll') ? 'Payroll'
                : (r.category === 'benefits' || r.category?.toLowerCase() === 'benefits' || r.category === 'Employee Info') ? 'Employee Info'
                : (r.category === 'documents' || r.category?.toLowerCase() === 'documents') ? 'Documents'
                : (r.category === 'compliance' || r.category === 'HR Policies') ? 'HR Policies'
                : r.categoryDisplay || (r.category as any) || 'Leave & Time';

              const status: any = (r.status === 'resolved' || r.statusUpper === 'RESOLVED')
                ? 'RESOLVED'
                : (r.status === 'in_review' || r.statusUpper === 'IN PROGRESS')
                ? 'IN PROGRESS'
                : 'SUBMITTED';

              const prio = r.priority === 'high' ? 'High' : r.priority === 'urgent' ? 'Urgent' : r.priority === 'low' ? 'Low' : 'Medium';

              return {
                id: r.id,
                subject: r.subject || r.title || 'HR Inquiry',
                category: cat,
                status,
                priority: prio,
                lastUpdated: r.waitingTime || 'Recent',
                createdDate: r.createdDate || (r.createdAt ? new Date(r.createdAt).toLocaleDateString() : 'Today'),
                description: r.description || '',
                assignedTo: r.assignedTo || (status === 'RESOLVED' ? 'Resolved by HR Operations' : 'Triage Queue (HR Operations)'),
                timeline: Array.isArray(r.timeline) && r.timeline.length ? r.timeline : [
                  {
                    date: r.createdDate || 'Today',
                    title: 'Request Created',
                    desc: 'Submitted through HR Service Desk self-service portal.',
                    actor: r.employee?.name || CURRENT_USER.name,
                  }
                ],
                comments: Array.isArray(r.comments) ? r.comments : [],
                attachmentName: r.attachmentName
              };
            });

            setRequests(mapped);
            try {
              localStorage.setItem('hr_employee_portal_requests', JSON.stringify(mapped));
            } catch {}
          }
        }
      } catch (err) {
        console.warn('Could not fetch initial requests from server:', err);
      }
    }
    loadRequestsFromDatabase();
  }, []);

  // Real-time live synchronization with central HR desk & database with auto-reconnect
  useEffect(() => {
    let es: EventSource | null = null;
    let reconnectTimer: any = null;

    const connect = () => {
      try {
        if (es) {
          try { es.close(); } catch {}
        }
        es = new EventSource('http://localhost:8000/api/v1/stream');

        es.onopen = () => {
          console.log('[Employee Portal] Connected to Central HR Sync Stream');
        };

        es.addEventListener('REQUEST_UPDATED', (e: MessageEvent) => {
          try {
            const payload = JSON.parse(e.data);
            const updated = payload.request;
            if (updated) {
              const newStatus: any = (updated.status === 'resolved' || updated.statusUpper === 'RESOLVED')
                ? 'RESOLVED'
                : (updated.status === 'in_review' || updated.statusUpper === 'IN PROGRESS')
                ? 'IN PROGRESS'
                : 'SUBMITTED';

              setRequests((prev) => {
                const next = prev.map((r) => {
                  const isMatch = r.id === updated.id || 
                                  (r.id && updated.id && r.id.toLowerCase() === updated.id.toLowerCase());
                  if (isMatch) {
                    return {
                      ...r,
                      status: newStatus,
                      timeline: Array.isArray(updated.timeline) && updated.timeline.length ? updated.timeline : r.timeline,
                      comments: Array.isArray(updated.comments) ? updated.comments : r.comments
                    };
                  }
                  return r;
                });
                try { localStorage.setItem('hr_employee_portal_requests', JSON.stringify(next)); } catch {}
                return next;
              });

              if (selectedRequest && (selectedRequest.id === updated.id || selectedRequest.id.toLowerCase() === updated.id.toLowerCase())) {
                setSelectedRequest((prev) => prev ? {
                  ...prev,
                  status: newStatus,
                  timeline: Array.isArray(updated.timeline) && updated.timeline.length ? updated.timeline : prev.timeline,
                  comments: Array.isArray(updated.comments) ? updated.comments : prev.comments
                } : null);
              }

              showToast(`🎉 HR Desk updated ticket ${updated.id} to ${newStatus}`);
            }
          } catch {}
        });

        es.addEventListener('REQUEST_CREATED', (e: MessageEvent) => {
          try {
            const payload = JSON.parse(e.data);
            const item = payload.request;
            if (item) {
              setRequests((prev) => {
                if (prev.some((r) => r.id === item.id || (r.id && item.id && r.id.toLowerCase() === item.id.toLowerCase()))) {
                  return prev;
                }
                const cat = item.category === 'leave' ? 'Leave & Time'
                  : item.category === 'payroll' ? 'Payroll'
                  : item.category === 'benefits' ? 'Employee Info'
                  : item.category === 'documents' ? 'Documents'
                  : item.category === 'compliance' ? 'HR Policies'
                  : item.categoryDisplay || item.category || 'Leave & Time';

                const newHrReq: HrRequest = {
                  id: item.id,
                  subject: item.subject || item.title || 'HR Inquiry',
                  category: cat,
                  status: 'SUBMITTED',
                  priority: item.priority === 'high' ? 'High' : item.priority === 'low' ? 'Low' : 'Medium',
                  lastUpdated: 'Just now',
                  createdDate: 'Today',
                  description: item.description || '',
                  assignedTo: 'Triage Queue (HR Operations)',
                  timeline: item.timeline || [
                    {
                      date: 'Just now',
                      title: 'Request Created',
                      desc: 'Submitted through HR Service Desk self-service portal.',
                      actor: item.employee?.name || CURRENT_USER.name,
                    }
                  ],
                  comments: item.comments || []
                };
                const next = [newHrReq, ...prev];
                try { localStorage.setItem('hr_employee_portal_requests', JSON.stringify(next)); } catch {}
                return next;
              });
            }
          } catch {}
        });

        es.onerror = () => {
          if (es) {
            try { es.close(); } catch {}
            es = null;
          }
          if (!reconnectTimer) {
            reconnectTimer = setTimeout(() => {
              reconnectTimer = null;
              connect();
            }, 3000);
          }
        };
      } catch {
        if (!reconnectTimer) {
          reconnectTimer = setTimeout(() => {
            reconnectTimer = null;
            connect();
          }, 5000);
        }
      }
    };

    connect();

    return () => {
      if (reconnectTimer) clearTimeout(reconnectTimer);
      if (es) {
        try { es.close(); } catch {}
      }
    };
  }, [selectedRequest]);

  // Handlers
  const handleAddRequest = async (newReqData: Partial<HrRequest>) => {
    const reqId = newReqData.id || `REQ-${Math.floor(1000 + Math.random() * 9000)}`;
    const fullReq: HrRequest = {
      id: reqId,
      subject: newReqData.subject || 'Untitled Request',
      category: newReqData.category || 'Leave & Time',
      status: newReqData.status || 'SUBMITTED',
      priority: newReqData.priority || 'Medium',
      lastUpdated: 'Just now',
      createdDate: new Date().toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' }),
      description: newReqData.description || '',
      assignedTo: 'Triage Queue (HR Operations)',
      timeline: [
        {
          date: new Date().toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' }),
          title: 'Request Created',
          desc: 'Submitted through HR Service Desk self-service portal.',
          actor: CURRENT_USER.name,
        },
      ],
      comments: [],
      attachmentName: newReqData.attachmentName,
    };

    setRequests((prev) => {
      const next = [fullReq, ...prev.filter(r => r.id !== fullReq.id)];
      try { localStorage.setItem('hr_employee_portal_requests', JSON.stringify(next)); } catch {}
      return next;
    });

    // Synchronize to Enterprise HR Service Desk & Central Database
    try {
      const response = await fetch('http://localhost:8000/api/v1/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: fullReq.id,
          title: fullReq.subject,
          subject: fullReq.subject,
          category: fullReq.category,
          priority: fullReq.priority,
          status: 'open',
          statusUpper: 'SUBMITTED',
          description: fullReq.description,
          timeline: fullReq.timeline,
          attachmentName: fullReq.attachmentName,
          employee: {
            id: CURRENT_USER.id,
            name: CURRENT_USER.name,
            department: CURRENT_USER.department,
            email: CURRENT_USER.email,
            avatar: CURRENT_USER.avatar,
            avatarUrl: CURRENT_USER.avatar
          }
        })
      });
      if (response.ok) {
        console.log('[Employee Portal] Successfully dispatched ticket to Central HR Desk:', fullReq.id);
      }
    } catch (err) {
      console.error('[Employee Portal] Failed to sync ticket to central server:', err);
    }

    // Add notification
    const newNotif: NotificationItem = {
      id: `notif-${Date.now()}`,
      title: `Ticket ${fullReq.id} logged: "${fullReq.subject}"`,
      time: 'Just now',
      read: false,
      requestId: fullReq.id,
      type: 'request',
    };
    setNotifications((prev) => [newNotif, ...prev]);

    showToast(`Request ${fullReq.id} submitted successfully!`);
  };

  const handleAddCommentToRequest = async (requestId: string, commentText: string) => {
    const newComment = {
      id: `comm-${Date.now()}`,
      author: CURRENT_USER.name,
      avatar: ASSETS.avatar,
      text: commentText,
      time: 'Just now',
      isHr: false,
    };

    setRequests((prev) => {
      const next = prev.map((r) => {
        if (r.id === requestId) {
          const updatedComments = [
            ...(r.comments || []),
            newComment,
          ];
          const updatedReq = {
            ...r,
            lastUpdated: 'Just now',
            comments: updatedComments,
          };
          if (selectedRequest && selectedRequest.id === requestId) {
            setSelectedRequest(updatedReq);
          }
          return updatedReq;
        }
        return r;
      });
      try { localStorage.setItem('hr_employee_portal_requests', JSON.stringify(next)); } catch {}
      return next;
    });

    // Sync comment to Central Server
    try {
      await fetch(`http://localhost:8000/api/v1/requests/${encodeURIComponent(requestId)}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          author: CURRENT_USER.name,
          avatar: ASSETS.avatar,
          text: commentText,
          isHr: false
        })
      });
    } catch (err) {
      console.error('[Employee Portal] Failed to sync comment to server:', err);
    }

    showToast('Response posted to ticket thread');
  };

  const handleApplyLeaveSubmit = (leaveData: {
    type: 'casual' | 'sick' | 'earned';
    startDate: string;
    endDate: string;
    daysCount: number;
    reason: string;
  }) => {
    // Deduct leave balance
    setLeaveBalance((prev) => {
      const current = prev[leaveData.type];
      const remaining = Math.max(0, current.remaining - leaveData.daysCount);
      const used = (current.used ?? 0) + leaveData.daysCount;
      return {
        ...prev,
        [leaveData.type]: {
          ...current,
          remaining,
          used,
        },
      };
    });

    // Create an automatic HR Request for the leave
    const newId = `REQ-${Math.floor(1030 + Math.random() * 500)}`;
    const leaveName =
      leaveData.type === 'casual'
        ? 'Casual Leave'
        : leaveData.type === 'sick'
        ? 'Sick Leave'
        : 'Earned Leave';

    handleAddRequest({
      id: newId,
      subject: `${leaveName} application (${leaveData.daysCount} days: ${leaveData.startDate} to ${leaveData.endDate})`,
      category: 'Leave & Time',
      priority: 'Medium',
      description: `Leave Type: ${leaveName}\nDuration: ${leaveData.daysCount} days\nDate Range: ${leaveData.startDate} to ${leaveData.endDate}\nReason: ${leaveData.reason}`,
      status: 'SUBMITTED',
    });

    setShowApplyLeaveModal(false);
  };

  const handleBankUpdateSubmit = (bankData: {
    accountNumber: string;
    ifsc: string;
    bankName: string;
    cancelledChequeName?: string;
  }) => {
    CURRENT_USER.bankName = bankData.bankName;
    CURRENT_USER.ifsc = bankData.ifsc;
    CURRENT_USER.accountNumberMasked = `•••• •••• ${bankData.accountNumber.slice(-4)}`;

    // Create an audit ticket
    handleAddRequest({
      subject: `Bank account update verification (${bankData.bankName} - ending in ${bankData.accountNumber.slice(-4)})`,
      category: 'Employee Info',
      priority: 'High',
      description: `Employee requested change of payroll salary bank account.\nBank: ${bankData.bankName}\nIFSC: ${bankData.ifsc}\nAccount ending in: ${bankData.accountNumber.slice(-4)}\nSupporting document: ${bankData.cancelledChequeName || 'Cancelled Cheque Attached'}`,
      attachmentName: bankData.cancelledChequeName,
      status: 'IN PROGRESS',
    });

    setShowUpdateBankModal(false);
    showToast('Bank details submitted for HR & Payroll validation');
  };

  const handleMarkAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    showToast('All notifications marked as read');
  };

  const handleMarkSingleNotificationRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const handleRaiseRequestFromPrompt = (topic: string, category: string) => {
    setRaiseRequestTopic({
      subject: topic,
      category: category as RequestCategory,
    });
    setActiveScreen('raise-request');
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[var(--background)] font-sans text-[var(--text-primary)] antialiased selection:bg-teal-500 selection:text-white p-2 sm:p-3 md:gap-3 gap-0 transition-colors duration-200">
      {/* 1. SIDEBAR (Dedicated Left Column) */}
      <Sidebar
        activeScreen={activeScreen}
        onNavigate={(screen) => {
          setActiveScreen(screen);
          setIsMobileSidebarOpen(false);
        }}
        unreadCount={unreadCount}
        isMobileOpen={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
        onOpenApplyLeave={() => setShowApplyLeaveModal(true)}
        onOpenPayslip={() => setShowPayslipModal(true)}
        onOpenBankUpdate={() => setShowUpdateBankModal(true)}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={handleToggleSidebarCollapse}
      />

      {/* 2. MAIN WORKSPACE CONTAINER */}
      <div className="flex-1 flex flex-col h-full overflow-hidden min-w-0 transition-all duration-300">
        {/* TOP HEADER */}
        <Header
          activeScreen={activeScreen}
          unreadCount={unreadCount}
          onOpenSearch={() => setShowSearchModal(true)}
          onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)}
          onNavigate={(screen) => setActiveScreen(screen)}
        />

        {/* SCROLLABLE MAIN CONTENT AREA */}
        <main className={`flex-1 min-h-0 px-1 sm:px-2.5 ${activeScreen === 'ask-hr' ? 'overflow-hidden pb-1' : 'overflow-y-auto pb-5'}`}>
          {activeScreen === 'dashboard' && (
            <DashboardView
              requests={requests}
              notifications={notifications}
              holidays={UPCOMING_HOLIDAYS}
              leaveBalance={leaveBalance}
              policies={policies}
              onSelectRequest={(req) => setSelectedRequest(req)}
              onSelectPolicy={(pol) => setSelectedPolicy(pol)}
              onNavigate={(s) => setActiveScreen(s)}
              onOpenApplyLeave={() => setShowApplyLeaveModal(true)}
              onOpenPayslip={() => setShowPayslipModal(true)}
              onOpenBankUpdate={() => setShowUpdateBankModal(true)}
            />
          )}

          {activeScreen === 'ask-hr' && (
            <AskHrView
              onRaiseRequestWithTopic={handleRaiseRequestFromPrompt}
              onNavigate={(s) => setActiveScreen(s)}
              onOpenApplyLeave={() => setShowApplyLeaveModal(true)}
              onOpenPayslip={() => setShowPayslipModal(true)}
              onSelectPolicy={(pol) => setSelectedPolicy(pol)}
              policies={policies}
              leaveBalance={leaveBalance}
            />
          )}

          {activeScreen === 'raise-request' && (
            <RaiseRequestView
              initialSubject={raiseRequestTopic.subject}
              initialCategory={raiseRequestTopic.category}
              onSubmitRequest={handleAddRequest}
              onNavigate={(s) => setActiveScreen(s)}
            />
          )}

          {activeScreen === 'my-requests' && (
            <MyRequestsView
              requests={requests}
              onSelectRequest={(req) => setSelectedRequest(req)}
              onNavigate={(s) => setActiveScreen(s)}
            />
          )}

          {activeScreen === 'notifications' && (
            <NotificationsView
              notifications={notifications}
              requests={requests}
              policies={policies}
              onSelectRequest={(req) => setSelectedRequest(req)}
              onSelectPolicy={(pol) => setSelectedPolicy(pol)}
              onMarkAllAsRead={handleMarkAllNotificationsRead}
              onMarkSingleAsRead={handleMarkSingleNotificationRead}
            />
          )}

          {activeScreen === 'knowledge-hub' && (
            <KnowledgeHubView
              policies={policies}
              onSelectPolicy={(pol) => setSelectedPolicy(pol)}
            />
          )}

          {activeScreen === 'my-profile' && (
            <MyProfileView
              leaveBalance={leaveBalance}
              onOpenBankUpdate={() => setShowUpdateBankModal(true)}
              onOpenApplyLeave={() => setShowApplyLeaveModal(true)}
              onNavigate={(s) => setActiveScreen(s)}
            />
          )}

          {activeScreen === 'help-support' && (
            <HelpSupportView onNavigate={(s) => setActiveScreen(s)} />
          )}
        </main>
      </div>

      {/* 3. MODALS */}
      {/* Request Details Modal */}
      {selectedRequest && (
        <RequestDetailsModal
          request={selectedRequest}
          onClose={() => setSelectedRequest(null)}
          onAddComment={(comment) =>
            handleAddCommentToRequest(selectedRequest.id, comment)
          }
        />
      )}

      {/* Apply Leave Modal */}
      {showApplyLeaveModal && (
        <ApplyLeaveModal
          leaveBalance={leaveBalance}
          onClose={() => setShowApplyLeaveModal(false)}
          onSubmit={handleApplyLeaveSubmit}
        />
      )}

      {/* Payslip Modal */}
      {showPayslipModal && (
        <PayslipModal onClose={() => setShowPayslipModal(false)} />
      )}

      {/* Update Bank Modal */}
      {showUpdateBankModal && (
        <UpdateBankModal
          currentBank={CURRENT_USER.bankName}
          currentAccountMasked={CURRENT_USER.accountNumberMasked}
          currentIfsc={CURRENT_USER.ifsc}
          onClose={() => setShowUpdateBankModal(false)}
          onSubmit={handleBankUpdateSubmit}
        />
      )}

      {/* Policy Reader Modal */}
      {selectedPolicy && (
        <PolicyReaderModal
          policy={selectedPolicy}
          onClose={() => setSelectedPolicy(null)}
        />
      )}

      {/* Quick Search (⌘K) Modal */}
      {showSearchModal && (
        <QuickSearchModal
          onClose={() => setShowSearchModal(false)}
          requests={requests}
          policies={policies}
          onSelectRequest={(req) => setSelectedRequest(req)}
          onSelectPolicy={(pol) => setSelectedPolicy(pol)}
          onNavigate={(screen) => setActiveScreen(screen)}
          onOpenQuickAction={(action) => {
            if (action === 'leave') setShowApplyLeaveModal(true);
            if (action === 'payslip') setShowPayslipModal(true);
            if (action === 'bank') setShowUpdateBankModal(true);
          }}
        />
      )}

      {/* 4. TOAST NOTIFICATION */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl bg-[#0F172A] text-white text-[13px] shadow-2xl border border-slate-700 animate-in fade-in slide-in-from-bottom-4">
          <span className="w-2 h-2 rounded-full bg-[#0D9488] animate-pulse"></span>
          <span>{toastMessage}</span>
          <button
            onClick={() => setToastMessage(null)}
            className="ml-2 text-slate-400 hover:text-white text-[11px]"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
}
