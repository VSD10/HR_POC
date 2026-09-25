import React, { useState } from 'react';

interface EndpointSpec {
  method: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  path: string;
  category: string;
  description: string;
  requestBody?: object;
  responseBody: object;
}

const endpointCatalog: EndpointSpec[] = [
  {
    method: 'POST',
    path: '/api/v1/auth/login',
    category: 'Authentication',
    description: 'Authenticates HR specialist with enterprise credentials and returns JWT bearer token.',
    requestBody: {
      email: "sarah.jenkins@enterprise.internal",
      password: "EnterprisePassword123!"
    },
    responseBody: {
      token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      refreshToken: "eyJhbGciOiJIUzI1NiIsIn...",
      expiresIn: 3600,
      user: {
        id: "usr_9410",
        name: "Sarah Jenkins",
        email: "sarah.jenkins@enterprise.internal",
        role: "HR_ADMIN",
        title: "HR Operations Lead"
      }
    }
  },
  {
    method: 'GET',
    path: '/api/v1/dashboard/metrics',
    category: 'Dashboard',
    description: 'Retrieves live KPI bento values, SLA compliance rates, and overnight autonomous resolution counts.',
    responseBody: {
      openRequests: { count: 128, changePercent: 12.0, comparisonText: "+12% this wk" },
      highPriority: { count: 17, requiresAttention: 5 },
      pendingHRActions: { count: 24, waitingOver24h: 8 },
      slaCompliance: { percent: 94.8, changePercent: 2.1, targetPercent: 92.0 },
      avgSla: "38m",
      resolvedOvernight: 72,
      nodeStatus: { core: "OK", sla: "99.8%", triageAgent: "v3.4 Active" }
    }
  },
  {
    method: 'GET',
    path: '/api/v1/dashboard/velocity?range=7D',
    category: 'Dashboard',
    description: 'Returns time-series telemetry comparing incoming cases against resolved cases across 7D, 30D, or 90D.',
    responseBody: {
      range: "7D",
      labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
      incoming: [45, 52, 68, 80, 55, 92, 102],
      resolved: [38, 44, 58, 70, 62, 78, 88],
      openTotal: 128,
      receivedToday: 86,
      resolvedToday: 72
    }
  },
  {
    method: 'GET',
    path: '/api/v1/requests?category=payroll&priority=high',
    category: 'Requests',
    description: 'Fetches paginated and filtered employee tickets with AI confidence score and waiting duration.',
    responseBody: {
      total: 128,
      page: 1,
      limit: 20,
      data: [
        {
          id: "HR-1028",
          title: "Payroll discrepancy in Q3 retention bonus payment",
          employee: {
            id: "EMP-410",
            name: "Alex Johnson",
            department: "Platform Engineering",
            email: "alex.johnson@enterprise.internal"
          },
          category: "payroll",
          priority: "high",
          status: "in_review",
          waitingTime: "3h 42m",
          aiTriage: {
            confidence: 0.98,
            classification: "Payroll Discrepancy / Bonus Adjustment",
            autoRouted: true
          }
        }
      ]
    }
  },
  {
    method: 'POST',
    path: '/api/v1/requests',
    category: 'Requests',
    description: 'Creates a new HR ticket and queues it for autonomous AI routing.',
    requestBody: {
      title: "Sabbatical policy clarification for Q1",
      employeeId: "EMP-388",
      category: "leave",
      priority: "medium",
      description: "Employee requesting 60-day unpaid sabbatical to participate in international fellowship."
    },
    responseBody: {
      id: "HR-1029",
      status: "open",
      createdAt: "2026-10-24T12:00:00Z"
    }
  },
  {
    method: 'POST',
    path: '/api/v1/requests/:id/review',
    category: 'Requests',
    description: 'Executes an HR review decision, appends specialist justification notes, and marks case resolved.',
    requestBody: {
      action: "resolve",
      notes: "Reconciled bonus delta with Finance. Difference scheduled for Nov 1 cycle.",
      assigneeId: "usr_9410"
    },
    responseBody: {
      id: "HR-1028",
      status: "resolved",
      resolvedAt: "2026-10-24T12:05:00Z"
    }
  },
  {
    method: 'GET',
    path: '/api/v1/ai/triage/queue',
    category: 'AI Triage',
    description: 'Retrieves active autonomous classification stream with model confidence scores and reasoning rationale.',
    responseBody: {
      triagedToday: 86,
      routingAccuracy: 99.1,
      queue: [
        {
          id: "TR-904",
          requestId: "HR-1028",
          predictedCategory: "payroll",
          confidenceScore: 0.98,
          urgencyScore: "HIGH",
          reasoning: "Keyword matching: 'withholding', 'retention bonus'. Scanned ledger delta exceeds $3,000 threshold.",
          suggestedAction: "Route to Senior Payroll Specialist; run automated gross comp tool."
        }
      ]
    }
  },
  {
    method: 'POST',
    path: '/api/v1/ai/assist/chat',
    category: 'AI Copilot',
    description: 'Queries the internal RAG engine grounded in company employee handbooks and statutory policies.',
    requestBody: {
      prompt: "What is the maximum allowable sabbatical duration under Section 6.4?",
      employeeContextId: "EMP-410"
    },
    responseBody: {
      reply: "Under Section 6.4 of the Enterprise Handbook, eligible employees with 3+ years of service can take up to 90 consecutive calendar days unpaid.",
      citations: [
        { title: "Enterprise Employee Handbook 2026", section: "Section 6.4 - Sabbatical & Extended Leave", page: 42 }
      ],
      suggestedActions: [
        "Generate Sabbatical Request Form",
        "Verify Employee Tenure"
      ]
    }
  },
  {
    method: 'POST',
    path: '/api/v1/deliverables/:id/approve',
    category: 'Deliverables',
    description: 'Digitally signs and dispatches an official HR response document to the employee.',
    responseBody: {
      deliverableId: "DEL-1024",
      status: "approved",
      dispatchedAt: "2026-10-24T12:10:00Z",
      signatureHash: "sha256:7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069"
    }
  },
  {
    method: 'POST',
    path: '/api/v1/actions/:id/execute',
    category: 'HR Actions',
    description: 'Triggers a 1-click administrative action (e.g. salary adjustment, leave grace period sign-off).',
    responseBody: {
      actionId: "ACT-841",
      status: "completed",
      transactionId: "TX-99318",
      effectiveDate: "2026-11-01"
    }
  }
];

