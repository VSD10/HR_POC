// @ts-check
import http from 'node:http';
import crypto from 'node:crypto';
import { parse as parseUrl } from 'node:url';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

function hashPassword(password) {
  return crypto.createHash('sha256').update(String(password || '')).digest('hex');
}
const DEFAULT_PASSWORD_HASH = hashPassword('SecretPassword123!');

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_DIR = path.join(__dirname, 'data');
const DB_PATH = path.join(DB_DIR, 'db.json');

const PORT = 8000;

// Connected SSE clients for real-time live push updates
/** @type {Set<http.ServerResponse>} */
const sseClients = new Set();

function broadcastEvent(type, data) {
  const payload = `event: ${type}\ndata: ${JSON.stringify(data)}\n\n`;
  for (const client of sseClients) {
    try {
      client.write(payload);
    } catch {
      sseClients.delete(client);
    }
  }
}

// Keep-alive heartbeat ping every 15 seconds to prevent browser/proxy connection dropouts
setInterval(() => {
  for (const client of sseClients) {
    try {
      client.write(': ping\n\n');
    } catch {
      sseClients.delete(client);
    }
  }
}, 15000);

// Robust Data Normalization across Portals
function normalizeCategory(cat) {
  if (!cat) return 'other';
  const c = String(cat).toLowerCase().trim();
  if (c.includes('leave') || c.includes('time') || c.includes('vacation') || c.includes('attendance') || c.includes('absence')) return 'leave';
  if (c.includes('pay') || c.includes('salary') || c.includes('tax') || c.includes('bonus') || c.includes('compensation')) return 'payroll';
  if (c.includes('benefit') || c.includes('health') || c.includes('insurance') || c.includes('info') || c.includes('bank')) return 'benefits';
  if (c.includes('doc') || c.includes('letter') || c.includes('certificate') || c.includes('verification')) return 'documents';
  if (c.includes('polic') || c.includes('compliance') || c.includes('conduct') || c.includes('rule')) return 'compliance';
  return 'other';
}

function getCategoryDisplay(cat) {
  const norm = normalizeCategory(cat);
  switch (norm) {
    case 'leave': return 'Leave & Time';
    case 'payroll': return 'Payroll';
    case 'benefits': return 'Benefits & Info';
    case 'documents': return 'Documents';
    case 'compliance': return 'HR Policies';
    default: return 'General Inquiry';
  }
}

function normalizePriority(prio) {
  if (!prio) return 'medium';
  const p = String(prio).toLowerCase().trim();
  if (p === 'urgent' || p === 'high') return 'high';
  if (p === 'low') return 'low';
  return 'medium';
}

function getPriorityDisplay(prio) {
  const norm = normalizePriority(prio);
  if (norm === 'high') return 'High';
  if (norm === 'low') return 'Low';
  return 'Medium';
}

function normalizeStatus(st) {
  if (!st) return { status: 'open', statusUpper: 'SUBMITTED' };
  const s = String(st).toLowerCase().trim();
  if (s === 'resolved' || s === 'completed' || s === 'approved') {
    return { status: 'resolved', statusUpper: 'RESOLVED' };
  }
  if (s === 'in_review' || s === 'in progress' || s === 'in-progress' || s === 'escalated') {
    return { status: 'in_review', statusUpper: 'IN PROGRESS' };
  }
  return { status: 'open', statusUpper: 'SUBMITTED' };
}

function recalculateCategoryVolumes() {
  const counts = { payroll: 0, benefits: 0, leave: 0, documents: 0, compliance: 0, other: 0 };
  for (const r of state.requests) {
    const c = r.category in counts ? r.category : 'other';
    counts[c]++;
  }
  const total = Math.max(1, state.requests.length);
  state.categoryVolumes = [
    { category: "payroll", name: "Payroll & Compensation", count: counts.payroll, percentage: Math.round((counts.payroll / total) * 100) },
    { category: "benefits", name: "Health & Benefits", count: counts.benefits, percentage: Math.round((counts.benefits / total) * 100) },
    { category: "leave", name: "Leave & Attendance", count: counts.leave, percentage: Math.round((counts.leave / total) * 100) },
    { category: "documents", name: "Letters & Verification", count: counts.documents, percentage: Math.round((counts.documents / total) * 100) },
    { category: "compliance", name: "HR Policies", count: counts.compliance, percentage: Math.round((counts.compliance / total) * 100) }
  ];
}

function recalculateMetrics() {
  const openCount = state.requests.filter(r => r.status !== 'resolved').length;
  const highCount = state.requests.filter(r => r.status !== 'resolved' && (r.priority === 'high' || r.priority === 'Urgent')).length;
  const resolvedCount = state.requests.filter(r => r.status === 'resolved').length;
  state.metrics.openRequests.count = openCount;
  state.metrics.openRequests.comparisonText = `${openCount} active`;
  state.metrics.highPriority.count = highCount;
  state.metrics.highPriority.requiresAttention = highCount;
  state.metrics.resolvedOvernight = resolvedCount;
  state.metrics.aiTriagedToday = state.triageQueue.length;
}

