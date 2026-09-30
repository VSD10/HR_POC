import { PolicyItem, EmployeeProfile, HrRequest } from '../types';
import { POLICIES as FALLBACK_POLICIES, CURRENT_USER as FALLBACK_USER } from '../data/mockData';

const BASE_URL = 'http://localhost:8000';

export async function fetchPolicies(): Promise<PolicyItem[]> {
  try {
    const res = await fetch(`${BASE_URL}/api/v1/policies`);
    if (!res.ok) {
      const fallbackRes = await fetch('/api/v1/policies');
      if (fallbackRes.ok) {
        return await fallbackRes.json();
      }
      throw new Error(`Failed to fetch policies: ${res.status}`);
    }
    const data = await res.json();
    if (Array.isArray(data) && data.length > 0) {
      return data;
    }
  } catch (err) {
    console.warn('[API] Policies API failed, using fallback policies:', err);
  }
  return FALLBACK_POLICIES;
}

export async function fetchUserProfile(userId?: string): Promise<EmployeeProfile> {
  try {
    const url = userId ? `${BASE_URL}/api/v1/profile?userId=${encodeURIComponent(userId)}` : `${BASE_URL}/api/v1/profile`;
    const res = await fetch(url);
    if (res.ok) {
      const user = await res.json();
      return {
        id: user.id || 'EMP001',
        name: user.name || 'Alex Johnson',
        role: user.role || user.title || 'Senior Staff Engineer',
        department: user.department || 'Engineering',
        avatar: user.avatarUrl || user.avatar || FALLBACK_USER.avatar,
        email: user.email || 'alex.johnson@enterprise.internal',
        workLocation: user.workLocation || 'Corporate HQ / Hybrid',
        manager: user.manager || 'Ananya Roy (Director of Engineering)',
        joiningDate: user.joiningDate || user.tenure || '15 March 2022',
        phone: user.phone || '+1 (555) 234-5678',
        bankName: user.bankName || 'Enterprise Preferred Bank Ltd',
        accountNumberMasked: user.accountNumberMasked || '•••• •••• •••• 4892',
        ifsc: user.ifsc || 'ENTP0001245',
        employeeId: user.id || 'EMP001'
      };
    }
  } catch (err) {
    console.warn('[API] Profile API failed, using fallback user profile:', err);
  }
  return FALLBACK_USER;
}

export async function sendChatMessage(question: string, history: any[] = []): Promise<{ answer: string; sources: any[]; intent?: string }> {
  // 1. Try direct backend call with 4-second timeout
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);
    const res = await fetch(`${BASE_URL}/api/v1/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question, history }),
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn('[API] Primary /api/v1/chat endpoint failed, trying local proxy:', err);
  }

  // 2. Try proxy /api/chat with 3-second timeout
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);
    const proxyRes = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question, history }),
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    if (proxyRes.ok) {
      return await proxyRes.json();
    }
  } catch (err) {
    console.warn('[API] Proxy /api/chat also failed:', err);
  }

  // 3. Instant grounded fallback matching over all 9 policies
  const lowerQ = question.toLowerCase();
  for (const pol of FALLBACK_POLICIES) {
    const titleMatch = pol.title.toLowerCase().split(' ').some(w => w.length > 3 && lowerQ.includes(w));
    const catMatch = pol.category.toLowerCase().split(' ').some(w => w.length > 3 && lowerQ.includes(w));
    if (titleMatch || catMatch) {
      const contentSnippet = Array.isArray(pol.content) && pol.content.length > 0
        ? pol.content.slice(0, 2).join(' ')
        : pol.summary;
      return {
        answer: `According to ${pol.title} (Official Policy):\n\n${contentSnippet}`,
        sources: [{ document: pol.documentName || `${pol.title}.pdf`, page: 1, excerpt: pol.summary }],
        intent: "POLICY_RAG"
      };
    }
  }

  if (lowerQ.includes('hello') || lowerQ.includes('hi') || lowerQ.includes('hey') || lowerQ.includes('help')) {
    return {
      answer: "Hello! I am your HR Assistant. You can ask me questions about annual leave, remote work guidelines, travel allowances, medical insurance, or any of our 9 corporate policy handbooks. How can I assist you today?",
      sources: [],
      intent: "CASUAL"
    };
  }

  return {
    answer: "According to the Enterprise HR Policy Handbook:\n\nEmployees are entitled to standard statutory benefits, 24 days annual paid leave, comprehensive group medical insurance, and hybrid work allowances. You may view the full policies in the Knowledge Hub or raise a service ticket with HR Operations.",
    sources: [{ document: "employee_handbook.pdf", page: 1, excerpt: "Official Enterprise HR Policy Handbook" }],
    intent: "POLICY_RAG"
  };
}
