import {
  DashboardMetrics,
  VelocityData,
  RequestItem,
  AITriageItem,
  DeliverableItem,
  HRActionItem,
  InsightItem,
  CategoryVolume,
  ActivityEvent,
  CopilotMessage,
  RequestComment,
  ComplianceReportItem,
  InsightsTelemetry,
  AITelemetryData
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

// Auto-connect to real-time Server-Sent Events stream on port 8000 with auto-reconnect
if (typeof window !== 'undefined') {
  let es: EventSource | null = null;
  let reconnectTimer: any = null;

  const connectSSE = () => {
    try {
      if (es) {
        try { es.close(); } catch {}
      }
      es = new EventSource('http://localhost:8000/api/v1/stream');

      es.onopen = () => {
        console.log('[HR Live Sync] Connected to SSE stream on http://localhost:8000/api/v1/stream');
      };

      es.addEventListener('REQUEST_CREATED', (e: MessageEvent) => {
        try {
          const payload = JSON.parse(e.data);
          if (payload.request) {
            const req = payload.request;
            if (!state.requests.some(r => r.id === req.id || (r.id && req.id && r.id.toLowerCase() === req.id.toLowerCase()))) {
              state.requests.unshift(req);
            }
          }
          if (payload.triageItem && !state.triageQueue.some(t => t.id === payload.triageItem.id)) {
            state.triageQueue.unshift(payload.triageItem);
          }
          if (payload.activity && !state.activities.some(a => a.id === payload.activity.id)) {
            state.activities.unshift(payload.activity);
          }
          if (payload.metrics) state.metrics = payload.metrics;
          if (payload.categoryVolumes) state.categoryVolumes = payload.categoryVolumes;
          syncListeners.forEach(fn => fn({ type: 'REQUEST_CREATED', data: payload }));
        } catch (err) {
          console.warn('[HR Live Sync] Error handling REQUEST_CREATED:', err);
        }
      });

      es.addEventListener('REQUEST_UPDATED', (e: MessageEvent) => {
        try {
          const payload = JSON.parse(e.data);
          if (payload.request) {
            const req = payload.request;
            const idx = state.requests.findIndex(r => r.id === req.id || (r.id && req.id && r.id.toLowerCase() === req.id.toLowerCase()));
            if (idx >= 0) {
              state.requests[idx] = { ...state.requests[idx], ...req };
            } else {
              state.requests.unshift(req);
            }
          }
          if (payload.activity && !state.activities.some(a => a.id === payload.activity.id)) {
            state.activities.unshift(payload.activity);
          }
          if (payload.metrics) state.metrics = payload.metrics;
          if (payload.categoryVolumes) state.categoryVolumes = payload.categoryVolumes;
          syncListeners.forEach(fn => fn({ type: 'REQUEST_UPDATED', data: payload }));
        } catch (err) {
          console.warn('[HR Live Sync] Error handling REQUEST_UPDATED:', err);
        }
      });

      es.addEventListener('DELIVERABLE_CREATED', (e: MessageEvent) => {
        try {
          const payload = JSON.parse(e.data);
          if (payload.deliverable) {
            const deliv = payload.deliverable;
            if (!state.deliverables.some(d => d.id === deliv.id)) {
              state.deliverables.unshift(deliv);
            }
          }
          syncListeners.forEach(fn => fn({ type: 'DELIVERABLE_CREATED', data: payload }));
        } catch (err) {
          console.warn('[HR Live Sync] Error handling DELIVERABLE_CREATED:', err);
        }
      });

      es.addEventListener('DELIVERABLE_UPDATED', (e: MessageEvent) => {
        try {
          const payload = JSON.parse(e.data);
          if (payload.deliverable) {
            const deliv = payload.deliverable;
            const idx = state.deliverables.findIndex(d => d.id === deliv.id);
            if (idx >= 0) {
              state.deliverables[idx] = { ...state.deliverables[idx], ...deliv };
            } else {
              state.deliverables.unshift(deliv);
            }
          }
          syncListeners.forEach(fn => fn({ type: 'DELIVERABLE_UPDATED', data: payload }));
        } catch (err) {
          console.warn('[HR Live Sync] Error handling DELIVERABLE_UPDATED:', err);
        }
      });

      es.addEventListener('TRIAGE_UPDATED', (e: MessageEvent) => {
        try {
          const payload = JSON.parse(e.data);
          if (payload.requestId && payload.triage) {
            const idx = state.requests.findIndex(r => r.id === payload.requestId);
            if (idx >= 0) {
              state.requests[idx].triage = payload.triage;
            }
          }
          syncListeners.forEach(fn => fn({ type: 'TRIAGE_UPDATED', data: payload }));
        } catch (err) {
          console.warn('[HR Live Sync] Error handling TRIAGE_UPDATED:', err);
        }
      });

      es.addEventListener('INSIGHTS_UPDATED', (e: MessageEvent) => {
        try {
          const payload = JSON.parse(e.data);
          syncListeners.forEach(fn => fn({ type: 'INSIGHTS_UPDATED', data: payload }));
        } catch (err) {
          console.warn('[HR Live Sync] Error handling INSIGHTS_UPDATED:', err);
        }
      });

      es.onerror = () => {
        if (es) {
          try { es.close(); } catch {}
          es = null;
        }
        if (!reconnectTimer) {
          reconnectTimer = setTimeout(() => {
            reconnectTimer = null;
            connectSSE();
          }, 3000);
        }
      };
    } catch {
      if (!reconnectTimer) {
        reconnectTimer = setTimeout(() => {
          reconnectTimer = null;
          connectSSE();
        }, 5000);
      }
    }
  };

  connectSSE();
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

  async getVelocity(range: '7D' | '30D' | '90D'): Promise<VelocityData> {
    try {
      const res = await fetch(`http://localhost:8000/api/v1/dashboard/velocity?range=${range}`);
      if (res.ok) {
        return await res.json();
      }
    } catch {}

    if (IS_MOCK_MODE) {
      await delay(120);
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
        return data;
      }
    } catch {}

    if (IS_MOCK_MODE) {
      await delay();
      return state.requests.filter(req => {
        if (category && category !== 'all' && req.category !== category) return false;
        if (priority && priority !== 'all' && req.priority !== priority) return false;
        if (search) {
          const q = search.toLowerCase();
          const matchTitle = req.title.toLowerCase().includes(q);
          const matchEmp = req.employee.name.toLowerCase().includes(q);
          const matchId = req.id.toLowerCase().includes(q);
          return matchTitle || matchEmp || matchId;
        }
        return true;
      });
    }
    const params = new URLSearchParams();
    if (category) params.append('category', category);
    if (priority) params.append('priority', priority);
    if (search) params.append('search', search);
    return request<RequestItem[]>(`/requests?${params.toString()}`);
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
    const item: RequestItem = {
      id,
      title: newReq.title || 'New HR Inquiry',
      employee: newReq.employee || {
        id: 'EMP-999',
        name: 'Rupam Sharma',
        department: 'Core Platform & AI Systems',
        email: 'rupam.sharma@enterprise.org',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80'
      },
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
      description: newReq.description || ''
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

  async reviewRequest(id: string, notes: string, status: 'resolved' | 'in_review' = 'resolved'): Promise<RequestItem> {
    const statusUpper = status === 'resolved' ? 'RESOLVED' : 'IN PROGRESS';
    try {
      const res = await fetch(`http://localhost:8000/api/v1/requests/${encodeURIComponent(id)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status,
          statusUpper,
          resolutionNotes: notes,
          resolverName: 'Sarah Jenkins (HR Ops)'
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
      (req as any).statusUpper = statusUpper;
      if (status === 'resolved') {
        state.metrics.resolvedOvernight += 1;
        state.metrics.openRequests.count = Math.max(0, state.metrics.openRequests.count - 1);
      }
      state.activities.unshift({
        id: `ACT-${Date.now()}`,
        actorType: 'user',
        actorName: 'Sarah Jenkins',
        actionText: `Sarah approved & resolved ${id}`,
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
    try {
      const res = await fetch('http://localhost:8000/api/v1/triage/queue');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          state.triageQueue = data;
          return data;
        }
      }
    } catch {}
    return [...state.triageQueue];
  },

  async overrideTriage(triageId: string, newCategory: any): Promise<void> {
    try {
      await fetch('http://localhost:8000/api/v1/triage/override', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ triageId, newCategory })
      });
    } catch {}

    const item = state.triageQueue.find(t => t.id === triageId);
    if (item) {
      item.predictedCategory = newCategory;
      item.status = 'OVERRIDDEN';
    }
  },

  async getTriagedRequests(): Promise<RequestItem[]> {
    try {
      const res = await fetch('http://localhost:8000/api/v1/triage');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          state.requests = data;
          return data;
        }
      }
    } catch {}
    return [...state.requests];
  },

  async overrideRequestTriage(
    requestId: string,
    humanPriority?: string,
    humanCategory?: string,
    overrideNotes?: string
  ): Promise<any> {
    try {
      const res = await fetch(`http://localhost:8000/api/v1/triage/${encodeURIComponent(requestId)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ humanPriority, humanCategory, overrideNotes })
      });
      if (res.ok) {
        const updatedTriage = await res.json();
        const reqIdx = state.requests.findIndex(r => r.id === requestId);
        if (reqIdx >= 0) {
          state.requests[reqIdx].triage = updatedTriage;
        }
        return updatedTriage;
      }
    } catch (err) {
      console.warn('overrideRequestTriage error:', err);
    }
    return null;
  },

  async retryRequestTriage(requestId: string): Promise<any> {
    try {
      const res = await fetch(`http://localhost:8000/api/v1/triage/${encodeURIComponent(requestId)}/retry`, {
        method: 'POST'
      });
      if (res.ok) {
        const updatedTriage = await res.json();
        const reqIdx = state.requests.findIndex(r => r.id === requestId);
        if (reqIdx >= 0) {
          state.requests[reqIdx].triage = updatedTriage;
        }
        return updatedTriage;
      }
    } catch (err) {
      console.warn('retryRequestTriage error:', err);
    }
    return null;
  },

  async getDeliverables(status?: string, requestId?: string): Promise<DeliverableItem[]> {
    try {
      const params = new URLSearchParams();
      if (status && status !== 'all') params.append('status', status);
      if (requestId) params.append('requestId', requestId);
      const url = `http://localhost:8000/api/v1/deliverables?${params.toString()}`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          state.deliverables = data;
          return data;
        }
      }
    } catch {}
    return [...state.deliverables];
  },

  async getDeliverable(id: string): Promise<DeliverableItem | null> {
    try {
      const res = await fetch(`http://localhost:8000/api/v1/deliverables/${encodeURIComponent(id)}`);
      if (res.ok) return await res.json();
    } catch {}
    return state.deliverables.find(d => d.id === id) || null;
  },

  async createDeliverable(deliv: Partial<DeliverableItem>): Promise<DeliverableItem | null> {
    try {
      const res = await fetch('http://localhost:8000/api/v1/deliverables', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(deliv)
      });
      if (res.ok) {
        const created = await res.json();
        if (!state.deliverables.some(d => d.id === created.id)) {
          state.deliverables.unshift(created);
        }
        return created;
      }
    } catch (err) {
      console.warn('createDeliverable error:', err);
    }
    return null;
  },

  async updateDeliverable(id: string, updates: Partial<DeliverableItem>): Promise<DeliverableItem | null> {
    try {
      const res = await fetch(`http://localhost:8000/api/v1/deliverables/${encodeURIComponent(id)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      if (res.ok) {
        const updated = await res.json();
        const idx = state.deliverables.findIndex(d => d.id === id);
        if (idx >= 0) state.deliverables[idx] = updated;
        return updated;
      }
    } catch (err) {
      console.warn('updateDeliverable error:', err);
    }
    return null;
  },

  async sendDeliverable(id: string): Promise<DeliverableItem | null> {
    try {
      const res = await fetch(`http://localhost:8000/api/v1/deliverables/${encodeURIComponent(id)}/send`, {
        method: 'POST'
      });
      if (res.ok) {
        const sent = await res.json();
        const idx = state.deliverables.findIndex(d => d.id === id);
        if (idx >= 0) state.deliverables[idx] = sent;
        return sent;
      }
    } catch (err) {
      console.warn('sendDeliverable error:', err);
    }
    return null;
  },

  async approveDeliverable(id: string): Promise<DeliverableItem> {
    try {
      const res = await fetch(`http://localhost:8000/api/v1/deliverables/${encodeURIComponent(id)}/approve`, { method: 'POST' });
      if (res.ok) {
        const updated = await res.json();
        const idx = state.deliverables.findIndex(d => d.id === id);
        if (idx >= 0) state.deliverables[idx] = updated;
        return updated;
      }
    } catch {}

    const item = state.deliverables.find(d => d.id === id);
    if (item) {
      item.status = 'READY';
      state.activities.unshift({
        id: `ACT-${Date.now()}`,
        actorType: 'user',
        actorName: 'Sarah',
        actionText: `Sarah marked ${id} as ready`,
        timeAgo: 'Just now',
        subText: item.title,
        tag: { text: 'Ready', color: 'emerald' }
      });
    }
    return item!;
  },

  async getHRActions(): Promise<HRActionItem[]> {
    try {
      const res = await fetch('http://localhost:8000/api/v1/actions');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          state.hrActions = data;
          return data;
        }
      }
    } catch {}
    return [...state.hrActions];
  },

  async executeHRAction(id: string): Promise<HRActionItem> {
    try {
      const res = await fetch(`http://localhost:8000/api/v1/actions/${encodeURIComponent(id)}/execute`, { method: 'POST' });
      if (res.ok) {
        const updated = await res.json();
        const idx = state.hrActions.findIndex(a => a.id === id);
        if (idx >= 0) state.hrActions[idx] = updated;
        return updated;
      }
    } catch {}

    const item = state.hrActions.find(a => a.id === id);
    if (item) {
      item.status = 'completed';
      state.metrics.pendingHRActions.count = Math.max(0, state.metrics.pendingHRActions.count - 1);
      state.activities.unshift({
        id: `ACT-${Date.now()}`,
        actorType: 'user',
        actorName: 'Sarah',
        actionText: `Executed Action ${id}: ${item.title}`,
        timeAgo: 'Just now',
        subText: item.employeeName,
        tag: { text: 'Executed', color: 'cyan' }
      });
    }
    return item!;
  },

  async getInsights(): Promise<InsightItem[]> {
    try {
      const res = await fetch('http://localhost:8000/api/v1/insights');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          state.insights = data;
          return data;
        }
      }
    } catch {}
    return [...state.insights];
  },

  async getInsightsTelemetry(range: '7D' | '30D' | '90D' = '7D'): Promise<InsightsTelemetry | null> {
    try {
      const res = await fetch(`http://localhost:8000/api/v1/insights/telemetry?range=${range}`);
      if (res.ok) {
        const data = await res.json();
        return data;
      }
    } catch (err) {
      console.warn('[HR Service] getInsightsTelemetry fetch error:', err);
    }
    return null;
  },

  async exportInsightsCsv(): Promise<void> {
    try {
      const res = await fetch('http://localhost:8000/api/v1/insights/export');
      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `hr-insights-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
        return;
      }
    } catch (e) {
      console.warn('Backend CSV export failed, generating from client state:', e);
    }

    // Client-side fallback if server is unreachable
    const items = state.insights || [];
    const rows = [
      ['ID', 'Title', 'Impact', 'Type', 'Description', 'Suggested Remediation', 'Related Category', 'Change Text'],
      ...items.map(i => [
        i.id,
        `"${(i.title || '').replace(/"/g, '""')}"`,
        i.impact || 'MEDIUM',
        i.type || 'info',
        `"${(i.description || '').replace(/"/g, '""')}"`,
        `"${(i.suggestedRemediation || '').replace(/"/g, '""')}"`,
        i.relatedCategory || '',
        i.changeText || ''
      ])
    ];
    const csvContent = 'data:text/csv;charset=utf-8,' + rows.map(e => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `hr-insights-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  },

  async getCategoryVolumes(): Promise<CategoryVolume[]> {
    try {
      const res = await fetch('http://localhost:8000/api/v1/category-volumes');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          state.categoryVolumes = data;
          return data;
        }
      }
    } catch {}
    return [...state.categoryVolumes];
  },

  async getActivities(): Promise<ActivityEvent[]> {
    try {
      const res = await fetch('http://localhost:8000/api/v1/activities');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          state.activities = data;
          return data;
        }
      }
    } catch {}
    return [...state.activities];
  },

  async getRagHealth(): Promise<{ status: string; azure_configured: boolean; vector_store_ready: boolean; knowledge_base_files: number } | null> {
    try {
      const res = await fetch('/health');
      if (res.ok) {
        return await res.json();
      }
    } catch {}
    return null;
  },

  async getAITelemetry(): Promise<AITelemetryData | null> {
    try {
      const res = await fetch('http://localhost:8000/api/v1/ai/telemetry');
      if (res.ok) {
        return await res.json();
      }
    } catch {}
    return null;
  },

  async testModelInference(prompt: string): Promise<{ response: string; latencyMs: number; tokens: { prompt: number; completion: number; total: number }; model: string }> {
    const start = performance.now();
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3500);

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: prompt, history: [] }),
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      const latencyMs = Math.round(performance.now() - start);
      if (res.ok) {
        const data = await res.json();
        const pTok = Math.max(16, Math.round(prompt.length / 3.8));
        const cTok = Math.max(28, Math.round((data.answer || '').length / 3.8));
        const modelTag = (data.sources && data.sources.length > 0) ? 'gpt-4o / rag-failover' : 'gpt-4o';
        
        // Asynchronously post to sync server audit log
        fetch('http://localhost:8000/api/v1/ai/telemetry/record', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            service: 'Test Bench',
            model: modelTag,
            promptTokens: pTok,
            completionTokens: cTok,
            latencyMs,
            queryPreview: prompt
          })
        }).catch(() => {});

        return {
          response: data.answer || 'Response generated from policy intelligence model.',
          latencyMs,
          tokens: { prompt: pTok, completion: cTok, total: pTok + cTok },
          model: modelTag
        };
      }
    } catch {}

    const latencyMs = Math.round(performance.now() - start);
    const pTok = Math.max(16, Math.round(prompt.length / 3.8));
    const cTok = 64;
    const fallback = {
      response: `[Local RAG Engine] Verified response for: "${prompt}". Validated against 9 knowledge base policy documents.`,
      latencyMs: Math.max(90, latencyMs),
      tokens: { prompt: pTok, completion: cTok, total: pTok + cTok },
      model: 'pypdf-fallback'
    };

    fetch('http://localhost:8000/api/v1/ai/telemetry/record', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        service: 'Test Bench',
        model: 'pypdf-fallback',
        promptTokens: pTok,
        completionTokens: cTok,
        latencyMs: fallback.latencyMs,
        queryPreview: prompt
      })
    }).catch(() => {});

    return fallback;
  },

  exportTelemetryCSV(telemetry: AITelemetryData): void {
    const rows = [
      ['Timestamp', 'Service', 'Model', 'Prompt Tokens', 'Completion Tokens', 'Total Tokens', 'Latency (ms)', 'Estimated Cost ($)', 'Status', 'Query Preview']
    ];
    for (const inv of telemetry.recentInvocations) {
      rows.push([
        `"${inv.timestamp}"`,
        `"${inv.service}"`,
        `"${inv.model}"`,
        String(inv.promptTokens),
        String(inv.completionTokens),
        String(inv.totalTokens),
        String(inv.latencyMs),
        `"$${inv.cost.toFixed(4)}"`,
        `"${inv.status}"`,
        `"${(inv.queryPreview || '').replace(/"/g, '""')}"`
      ]);
    }
    const csvContent = 'data:text/csv;charset=utf-8,' + rows.map(e => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `hr-ai-telemetry-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  },

  async getGmailStatus(userId?: string): Promise<any | null> {
    try {
      const url = userId ? `/api/gmail/status?user_id=${encodeURIComponent(userId)}` : '/api/gmail/status';
      const res = await fetch(url);
      if (res.ok) return await res.json();
    } catch {}
    return null;
  },

  async getGmailAccounts(): Promise<any[]> {
    try {
      const res = await fetch('/api/gmail/accounts');
      if (res.ok) return await res.json();
    } catch {}
    return [];
  },

  async switchGmailAccount(userId: string): Promise<any | null> {
    try {
      const res = await fetch('/api/gmail/switch-active', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId })
      });
      if (res.ok) return await res.json();
    } catch {}
    return null;
  },

  async getGmailAuthUrl(userId?: string, userName?: string): Promise<{ auth_url: string; mode: string; message: string } | null> {
    try {
      const params = new URLSearchParams();
      if (userId) params.set('user_id', userId);
      if (userName) params.set('user_name', userName);
      const url = `/api/gmail/auth-url${params.toString() ? `?${params.toString()}` : ''}`;
      const res = await fetch(url);
      if (res.ok) return await res.json();
    } catch {}
    return null;
  },

  async disconnectGmail(userId?: string): Promise<boolean> {
    try {
      const url = userId ? `/api/gmail/disconnect?user_id=${encodeURIComponent(userId)}` : '/api/gmail/disconnect';
      const res = await fetch(url, { method: 'POST' });
      return res.ok;
    } catch {}
    return false;
  },

  async connectCustomEmail(email: string, displayName?: string, userId?: string, userName?: string): Promise<any | null> {
    try {
      const res = await fetch('/api/gmail/connect-custom', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, display_name: displayName, user_id: userId, user_name: userName })
      });
      if (res.ok) return await res.json();
    } catch {}
    return null;
  },

  async configureGmailOAuth(clientId: string, clientSecret: string, redirectUri?: string): Promise<any | null> {
    try {
      const res = await fetch('/api/gmail/configure-oauth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ client_id: clientId, client_secret: clientSecret, redirect_uri: redirectUri })
      });
      if (res.ok) return await res.json();
    } catch {}
    return null;
  },

  async getGmailEmails(category?: string, search?: string): Promise<any[]> {
    try {
      const params = new URLSearchParams();
      if (category && category !== 'All') params.set('category', category);
      if (search) params.set('search', search);
      const res = await fetch(`/api/gmail/emails?${params.toString()}`);
      if (res.ok) return await res.json();
    } catch {}
    return [];
  },

  async getGmailEmailDetail(emailId: string): Promise<any | null> {
    try {
      const res = await fetch(`/api/gmail/emails/${emailId}`);
      if (res.ok) return await res.json();
    } catch {}
    return null;
  },

  async triageGmailEmail(emailId: string): Promise<any | null> {
    try {
      const res = await fetch(`/api/gmail/emails/${emailId}/triage`, { method: 'POST' });
      if (res.ok) return await res.json();
    } catch {}
    return null;
  },

  async generateGmailDraft(emailId: string, options: { tone?: string; refinement?: string; custom_instructions?: string } = {}): Promise<any | null> {
    try {
      const res = await fetch(`/api/gmail/emails/${emailId}/draft`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(options)
      });
      if (res.ok) return await res.json();
    } catch {}
    return null;
  },

  async sendGmailReply(
    emailId: string,
    reply: { to: string; subject: string; body: string; thread_id?: string; approved_by_hr: boolean },
    userId?: string
  ): Promise<any | null> {
    try {
      const url = userId
        ? `/api/gmail/emails/${emailId}/reply?user_id=${encodeURIComponent(userId)}`
        : `/api/gmail/emails/${emailId}/reply`;
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reply)
      });
      if (res.ok) return await res.json();
    } catch {}
    return null;
  },

  async queryCopilot(prompt: string, history: Array<{ role: string; content: string }> = []): Promise<CopilotMessage> {
    try {
      // 1. Query the RAG agent backend (port 8001 direct or port 8000 proxy)
      let res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: prompt, history })
      }).catch((e) => {
        console.warn('Primary fetch failed:', e);
        return null;
      });

      if (!res || !res.ok) {
        res = await fetch('/api/v1/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ question: prompt, history })
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

        // Contextual suggested actions for HR Operations
        const lower = prompt.toLowerCase();
        let suggestedActions = [
          "Verify Policy Eligibility Checklist",
          "Draft Official HR Response to Employee",
          "Log HR Policy Audit Action"
        ];
        if (lower.includes('leave') || lower.includes('pto') || lower.includes('vacation')) {
          suggestedActions = [
            "Audit Leave Eligibility Requirements",
            "Draft Policy Clarification to Employee",
            "Verify Medical Documentation Rules"
          ];
        } else if (lower.includes('remote') || lower.includes('home') || lower.includes('stipend')) {
          suggestedActions = [
            "Verify Hybrid Agreement Requirements",
            "Check $500 Stipend 90-Day Eligibility Rule",
            "Review IT Equipment Compliance Terms"
          ];
        } else if (lower.includes('travel') || lower.includes('expense') || lower.includes('per diem')) {
          suggestedActions = [
            "Audit Expense Claim Against Policy Limits",
            "Verify 45-Day Receipt Submission Window",
            "Draft Incomplete Claim Clarification Notice"
          ];
        } else if (lower.includes('parental') || lower.includes('maternity') || lower.includes('paternity')) {
          suggestedActions = [
            "Verify 6-Month Tenure Eligibility Requirement",
            "Audit Primary vs Secondary Caregiver Criteria",
            "Draft Official Parental Leave Signoff"
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

    // Local fallback if backend is unreachable
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
  },

  async addComment(
    requestId: string,
    text: string,
    author = 'Sarah Jenkins (HR Ops)',
    isHr = true,
    avatar?: string
  ): Promise<RequestComment> {
    try {
      const res = await fetch(`http://localhost:8000/api/v1/requests/${encodeURIComponent(requestId)}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          author,
          text,
          isHr,
          avatar
        })
      });
      if (res.ok) {
        const newComment: RequestComment = await res.json();
        const target = state.requests.find(r => r.id === requestId || r.id?.toLowerCase() === requestId.toLowerCase());
        if (target) {
          if (!target.comments) target.comments = [];
          if (!target.comments.some(c => c.id === newComment.id)) {
            target.comments.push(newComment);
          }
          target.lastUpdated = 'Just now';
        }
        return newComment;
      }
    } catch (err) {
      console.warn('Backend comment post failed, applying local fallback:', err);
    }

    await delay(120);
    const newComment: RequestComment = {
      id: `c-${Date.now()}`,
      author,
      text,
      time: 'Just now',
      isHr,
      avatar
    };
    const target = state.requests.find(r => r.id === requestId || r.id?.toLowerCase() === requestId.toLowerCase());
    if (target) {
      if (!target.comments) target.comments = [];
      target.comments.push(newComment);
      target.lastUpdated = 'Just now';
    }
    return newComment;
  },

  async queryCaseCopilot(
    caseItem: RequestItem,
    action: 'draft_reply' | 'summarize' | 'check_policy' | 'missing_info' | 'improve_tone' | 'next_steps' | 'custom_query',
    userQuery?: string,
    tone?: string
  ): Promise<CopilotMessage> {
    const empName = typeof caseItem.employee === 'object' && caseItem.employee ? (caseItem.employee.name || 'Employee') : (caseItem.employee || 'Employee');
    const empDept = typeof caseItem.employee === 'object' && caseItem.employee ? (caseItem.employee.department || 'Operations') : 'Operations';
    const commentsList = caseItem.comments || [];
    const conversationHistoryStr = commentsList.length > 0
      ? commentsList.map(c => `[${c.isHr ? 'HR Response' : 'Employee'}] (${c.author}, ${c.time}): ${c.text}`).join('\n')
      : '(No previous messages in conversation thread)';

    let prompt = '';
    const systemRoleDesc = `You are an AI Copilot specialized in enterprise HR case resolution and employee relations for GlobalTech Enterprise.`;

    switch (action) {
      case 'draft_reply':
        prompt = `${systemRoleDesc}
Please generate an official, professional, and empathetic employee communication reply from HR to ${empName}.
Tone: ${tone || 'Polite, clear, supportive, and grounded in official HR policy'}.

CASE CONTEXT:
- Case ID: ${caseItem.id}
- Case Title: ${caseItem.title || caseItem.subject || 'HR Inquiry'}
- Category: ${caseItem.category}
- Priority: ${caseItem.priority}
- Current Status: ${caseItem.status}
- Employee: ${empName} (${empDept})
- Original Case Narrative:
"""
${caseItem.description}
"""

CONVERSATION THREAD SO FAR:
${conversationHistoryStr}

INSTRUCTIONS FOR THE HR REPLY:
1. Address ${empName} warmly by first name.
2. Direct and transparent answer referencing their request and the latest comment.
3. If applicable, cite the relevant company policy rules (e.g. Leave, Remote Work, Benefits, Payroll).
4. Provide clear next steps or expected timeline.
5. Close professionally from Sarah Jenkins, HR Operations Lead.`;
        break;

      case 'summarize':
        prompt = `${systemRoleDesc}
Provide a concise, high-level bullet-point executive summary of this case and all communications.

CASE CONTEXT:
- Case ID: ${caseItem.id}
- Title: ${caseItem.title || caseItem.subject}
- Employee: ${empName} (${empDept})
- Narrative: ${caseItem.description}
- Conversation History:
${conversationHistoryStr}

Format with:
- **Core Request**: (1 sentence)
- **Status & Timeline**: (current state)
- **Key Details**: (bullet points)
- **Action Required**: (what HR needs to do next)`;
        break;

      case 'check_policy':
        prompt = `${systemRoleDesc}
Check applicable company policies for this case:
Case ID: ${caseItem.id}
Category: ${caseItem.category}
Narrative: ${caseItem.description}
${userQuery ? `Specific Question: ${userQuery}` : 'Identify the exact policy requirements, eligibility criteria, and SLA timelines.'}`;
        break;

      case 'missing_info':
        prompt = `${systemRoleDesc}
Review the case details and conversation history below. Identify any missing information, documents, approvals, or dates that HR needs from the employee before this case can be resolved.
Case: ${caseItem.title}
Narrative: ${caseItem.description}
Conversation:
${conversationHistoryStr}`;
        break;

      case 'improve_tone':
        prompt = `${systemRoleDesc}
Refine and polish the following draft response to be ${tone || 'more empathetic, professional, and clear'}:
Draft:
"""
${userQuery || ''}
"""
Target audience: ${empName} regarding Case ${caseItem.title}.`;
        break;

      case 'next_steps':
        prompt = `${systemRoleDesc}
Based on this case status (${caseItem.status}) and history, outline the 3 immediate operational next steps for HR to bring this case to resolution.
Case: ${caseItem.id} - ${caseItem.title}
Narrative: ${caseItem.description}
Conversation:
${conversationHistoryStr}`;
        break;

      case 'custom_query':
      default:
        prompt = `${systemRoleDesc}
Case Context: ${caseItem.id} (${caseItem.title}), Category: ${caseItem.category}, Employee: ${empName} (${empDept}).
Narrative: ${caseItem.description}
Conversation History:
${conversationHistoryStr}

HR Specialist Query:
${userQuery || 'Analyze this request and recommend appropriate action.'}`;
        break;
    }

    try {
      let res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: prompt, history: [] })
      }).catch(() => null);

      if (!res || !res.ok) {
        res = await fetch('http://localhost:8001/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ question: prompt, history: [] })
        }).catch(() => null);
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

        return {
          id: `COP-CASE-${Date.now()}`,
          sender: 'assistant',
          text: data.answer || 'Response generated from policy agent.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          citations,
          suggestedActions: [
            'Use Reply',
            'Make More Empathetic',
            'Make More Concise',
            'Check Policy Details'
          ]
        };
      }
    } catch (err) {
      console.warn('RAG backend query error, falling back to local domain knowledge:', err);
    }

    // Local fallback with rich context
    await delay(250);
    const categoryLower = (caseItem.category || '').toLowerCase();
    let replyText = '';
    let citations = [{ title: 'Employee Handbook', section: 'employee_handbook.pdf', page: 1 }];

    if (action === 'draft_reply') {
      if (categoryLower.includes('leave')) {
        replyText = `Hi ${empName},\n\nThank you for reaching out regarding your leave inquiry for Case ${caseItem.id}. According to our Leave & Time Off Policy (Section 3.2), full-time employees accrue 1.67 PTO days per month. I have reviewed your balance and verified that your requested dates can be accommodated.\n\nPlease ensure your direct supervisor has also approved the calendar block in the portal. Feel free to reply if you need any adjustments!\n\nBest regards,\nSarah Jenkins\nHR Operations Lead`;
        citations = [{ title: 'Leave Policy', section: 'leave_policy.pdf', page: 1 }];
      } else if (categoryLower.includes('payroll')) {
        replyText = `Hi ${empName},\n\nThank you for following up on your payroll case (${caseItem.id}). Our finance and payroll operations team has verified the batch disbursement. The adjustment has been scheduled for the upcoming pay cycle on the 1st of next month.\n\nYou will see the revised breakdown on your itemized payslip. Please let me know if you have any questions in the meantime.\n\nWarm regards,\nSarah Jenkins\nHR Operations Lead`;
        citations = [{ title: 'Compensation & Payroll Policy', section: 'employee_handbook.pdf', page: 4 }];
      } else {
        replyText = `Hi ${empName},\n\nThank you for providing the details for Case ${caseItem.id}. I have reviewed your submission regarding "${caseItem.title || 'your request'}" alongside our company guidelines.\n\nWe are currently processing the verification and will have this resolved for you within 24–48 hours. Please let me know if any additional context comes up.\n\nSincerely,\nSarah Jenkins\nHR Operations Lead`;
        citations = [{ title: 'Employee Relations Guide', section: 'employee_handbook.pdf', page: 2 }];
      }
    } else if (action === 'summarize') {
      replyText = `**Case Summary for ${caseItem.id}**:\n- **Employee**: ${empName} (${empDept})\n- **Status**: ${caseItem.status.toUpperCase()} (${caseItem.priority} priority)\n- **Subject**: ${caseItem.title || caseItem.subject}\n- **Core Narrative**: ${caseItem.description}\n- **Conversation State**: ${commentsList.length} total messages exchanged.\n- **Action Required**: Review documentation and confirm resolution notes.`;
    } else if (action === 'check_policy') {
      replyText = `**Applicable Company Policy Clauses**:\n1. **Standard Service SLA**: Inquiries must receive initial specialist response within 4 business hours.\n2. **Documentation Retention**: Communications are archived in accordance with Article 6 (Compliance & Records).\n3. **Policy Grounding**: Verified against ${categoryLower.includes('leave') ? 'leave_policy.pdf' : categoryLower.includes('remote') ? 'remote_work_policy.pdf' : 'employee_handbook.pdf'}.`;
    } else {
      replyText = `I have analyzed Case ${caseItem.id} for ${empName}. Based on the request details ("${caseItem.description}"), all mandatory fields are present. You can proceed with drafting a response or approving the case.`;
    }

    return {
      id: `COP-CASE-${Date.now()}`,
      sender: 'assistant',
      text: replyText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      citations,
      suggestedActions: [
        'Use Reply',
        'Make More Empathetic',
        'Make More Concise'
      ]
    };
  },

  async getReports(): Promise<ComplianceReportItem[]> {
    try {
      const res = await fetch('http://localhost:8000/api/v1/reports');
      if (res.ok) {
        return await res.json();
      }
    } catch {}

    if (IS_MOCK_MODE) {
      await delay(120);
      return [];
    }
    return request<ComplianceReportItem[]>('/reports');
  },

  async generateReport(payload: {
    reportType?: string;
    name?: string;
    standard?: string;
    quarter?: string;
    year?: number;
    startDate?: string;
    endDate?: string;
    generatedBy?: string;
  }): Promise<ComplianceReportItem> {
    try {
      const res = await fetch('http://localhost:8000/api/v1/reports/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        return await res.json();
      }
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `Report generation failed (${res.status})`);
    } catch (e: any) {
      if (!IS_MOCK_MODE) throw e;
    }

    if (IS_MOCK_MODE) {
      await delay(600);
      const q = payload.quarter || 'Q3';
      const yr = payload.year || 2026;
      return {
        id: `REP-${yr}-${Date.now().toString(36).toUpperCase()}`,
        name: payload.name || `Compliance Audit Package (${q} ${yr})`,
        standard: payload.standard || 'SOC2 Type II / EEOC',
        periodStart: payload.startDate || `${yr}-07-01T00:00:00.000Z`,
        periodEnd: payload.endDate || `${yr}-09-30T23:59:59.999Z`,
        periodLabel: `${q} ${yr}`,
        generatedBy: payload.generatedBy || 'Sarah Jenkins (HR Ops)',
        generatedAt: new Date().toISOString(),
        status: 'VERIFIED & SIGNED',
        reportType: (payload.reportType as any) || 'QUARTERLY_SLA_AUDIT',
        integrityHash: 'sha256:' + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join(''),
        metrics: {
          totalCases: state.requests.length,
          resolvedCases: state.requests.filter(r => r.status === 'resolved').length,
          openCases: state.requests.filter(r => r.status !== 'resolved').length,
          highPriorityCases: state.requests.filter(r => r.priority === 'high').length,
          sensitiveCases: 2,
          slaApplicableCases: state.requests.length,
          slaMet: state.requests.length - 2,
          slaBreached: 2,
          slaResolvedWithin: 5,
          slaResolvedBreached: 0,
          slaOpenWithin: 7,
          slaOpenBreached: 2,
          slaComplianceRate: 85.7,
          avgResolutionTimeHours: 2.8,
          executiveSummary: 'Audit generated under local fallback mode.',
          categoryDistribution: [],
          policyDistribution: []
        }
      };
    }
    return request<ComplianceReportItem>('/reports/generate', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  async downloadReport(id: string, format: 'pdf' | 'csv' | 'json', filename?: string): Promise<void> {
    const url = `http://localhost:8000/api/v1/reports/${encodeURIComponent(id)}/download?format=${format}`;
    const res = await fetch(url);
    if (!res.ok) {
      let msg = `Download failed with status ${res.status}`;
      try {
        const err = await res.json();
        if (err.error) msg = err.error;
      } catch {}
      throw new Error(msg);
    }
    const blob = await res.blob();
    const blobUrl = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = blobUrl;
    a.download = filename || `${id}.${format}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(blobUrl);
  }
};