export const BackendDocsView: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const categories = ['All', 'Authentication', 'Dashboard', 'Requests', 'AI Triage', 'AI Copilot', 'Deliverables', 'HR Actions'];

  const filteredEndpoints = selectedCategory === 'All'
    ? endpointCatalog
    : endpointCatalog.filter(e => e.category === selectedCategory);

  const handleCopy = (content: string, idx: number) => {
    navigator.clipboard.writeText(content);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 1500);
  };

  return (
    <div className="flex-1 flex flex-col gap-6">
      {/* Header Info */}
      <div className="rounded-3xl p-6 md:p-8 bg-gradient-to-r from-blue-900/30 via-purple-900/20 to-indigo-900/30 backdrop-blur-2xl border border-white/15 shadow-glass-elevated specular-border flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-400/30 text-cyan-300 font-mono text-xs mb-3">
            <span className="w-1.5 h-1.5 rounded-full bg-neon-cyan animate-pulse" />
            <span>Architecture &amp; Connector Blueprint</span>
          </div>
          <h2 className="font-display text-2xl md:text-3xl font-bold text-white tracking-tight">
            Backend API Integration Specification
          </h2>
          <p className="text-white/60 text-xs md:text-sm mt-1 max-w-2xl font-light">
            This live document outlines every REST endpoint, WebSocket channel, and payload format required to connect this React frontend to your future Node.js, Python (FastAPI/Django), or Go backend.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-black/50 border border-white/10 flex flex-col gap-2 font-mono text-xs">
          <span className="text-white/50 text-[11px]">Quick Switch to Live Mode:</span>
          <code className="text-cyan-300 bg-white/5 px-2 py-1 rounded">
            VITE_USE_MOCK=false
          </code>
          <code className="text-emerald-300 bg-white/5 px-2 py-1 rounded">
            VITE_API_URL=http://localhost:8000/api/v1
          </code>
        </div>
      </div>

      {/* 3 Step Integration Guide */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/10 flex flex-col gap-2">
          <div className="flex items-center gap-2 text-cyan-300 font-mono text-xs font-bold">
            <span className="w-6 h-6 rounded-lg bg-cyan-500/20 flex items-center justify-center">1</span>
            <span>Configure Environment</span>
          </div>
          <p className="text-xs text-white/60 font-light">
            Update <code className="text-white">hr/frontend/.env</code> with your backend port and set <code className="text-white">VITE_USE_MOCK=false</code>.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/10 flex flex-col gap-2">
          <div className="flex items-center gap-2 text-purple-300 font-mono text-xs font-bold">
            <span className="w-6 h-6 rounded-lg bg-purple-500/20 flex items-center justify-center">2</span>
            <span>Enable CORS &amp; Auth</span>
          </div>
          <p className="text-xs text-white/60 font-light">
            Allow origin <code className="text-white">http://localhost:5173</code> in backend CORS headers and return standard Bearer JWT tokens.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/10 flex flex-col gap-2">
          <div className="flex items-center gap-2 text-emerald-300 font-mono text-xs font-bold">
            <span className="w-6 h-6 rounded-lg bg-emerald-500/20 flex items-center justify-center">3</span>
            <span>Implement Endpoints</span>
          </div>
          <p className="text-xs text-white/60 font-light">
            Match the JSON schemas listed below or reference the complete <code className="text-white">hr/BACKEND_INTEGRATION.md</code> file in your workspace.
          </p>
        </div>
      </div>

      {/* Endpoint Explorer */}
      <div className="rounded-3xl p-6 bg-white/[0.04] backdrop-blur-2xl border border-white/10 shadow-glass specular-border space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
          <div>
            <h3 className="font-display text-lg font-bold text-white">
              REST Endpoint Catalog
            </h3>
            <p className="text-xs text-white/50">
              Interactive request &amp; response payload viewer
            </p>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-mono transition-all cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 font-medium'
                    : 'bg-white/5 text-white/60 hover:text-white border border-transparent'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Endpoints List */}
        <div className="space-y-4">
          {filteredEndpoints.map((ep, idx) => {
            const isGet = ep.method === 'GET';
            const isPost = ep.method === 'POST';
            const isPatch = ep.method === 'PATCH';

            return (
              <div
                key={idx}
                className="p-5 rounded-2xl bg-white/[0.03] hover:bg-white/[0.05] border border-white/10 transition-all space-y-4"
              >
                {/* Method & Path Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <span
                      className={`font-mono text-xs px-2.5 py-1 rounded-lg font-bold ${
                        isGet
                          ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                          : isPost
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : isPatch
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : 'bg-rose-500/20 text-rose-300'
                      }`}
                    >
                      {ep.method}
                    </span>
                    <span className="font-mono text-xs md:text-sm text-white font-semibold">
                      {ep.path}
                    </span>
                  </div>
                  <span className="text-[11px] font-mono text-cyan-300/80 px-2 py-0.5 rounded bg-cyan-500/10">
                    {ep.category}
                  </span>
                </div>

                <p className="text-xs text-white/70 font-light">{ep.description}</p>

                {/* Schemas */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  {/* Request Payload */}
                  {ep.requestBody ? (
                    <div>
                      <div className="flex items-center justify-between mb-1 text-[11px] font-mono text-white/50">
                        <span>Request Body (JSON)</span>
                        <button
                          onClick={() => handleCopy(JSON.stringify(ep.requestBody, null, 2), idx * 2)}
                          className="hover:text-cyan-300 transition-colors cursor-pointer"
                        >
                          {copiedIndex === idx * 2 ? 'Copied!' : 'Copy'}
                        </button>
                      </div>
                      <pre className="p-3 rounded-xl bg-black/60 border border-white/10 text-[11px] font-mono text-cyan-200/90 overflow-x-auto max-h-44">
                        {JSON.stringify(ep.requestBody, null, 2)}
                      </pre>
                    </div>
                  ) : (
                    <div className="flex flex-col justify-center p-4 rounded-xl bg-black/30 border border-white/5 text-center text-[11px] font-mono text-white/40">
                      No request body required (Query parameters or URL param only)
                    </div>
                  )}

                  {/* Response Payload */}
                  <div>
                    <div className="flex items-center justify-between mb-1 text-[11px] font-mono text-white/50">
                      <span>Response 200 OK (JSON)</span>
                      <button
                        onClick={() => handleCopy(JSON.stringify(ep.responseBody, null, 2), idx * 2 + 1)}
                        className="hover:text-cyan-300 transition-colors cursor-pointer"
                      >
                        {copiedIndex === idx * 2 + 1 ? 'Copied!' : 'Copy'}
                      </button>
                    </div>
                    <pre className="p-3 rounded-xl bg-black/60 border border-white/10 text-[11px] font-mono text-emerald-200/90 overflow-x-auto max-h-44">
                      {JSON.stringify(ep.responseBody, null, 2)}
                    </pre>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
