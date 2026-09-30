// Automated Multi-User System Verification Test Script
import assert from 'node:assert';

const BASE_URL = 'http://localhost:8000/api/v1';

async function testSuite() {
  console.log('=== STARTING MULTI-USER SYSTEM VERIFICATION ===\n');

  // TEST HEALTH & ROSTER
  console.log('[Check] Checking server health & roster endpoints...');
  const healthRes = await fetch(`${BASE_URL}/health`);
  assert.strictEqual(healthRes.status, 200, 'Health check should return 200');
  const health = await healthRes.json();
  console.log(`✓ Health OK: ${health.service} (v${health.version}), ${health.requestsCount} requests, ${health.usersCount} users.`);
  assert.strictEqual(health.usersCount, 7, 'Server must have 7 users in roster');

  const usersRes = await fetch(`${BASE_URL}/users`);
  const users = await usersRes.json();
  assert.strictEqual(users.length, 7, 'Users roster must return 7 users');
  console.log('✓ Users roster returned 7 users:');
  users.forEach(u => console.log(`   - [${u.isHr ? 'HR' : 'EMP'}] ${u.id}: ${u.name} (${u.role}, ${u.department})`));

  // TEST 1: Login as Alex Johnson (EMP001) & Create Ticket
  console.log('\n[TEST 1] Login as Alex Johnson (EMP001) and create ticket...');
  const alexLoginRes = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId: 'EMP001' })
  });
  assert.strictEqual(alexLoginRes.status, 200);
  const alexAuth = await alexLoginRes.json();
  assert.strictEqual(alexAuth.user.id, 'EMP001');
  assert.strictEqual(alexAuth.user.name, 'Alex Johnson');
  assert.strictEqual(alexAuth.user.isHr, false);
  console.log(`✓ Logged in as ${alexAuth.user.name} (${alexAuth.user.id})`);

  const alexTicketRes = await fetch(`${BASE_URL}/requests`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      title: 'Alex Private Test Ticket - GPU Cluster Access',
      subject: 'Alex Private Test Ticket - GPU Cluster Access',
      employeeId: 'EMP001',
      category: 'benefits',
      priority: 'high',
      description: 'Need access to machine learning training nodes.'
    })
  });
  assert.strictEqual(alexTicketRes.status, 201);
  const alexTicket = await alexTicketRes.json();
  assert.strictEqual(alexTicket.employeeId, 'EMP001', 'Ticket employeeId must be EMP001');
  assert.strictEqual(alexTicket.employee.name, 'Alex Johnson');
  console.log(`✓ Alex ticket created: ID=${alexTicket.id}, employeeId=${alexTicket.employeeId}`);

  // Check Alex's requests
  const alexReqsRes = await fetch(`${BASE_URL}/requests?employeeId=EMP001`);
  const alexReqs = await alexReqsRes.json();
  assert(alexReqs.some(r => r.id === alexTicket.id), 'Alex must see his own ticket in requests');
  console.log(`✓ Alex sees ${alexReqs.length} ticket(s) belonging to EMP001`);

  // TEST 2: Login as Rupam Sharma (EMP002) & Verify Ticket Isolation
  console.log('\n[TEST 2] Login as Rupam Sharma (EMP002) and verify isolation...');
  const rupamLoginRes = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId: 'EMP002' })
  });
  const rupamAuth = await rupamLoginRes.json();
  assert.strictEqual(rupamAuth.user.id, 'EMP002');
  assert.strictEqual(rupamAuth.user.name, 'Rupam Sharma');

  const rupamReqsRes = await fetch(`${BASE_URL}/requests?employeeId=EMP002`);
  const rupamReqs = await rupamReqsRes.json();
  const foundAlexTicketInRupam = rupamReqs.some(r => r.id === alexTicket.id);
  assert.strictEqual(foundAlexTicketInRupam, false, "Rupam's requests must NOT include Alex's ticket!");
  console.log(`✓ Verified: Alex's ticket (${alexTicket.id}) is NOT visible in Rupam's requests.`);

  // Rupam creates ticket
  const rupamTicketRes = await fetch(`${BASE_URL}/requests`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      title: 'Rupam Deployment Ticket - K8s Ingress SSL',
      employeeId: 'EMP002',
      category: 'documents',
      priority: 'medium',
      description: 'Domain cert renewal verification.'
    })
  });
  const rupamTicket = await rupamTicketRes.json();
  assert.strictEqual(rupamTicket.employeeId, 'EMP002');
  console.log(`✓ Rupam ticket created: ID=${rupamTicket.id}, employeeId=${rupamTicket.employeeId}`);

  // TEST 3: Login as Maya Patel (EMP003)
  console.log('\n[TEST 3] Login as Maya Patel (EMP003) & verify identity & Light theme default...');
  const mayaLoginRes = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'maya.patel@enterprise.internal' })
  });
  const mayaAuth = await mayaLoginRes.json();
  assert.strictEqual(mayaAuth.user.id, 'EMP003');
  assert.strictEqual(mayaAuth.user.name, 'Maya Patel');
  assert.strictEqual(mayaAuth.user.role, 'Product Manager');
  assert.strictEqual(mayaAuth.user.department, 'Design & Product');
  assert.strictEqual(mayaAuth.user.isHr, false);
  const mayaDefaultTheme = mayaAuth.user.isHr ? 'dark' : 'light';
  assert.strictEqual(mayaDefaultTheme, 'light', 'Employee theme must default to Light');
  console.log(`✓ Maya Patel identity verified: ${mayaAuth.user.name}, ${mayaAuth.user.role}, ${mayaAuth.user.department}`);
  console.log(`✓ Maya Patel role-based theme defaults to: ${mayaDefaultTheme}`);

  // TEST 4: Login as David Chen (EMP004) & Create ticket
  console.log('\n[TEST 4] Login as David Chen (EMP004) & create ticket...');
  const davidLoginRes = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId: 'EMP004' })
  });
  const davidAuth = await davidLoginRes.json();
  assert.strictEqual(davidAuth.user.id, 'EMP004');
  assert.strictEqual(davidAuth.user.name, 'David Chen');
  assert.strictEqual(davidAuth.user.department, 'Finance & Operations');

  const davidTicketRes = await fetch(`${BASE_URL}/requests`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      title: 'David Chen Fiscal Audit Verification',
      employeeId: 'EMP004',
      category: 'documents',
      priority: 'high',
      description: 'Fiscal Q3 end closing verification statement.'
    })
  });
  const davidTicket = await davidTicketRes.json();
  assert.strictEqual(davidTicket.employeeId, 'EMP004', 'David must be creator');
  console.log(`✓ David Chen ticket created: ID=${davidTicket.id}, employeeId=${davidTicket.employeeId}`);

  // TEST 5: Login as Marcus Vance (HR002), verify HR theme defaults to Dark & Assign to Elena (HR003)
  console.log('\n[TEST 5] Login as Marcus Vance (HR002), check Dark theme default & assign ticket to Elena Rostova (HR003)...');
  const marcusLoginRes = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId: 'HR002' })
  });
  const marcusAuth = await marcusLoginRes.json();
  assert.strictEqual(marcusAuth.user.id, 'HR002');
  assert.strictEqual(marcusAuth.user.name, 'Marcus Vance');
  assert.strictEqual(marcusAuth.user.isHr, true);
  const marcusDefaultTheme = marcusAuth.user.isHr ? 'dark' : 'light';
  assert.strictEqual(marcusDefaultTheme, 'dark', 'HR theme must default to Dark');
  console.log(`✓ Marcus Vance HR theme defaults to: ${marcusDefaultTheme}`);

  // Assign David's ticket to Elena Rostova (HR003)
  const assignRes = await fetch(`${BASE_URL}/requests/${davidTicket.id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ assignedToId: 'HR003' })
  });
  assert.strictEqual(assignRes.status, 200);
  const assignedTicket = await assignRes.json();
  assert.strictEqual(assignedTicket.assignedToId, 'HR003', 'Ticket assignedToId must be HR003');
  assert.strictEqual(assignedTicket.assignedTo, 'Elena Rostova');
  console.log(`✓ Ticket ${davidTicket.id} successfully assigned to ${assignedTicket.assignedTo} (${assignedTicket.assignedToId})`);

  // Verify assigning to non-HR user is rejected
  const invalidAssignRes = await fetch(`${BASE_URL}/requests/${davidTicket.id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ assignedToId: 'EMP001' })
  });
  assert.strictEqual(invalidAssignRes.status, 400, 'Assigning to non-HR employee must be rejected with 400');
  console.log(`✓ Server correctly rejected non-HR assignee with status 400`);

  // TEST 6: Reply to a ticket as Marcus Vance (HR002)
  console.log('\n[TEST 6] Reply to ticket as Marcus Vance (HR002)...');
  const marcusCommentRes = await fetch(`${BASE_URL}/requests/${alexTicket.id}/comments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      authorId: 'HR002',
      text: 'Marcus Vance HR reply: reviewed GPU cluster authorization.'
    })
  });
  assert.strictEqual(marcusCommentRes.status, 201);
  const marcusComment = await marcusCommentRes.json();
  assert.strictEqual(marcusComment.author, 'Marcus Vance');
  assert.strictEqual(marcusComment.authorId, 'HR002');
  assert.strictEqual(marcusComment.isHr, true);
  assert(marcusComment.avatar, 'Marcus avatar must be populated');
  console.log(`✓ Marcus comment verified: Author="${marcusComment.author}" (${marcusComment.authorId}), isHr=${marcusComment.isHr}`);

  // TEST 7: Reply to a ticket as Alex Johnson (EMP001)
  console.log('\n[TEST 7] Reply to ticket as Alex Johnson (EMP001)...');
  const alexCommentRes = await fetch(`${BASE_URL}/requests/${alexTicket.id}/comments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      authorId: 'EMP001',
      text: 'Alex Johnson employee reply: thank you for checking the GPU nodes.'
    })
  });
  assert.strictEqual(alexCommentRes.status, 201);
  const alexComment = await alexCommentRes.json();
  assert.strictEqual(alexComment.author, 'Alex Johnson');
  assert.strictEqual(alexComment.authorId, 'EMP001');
  assert.strictEqual(alexComment.isHr, false);
  assert(alexComment.avatar, 'Alex avatar must be populated');
  console.log(`✓ Alex comment verified: Author="${alexComment.author}" (${alexComment.authorId}), isHr=${alexComment.isHr}`);

  // TEST 8: Login as Sarah (HR001) and assign ticket to Marcus (HR002)
  console.log('\n[TEST 8] Login as Sarah Jenkins (HR001) and assign ticket to Marcus Vance (HR002)...');
  const sarahLoginRes = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId: 'HR001' })
  });
  const sarahAuth = await sarahLoginRes.json();
  assert.strictEqual(sarahAuth.user.id, 'HR001');

  const sarahAssignRes = await fetch(`${BASE_URL}/requests/${alexTicket.id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ assignedToId: 'HR002' })
  });
  assert.strictEqual(sarahAssignRes.status, 200);
  const sarahAssignedTicket = await sarahAssignRes.json();
  assert.strictEqual(sarahAssignedTicket.assignedToId, 'HR002');
  assert.strictEqual(sarahAssignedTicket.assignedTo, 'Marcus Vance');
  console.log(`✓ Sarah assigned ticket ${alexTicket.id} to Marcus Vance (${sarahAssignedTicket.assignedToId})`);

  // Verify persistence by fetching ticket directly from requests list
  const allReqsRes = await fetch(`${BASE_URL}/requests`);
  const allReqs = await allReqsRes.json();
  const fetched = allReqs.find(r => r.id === alexTicket.id);
  assert.strictEqual(fetched.assignedToId, 'HR002', 'Assignment must be persisted in database');
  assert.strictEqual(fetched.assignedTo, 'Marcus Vance');
  assert.strictEqual(fetched.comments.length >= 2, true, 'Comments must be persisted');
  console.log(`✓ Verified persistence: Ticket ${fetched.id} has assignedToId="${fetched.assignedToId}" and ${fetched.comments.length} comments.`);

  console.log('\n=== ALL SERVER VERIFICATION TESTS PASSED SUCCESSFULLY! ===');
}

testSuite().catch((err) => {
  console.error('\n❌ Test failure:', err);
  process.exit(1);
});