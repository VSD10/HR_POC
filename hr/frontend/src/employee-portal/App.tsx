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
import { useAuth } from '../context/AuthContext';
import { hrService } from '../services/hrService';

export default function EmployeePortalApp() {
  const { user } = useAuth();

  // Navigation State
  const [activeScreen, setActiveScreen] = useState<ScreenId>('dashboard');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Sync user name if available
  useEffect(() => {
    if (user?.name) {
      CURRENT_USER.name = user.name;
      CURRENT_USER.email = user.email || CURRENT_USER.email;
    }
  }, [user]);

  // Real-time live synchronization with central HR desk
  useEffect(() => {
    const unsubscribe = hrService.subscribe((event) => {
      if (event.type === 'REQUEST_CREATED') {
        const item = event.data?.request;
        if (item) {
          setRequests((prev) => {
            if (prev.some((r) => r.id === item.id || (r.id && item.id && r.id.toLowerCase() === item.id.toLowerCase()))) {
              return prev;
            }
            const cat = item.category === 'leave' ? 'Leave & Time'
              : item.category === 'payroll' ? 'Payroll'
              : item.category === 'benefits' ? 'Employee Info'
              : item.category === 'documents' ? 'Documents'
              : 'Leave & Time';

            const newHrReq: HrRequest = {
              id: item.id,
              subject: item.subject || item.title || 'HR Inquiry',
              category: cat,
              status: 'SUBMITTED',
              priority: item.priority === 'high' ? 'High' : 'Medium',
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
            const updatedList = [newHrReq, ...prev];
            try { localStorage.setItem('hr_employee_portal_requests', JSON.stringify(updatedList)); } catch {}
            return updatedList;
          });
        }
      }

      if (event.type === 'REQUEST_UPDATED') {
        const updated = event.data?.request;
        if (updated) {
          const newStatus: any = (updated.status === 'resolved' || updated.statusUpper === 'RESOLVED')
            ? 'RESOLVED'
            : (updated.status === 'in_review' || updated.statusUpper === 'IN PROGRESS')
            ? 'IN PROGRESS'
            : 'SUBMITTED';

          setRequests((prev) => {
            const next = prev.map((r) => {
              const isMatch = r.id === updated.id || 
                              (r.id && updated.id && r.id.toLowerCase() === updated.id.toLowerCase()) ||
                              (r.subject && updated.title && r.subject === updated.title);

              if (isMatch) {
                return {
                  ...r,
                  id: updated.id || r.id,
                  status: newStatus,
                  timeline: Array.isArray(updated.timeline) && updated.timeline.length ? updated.timeline : [
                    ...r.timeline,
                    {
                      date: new Date().toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' }),
                      title: 'Status Updated: ' + newStatus,
                      desc: updated.resolutionNotes || 'HR Operations verified and processed this ticket.',
                      actor: 'HR Specialist'
                    }
                  ],
                  comments: Array.isArray(updated.comments) ? updated.comments : r.comments
                };
              }
              return r;
            });
            try { localStorage.setItem('hr_employee_portal_requests', JSON.stringify(next)); } catch {}
            return next;
          });

          showToast(`🎉 HR Desk updated ticket ${updated.id} to ${newStatus}`);
        }
      }
    });
    return unsubscribe;
  }, []);

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

  // Load from Central Sync Server / Database on Mount
  useEffect(() => {
    async function loadRequestsFromDatabase() {
      try {
        const serverReqs = await hrService.getRequests();
        if (Array.isArray(serverReqs)) {
          const mapped: HrRequest[] = serverReqs.map((r: any) => {
            const cat = r.category === 'leave' ? 'Leave & Time'
              : r.category === 'payroll' ? 'Payroll'
              : r.category === 'benefits' ? 'Employee Info'
              : r.category === 'documents' ? 'Documents'
              : (r.category as any) || 'Leave & Time';

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
      } catch (err) {
        console.warn('Could not fetch initial requests from server:', err);
      }
    }
    loadRequestsFromDatabase();
  }, []);

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
          actor: user?.name || CURRENT_USER.name,
        },
      ],
      comments: [],
      attachmentName: newReqData.attachmentName,
    };

    setRequests((prev) => {
      const updated = [fullReq, ...prev.filter(r => r.id !== fullReq.id)];
      try { localStorage.setItem('hr_employee_portal_requests', JSON.stringify(updated)); } catch {}
      return updated;
    });

    // Synchronize to Enterprise HR Service Desk & Database
    try {
      await hrService.createRequest({
        id: fullReq.id,
        title: fullReq.subject,
        category:
          fullReq.category === 'Leave & Time'
            ? 'leave'
            : fullReq.category === 'Payroll'
            ? 'payroll'
            : fullReq.category === 'Employee Info'
            ? 'benefits'
            : fullReq.category === 'Documents'
            ? 'documents'
            : 'other',
        priority:
          fullReq.priority === 'Urgent'
            ? 'high'
            : (fullReq.priority.toLowerCase() as 'low' | 'medium' | 'high') ||
              'medium',
        description: fullReq.description,
        timeline: fullReq.timeline,
        attachmentName: fullReq.attachmentName,
        employee: {
          id: user?.id || CURRENT_USER.employeeId,
          name: user?.name || CURRENT_USER.name,
          department: CURRENT_USER.department,
          email: user?.email || CURRENT_USER.email,
          avatar: user?.avatarUrl || ASSETS.avatar,
        },
      });
    } catch (err) {
      console.warn('Could not sync request to HR service:', err);
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

  const handleAddCommentToRequest = (requestId: string, commentText: string) => {
    setRequests((prev) => {
      const next = prev.map((r) => {
        if (r.id === requestId) {
          const updatedComments = [
            ...r.comments,
            {
              id: `comm-${Date.now()}`,
              author: user?.name || CURRENT_USER.name,
              avatar: user?.avatarUrl || ASSETS.avatar,
              text: commentText,
              time: 'Just now',
              isHr: false,
            },
          ];
          const updatedReq = {
            ...r,
            lastUpdated: 'Just now',
            comments: updatedComments,
          };
          if (selectedRequest && selectedRequest.id === requestId) {
            setSelectedRequest(updatedReq);
          }
          fetch(`http://localhost:8000/api/v1/requests/${encodeURIComponent(requestId)}/comments`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              author: user?.name || CURRENT_USER.name,
              avatar: user?.avatarUrl || ASSETS.avatar,
              text: commentText,
              isHr: false
            })
          }).catch(() => {});
          return updatedReq;
        }
        return r;
      });
      try { localStorage.setItem('hr_employee_portal_requests', JSON.stringify(next)); } catch {}
      return next;
    });
    showToast('Response posted to ticket thread');
  };

  const handleApplyLeaveSubmit = (
    newRequest: Partial<HrRequest>,
    daysCount: number,
    leaveType: 'casual' | 'sick' | 'earned'
  ) => {
    // Deduct leave balance
    setLeaveBalance((prev) => {
      const current = prev[leaveType];
      const remaining = Math.max(0, current.remaining - daysCount);
      return {
        ...prev,
        [leaveType]: {
          ...current,
          remaining,
        },
      };
    });

    handleAddRequest(newRequest);
    setShowApplyLeaveModal(false);
  };

  const handleBankUpdateSubmit = (bankRequest: Partial<HrRequest>) => {
    handleAddRequest(bankRequest);
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
          balance={leaveBalance}
          onClose={() => setShowApplyLeaveModal(false)}
          onSubmitLeave={handleApplyLeaveSubmit}
        />
      )}

      {/* Payslip Modal */}
      {showPayslipModal && (
        <PayslipModal onClose={() => setShowPayslipModal(false)} />
      )}

      {/* Update Bank Modal */}
      {showUpdateBankModal && (
        <UpdateBankModal
          onClose={() => setShowUpdateBankModal(false)}
          onSubmitBankUpdate={handleBankUpdateSubmit}
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