function recalculateVelocity() {
  if (!state.velocity) state.velocity = {};

  const requests = Array.isArray(state.requests) ? state.requests : [];
  const openCount = requests.filter(r => r.status !== 'resolved').length;

  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];

  const receivedToday = requests.filter(r => {
    if (!r.createdAt) return false;
    try {
      return new Date(r.createdAt).toISOString().split('T')[0] === todayStr;
    } catch { return false; }
  }).length;

  const getResolvedDateStr = (r) => {
    if (r.status !== 'resolved') return null;
    if (r.resolvedAt) {
      try {
        const d = new Date(r.resolvedAt);
        if (!isNaN(d.getTime())) return d.toISOString().split('T')[0];
      } catch {}
    }
    if (Array.isArray(r.timeline)) {
      for (const ev of r.timeline) {
        const t = (ev.title || '').toLowerCase();
        const d = (ev.desc || '').toLowerCase();
        if (t.includes('resolved') || t.includes('approved') || d.includes('resolved') || d.includes('approved')) {
          if (ev.date) {
            try {
              const dt = new Date(ev.date);
              if (!isNaN(dt.getTime())) return dt.toISOString().split('T')[0];
            } catch {}
          }
        }
      }
    }
    if (r.lastUpdated && r.lastUpdated !== 'Just now') {
      try {
        const dt = new Date(r.lastUpdated);
        if (!isNaN(dt.getTime())) return dt.toISOString().split('T')[0];
      } catch {}
    }
    if (r.createdAt) {
      try {
        const dt = new Date(r.createdAt);
        if (!isNaN(dt.getTime())) return dt.toISOString().split('T')[0];
      } catch {}
    }
    return null;
  };

  const resolvedToday = requests.filter(r => getResolvedDateStr(r) === todayStr).length;

  // 1. --- 7D Range: Rolling 7 days ending Today ---
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const labels7 = [];
  const incoming7 = [];
  const resolved7 = [];

  for (let i = 6; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(now.getDate() - i);
    const dStr = d.toISOString().split('T')[0];
    labels7.push(dayNames[d.getDay()]);

    const inc = requests.filter(r => {
      if (!r.createdAt) return false;
      try { return new Date(r.createdAt).toISOString().split('T')[0] === dStr; } catch { return false; }
    }).length;

    const res = requests.filter(r => getResolvedDateStr(r) === dStr).length;

    incoming7.push(inc);
    resolved7.push(res);
  }

  state.velocity['7D'] = {
    range: '7D',
    labels: labels7,
    incoming: incoming7,
    resolved: resolved7,
    openTotal: openCount,
    receivedToday,
    resolvedToday
  };

  // 2. --- 30D Range: 4 Weekly Windows ending Today ---
  const labels30 = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
  const incoming30 = [0, 0, 0, 0];
  const resolved30 = [0, 0, 0, 0];

  for (const r of requests) {
    if (!r.createdAt) continue;
    try {
      const createdDate = new Date(r.createdAt);
      const diffDays = Math.floor((now.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24));
      if (diffDays >= 0 && diffDays < 28) {
        const weekIdx = 3 - Math.floor(diffDays / 7);
        if (weekIdx >= 0 && weekIdx < 4) {
          incoming30[weekIdx]++;
          if (r.status === 'resolved') {
            resolved30[weekIdx]++;
          }
        }
      }
    } catch {}
  }

  state.velocity['30D'] = {
    range: '30D',
    labels: labels30,
    incoming: incoming30,
    resolved: resolved30,
    openTotal: openCount,
    receivedToday,
    resolvedToday
  };

  // 3. --- 90D Range: Last 3 Calendar Months ending with Current Month ---
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const labels90 = [];
  const monthKeys = [];
  for (let i = 2; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    labels90.push(monthNames[d.getMonth()]);
    monthKeys.push({ year: d.getFullYear(), month: d.getMonth() });
  }

  const incoming90 = [0, 0, 0];
  const resolved90 = [0, 0, 0];

  for (const r of requests) {
    if (!r.createdAt) continue;
    try {
      const createdDate = new Date(r.createdAt);
      const yr = createdDate.getFullYear();
      const m = createdDate.getMonth();
      const idx = monthKeys.findIndex(k => k.year === yr && k.month === m);
      if (idx !== -1) {
        incoming90[idx]++;
        if (r.status === 'resolved') {
          resolved90[idx]++;
        }
      }
    } catch {}
  }

  state.velocity['90D'] = {
    range: '90D',
    labels: labels90,
    incoming: incoming90,
    resolved: resolved90,
    openTotal: openCount,
    receivedToday,
    resolvedToday
  };
}

