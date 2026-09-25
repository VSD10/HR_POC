import {
  DashboardMetrics,
  VelocityData,
  RequestItem,
  RequestComment,
  AITriageItem,
  DeliverableItem,
  HRActionItem,
  InsightItem,
  CategoryVolume,
  ActivityEvent,
  CopilotMessage
} from '../types/hr';
import {
  initialMetrics,
  velocityDataset,
  initialRequests,
  initialTriageQueue,
  initialDeliverables,
  initialHRActions,
  initialInsights,
  initialCategoryVolumes,
  initialActivities,
  initialCopilotMessages
} from './mockData';
import { request, IS_MOCK_MODE } from './apiClient';

// In-memory state for reactive local mock mode
let state = {
  metrics: { ...initialMetrics },
  requests: [...initialRequests],
  triageQueue: [...initialTriageQueue],
  deliverables: [...initialDeliverables],
  hrActions: [...initialHRActions],
  insights: [...initialInsights],
  categoryVolumes: [...initialCategoryVolumes],
  activities: [...initialActivities],
  copilotMessages: [...initialCopilotMessages]
};

// Simulate network delay in mock mode for realistic enterprise UI feedback
const delay = (ms = 180) => new Promise(resolve => setTimeout(resolve, ms));

type SyncListener = (event: { type: string; data: any }) => void;
const syncListeners = new Set<SyncListener>();

// Auto-connect to real-time Server-Sent Events stream on port 8000
if (typeof window !== 'undefined') {
  try {
    const es = new EventSource('http://localhost:8000/api/v1/stream');
    es.addEventListener('REQUEST_CREATED', (e: MessageEvent) => {
      try {
        const payload = JSON.parse(e.data);
        if (payload.request && !state.requests.some(r => r.id === payload.request.id)) {
          state.requests.unshift(payload.request);
        }
        if (payload.activity && !state.activities.some(a => a.id === payload.activity.id)) {
          state.activities.unshift(payload.activity);
        }
        if (payload.metrics) state.metrics = payload.metrics;
        syncListeners.forEach(fn => fn({ type: 'REQUEST_CREATED', data: payload }));
      } catch {}
    });

    es.addEventListener('REQUEST_UPDATED', (e: MessageEvent) => {
      try {
        const payload = JSON.parse(e.data);
        if (payload.request) {
          const idx = state.requests.findIndex(r => r.id === payload.request.id);
          if (idx >= 0) state.requests[idx] = payload.request;
        }
        if (payload.activity && !state.activities.some(a => a.id === payload.activity.id)) {
          state.activities.unshift(payload.activity);
        }
        if (payload.metrics) state.metrics = payload.metrics;
        syncListeners.forEach(fn => fn({ type: 'REQUEST_UPDATED', data: payload }));
      } catch {}
    });
  } catch (err) {
    console.warn('Real-time sync SSE info:', err);
  }
}

