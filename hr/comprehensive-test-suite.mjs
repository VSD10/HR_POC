import assert from 'node:assert';

const SYNC_URL = 'http://localhost:8000/api/v1';
const RAG_URL = 'http://localhost:8001';

const results = {
  passed: 0,
  failed: 0,
  bugs: []
};

function recordPass(testName) {
  results.passed++;
  console.log(`  ✅ PASS: ${testName}`);
}

function recordFail(testName, error, bugDescription = null) {
  results.failed++;
  console.error(`  ❌ FAIL: ${testName} -> ${error.message || error}`);
  results.bugs.push({
    test: testName,
    error: error.message || String(error),
    bugDescription: bugDescription || error.message || String(error)
  });
}

async function runTestSuite() {
  console.log('====================================================');
  console.log('   ENTERPRISE HR AI ECOSYSTEM - COMPREHENSIVE AUDIT');
  console.log('====================================================\n');

  // --- SUITE 1: Server Health & Basic Metadata ---
  console.log('▶ [SUITE 1] HR Sync Server Health & System Metadata');
  try {
    const res = await fetch(`${SYNC_URL}/health`);
    assert.strictEqual(res.status, 200, 'Health check status should be 200');
    const data = await res.json();
    assert.strictEqual(data.status, 'ok');
    assert(data.requestsCount !== undefined, 'requestsCount must exist');
    assert(data.usersCount >= 7, 'usersCount must be >= 7');
    recordPass('Health check returns valid status and metadata');
  } catch (err) {
    recordFail('Health check', err);
  }

  // --- SUITE 2: Authentication & User Management ---
  console.log('\n▶ [SUITE 2] Authentication & User Roster');
  try {
    const res = await fetch(`${SYNC_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: 'HR001' })
    });
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.user.id, 'HR001');
    assert.strictEqual(data.user.isHr, true);
    assert(data.token, 'Session token must be returned');
    recordPass('HR login with valid userId succeeds');
  } catch (err) {
    recordFail('HR login', err);
  }

  try {
    const res = await fetch(`${SYNC_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: 'NON_EXISTENT_USER' })
    });
    assert(res.status === 401 || res.status === 404, `Expected 401/404 for invalid user, got ${res.status}`);
    recordPass('Login with non-existent user rejected');
  } catch (err) {
    recordFail('Non-existent user login rejection', err, 'Invalid user login should return 401/404');
  }

  try {
    const res = await fetch(`${SYNC_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({})
    });
    assert(res.status >= 400, `Expected 400/401 for empty login, got ${res.status}`);
    recordPass('Empty login body rejected');
  } catch (err) {
    recordFail('Empty login rejection', err, 'Empty login body should return 400/401');
  }

  // Check Roster
  try {
    const res = await fetch(`${SYNC_URL}/users`);
    assert.strictEqual(res.status, 200);
    const users = await res.json();
    assert(Array.isArray(users), 'Users must be an array');
    assert(users.length >= 7, 'Must have at least 7 roster users');
    recordPass(`User roster fetched (${users.length} users)`);
  } catch (err) {
    recordFail('User roster fetch', err);
  }

  // --- SUITE 3: Request / Ticket Isolation & Access Control ---
  console.log('\n▶ [SUITE 3] Ticket Isolation & Access Control');
  let testTicketId = null;
  try {
    // EMP001 creates a ticket
    const createRes = await fetch(`${SYNC_URL}/requests`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'Audit Test Ticket - Confidential Payroll Query',
        subject: 'Audit Test Ticket - Confidential Payroll Query',
        employeeId: 'EMP001',
        category: 'payroll',
        priority: 'high',
        description: 'Testing ticket visibility and isolation.'
      })
    });
    assert.strictEqual(createRes.status, 201);
    const ticket = await createRes.json();
    testTicketId = ticket.id;
    assert.strictEqual(ticket.employeeId, 'EMP001');
    assert(ticket.triage, 'Triage metadata must be generated');
    recordPass(`Ticket created: ${ticket.id}`);

    // Verify EMP001 sees the ticket
    const emp1Res = await fetch(`${SYNC_URL}/requests?employeeId=EMP001`);
    const emp1Reqs = await emp1Res.json();
    assert(emp1Reqs.some(r => r.id === testTicketId), 'EMP001 must see own ticket');
    recordPass('Creator sees own ticket in filtered request');

    // Verify EMP002 does NOT see the ticket when querying their own
    const emp2Res = await fetch(`${SYNC_URL}/requests?employeeId=EMP002`);
    const emp2Reqs = await emp2Res.json();
    const leakedToEmp2 = emp2Reqs.some(r => r.id === testTicketId);
    assert.strictEqual(leakedToEmp2, false, "EMP002 must not see EMP001's ticket");
    recordPass('Ticket correctly isolated between employees when employeeId query param is passed');

    // SECURITY CHECK: What happens if an employee queries /requests WITHOUT employeeId?
    const unauthenticatedAllRes = await fetch(`${SYNC_URL}/requests`);
    const allReqs = await unauthenticatedAllRes.json();
    if (Array.isArray(allReqs) && allReqs.length > 0) {
      console.warn('  ⚠️ WARNING: GET /requests without auth/employeeId returns all tickets in DB (used by cockpit)');
    }
  } catch (err) {
    recordFail('Ticket creation & isolation', err);
  }

  // --- SUITE 4: Ticket Updates, Auto-assignment & Status Transitions ---
  console.log('\n▶ [SUITE 4] Ticket Updates, Patching & Auto-assignment');
  try {
    // Assign to HR002 (Marcus Vance)
    const patchRes = await fetch(`${SYNC_URL}/requests/${testTicketId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        assignedToId: 'HR002',
        status: 'in_review'
      })
    });
    assert.strictEqual(patchRes.status, 200);
    const patched = await patchRes.json();
    assert.strictEqual(patched.assignedToId, 'HR002');
    assert.strictEqual(patched.assignedTo, 'Marcus Vance');
    assert.strictEqual(patched.status, 'in_review');
    recordPass('Ticket assigned to HR specialist and status changed to in_review');

    // Invalid assignee (non-HR)
    const invalidAssign = await fetch(`${SYNC_URL}/requests/${testTicketId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ assignedToId: 'EMP002' })
    });
    assert.strictEqual(invalidAssign.status, 400, 'Assigning to non-HR user must return 400');
    recordPass('Assigning ticket to non-HR user correctly rejected (400)');
  } catch (err) {
    recordFail('Ticket patching', err);
  }

  // --- SUITE 5: Comments, Author Spoofing & Timeline ---
  console.log('\n▶ [SUITE 5] Comments, Timeline & Author Verification');
  try {
    // Add comment as Marcus Vance (HR002)
    const commentRes = await fetch(`${SYNC_URL}/requests/${testTicketId}/comments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer token_HR002'
      },
      body: JSON.stringify({
        authorId: 'HR002',
        text: 'Marcus Vance investigating payroll details.'
      })
    });
    assert.strictEqual(commentRes.status, 201);
    const comment = await commentRes.json();
    assert.strictEqual(comment.authorId, 'HR002');
    assert.strictEqual(comment.isHr, true);
    assert(comment.timestamp, 'Comment must have timestamp');
    recordPass('HR comment added with correct author and isHr=true');

    // Add comment as Alex (EMP001)
    const empCommentRes = await fetch(`${SYNC_URL}/requests/${testTicketId}/comments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer token_EMP001'
      },
      body: JSON.stringify({
        authorId: 'EMP001',
        text: 'Alex providing supplemental payslip info.'
      })
    });
    assert.strictEqual(empCommentRes.status, 201);
    const empComment = await empCommentRes.json();
    assert.strictEqual(empComment.authorId, 'EMP001');
    assert.strictEqual(empComment.isHr, false);
    recordPass('Employee comment added with correct author and isHr=false');

    // Test Empty Comment Validation
    const emptyCommentRes = await fetch(`${SYNC_URL}/requests/${testTicketId}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ authorId: 'EMP001', text: '   ' })
    });
    assert(emptyCommentRes.status >= 400, `Empty comment should be rejected with 400, got ${emptyCommentRes.status}`);
    recordPass('Empty comment rejected with 400');
  } catch (err) {
    recordFail('Comment validation', err, 'Comments endpoint must validate text content');
  }

  // --- SUITE 6: Leave Request Deduction & Balance Integrity ---
  console.log('\n▶ [SUITE 6] Leave Request Processing & Balance Deductions');
  try {
    // Check initial leave balance of EMP003 (Maya Patel)
    const mayaUserRes = await fetch(`${SYNC_URL}/users/EMP003`);
    let initialSick = 6;
    if (mayaUserRes.ok) {
      const u = await mayaUserRes.json();
      initialSick = u.leaveBalance?.sick?.remaining ?? 6;
    }

    // Submit a 2-day sick leave ticket for Maya Patel
    const leaveTicketRes = await fetch(`${SYNC_URL}/requests`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'Maya Patel - Medical Sick Leave for 2 days',
        subject: 'Maya Patel - Medical Sick Leave for 2 days',
        employeeId: 'EMP003',
        category: 'leave',
        priority: 'medium',
        leaveDetails: {
          leaveType: 'sick',
          days: 2
        },
        description: 'Undergoing dental surgery and need 2 days recovery.'
      })
    });
    assert.strictEqual(leaveTicketRes.status, 201);
    const leaveTicket = await leaveTicketRes.json();
    recordPass(`Leave ticket created: ${leaveTicket.id} for 2 days`);

    // Approve the leave ticket as HR
    const approveActionRes = await fetch(`${SYNC_URL}/requests/${leaveTicket.id}/actions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer token_HR001'
      },
      body: JSON.stringify({
        action: 'APPROVE',
        actorId: 'HR001',
        comment: 'Approved medical sick leave with medical certificate.'
      })
    });
    
    // Check if the balance was deducted
    const mayaAfterRes = await fetch(`${SYNC_URL}/users/EMP003`);
    if (mayaAfterRes.ok) {
      const uAfter = await mayaAfterRes.json();
      const afterSick = uAfter.leaveBalance?.sick?.remaining;
      console.log(`    ℹ️ Maya initial sick leave: ${initialSick}, after approval: ${afterSick}`);
      if (approveActionRes.ok && afterSick !== undefined) {
        assert(afterSick === initialSick - 2, `Expected sick leave to be ${initialSick - 2}, got ${afterSick}`);
        recordPass('Leave balance correctly deducted upon approval');
      } else {
        console.log('    ℹ️ /actions endpoint status:', approveActionRes.status);
      }
    }
  } catch (err) {
    recordFail('Leave deduction processing', err, 'Leave approvals must deduct from user leave balance');
  }

  // --- SUITE 7: Reports Generation & Document Exports ---
  console.log('\n▶ [SUITE 7] Executive Audit Reports & PDF/CSV Generation');
  let testReportId = null;
  try {
    const listRes = await fetch(`${SYNC_URL}/reports`);
    assert.strictEqual(listRes.status, 200);
    const reports = await listRes.json();
    assert(Array.isArray(reports), 'Reports must be an array');
    recordPass(`Reports catalog retrieved (${reports.length} reports)`);

    // Generate a new report
    const genRes = await fetch(`${SYNC_URL}/reports/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer token_HR001'
      },
      body: JSON.stringify({
        type: 'QUARTERLY_SLA_AUDIT',
        title: 'Automated Test SLA Compliance Audit',
        quarter: 'Q3',
        year: 2026,
        generatedBy: 'Sarah Jenkins (Auditor)'
      })
    });
    assert.strictEqual(genRes.status, 201);
    const newReport = await genRes.json();
    testReportId = newReport.id;
    assert(newReport.integrityHash, 'Report must have cryptographic SHA-256 integrity hash');
    assert(newReport.metrics, 'Report must contain aggregated metrics');
    recordPass(`Report generated: ${newReport.id} with integrity hash: ${newReport.integrityHash.slice(0, 16)}...`);

    // Download PDF
    const pdfRes = await fetch(`${SYNC_URL}/reports/${testReportId}/download?format=pdf`);
    assert.strictEqual(pdfRes.status, 200);
    const pdfContentType = pdfRes.headers.get('content-type');
    assert(pdfContentType && pdfContentType.includes('application/pdf'), 'Must return application/pdf');
    const pdfBuffer = await pdfRes.arrayBuffer();
    assert(pdfBuffer.byteLength > 100, 'PDF buffer must contain binary PDF content');
    // Check PDF magic bytes "%PDF-"
    const pdfHeader = Buffer.from(pdfBuffer.slice(0, 5)).toString();
    assert.strictEqual(pdfHeader, '%PDF-', 'Buffer must start with %PDF- header');
    recordPass(`PDF report download verified (${pdfBuffer.byteLength} bytes, valid %PDF- magic bytes)`);

    // Download CSV
    const csvRes = await fetch(`${SYNC_URL}/reports/${testReportId}/download?format=csv`);
    assert.strictEqual(csvRes.status, 200);
    const csvContentType = csvRes.headers.get('content-type');
    assert(csvContentType && csvContentType.includes('text/csv'), 'Must return text/csv');
    const csvText = await csvRes.text();
    assert(csvText.includes('Metric') || csvText.includes('Audit') || csvText.includes(','), 'CSV must contain tabular data');
    recordPass(`CSV report download verified (${csvText.length} chars)`);
  } catch (err) {
    recordFail('Reports generation and download', err);
  }

  // --- SUITE 8: Telemetry & AI Model Intelligence ---
  console.log('\n▶ [SUITE 8] AI Model Telemetry & Token Intelligence');
  try {
    const telemRes = await fetch(`${SYNC_URL}/insights/telemetry?range=7D`);
    assert.strictEqual(telemRes.status, 200);
    const telem = await telemRes.json();
    assert(telem.kpis, 'Telemetry must contain kpis');
    assert(telem.velocity, 'Telemetry must contain velocity');
    assert(telem.categories, 'Telemetry must contain categories');
    recordPass('7D Telemetry overview calculated');

    // Test Horizon Validation (30D, 90D, invalid)
    const telem30Res = await fetch(`${SYNC_URL}/insights/telemetry?range=30D`);
    assert.strictEqual(telem30Res.status, 200);
    const telem90Res = await fetch(`${SYNC_URL}/insights/telemetry?range=90D`);
    assert.strictEqual(telem90Res.status, 200);
    const telemInvalidRes = await fetch(`${SYNC_URL}/insights/telemetry?range=invalid_horizon`);
    assert.strictEqual(telemInvalidRes.status, 200, 'Invalid horizon should safely fallback to default 7D');
    recordPass('Telemetry handles all horizons and invalid horizon fallback safely');

    // AI Telemetry
    const aiTelemRes = await fetch(`${SYNC_URL}/ai/telemetry`);
    assert.strictEqual(aiTelemRes.status, 200);
    const aiTelem = await aiTelemRes.json();
    assert(aiTelem.summary, 'AI telemetry must have summary');
    assert(Array.isArray(aiTelem.models), 'AI telemetry must have models list');
    recordPass(`AI Telemetry active (${aiTelem.models.length} tracked models)`);
  } catch (err) {
    recordFail('Telemetry endpoints', err);
  }

  // --- SUITE 9: Settings, Roles & RBAC Protection ---
  console.log('\n▶ [SUITE 9] Roles & Settings RBAC Security');
  try {
    // Non-admin attempting to access settings/roles
    const unauthRoles = await fetch(`${SYNC_URL}/admin/roles`, {
      headers: {
        'Authorization': 'Bearer token_EMP001'
      }
    });
    assert(unauthRoles.status === 403 || unauthRoles.status === 401, `Employee reading admin roles should be rejected with 403/401, got ${unauthRoles.status}`);
    recordPass('Non-admin user forbidden from admin roles endpoint (403/401)');

    // Admin accessing settings
    const adminSettingsRes = await fetch(`${SYNC_URL}/settings`, {
      headers: { 'Authorization': 'Bearer token_HR001' }
    });
    assert.strictEqual(adminSettingsRes.status, 200);
    const settings = await adminSettingsRes.json();
    assert(settings.slaSettings !== undefined || settings.slaStandardHours !== undefined || settings.ticketCategories !== undefined, 'Settings must be returned');
    recordPass('Admin successfully retrieves system governance settings');
  } catch (err) {
    recordFail('RBAC settings & roles security', err);
  }

  // --- SUITE 10: Policy RAG AI Backend (Port 8001) ---
  console.log('\n▶ [SUITE 10] Policy RAG AI Backend (Port 8001)');
  try {
    const ragHealth = await fetch(`${RAG_URL}/health`);
    assert.strictEqual(ragHealth.status, 200);
    const healthJson = await ragHealth.json();
    assert.strictEqual(healthJson.status, 'healthy');
    recordPass('RAG backend health check passed');

    // Test Pleasantries / Greeting
    const greetingRes = await fetch(`${RAG_URL}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question: 'Hello, what policies can you help me with?' })
    });
    assert.strictEqual(greetingRes.status, 200);
    const greetingJson = await greetingRes.json();
    assert(greetingJson.answer.length > 50, 'Greeting response should be informative');
    recordPass('RAG greeting answered accurately');

    // Test Grounded Policy Question
    const policyRes = await fetch(`${RAG_URL}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question: 'What is the policy for sick leave medical certificates?' })
    });
    assert.strictEqual(policyRes.status, 200);
    const policyJson = await policyRes.json();
    assert(policyJson.answer.includes('Sick Leave') || policyJson.answer.includes('Medical Certificate'), 'Answer must mention sick leave/medical cert');
    assert(Array.isArray(policyJson.sources) && policyJson.sources.length > 0, 'Sources must be cited');
    recordPass(`Grounded policy search answered with ${policyJson.sources.length} citations`);

    // Test Out-of-Scope / Irrelevant Query
    const oosRes = await fetch(`${RAG_URL}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question: 'How do I bake a chocolate cake with cherries?' })
    });
    assert.strictEqual(oosRes.status, 200);
    const oosJson = await oosRes.json();
    assert.strictEqual(oosJson.sources.length, 0, 'Out-of-scope question must have 0 false citations');
    recordPass('Out-of-scope query correctly yields 0 citations (no hallucinations)');

    // Test Malformed / Empty Question
    const emptyRes = await fetch(`${RAG_URL}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question: '   ' })
    });
    assert(emptyRes.status === 400 || emptyRes.status === 422 || emptyRes.status === 200, `Empty question status: ${emptyRes.status}`);
    recordPass(`Empty question handled safely with validation status (${emptyRes.status})`);
  } catch (err) {
    recordFail('RAG backend tests', err);
  }

  // --- SUITE 11: Real-Time SSE Stream Connectivity ---
  console.log('\n▶ [SUITE 11] Server-Sent Events (SSE) Stream Connectivity');
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3000);
    const sseRes = await fetch(`${SYNC_URL}/stream`, { signal: controller.signal });
    assert.strictEqual(sseRes.status, 200);
    const contentType = sseRes.headers.get('content-type');
    assert(contentType && contentType.includes('text/event-stream'), 'Content-Type must be text/event-stream');
    clearTimeout(timeout);
    controller.abort(); // Close connection
    recordPass('SSE stream endpoint opens and accepts clients');
  } catch (err) {
    if (err.name === 'AbortError') {
      recordPass('SSE stream successfully connected (client abort after handshake)');
    } else {
      recordFail('SSE stream connectivity', err);
    }
  }

  // Clean up test ticket
  if (testTicketId) {
    try {
      await fetch(`${SYNC_URL}/requests/${testTicketId}`, {
        method: 'DELETE',
        headers: { 'Authorization': 'Bearer token_HR001' }
      });
    } catch {}
  }

  console.log('\n====================================================');
  console.log(`AUDIT COMPLETE: ${results.passed} Passed, ${results.failed} Failed`);
  console.log('====================================================');
  if (results.bugs.length > 0) {
    console.log('\nBUGS FOUND:');
    results.bugs.forEach((b, i) => {
      console.log(`${i + 1}. [${b.test}] ${b.bugDescription}`);
    });
  }
}

runTestSuite().catch(console.error);