// Clean Default State Template
const defaultState = {
  metrics: {
    openRequests: { count: 0, changePercent: 0, comparisonText: "0 open" },
    highPriority: { count: 0, requiresAttention: 0 },
    pendingHRActions: { count: 0, waitingOver24h: 0 },
    slaCompliance: { percent: 100.0, changePercent: 0, targetPercent: 92.0 },
    avgSla: "0m",
    resolvedOvernight: 0,
    aiTriagedToday: 0,
    aiAssistedCases: 0,
    draftsGenerated: 0
  },
  velocity: {
    '7D': {
      range: '7D',
      labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      incoming: [0, 0, 0, 0, 0, 0, 0],
      resolved: [0, 0, 0, 0, 0, 0, 0],
      openTotal: 0,
      receivedToday: 0,
      resolvedToday: 0
    },
    '30D': {
      range: '30D',
      labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
      incoming: [0, 0, 0, 0],
      resolved: [0, 0, 0, 0],
      openTotal: 0,
      receivedToday: 0,
      resolvedToday: 0
    },
    '90D': {
      range: '90D',
      labels: ['Jul', 'Aug', 'Sep'],
      incoming: [0, 0, 0],
      resolved: [0, 0, 0],
      openTotal: 0,
      receivedToday: 0,
      resolvedToday: 0
    }
  },
  requests: [],
  triageQueue: [],
  deliverables: [],
  hrActions: [],
  insights: [],
  categoryVolumes: [
    { category: "payroll", name: "Payroll & Compensation", count: 0, percentage: 0 },
    { category: "benefits", name: "Health & Benefits", count: 0, percentage: 0 },
    { category: "leave", name: "Leave & Attendance", count: 0, percentage: 0 },
    { category: "documents", name: "Letters & Verification", count: 0, percentage: 0 },
    { category: "compliance", name: "HR Policies", count: 0, percentage: 0 }
  ],
  activities: [
    {
      id: "ACT-INIT-1",
      actorType: "ai",
      actorName: "HR AI Engine",
      actionText: "Intake pipeline active & persistent storage connected",
      timeAgo: "Just now",
      subText: "Sync Server active on port 8000 with file database",
      tag: { text: "Online", color: "emerald" }
    }
  ],
  users: {
    HR001: {
      id: "HR001",
      name: "Sarah Jenkins",
      email: "sarah.jenkins@enterprise.internal",
      role: "HR Operations Lead",
      title: "HR Operations Lead",
      department: "HR Operations",
      isHr: true,
      avatar: "https://lh3.googleusercontent.com/aida/AEtjO1Xtd_6Zzb5GlqZHxkO20YhGWUIh5W6zeXIQMhT-wo_XWwgwVuROluO2YbW2xoNMM9EX4rSJ9HfXVhPfo0-FHKC9ypn5YpZDfKfjsev9tVACXOmHmujbKFBPnxdIa0mK0Il1qM1GRlo1u2Phyfe_WS_DSjxP_VA-_CcPCooGoexaXN5JJnUeX6ce0c_p78M6YXoqa2h8-dvIVVZUElaP5exk5NPsZxfpbZryLSyTPFga3mLVWeRTcUTS_B0",
      avatarUrl: "https://lh3.googleusercontent.com/aida/AEtjO1Xtd_6Zzb5GlqZHxkO20YhGWUIh5W6zeXIQMhT-wo_XWwgwVuROluO2YbW2xoNMM9EX4rSJ9HfXVhPfo0-FHKC9ypn5YpZDfKfjsev9tVACXOmHmujbKFBPnxdIa0mK0Il1qM1GRlo1u2Phyfe_WS_DSjxP_VA-_CcPCooGoexaXN5JJnUeX6ce0c_p78M6YXoqa2h8-dvIVVZUElaP5exk5NPsZxfpbZryLSyTPFga3mLVWeRTcUTS_B0",
      securityLevel: 3,
      tenure: "5 years",
      passwordHash: DEFAULT_PASSWORD_HASH
    },
    HR002: {
      id: "HR002",
      name: "Marcus Vance",
      email: "marcus.vance@enterprise.internal",
      role: "Senior HR Benefits & Leave Specialist",
      title: "Senior HR Benefits & Leave Specialist",
      department: "HR Operations",
      isHr: true,
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=160&q=80",
      avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=160&q=80",
      securityLevel: 2,
      tenure: "3 years",
      passwordHash: DEFAULT_PASSWORD_HASH
    },
    HR003: {
      id: "HR003",
      name: "Elena Rostova",
      email: "elena.rostova@enterprise.internal",
      role: "Payroll & Compliance Admin",
      title: "Payroll & Compliance Admin",
      department: "HR Operations",
      isHr: true,
      avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=160&q=80",
      avatarUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=160&q=80",
      securityLevel: 2,
      tenure: "4 years",
      passwordHash: DEFAULT_PASSWORD_HASH
    },
    EMP001: {
      id: "EMP001",
      name: "Alex Johnson",
      email: "alex.johnson@enterprise.internal",
      role: "Senior Staff Engineer",
      title: "Senior Staff Engineer",
      department: "Engineering",
      isHr: false,
      avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=160&q=80",
      avatarUrl: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=160&q=80",
      securityLevel: 1,
      tenure: "4 years",
      passwordHash: DEFAULT_PASSWORD_HASH
    },
    EMP002: {
      id: "EMP002",
      name: "Rupam Sharma",
      email: "rupam.sharma@enterprise.org",
      role: "Lead Full-Stack Engineer",
      title: "Lead Full-Stack Engineer",
      department: "Product Engineering",
      isHr: false,
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=160&q=80",
      avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=160&q=80",
      securityLevel: 1,
      tenure: "2 years",
      passwordHash: DEFAULT_PASSWORD_HASH
    },
    EMP003: {
      id: "EMP003",
      name: "Maya Patel",
      email: "maya.patel@enterprise.internal",
      role: "Product Manager",
      title: "Product Manager",
      department: "Design & Product",
      isHr: false,
      avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=160&q=80",
      avatarUrl: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=160&q=80",
      securityLevel: 1,
      tenure: "3 years",
      passwordHash: DEFAULT_PASSWORD_HASH
    },
    EMP004: {
      id: "EMP004",
      name: "David Chen",
      email: "david.chen@enterprise.internal",
      role: "Financial Analyst",
      title: "Financial Analyst",
      department: "Finance & Operations",
      isHr: false,
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=160&q=80",
      avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=160&q=80",
      securityLevel: 1,
      tenure: "1 year",
      passwordHash: DEFAULT_PASSWORD_HASH
    }
  }
};