export const hrService = {
  subscribe(callback: (event: { type: string; data: any }) => void) {
    syncListeners.add(callback);
    return () => {
      syncListeners.delete(callback);
    };
  },

  async getMetrics(): Promise<DashboardMetrics> {
    try {
      const res = await fetch('http://localhost:8000/api/v1/dashboard/metrics');
      if (res.ok) {
        const data = await res.json();
        state.metrics = data;
        return data;
      }
    } catch {}

    if (IS_MOCK_MODE) {
      await delay();
      return { ...state.metrics };
    }
    return request<DashboardMetrics>('/dashboard/metrics');
  },

  async getVelocity(range: '7D' | '30D' | '90D' = '7D'): Promise<VelocityData> {
    try {
      const res = await fetch(`http://localhost:8000/api/v1/dashboard/velocity?range=${range}`);
      if (res.ok) {
        return await res.json();
      }
    } catch {}

    if (IS_MOCK_MODE) {
      await delay();
      return velocityDataset[range];
    }
    return request<VelocityData>(`/dashboard/velocity?range=${range}`);
  },

  async getRequests(category?: string, priority?: string, search?: string): Promise<RequestItem[]> {
    try {
      const params = new URLSearchParams();
      if (category && category !== 'all') params.append('category', category);
      if (priority && priority !== 'all') params.append('priority', priority);
      if (search) params.append('search', search);

      const res = await fetch(`http://localhost:8000/api/v1/requests?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        state.requests = data;
        if (typeof window !== 'undefined') {
          try { localStorage.setItem('hr_cached_requests', JSON.stringify(data)); } catch {}
        }
        return data;
      }
    } catch (err) {
      console.warn('Backend unavailable, using cached state:', err);
    }

    if (IS_MOCK_MODE) {
      await delay();
      let filtered = [...state.requests];
      if (category && category !== 'all') {
        filtered = filtered.filter(r => r.category === category);
      }
      if (priority && priority !== 'all') {
        filtered = filtered.filter(r => r.priority === priority);
      }
      if (search) {
        const q = search.toLowerCase();
        filtered = filtered.filter(r => 
          r.title.toLowerCase().includes(q) ||
          r.employee.name.toLowerCase().includes(q) ||
          r.description.toLowerCase().includes(q)
        );
      }
      return filtered;
    }
    return request<RequestItem[]>('/requests');
  },

  async createRequest(newReq: Partial<RequestItem>): Promise<RequestItem> {
    try {
      const res = await fetch('http://localhost:8000/api/v1/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newReq)
      });
      if (res.ok) {
        const created = await res.json();
        const existingIdx = state.requests.findIndex(r => r.id === created.id);
        if (existingIdx >= 0) {
          state.requests[existingIdx] = created;
        } else {
          state.requests.unshift(created);
        }
        if (typeof window !== 'undefined') {
          try { localStorage.setItem('hr_cached_requests', JSON.stringify(state.requests)); } catch {}
        }
        return created;
      }
    } catch {}

    await delay(120);
    const id = newReq.id || `REQ-${Math.floor(1000 + Math.random() * 9000)}`;
    const emp = newReq.employee || {
      id: newReq.employeeId || 'EMP001',
      name: 'Alex Johnson',
      department: 'Engineering',
      email: 'alex.johnson@enterprise.internal',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=160&q=80'
    };

    const item: RequestItem = {
      id,
      title: newReq.title || 'New HR Inquiry',
      employeeId: newReq.employeeId || emp.id,
      employee: emp,
      assignedToId: newReq.assignedToId,
      assignedTo: newReq.assignedTo,
      category: newReq.category || 'other',
      priority: newReq.priority || 'medium',
      status: 'open',
      waitingTime: 'Just now',
      createdAt: new Date().toISOString(),
      aiTriage: {
        confidence: 0.95,
        classification: 'Autonomous Intake',
        autoRouted: true
      },
      description: newReq.description || '',
      comments: newReq.comments || []
    };
    state.requests.unshift(item);
    state.metrics.openRequests.count += 1;
    state.activities.unshift({
      id: `ACT-${Date.now()}`,
      actorType: 'user',
      actorName: item.employee.name,
      actionText: `${item.employee.name} created ${item.id} (${item.category})`,
      timeAgo: 'Just now',
      subText: item.title,
      tag: { text: 'New', color: 'cyan' }
    });
    if (typeof window !== 'undefined') {
      try { localStorage.setItem('hr_cached_requests', JSON.stringify(state.requests)); } catch {}
    }
    return item;
  },

  async assignRequest(id: string, assignedToId: string, assignedToName: string): Promise<RequestItem> {
    try {
      const res = await fetch(`http://localhost:8000/api/v1/requests/${encodeURIComponent(id)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assignedToId,
          assignedTo: assignedToName
        })
      });
      if (res.ok) {
        const updated = await res.json();
        const idx = state.requests.findIndex(r => r.id === id || r.id?.toLowerCase() === id.toLowerCase());
        if (idx >= 0) state.requests[idx] = updated;
        if (typeof window !== 'undefined') {
          try { localStorage.setItem('hr_cached_requests', JSON.stringify(state.requests)); } catch {}
        }
        return updated;
      }
    } catch {}

    const req = state.requests.find(r => r.id === id || r.id?.toLowerCase() === id.toLowerCase());
    if (req) {
      req.assignedToId = assignedToId;
      req.assignedTo = assignedToName;
      if (typeof window !== 'undefined') {
        try { localStorage.setItem('hr_cached_requests', JSON.stringify(state.requests)); } catch {}
      }
      return req;
    }
    throw new Error('Request not found');
  },

  async addComment(id: string, comment: Partial<RequestComment>): Promise<RequestComment> {
    try {
      const res = await fetch(`http://localhost:8000/api/v1/requests/${encodeURIComponent(id)}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(comment)
      });
      if (res.ok) {
        const createdComment = await res.json();
        const req = state.requests.find(r => r.id === id || r.id?.toLowerCase() === id.toLowerCase());
        if (req) {
          req.comments = [...(req.comments || []), createdComment];
          if (typeof window !== 'undefined') {
            try { localStorage.setItem('hr_cached_requests', JSON.stringify(state.requests)); } catch {}
          }
        }
        return createdComment;
      }
    } catch {}

    const created: RequestComment = {
      id: `c-${Date.now()}`,
      author: comment.author || 'User',
      authorId: comment.authorId,
      avatar: comment.avatar,
      text: comment.text || '',
      time: 'Just now',
      isHr: !!comment.isHr
    };
    const req = state.requests.find(r => r.id === id || r.id?.toLowerCase() === id.toLowerCase());
    if (req) {
      req.comments = [...(req.comments || []), created];
      if (typeof window !== 'undefined') {
        try { localStorage.setItem('hr_cached_requests', JSON.stringify(state.requests)); } catch {}
      }
    }
    return created;
  },

  async reviewRequest(id: string, notes: string, status: 'resolved' | 'in_review' = 'resolved', resolverName = 'HR Operations'): Promise<RequestItem> {
    const statusUpper = status === 'resolved' ? 'RESOLVED' : 'IN PROGRESS';
    try {
      const res = await fetch(`http://localhost:8000/api/v1/requests/${encodeURIComponent(id)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status,
          statusUpper,
          resolutionNotes: notes,
          resolverName
        })
      });
      if (res.ok) {
        const updated = await res.json();
        const idx = state.requests.findIndex(r => r.id === id || r.id?.toLowerCase() === id.toLowerCase());
        if (idx >= 0) state.requests[idx] = updated;
        if (typeof window !== 'undefined') {
          try { localStorage.setItem('hr_cached_requests', JSON.stringify(state.requests)); } catch {}
        }
        return updated;
      }
    } catch {}

    await delay(120);
    const req = state.requests.find(r => r.id === id || r.id?.toLowerCase() === id.toLowerCase());
    if (req) {
      req.status = status;
      req.resolutionNotes = notes;
      req.resolverName = resolverName;
      (req as any).statusUpper = statusUpper;
      if (status === 'resolved') {
        state.metrics.resolvedOvernight += 1;
        state.metrics.openRequests.count = Math.max(0, state.metrics.openRequests.count - 1);
      }
      state.activities.unshift({
        id: `ACT-${Date.now()}`,
        actorType: 'user',
        actorName: resolverName,
        actionText: `${resolverName} approved & resolved ${id}`,
        timeAgo: 'Just now',
        subText: notes || req.title,
        tag: { text: statusUpper, color: 'emerald' }
      });
      if (typeof window !== 'undefined') {
        try { localStorage.setItem('hr_cached_requests', JSON.stringify(state.requests)); } catch {}
      }
      return req;
    }
    throw new Error('Request not found');
  },

  async getTriageQueue(): Promise<AITriageItem[]> {
    if (IS_MOCK_MODE) {
      await delay();
      return [...state.triageQueue];
    }
    return request<AITriageItem[]>('/ai/triage/queue');
  },

  async overrideTriage(triageId: string, newCategory: any): Promise<void> {
    if (IS_MOCK_MODE) {
      await delay(200);
      const item = state.triageQueue.find(t => t.id === triageId);
      if (item) {
        item.predictedCategory = newCategory;
        item.status = 'OVERRIDDEN';
      }
      return;
    }
    return request<void>('/ai/triage/override', {
      method: 'POST',
      body: JSON.stringify({ triageId, newCategory })
    });
  },

  async getDeliverables(): Promise<DeliverableItem[]> {
    if (IS_MOCK_MODE) {
      await delay();
      return [...state.deliverables];
    }
    return request<DeliverableItem[]>('/deliverables');
  },

  async approveDeliverable(id: string): Promise<DeliverableItem> {
    if (IS_MOCK_MODE) {
      await delay(200);
      const item = state.deliverables.find(d => d.id === id);
      if (item) {
        item.status = 'approved';
        state.activities.unshift({
          id: `ACT-${Date.now()}`,
          actorType: 'user',
          actorName: 'Sarah Jenkins',
          actionText: `Approved ${id}`,
          timeAgo: 'Just now',
          subText: item.title,
          tag: { text: 'Approved', color: 'emerald' }
        });
      }
      return item!;
    }
    return request<DeliverableItem>(`/deliverables/${id}/approve`, { method: 'POST' });
  },

  async getHRActions(): Promise<HRActionItem[]> {
    if (IS_MOCK_MODE) {
      await delay();
      return [...state.hrActions];
    }
    return request<HRActionItem[]>('/actions');
  },

  async executeHRAction(id: string): Promise<HRActionItem> {
    if (IS_MOCK_MODE) {
      await delay(250);
      const item = state.hrActions.find(a => a.id === id);
      if (item) {
        item.status = 'completed';
        state.metrics.pendingHRActions.count = Math.max(0, state.metrics.pendingHRActions.count - 1);
        state.activities.unshift({
          id: `ACT-${Date.now()}`,
          actorType: 'user',
          actorName: 'HR Operations',
          actionText: `Executed Action ${id}: ${item.title}`,
          timeAgo: 'Just now',
          subText: item.employeeName,
          tag: { text: 'Executed', color: 'cyan' }
        });
      }
      return item!;
    }
    return request<HRActionItem>(`/actions/${id}/execute`, { method: 'POST' });
  },

  async getInsights(): Promise<InsightItem[]> {
    if (IS_MOCK_MODE) {
      await delay();
      return [...state.insights];
    }
    return request<InsightItem[]>('/insights/trends');
  },

  async getCategoryVolumes(): Promise<CategoryVolume[]> {
    if (IS_MOCK_MODE) {
      await delay();
      return [...state.categoryVolumes];
    }
    return request<CategoryVolume[]>('/insights/categories');
  },

  async getActivities(): Promise<ActivityEvent[]> {
    if (IS_MOCK_MODE) {
      await delay();
      return [...state.activities];
    }
    return request<ActivityEvent[]>('/dashboard/recent-activity');
  },

  async queryCopilot(prompt: string): Promise<CopilotMessage> {
    try {
      let res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: prompt })
      }).catch((e) => {
        console.warn('Primary fetch failed:', e);
        return null;
      });

      if (!res || !res.ok) {
        res = await fetch('/api/v1/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ question: prompt })
        }).catch((e) => {
          console.warn('Fallback fetch failed:', e);
          return null;
        });
      }

      if (res && res.ok) {
        const data = await res.json();
        const sources: Array<{ document: string; page: number }> = data.sources || [];
        const citations = sources.map(s => ({
          title: s.document
            ? s.document.replace('.pdf', '').replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
            : 'Company Policy',
          section: s.document || 'Policy Document',
          page: s.page
        }));

        const lower = prompt.toLowerCase();
        let suggestedActions = [
          "Generate Official Resolution Addendum",
          "Notify Employee via Email",
          "Log HR Action"
        ];
        if (lower.includes('leave') || lower.includes('pto') || lower.includes('vacation')) {
          suggestedActions = [
            "Check Employee PTO Balance",
            "Generate Leave Signoff Document",
            "Notify Department Manager"
          ];
        } else if (lower.includes('remote') || lower.includes('home') || lower.includes('stipend')) {
          suggestedActions = [
            "Initiate $500 Home Office Stipend Reimbursement",
            "Verify Hybrid Agreement Status",
            "Notify IT Hardware Procurement"
          ];
        } else if (lower.includes('travel') || lower.includes('expense') || lower.includes('per diem')) {
          suggestedActions = [
            "Review Travel Authorization Claim",
            "Approve Per Diem Expense",
            "Route to Finance for Reimbursement"
          ];
        }

        const assistantMsg: CopilotMessage = {
          id: `COP-${Date.now()}`,
          sender: 'assistant',
          text: data.answer || "No response received from policy agent.",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          citations,
          suggestedActions
        };
        state.copilotMessages.push(assistantMsg);
        return assistantMsg;
      }
    } catch (err) {
      console.warn('RAG backend query error, falling back to local simulation:', err);
    }

    await delay(300);
    let reply = `Based on the Enterprise HR Policy Library, here is the verified rule for "${prompt}":`;
    let citations = [
      { title: 'Leave Policy', section: 'leave_policy.pdf', page: 1 },
      { title: 'Employee Handbook', section: 'employee_handbook.pdf', page: 2 }
    ];

    if (prompt.toLowerCase().includes('leave') || prompt.toLowerCase().includes('pto')) {
      reply = "According to the Company Leave and Time Off Policy (leave_policy.pdf, Page 1):\n\nFull-time permanent employees are entitled to 20 business days of paid annual leave (PTO) per calendar year, accruing monthly at 1.67 days. 10 paid sick days are also provided.";
      citations = [{ title: 'Leave Policy', section: 'leave_policy.pdf', page: 1 }];
    } else if (prompt.toLowerCase().includes('remote') || prompt.toLowerCase().includes('hybrid')) {
      reply = "According to the Remote and Hybrid Work Policy (remote_work_policy.pdf, Page 2):\n\nEligible employees may work remotely up to 3 days per week (Tuesdays/Thursdays in office). Upon completing 90 days of service, employees receive a one-time $500 home office equipment stipend.";
      citations = [{ title: 'Remote Work Policy', section: 'remote_work_policy.pdf', page: 2 }];
    }

    const assistantMsg: CopilotMessage = {
      id: `COP-${Date.now()}`,
      sender: 'assistant',
      text: reply,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      citations,
      suggestedActions: [
        "Generate Official Resolution Addendum",
        "Notify Employee via Email"
      ]
    };
    state.copilotMessages.push(assistantMsg);
    return assistantMsg;
  }
};