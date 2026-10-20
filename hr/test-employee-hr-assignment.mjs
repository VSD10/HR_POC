import http from 'http';

const BASE_URL = 'http://localhost:8000';

function request(options, body = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        let json = null;
        try {
          json = JSON.parse(data);
        } catch {
          json = data;
        }
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          data: json
        });
      });
    });

    req.on('error', reject);

    if (body) {
      const payload = typeof body === 'string' ? body : JSON.stringify(body);
      req.setHeader('Content-Type', 'application/json');
      req.setHeader('Content-Length', Buffer.byteLength(payload));
      req.write(payload);
    }
    req.end();
  });
}

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✅ PASS: ${message}`);
    passed++;
  } else {
    console.error(`  ❌ FAIL: ${message}`);
    failed++;
  }
}

async function runTests() {
  console.log('================================================================');
  console.log('🧪 RUNNING EMPLOYEE-TO-HR ASSIGNMENT & ACCESS CONTROL TEST SUITE');
  console.log('================================================================\n');

  try {
    // -----------------------------------------------------------------
    // TEST 1: Employee initial state and assignments
    // -----------------------------------------------------------------
    console.log('📋 Test 1: Verify Initial Employee Assignments in System State');
    const getEmp1 = await request({
      hostname: 'localhost',
      port: 8000,
      path: '/api/v1/users/EMP001',
      method: 'GET'
    });
    assert(getEmp1.statusCode === 200, 'EMP001 user record retrieved');
    assert(getEmp1.data.assignedHrId === 'HR002', `EMP001 is assigned to HR002 (Marcus Vance), actual: ${getEmp1.data.assignedHrId}`);

    const getEmp2 = await request({
      hostname: 'localhost',
      port: 8000,
      path: '/api/v1/users/EMP002',
      method: 'GET'
    });
    assert(getEmp2.data.assignedHrId === 'HR001', `EMP002 is assigned to HR001 (Sarah Jenkins), actual: ${getEmp2.data.assignedHrId}`);

    // -----------------------------------------------------------------
    // TEST 2: Request Creation automatically inherits employee's assigned HR
    // -----------------------------------------------------------------
    console.log('\n📋 Test 2: Request Creation Binds to Assigned HR Specialist');
    const newReqRes = await request({
      hostname: 'localhost',
      port: 8000,
      path: '/api/v1/requests',
      method: 'POST',
      headers: {
        'x-user-id': 'EMP001'
      }
    }, {
      employeeId: 'EMP001',
      title: 'Q3 Wellness Reimbursement Claim',
      category: 'benefits',
      priority: 'medium',
      description: 'Submitted gym membership receipt for Q3 reimbursement.'
    });

    assert(newReqRes.statusCode === 201, 'Request created successfully');
    const createdReq = newReqRes.data;
    assert(createdReq.assignedHrId === 'HR002', `Created request is bound to assignedHrId HR002, actual: ${createdReq.assignedHrId}`);
    assert(createdReq.assignedHr.includes('Marcus Vance'), `Created request specifies Marcus Vance, actual: ${createdReq.assignedHr}`);

    const ticketId = createdReq.id;

    // -----------------------------------------------------------------
    // TEST 3: HR Specialist can access only their assigned employees' requests
    // -----------------------------------------------------------------
    console.log('\n📋 Test 3: HR Specialist Requests Queue Isolation');
    // HR002 (Marcus Vance) query:
    const hr2List = await request({
      hostname: 'localhost',
      port: 8000,
      path: '/api/v1/requests',
      method: 'GET',
      headers: {
        'authorization': 'Bearer token-HR002'
      }
    });
    assert(hr2List.statusCode === 200, 'HR002 requests retrieved');
    assert(Array.isArray(hr2List.data), 'HR002 response is array');
    const hr2HasTicket = hr2List.data.some(r => r.id === ticketId);
    assert(hr2HasTicket, `HR002 can see ticket ${ticketId} from assigned employee EMP001`);
    const allAssignedToHr2 = hr2List.data.every(r => r.assignedHrId === 'HR002' || r.assignedToId === 'HR002' || r.employeeId === 'EMP001' || r.employeeId === 'EMP004');
    assert(allAssignedToHr2, 'HR002 ONLY sees tickets from employees assigned to HR002');

    // HR003 (Elena Rostova) query:
    const hr3List = await request({
      hostname: 'localhost',
      port: 8000,
      path: '/api/v1/requests',
      method: 'GET',
      headers: {
        'authorization': 'Bearer token-HR003'
      }
    });
    assert(hr3List.statusCode === 200, 'HR003 requests retrieved');
    const hr3HasTicket = hr3List.data.some(r => r.id === ticketId);
    assert(!hr3HasTicket, `HR003 CANNOT see ticket ${ticketId} from unassigned employee EMP001`);

    // -----------------------------------------------------------------
    // TEST 4: Direct URL / ID Access Protection (403 Forbidden)
    // -----------------------------------------------------------------
    console.log('\n📋 Test 4: Direct URL / ID Access Protection Enforcement');
    // HR003 attempts direct GET /requests/:ticketId
    const directGetForbidden = await request({
      hostname: 'localhost',
      port: 8000,
      path: `/api/v1/requests/${ticketId}`,
      method: 'GET',
      headers: {
        'authorization': 'Bearer token-HR003'
      }
    });
    assert(directGetForbidden.statusCode === 403, `Direct GET by unauthorized HR returns 403 Forbidden, actual: ${directGetForbidden.statusCode}`);

    // HR003 attempts direct PATCH /requests/:ticketId (Resolve / Approve)
    const directPatchForbidden = await request({
      hostname: 'localhost',
      port: 8000,
      path: `/api/v1/requests/${ticketId}`,
      method: 'PATCH',
      headers: {
        'authorization': 'Bearer token-HR003'
      }
    }, {
      status: 'resolved',
      action: 'APPROVE',
      notes: 'Unauthorized approval attempt'
    });
    assert(directPatchForbidden.statusCode === 403, `Direct PATCH by unauthorized HR returns 403 Forbidden, actual: ${directPatchForbidden.statusCode}`);

    // HR002 (Authorized) performs direct GET /requests/:ticketId
    const directGetAllowed = await request({
      hostname: 'localhost',
      port: 8000,
      path: `/api/v1/requests/${ticketId}`,
      method: 'GET',
      headers: {
        'authorization': 'Bearer token-HR002'
      }
    });
    assert(directGetAllowed.statusCode === 200, `Direct GET by authorized HR returns 200 OK, actual: ${directGetAllowed.statusCode}`);

    // -----------------------------------------------------------------
    // TEST 5: Employee self-access and other employee restriction
    // -----------------------------------------------------------------
    console.log('\n📋 Test 5: Employee Request Isolation & Ownership');
    // EMP001 (Owner) can view their ticket
    const emp1Get = await request({
      hostname: 'localhost',
      port: 8000,
      path: `/api/v1/requests/${ticketId}`,
      method: 'GET',
      headers: {
        'x-user-id': 'EMP001'
      }
    });
    assert(emp1Get.statusCode === 200, `Submitting employee EMP001 can view own ticket (${ticketId})`);

    // EMP002 (Different employee) attempts direct GET
    const emp2GetForbidden = await request({
      hostname: 'localhost',
      port: 8000,
      path: `/api/v1/requests/${ticketId}`,
      method: 'GET',
      headers: {
        'x-user-id': 'EMP002'
      }
    });
    assert(emp2GetForbidden.statusCode === 403, `Different employee EMP002 gets 403 Forbidden for ticket ${ticketId}`);

    // -----------------------------------------------------------------
    // TEST 6: Non-Admin HR cannot reassign employees or change assignments
    // -----------------------------------------------------------------
    console.log('\n📋 Test 6: Non-Admin Reassignment Prevention');
    const hrAttemptReassign = await request({
      hostname: 'localhost',
      port: 8000,
      path: '/api/v1/admin/assign-hr',
      method: 'POST',
      headers: {
        'authorization': 'Bearer token-HR002'
      }
    }, {
      employeeId: 'EMP001',
      hrId: 'HR003',
      reason: 'Unauthorized specialist reassignment'
    });
    assert(hrAttemptReassign.statusCode === 403, `Non-admin HR specialist receives 403 Forbidden when attempting reassignment, actual: ${hrAttemptReassign.statusCode}`);

    // -----------------------------------------------------------------
    // TEST 7: Admin Reassigns Employee (EMP001: HR002 -> HR003)
    // -----------------------------------------------------------------
    console.log('\n📋 Test 7: Admin Employee Reassignment & Access Transfer');
    const adminReassignRes = await request({
      hostname: 'localhost',
      port: 8000,
      path: '/api/v1/admin/assign-hr',
      method: 'POST',
      headers: {
        'authorization': 'Bearer token-HR001'
      }
    }, {
      employeeId: 'EMP001',
      hrId: 'HR003',
      reason: 'Workload balancing across specialist teams'
    });
    assert(adminReassignRes.statusCode === 200, `Admin successfully reassigns employee, status: ${adminReassignRes.statusCode}`);
    assert(adminReassignRes.data.assignment.newHrId === 'HR003', `Assignment record confirms new HR is HR003`);

    // Verify employee record is updated
    const verifyEmp = await request({
      hostname: 'localhost',
      port: 8000,
      path: '/api/v1/users/EMP001',
      method: 'GET'
    });
    assert(verifyEmp.data.assignedHrId === 'HR003', `EMP001 user record now points to HR003`);

    // -----------------------------------------------------------------
    // TEST 8: Immediate Access Transfer & Previous HR Revocation
    // -----------------------------------------------------------------
    console.log('\n📋 Test 8: Immediate Access Transfer & Revocation Verification');
    // Previous HR (HR002) IMMEDIATELY loses access
    const prevHrDirectGet = await request({
      hostname: 'localhost',
      port: 8000,
      path: `/api/v1/requests/${ticketId}`,
      method: 'GET',
      headers: {
        'authorization': 'Bearer token-HR002'
      }
    });
    assert(prevHrDirectGet.statusCode === 403, `Previous HR (HR002) IMMEDIATELY loses direct GET access (403 Forbidden)`);

    const prevHrDirectPatch = await request({
      hostname: 'localhost',
      port: 8000,
      path: `/api/v1/requests/${ticketId}`,
      method: 'PATCH',
      headers: {
        'authorization': 'Bearer token-HR002'
      }
    }, {
      status: 'resolved',
      action: 'RESOLVE'
    });
    assert(prevHrDirectPatch.statusCode === 403, `Previous HR (HR002) IMMEDIATELY loses direct PATCH/resolve access (403 Forbidden)`);

    // New HR (HR003) GAINS access and can manage / resolve the ticket
    const newHrDirectGet = await request({
      hostname: 'localhost',
      port: 8000,
      path: `/api/v1/requests/${ticketId}`,
      method: 'GET',
      headers: {
        'authorization': 'Bearer token-HR003'
      }
    });
    assert(newHrDirectGet.statusCode === 200, `New HR (HR003) immediately gains direct GET access (200 OK)`);

    const newHrDirectPatch = await request({
      hostname: 'localhost',
      port: 8000,
      path: `/api/v1/requests/${ticketId}`,
      method: 'PATCH',
      headers: {
        'authorization': 'Bearer token-HR003'
      }
    }, {
      status: 'resolved',
      action: 'APPROVE',
      notes: 'Approved wellness reimbursement by newly assigned HR Elena Rostova.'
    });
    assert(newHrDirectPatch.statusCode === 200, `New HR (HR003) successfully approves and resolves ticket (200 OK)`);
    const finalStatus = newHrDirectPatch.data.status || newHrDirectPatch.data.request?.status;
    assert(finalStatus === 'resolved', `Ticket status is now resolved, actual: ${finalStatus}`);

    // -----------------------------------------------------------------
    // TEST 9: Admin Audit Trail & Assignment History Verification
    // -----------------------------------------------------------------
    console.log('\n📋 Test 9: Assignment Audit Trail & History Verification');
    const historyRes = await request({
      hostname: 'localhost',
      port: 8000,
      path: '/api/v1/admin/assignment-history',
      method: 'GET',
      headers: {
        'authorization': 'Bearer token-HR001'
      }
    });
    assert(historyRes.statusCode === 200, `Admin retrieves assignment history (200 OK)`);
    assert(Array.isArray(historyRes.data), `History is array of records`);
    const loggedRecord = historyRes.data.find(h => h.employeeId === 'EMP001' && h.newHrId === 'HR003');
    assert(!!loggedRecord, `Audit trail logs record for EMP001 reassignment to HR003`);
    assert(loggedRecord.previousHrId === 'HR002', `Audit trail records previousHrId HR002`);
    assert(loggedRecord.assignedById === 'HR001', `Audit trail records assignedById HR001 (Admin Sarah Jenkins)`);

    // Non-admin attempting to fetch admin history receives 403
    const nonAdminHistory = await request({
      hostname: 'localhost',
      port: 8000,
      path: '/api/v1/admin/assignment-history',
      method: 'GET',
      headers: {
        'authorization': 'Bearer token-HR002'
      }
    });
    assert(nonAdminHistory.statusCode === 403, `Non-admin receives 403 Forbidden accessing assignment audit history`);

    // Revert EMP001 back to HR002 so subsequent tests or demo state remain clean
    await request({
      hostname: 'localhost',
      port: 8000,
      path: '/api/v1/admin/assign-hr',
      method: 'POST',
      headers: {
        'authorization': 'Bearer token-HR001'
      }
    }, {
      employeeId: 'EMP001',
      hrId: 'HR002',
      reason: 'Test suite cleanup restore'
    });
    console.log('  ✨ Restored EMP001 assignment to HR002 after testing.');

  } catch (err) {
    console.error('Fatal error during test run:', err);
    failed++;
  }

  console.log('\n================================================================');
  console.log(`🏁 TEST SUITE COMPLETED: ${passed} Passed, ${failed} Failed`);
  console.log('================================================================');

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runTests();