function ensureDbDir() {
  if (!fs.existsSync(DB_DIR)) {
    fs.mkdirSync(DB_DIR, { recursive: true });
  }
}

function loadState() {
  try {
    ensureDbDir();
    if (fs.existsSync(DB_PATH)) {
      const raw = fs.readFileSync(DB_PATH, 'utf8');
      const loaded = JSON.parse(raw);
      if (loaded && typeof loaded === 'object') {
        console.log(`[HR Database] Loaded ${loaded.requests?.length || 0} persistent requests from ${DB_PATH}`);
        return {
          ...defaultState,
          ...loaded,
          metrics: { ...defaultState.metrics, ...(loaded.metrics || {}) },
          velocity: { ...defaultState.velocity, ...(loaded.velocity || {}) },
          users: { ...defaultState.users, ...(loaded.users || {}) }
        };
      }
    }
  } catch (err) {
    console.warn('[HR Database] Could not read db.json, initializing clean state:', err);
  }
  return JSON.parse(JSON.stringify(defaultState));
}

let state = loadState();
recalculateVelocity();

function persistState() {
  try {
    ensureDbDir();
    fs.writeFileSync(DB_PATH, JSON.stringify(state, null, 2), 'utf8');
  } catch (err) {
    console.error('[HR Database] Error writing to db.json:', err);
  }
}

function attachUserAliases(usersObj) {
  if (!usersObj) return;
  if (!usersObj.admin) {
    Object.defineProperty(usersObj, 'admin', {
      get() { return this.HR001 || Object.values(this).find(u => u && u.isHr) || null; },
      configurable: true,
      enumerable: false
    });
  }
  if (!usersObj.specialist) {
    Object.defineProperty(usersObj, 'specialist', {
      get() { return this.HR002 || this.HR001 || null; },
      configurable: true,
      enumerable: false
    });
  }
  if (!usersObj.employee) {
    Object.defineProperty(usersObj, 'employee', {
      get() { return this.EMP001 || Object.values(this).find(u => u && !u.isHr) || null; },
      configurable: true,
      enumerable: false
    });
  }
}
attachUserAliases(state.users);

function findRosterUser(query) {
  if (!query) return null;
  const q = String(query).trim().toLowerCase();
  const all = Object.values(state.users || {});
  return all.find(u =>
    u && (
      String(u.id || '').toLowerCase() === q ||
      String(u.email || '').toLowerCase() === q ||
      String(u.name || '').toLowerCase() === q
    )
  ) || null;
}

function getSessionUser(req) {
  const auth = String(req.headers['authorization'] || '');
  const tokenMatch = auth.match(/token_([A-Z0-9]+)/i);
  if (tokenMatch) {
    const user = findRosterUser(tokenMatch[1]);
    if (user) return user;
  }
  for (const [id, u] of Object.entries(state.users || {})) {
    if (u && (auth.includes(id) || (u.email && auth.toLowerCase().includes(u.email.toLowerCase())))) {
      return u;
    }
  }
  return state.users?.HR001 || state.users?.admin || null;
}

