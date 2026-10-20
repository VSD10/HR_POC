import http from 'http';

function req(options, body = null) {
  return new Promise((resolve, reject) => {
    const r = http.request(options, (res) => {
      let d = '';
      res.on('data', chunk => d += chunk);
      res.on('end', () => {
        let json = null;
        try { json = JSON.parse(d); } catch { json = d; }
        resolve({ statusCode: res.statusCode, data: json });
      });
    });
    r.on('error', reject);
    if (body) {
      const p = typeof body === 'string' ? body : JSON.stringify(body);
      r.setHeader('Content-Type', 'application/json');
      r.setHeader('Content-Length', Buffer.byteLength(p));
      r.write(p);
    }
    r.end();
  });
}

function assert(cond, msg) {
  if (cond) {
    console.log(`  ✅ PASS: ${msg}`);
  } else {
    console.error(`  ❌ FAIL: ${msg}`);
    process.exitCode = 1;
  }
}

async function test() {
  console.log('================================================================');
  console.log('🧪 VERIFYING HR REQUEST ISOLATION, METRICS SCOPING & CLEANUP');
  console.log('================================================================\n');

  // STEP 1: Wipe all previous requests using cleanup endpoint
  console.log('🧹 1. Cleaning up all previous requests...');
  const cleanRes = await req({
    hostname: 'localhost',
    port: 8000,
    path: '/api/v1/requests/cleanup',
    method: 'POST',
    headers: { 'authorization': 'Bearer token-HR001' }
  });
  assert(cleanRes.statusCode === 200, 'Cleanup endpoint responded with 200 OK');
  assert(cleanRes.data.requestsCount === 0, 'Cleaned database: requestsCount is 0');

  // Verify all HR metrics are at 0
  const mHr1Init = await req({
    hostname: 'localhost',
    port: 8000,
    path: '/api/v1/dashboard/metrics',
    method: 'GET',
    headers: { 'authorization': 'Bearer token-HR001' }
  });
  assert(mHr1Init.data.openRequests.count === 0, 'HR001 initial openRequests count is 0');

  const mHr2Init = await req({
    hostname: 'localhost',
    port: 8000,
    path: '/api/v1/dashboard/metrics',
    method: 'GET',
    headers: { 'authorization': 'Bearer token-HR002' }
  });
  assert(mHr2Init.data.openRequests.count === 0, 'HR002 initial openRequests count is 0');

  // STEP 2: Create 2 requests for EMP001 (assigned to HR002 Marcus Vance)
  console.log('\n📝 2. Creating 2 requests for EMP001 (Assigned to HR002)...');
  await req({
    hostname: 'localhost',
    port: 8000,
    path: '/api/v1/requests',
    method: 'POST',
    headers: { 'x-user-id': 'EMP001' }
  }, {
    employeeId: 'EMP001',
    title: 'Medical Leave Claim 1',
    category: 'leave',
    priority: 'high',
    description: 'First medical leave claim'
  });
  await req({
    hostname: 'localhost',
    port: 8000,
    path: '/api/v1/requests',
    method: 'POST',
    headers: { 'x-user-id': 'EMP001' }
  }, {
    employeeId: 'EMP001',
    title: 'Medical Leave Claim 2',
    category: 'leave',
    priority: 'medium',
    description: 'Second medical leave claim'
  });

  // STEP 3: Create 1 request for EMP002 (assigned to HR001 Sarah Jenkins)
  console.log('\n📝 3. Creating 1 request for EMP002 (Assigned to HR001)...');
  await req({
    hostname: 'localhost',
    port: 8000,
    path: '/api/v1/requests',
    method: 'POST',
    headers: { 'x-user-id': 'EMP002' }
  }, {
    employeeId: 'EMP002',
    title: 'Payroll Tax Query',
    category: 'payroll',
    priority: 'high',
    description: 'Query regarding W-2 tax withholding'
  });

  // STEP 4: Verify HR001 (Sarah Jenkins) sees ONLY her 1 assigned request
  console.log('\n🔍 4. Verifying HR001 isolation...');
  const hr1List = await req({
    hostname: 'localhost',
    port: 8000,
    path: '/api/v1/requests',
    method: 'GET',
    headers: { 'authorization': 'Bearer token-HR001' }
  });
  assert(hr1List.data.length === 1, `HR001 sees exactly 1 ticket, actual: ${hr1List.data.length}`);
  assert(hr1List.data[0].employeeId === 'EMP002', 'HR001 sees ticket from assigned employee EMP002');
  assert(!hr1List.data.some(r => r.employeeId === 'EMP001'), 'HR001 CANNOT see any tickets from EMP001 (assigned to HR002)');

  // Verify HR001 metrics shows count: 1
  const hr1Metrics = await req({
    hostname: 'localhost',
    port: 8000,
    path: '/api/v1/dashboard/metrics',
    method: 'GET',
    headers: { 'authorization': 'Bearer token-HR001' }
  });
  assert(hr1Metrics.data.openRequests.count === 1, `HR001 metrics openRequests count is 1 (NOT 3 total), actual: ${hr1Metrics.data.openRequests.count}`);
  assert(hr1Metrics.data.highPriority.count === 1, `HR001 metrics highPriority count is 1 (NOT 2 total), actual: ${hr1Metrics.data.highPriority.count}`);

  // STEP 5: Verify HR002 (Marcus Vance) sees ONLY his 2 assigned requests
  console.log('\n🔍 5. Verifying HR002 isolation...');
  const hr2List = await req({
    hostname: 'localhost',
    port: 8000,
    path: '/api/v1/requests',
    method: 'GET',
    headers: { 'authorization': 'Bearer token-HR002' }
  });
  assert(hr2List.data.length === 2, `HR002 sees exactly 2 tickets, actual: ${hr2List.data.length}`);
  assert(hr2List.data.every(r => r.employeeId === 'EMP001'), 'HR002 sees tickets only from assigned employee EMP001');
  assert(!hr2List.data.some(r => r.employeeId === 'EMP002'), 'HR002 CANNOT see ticket from EMP002 (assigned to HR001)');

  // Verify HR002 metrics shows count: 2
  const hr2Metrics = await req({
    hostname: 'localhost',
    port: 8000,
    path: '/api/v1/dashboard/metrics',
    method: 'GET',
    headers: { 'authorization': 'Bearer token-HR002' }
  });
  assert(hr2Metrics.data.openRequests.count === 2, `HR002 metrics openRequests count is 2 (NOT 3 total), actual: ${hr2Metrics.data.openRequests.count}`);
  assert(hr2Metrics.data.highPriority.count === 1, `HR002 metrics highPriority count is 1, actual: ${hr2Metrics.data.highPriority.count}`);

  // STEP 6: Verify HR003 (Elena Rostova) sees 0 requests
  console.log('\n🔍 6. Verifying HR003 isolation...');
  const hr3List = await req({
    hostname: 'localhost',
    port: 8000,
    path: '/api/v1/requests',
    method: 'GET',
    headers: { 'authorization': 'Bearer token-HR003' }
  });
  assert(hr3List.data.length === 0, `HR003 sees exactly 0 tickets, actual: ${hr3List.data.length}`);

  const hr3Metrics = await req({
    hostname: 'localhost',
    port: 8000,
    path: '/api/v1/dashboard/metrics',
    method: 'GET',
    headers: { 'authorization': 'Bearer token-HR003' }
  });
  assert(hr3Metrics.data.openRequests.count === 0, `HR003 metrics count is 0, actual: ${hr3Metrics.data.openRequests.count}`);

  // STEP 7: Verify Admin Portal query with scope=all sees all 3 requests
  console.log('\n🔍 7. Verifying Admin Portal scope=all access...');
  const adminAllList = await req({
    hostname: 'localhost',
    port: 8000,
    path: '/api/v1/requests?scope=all',
    method: 'GET',
    headers: { 'authorization': 'Bearer token-HR001' }
  });
  assert(adminAllList.data.length === 3, `Admin with scope=all sees all 3 tickets organization-wide, actual: ${adminAllList.data.length}`);

  // STEP 8: Final cleanup of test requests
  console.log('\n🧹 8. Final cleanup to leave database clean...');
  const finalClean = await req({
    hostname: 'localhost',
    port: 8000,
    path: '/api/v1/requests/cleanup',
    method: 'POST',
    headers: { 'authorization': 'Bearer token-HR001' }
  });
  assert(finalClean.statusCode === 200, 'Final cleanup executed successfully');
  assert(finalClean.data.requestsCount === 0, 'Database confirmed at 0 requests');

  console.log('\n================================================================');
  console.log('🏁 ALL ISOLATION, METRICS AND CLEANUP TESTS PASSED SUCCESSFULLY!');
  console.log('================================================================\n');
}

test().catch(err => {
  console.error('Test error:', err);
  process.exit(1);
});