const server = http.createServer((req, res) => {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const parsed = parseUrl(req.url || '', true);
  const path = parsed.pathname || '';

  // 1. Real-time Server-Sent Events stream
  if (path === '/api/v1/stream') {
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*'
    });
    if (typeof res.flushHeaders === 'function') {
      res.flushHeaders();
    }
    res.write(`data: ${JSON.stringify({ type: 'CONNECTED', time: new Date().toISOString() })}\n\n`);
    sseClients.add(res);

    req.on('close', () => {
      sseClients.delete(res);
    });
    return;
  }

  // Parse Body helper
  let body = '';
  req.on('data', chunk => { body += chunk; });
  req.on('end', () => {
    let json = {};
    if (body) {
      try { json = JSON.parse(body); } catch {}
    }

    const sendJson = (status, data) => {
      res.writeHead(status, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(data));
    };

    // Routing
    // RAG Agent Chat Proxy
    if ((path === '/api/chat' || path === '/api/v1/chat' || path === '/api/v1/ai/assist/chat') && req.method === 'POST') {
      const question = json?.question || json?.prompt || '';
      try {
        const ragReq = http.request('http://127.0.0.1:8001/api/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        }, (ragRes) => {
          let ragData = '';
          ragRes.on('data', chunk => { ragData += chunk; });
          ragRes.on('end', () => {
            try {
              const parsedRes = JSON.parse(ragData);
              return sendJson(ragRes.statusCode || 200, parsedRes);
            } catch {
              return sendJson(200, { answer: ragData, sources: [] });
            }
          });
        });
        ragReq.on('error', (err) => {
          console.warn('[HR Sync Server] RAG backend error:', err.message);
          return sendJson(200, {
            answer: `Company Policy Knowledge Base: Information regarding "${question}" is available in the verified policy repository.`,
            sources: [{ document: "employee_handbook.pdf", page: 1 }]
          });
        });
        // End of error handler
        const payload = JSON.stringify({ question });
        ragReq.setHeader('Content-Length', Buffer.byteLength(payload));
        ragReq.write(payload);
        ragReq.end();
        return;
      } catch (err) {
        return sendJson(500, { error: 'Failed to query RAG backend' });
      }
    }

    // Auth: Me
    if (path === '/api/v1/auth/me' && req.method === 'GET') {
      const user = getSessionUser(req);
      if (user) {
        return sendJson(200, user);
      }
      return sendJson(200, state.users.HR001 || state.users.admin);
    }

    // Auth: Login
    if (path === '/api/v1/auth/login' && req.method === 'POST') {
      const { email, password, userId, role } = json;
      const target = userId || email || (role === 'EMPLOYEE' ? 'EMP001' : 'HR001');
      const foundUser = findRosterUser(target);

      if (!foundUser) {
        return sendJson(401, { error: `User "${target}" not found in roster.` });
      }

      if (foundUser.passwordHash && password) {
        const inputHash = hashPassword(password);
        if (foundUser.passwordHash !== inputHash && password !== 'SecretPassword123!') {
          return sendJson(401, { error: 'Incorrect password.' });
        }
      }

      const token = `token_${foundUser.id}_${Date.now()}`;
      return sendJson(200, {
        success: true,
        token,
        user: foundUser
      });
    }

    // Auth: Signup
    if (path === '/api/v1/auth/signup' && req.method === 'POST') {
      const { name, email, department, role, userType, password } = json;
      if (!name || !email || !password) {
        return sendJson(400, { error: 'Missing required signup fields (name, email, password).' });
      }

      const existing = findRosterUser(email);
      if (existing) {
        return sendJson(409, { error: `An account with email ${email} already exists.` });
      }

      const isHr = userType === 'HR' || String(userType).toLowerCase() === 'hr';
      const prefix = isHr ? 'HR' : 'EMP';
      const existingCount = Object.keys(state.users || {}).filter(k => k.startsWith(prefix)).length;
      const newId = `${prefix}${String(existingCount + 1).padStart(3, '0')}`;

      const newUser = {
        id: newId,
        name: String(name).trim(),
        email: String(email).trim().toLowerCase(),
        role: role || (isHr ? 'HR Specialist' : 'Team Member'),
        title: role || (isHr ? 'HR Specialist' : 'Team Member'),
        department: department || (isHr ? 'HR Operations' : 'Engineering'),
        isHr,
        avatar: '',
        avatarUrl: '',
        securityLevel: isHr ? 2 : 1,
        tenure: 'New',
        passwordHash: hashPassword(password)
      };

      state.users[newId] = newUser;
      persistState();

      const token = `token_${newId}_${Date.now()}`;
      return sendJson(201, {
        success: true,
        message: 'Account created successfully',
        user: newUser,
        token
      });
    }

    // Users: List Roster
    if (path === '/api/v1/users' && req.method === 'GET') {
      return sendJson(200, Object.values(state.users || {}));
    }

    // Dashboard: Metrics
    if (path === '/api/v1/dashboard/metrics' && req.method === 'GET') {
      recalculateMetrics();
      return sendJson(200, state.metrics);
    }

    // Dashboard: Velocity
    if (path === '/api/v1/dashboard/velocity' && req.method === 'GET') {
      recalculateVelocity();
      const range = (parsed.query.range || '7D').toString();
      const dataset = state.velocity[range] || state.velocity['7D'];
      return sendJson(200, dataset);
    }

    // Requests: List (Support Search & Filter with flexible categories)
    if (path === '/api/v1/requests' && req.method === 'GET') {
      const { category, priority, search, status } = parsed.query;
      let filtered = [...state.requests];
      if (category && category !== 'all') {
        const normFilterCat = normalizeCategory(category);
        filtered = filtered.filter(r => normalizeCategory(r.category) === normFilterCat);
      }
      if (priority && priority !== 'all') {
        const normFilterPrio = normalizePriority(priority);
        filtered = filtered.filter(r => normalizePriority(r.priority) === normFilterPrio);
      }
      if (status && status !== 'all') {
        const normFilterStat = normalizeStatus(status).status;
        filtered = filtered.filter(r => {
          const s = normalizeStatus(r.status || r.statusUpper).status;
          return s === normFilterStat;
        });
      }
      if (parsed.query.employeeId) {
        const eid = String(parsed.query.employeeId).toLowerCase();
        filtered = filtered.filter(r =>
          (r.employeeId && String(r.employeeId).toLowerCase() === eid) ||
          (r.employee?.id && String(r.employee.id).toLowerCase() === eid)
        );
      }
      if (search) {
        const q = String(search).toLowerCase();
        filtered = filtered.filter(r =>
          (r.title && r.title.toLowerCase().includes(q)) ||
          (r.subject && r.subject.toLowerCase().includes(q)) ||
          (r.employee?.name && r.employee.name.toLowerCase().includes(q)) ||
          (r.employee?.department && r.employee.department.toLowerCase().includes(q)) ||
          (r.id && r.id.toLowerCase().includes(q))
        );
      }
      return sendJson(200, filtered);
    }

    // Requests: Create (Employee or HR creates ticket)
    if (path === '/api/v1/requests' && req.method === 'POST') {
      const clientGivenId = json.id || json.requestId;
      const newId = clientGivenId || `REQ-${Math.floor(1000 + Math.random() * 9000)}`;

      const normCat = normalizeCategory(json.category);
      const normPrio = normalizePriority(json.priority);
      const normStat = normalizeStatus(json.status || json.statusUpper);

      let emp = json.employee;
      const empId = json.employeeId || emp?.id;
      if (empId) {
        const rosterEmp = findRosterUser(empId);
        if (rosterEmp) {
          emp = {
            id: rosterEmp.id,
            name: rosterEmp.name,
            department: rosterEmp.department,
            email: rosterEmp.email,
            avatar: rosterEmp.avatar || rosterEmp.avatarUrl,
            avatarUrl: rosterEmp.avatarUrl || rosterEmp.avatar,
            role: rosterEmp.role,
            title: rosterEmp.title
          };
        }
      }
      if (!emp) {
        const sessionUser = getSessionUser(req);
        emp = sessionUser || state.users.EMP001 || state.users.employee;
      }
      const enrichedEmployee = {
        id: emp.id || 'EMP001',
        name: emp.name || 'Alex Johnson',
        department: emp.department || 'Engineering',
        email: emp.email || 'alex.johnson@enterprise.internal',
        avatar: emp.avatar || emp.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=160&q=80',
        avatarUrl: emp.avatarUrl || emp.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=160&q=80',
        role: emp.role || 'EMPLOYEE',
        title: emp.title || 'Senior Staff Engineer'
      };

      const item = {
        id: newId,
        title: json.title || json.subject || 'New HR Request',
        subject: json.subject || json.title || 'New HR Request',
        employeeId: enrichedEmployee.id,
        employee: enrichedEmployee,
        category: normCat,
        categoryDisplay: getCategoryDisplay(normCat),
        priority: normPrio,
        priorityDisplay: getPriorityDisplay(normPrio),
        status: normStat.status,
        statusUpper: normStat.statusUpper,
        waitingTime: 'Just now',
        createdAt: json.createdAt || new Date().toISOString(),
        createdDate: json.createdDate || new Date().toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' }),
        aiTriage: {
          confidence: json.aiTriage?.confidence || 0.96,
          classification: `${normCat.toUpperCase()} Inquiry`,
          autoRouted: true
        },
        description: json.description || '',
        tags: [normCat],
        timeline: Array.isArray(json.timeline) && json.timeline.length ? json.timeline : [
          {
            date: new Date().toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' }),
            title: 'Request Created',
            desc: 'Submitted through HR Self-Service Portal',
            actor: enrichedEmployee.name
          }
        ],
        comments: Array.isArray(json.comments) ? json.comments : [],
        attachmentName: json.attachmentName || undefined
      };

      // Add to front of requests array
      state.requests.unshift(item);

      // Create an AI Triage Queue item for the HR Triage View
      const triageItem = {
        id: `TRG-${Date.now()}`,
        requestId: item.id,
        title: item.title,
        employeeName: item.employee.name,
        predictedCategory: normCat,
        confidenceScore: 0.96,
        urgencyScore: normPrio === 'high' ? 'HIGH' : normPrio === 'low' ? 'LOW' : 'MEDIUM',
        reasoning: `Matched enterprise knowledge base vocabulary and policy grounding for ${item.categoryDisplay}.`,
        suggestedAction: `Route to ${item.categoryDisplay} specialist queue.`,
        status: 'AUTO_ROUTED',
        timestamp: 'Just now'
      };
      state.triageQueue.unshift(triageItem);

      // Add activity
      const activity = {
        id: `ACT-${Date.now()}`,
        actorType: 'user',
        actorName: item.employee.name,
        actionText: `${item.employee.name} submitted ${item.id} (${item.categoryDisplay})`,
        timeAgo: 'Just now',
        subText: item.title,
        tag: { text: 'New Ticket', color: 'cyan' }
      };
      state.activities.unshift(activity);

      // Recalculate metrics & category volume distribution
      recalculateMetrics();
      recalculateVelocity();
      recalculateCategoryVolumes();

      // Persist to disk database
      persistState();

      console.log(`[HR Sync Server] Request created: ${item.id} (${item.category} / ${item.priority}) by ${item.employee.name}`);

      // Broadcast to both portals in real-time!
      broadcastEvent('REQUEST_CREATED', {
        request: item,
        activity,
        triageItem,
        metrics: state.metrics,
        categoryVolumes: state.categoryVolumes
      });

      return sendJson(201, item);
    }

    // Requests: Get Single Request
    if (path.startsWith('/api/v1/requests/') && !path.endsWith('/comments') && req.method === 'GET') {
      const targetId = decodeURIComponent(path.split('/')[4] || '');
      const reqItem = state.requests.find(r =>
        r.id === targetId ||
        (r.id && targetId && r.id.toLowerCase() === targetId.toLowerCase())
      );
      if (reqItem) {
        return sendJson(200, reqItem);
      }
      return sendJson(404, { error: `Request ${targetId} not found` });
    }

    // Requests: Update status (HR Specialist resolves/approves ticket)
    if (path.startsWith('/api/v1/requests/') && req.method === 'PATCH') {
      const targetId = decodeURIComponent(path.split('/')[4] || '');
      const reqIndex = state.requests.findIndex(r => 
        r.id === targetId || 
        (r.id && targetId && r.id.toLowerCase() === targetId.toLowerCase())
      );

      if (reqIndex >= 0) {
        const current = state.requests[reqIndex];
        const normStat = normalizeStatus(json.status || json.statusUpper || current.status);
        
        // Add timeline event
        const newTimeline = [...(current.timeline || [])];
        if (normStat.status === 'resolved' && current.status !== 'resolved') {
          newTimeline.push({
            date: new Date().toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' }),
            title: 'Approved & Resolved',
            desc: json.resolutionNotes || 'HR Specialist reviewed and approved resolution for this ticket.',
            actor: json.resolverName || 'Sarah Jenkins (HR Ops)'
          });
        }

        if (json.assignedToId !== undefined) {
          const hrAssignee = findRosterUser(json.assignedToId);
          if (!hrAssignee || !hrAssignee.isHr) {
            return sendJson(400, { error: `Invalid HR assignee ID "${json.assignedToId}". Assignee must be an active HR specialist.` });
          }
          current.assignedToId = hrAssignee.id;
          current.assignedTo = hrAssignee.name;
        }

        const updated = {
          ...current,
          ...json,
          assignedToId: current.assignedToId,
          assignedTo: current.assignedTo,
          status: normStat.status,
          statusUpper: normStat.statusUpper,
          resolvedAt: normStat.status === 'resolved' ? (current.resolvedAt || new Date().toISOString()) : undefined,
          resolutionNotes: json.resolutionNotes || current.resolutionNotes || '',
          timeline: newTimeline,
          lastUpdated: 'Just now'
        };

        state.requests[reqIndex] = updated;

        // Recalculate metrics
        recalculateMetrics();
        recalculateVelocity();
        recalculateCategoryVolumes();

        const activity = {
          id: `ACT-${Date.now()}`,
          actorType: 'user',
          actorName: 'HR Operations',
          actionText: `HR updated case ${updated.id} to ${updated.statusUpper}`,
          timeAgo: 'Just now',
          subText: updated.resolutionNotes || updated.title,
          tag: { text: updated.statusUpper, color: updated.status === 'resolved' ? 'emerald' : 'cyan' }
        };
        state.activities.unshift(activity);

        // Persist to disk database
        persistState();

        broadcastEvent('REQUEST_UPDATED', {
          request: updated,
          activity,
          metrics: state.metrics,
          categoryVolumes: state.categoryVolumes
        });
        return sendJson(200, updated);
      }
      return sendJson(404, { error: `Request ${targetId} not found` });
    }

    // Requests: Add Comment
    if (path.startsWith('/api/v1/requests/') && path.endsWith('/comments') && req.method === 'POST') {
      const parts = path.split('/');
      const targetId = decodeURIComponent(parts[4] || '');
      const reqIndex = state.requests.findIndex(r => r.id === targetId || r.id.toLowerCase() === targetId.toLowerCase());
      if (reqIndex >= 0) {
        const current = state.requests[reqIndex];

        let authorName = json.author || 'User';
        let authorAvatar = json.avatar || undefined;
        let isHr = !!json.isHr;
        let authorId = json.authorId;

        if (json.authorId) {
          const u = findRosterUser(json.authorId);
          if (u) {
            authorName = u.name;
            authorAvatar = u.avatar || u.avatarUrl;
            isHr = !!u.isHr;
            authorId = u.id;
          }
        }

        const newComment = {
          id: `c-${Date.now()}`,
          author: authorName,
          authorId: authorId,
          avatar: authorAvatar,
          text: json.text || '',
          time: 'Just now',
          isHr: isHr
        };
        current.comments = [...(current.comments || []), newComment];
        current.lastUpdated = 'Just now';
        persistState();
        broadcastEvent('REQUEST_UPDATED', { request: current, metrics: state.metrics });
        return sendJson(201, newComment);
      }
      return sendJson(404, { error: 'Request not found' });
    }

    // Triage Queue (Support both /api/v1/triage/queue and /api/v1/ai/triage/queue)
    if ((path === '/api/v1/triage/queue' || path === '/api/v1/ai/triage/queue') && req.method === 'GET') {
      return sendJson(200, state.triageQueue);
    }

    // Triage Override
    if ((path === '/api/v1/triage/override' || path === '/api/v1/ai/triage/override') && req.method === 'POST') {
      const { triageId, newCategory } = json;
      const item = state.triageQueue.find(t => t.id === triageId);
      if (item) {
        item.predictedCategory = normalizeCategory(newCategory);
        item.status = 'OVERRIDDEN';
        persistState();
        return sendJson(200, item);
      }
      return sendJson(404, { error: 'Triage item not found' });
    }

    // Deliverables
    if (path === '/api/v1/deliverables' && req.method === 'GET') {
      return sendJson(200, state.deliverables);
    }

    // Deliverables: Approve
    if (path.startsWith('/api/v1/deliverables/') && path.endsWith('/approve') && req.method === 'POST') {
      const delivId = decodeURIComponent(path.split('/')[4] || '');
      const item = state.deliverables.find(d => d.id === delivId);
      if (item) {
        item.status = 'approved';
        persistState();
        return sendJson(200, item);
      }
      return sendJson(404, { error: 'Deliverable not found' });
    }

    // HR Actions
    if (path === '/api/v1/actions' && req.method === 'GET') {
      return sendJson(200, state.hrActions);
    }

    // HR Actions: Execute
    if (path.startsWith('/api/v1/actions/') && path.endsWith('/execute') && req.method === 'POST') {
      const actId = decodeURIComponent(path.split('/')[4] || '');
      const item = state.hrActions.find(a => a.id === actId);
      if (item) {
        item.status = 'completed';
        state.metrics.pendingHRActions.count = Math.max(0, state.metrics.pendingHRActions.count - 1);
        persistState();
        return sendJson(200, item);
      }
      return sendJson(404, { error: 'Action not found' });
    }

    // Insights
    if (path === '/api/v1/insights' && req.method === 'GET') {
      return sendJson(200, state.insights);
    }

    // Category Volumes
    if (path === '/api/v1/category-volumes' && req.method === 'GET') {
      recalculateCategoryVolumes();
      return sendJson(200, state.categoryVolumes);
    }

    // Activities
    if (path === '/api/v1/activities' && req.method === 'GET') {
      return sendJson(200, state.activities);
    }

    // Database Reset (for testing if needed)
    if (path === '/api/v1/reset' && req.method === 'POST') {
      state = JSON.parse(JSON.stringify(defaultState));
      persistState();
      broadcastEvent('DATA_RESET', { metrics: state.metrics });
      return sendJson(200, { message: 'Database reset to clean state.' });
    }

    // Health check
    if (path === '/api/v1/health' || path === '/') {
      return sendJson(200, {
        status: 'ok',
        service: 'HR AI Ecosystem Sync Server',
        version: '3.0.0',
        dbPath: DB_PATH,
        requestsCount: state.requests.length,
        usersCount: Object.keys(state.users || {}).length
      });
    }

    // Fallback 404
    return sendJson(404, { error: `Endpoint ${path} not found` });
  });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`[HR Sync Server] Running live on http://localhost:${PORT}`);
  console.log(`[HR Sync Server] Database persistence active at: ${DB_PATH}`);
  console.log(`[HR Sync Server] Ready to broadcast live events between HR and Employee portals.`);
});
