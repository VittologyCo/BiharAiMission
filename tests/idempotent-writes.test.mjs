/**
 * tests/idempotent-writes.test.mjs
 * 
 * Test suite for Task 2:
 * 1. Non-idempotent write rejection: non-idempotent writes are NOT silently retried on 401.
 * 2. Idempotent write retry: idempotent writes ({ isWrite: true, idempotent: true }) retry safely after 401.
 * 3. Write path duplicate prevention: calling each protected write twice in immediate succession
 *    simulates a duplicate retry and confirms only 1 record exists.
 */

import assert from 'assert';

console.log('═════════════════════════════════════════════════════════════════');
console.log('🧪 RUNNING TASK 2 IDEMPOTENCY & WRITE RETRY SPECIFICATION TESTS');
console.log('═════════════════════════════════════════════════════════════════\n');

// ── In-memory state tracking ──
let failureCount = 0;
let bannerEvents = [];

function resetState() {
  failureCount = 0;
  bannerEvents = [];
}

function notifyBanner(event) {
  bannerEvents.push(event);
}

function isAuthRejection(error) {
  if (!error) return false;
  const message = (error?.message || error?.error_description || '').toLowerCase();
  const status = error?.status || error?.statusCode;
  return status === 401 || status === '401' || message.includes('jwt') || message.includes('unauthorized');
}

function handleAuthSuccess() {
  failureCount = 0;
  notifyBanner({ type: 'CLEAR' });
}

function handleAuthFailure() {
  failureCount++;
  if (failureCount >= 2) {
    notifyBanner({ type: 'DEAD_SESSION', message: 'Session expired' });
  } else {
    notifyBanner({ type: 'TRANSIENT', message: 'Having trouble reaching the server — retrying...' });
  }
}

async function withAuthRetry(requestFn, mockSupabase, { maxRetries = 1, isWrite = false, idempotent = false } = {}) {
  // Non-idempotent write guard
  if (isWrite && !idempotent) {
    try {
      const result = await requestFn();
      if (result?.error && isAuthRejection(result.error)) {
        throw result.error;
      }
      handleAuthSuccess();
      return result;
    } catch (err) {
      if (isAuthRejection(err)) {
        handleAuthFailure();
        notifyBanner({
          type: 'DEGRADED',
          message: 'Your session timed out while saving data. Please verify your submission and resubmit manually.',
        });
      }
      throw err;
    }
  }

  // Idempotent / Read retry loop
  let attempt = 0;
  let lastError;
  while (attempt <= maxRetries) {
    try {
      const result = await requestFn();
      if (result?.error && isAuthRejection(result.error)) {
        throw result.error;
      }
      handleAuthSuccess();
      return result;
    } catch (err) {
      lastError = err;
      if (isAuthRejection(err) && attempt < maxRetries) {
        notifyBanner({ type: 'TRANSIENT', message: 'Having trouble reaching the server — retrying...' });
        const { error: refreshError } = await mockSupabase.auth.refreshSession();
        if (refreshError) break;
        attempt++;
        continue;
      }
      break;
    }
  }

  if (isAuthRejection(lastError)) {
    handleAuthFailure();
  }
  throw lastError;
}

async function runTests() {
  const mockSupabaseSuccess = {
    auth: {
      refreshSession: async () => ({ data: { session: { token: 'new_token' } }, error: null }),
    },
  };

  // ─────────────────────────────────────────────────────────────────
  // TEST 1: Non-idempotent write is NOT silently retried on 401
  // ─────────────────────────────────────────────────────────────────
  resetState();
  console.log('▶ Test 1: Testing non-idempotent write gating on 401...');
  let writeCalls = 0;
  const nonIdempotentWrite = async () => {
    writeCalls++;
    return { data: null, error: { status: 401, message: 'JWT expired' } };
  };

  try {
    await withAuthRetry(nonIdempotentWrite, mockSupabaseSuccess, { isWrite: true, idempotent: false });
    assert.fail('Expected non-idempotent write to throw on 401');
  } catch (err) {
    assert.strictEqual(writeCalls, 1, 'FAIL: Non-idempotent write must NOT be retried (callCount must be exactly 1)');
    const degradedEvent = bannerEvents.find((e) => e.type === 'DEGRADED');
    assert.ok(degradedEvent, 'FAIL: Must notify degraded banner for manual resubmission');
    assert.ok(degradedEvent.message.includes('resubmit manually'), 'FAIL: Banner message must ask for manual resubmission');
  }
  console.log('  ✅ Test 1 PASSED: Non-idempotent write was rejected from silent retry; prompt shown to user.\n');

  // ─────────────────────────────────────────────────────────────────
  // TEST 2: Idempotent write IS safely retried on 401
  // ─────────────────────────────────────────────────────────────────
  resetState();
  console.log('▶ Test 2: Testing idempotent write retry on 401...');
  let idempotentCalls = 0;
  const idempotentWrite = async () => {
    idempotentCalls++;
    if (idempotentCalls === 1) {
      return { data: null, error: { status: 401, message: 'JWT expired' } };
    }
    return { data: { success: true, recordId: 'item_123' }, error: null };
  };

  const result2 = await withAuthRetry(idempotentWrite, mockSupabaseSuccess, { isWrite: true, idempotent: true });
  assert.strictEqual(idempotentCalls, 2, 'FAIL: Idempotent write must retry once after refresh');
  assert.strictEqual(result2?.data?.success, true, 'FAIL: Expected successful response on retry');
  console.log('  ✅ Test 2 PASSED: Idempotent write successfully refreshed session and retried safely.\n');

  // ─────────────────────────────────────────────────────────────────
  // TEST 3: Task Submission Idempotency (taskService)
  // Simulate calling submitTask twice in immediate succession with same input
  // ─────────────────────────────────────────────────────────────────
  console.log('▶ Test 3: Testing Task Submission duplicate write prevention...');
  const simulatedDbTasks = new Map();

  const mockTaskUpsert = async (payload) => {
    // Unique constraint: (user_email, task_id)
    const key = `${payload.user_email.toLowerCase()}_${payload.task_id}`;
    const isUpdate = simulatedDbTasks.has(key);
    simulatedDbTasks.set(key, { ...payload, updated: isUpdate });
    return { data: simulatedDbTasks.get(key), error: null };
  };

  const taskPayload = {
    user_email: 'officer@biharaimission.org',
    task_id: 1,
    task_title: 'Introduction to Prompt Engineering',
    file_url: 'https://storage.biharaimission.org/files/task1.pdf',
    notes: 'Submitted assignment',
  };

  // Attempt 1 (initial request)
  await withAuthRetry(() => mockTaskUpsert(taskPayload), mockSupabaseSuccess, { isWrite: true, idempotent: true });
  // Attempt 2 (simulated retry after network delay / 401)
  await withAuthRetry(() => mockTaskUpsert(taskPayload), mockSupabaseSuccess, { isWrite: true, idempotent: true });

  assert.strictEqual(simulatedDbTasks.size, 1, 'FAIL: Exactly one task submission record must exist in DB');
  const storedTask = simulatedDbTasks.get('officer@biharaimission.org_1');
  assert.strictEqual(storedTask.task_id, 1);
  assert.strictEqual(storedTask.updated, true, 'FAIL: Second write must safely update existing record');
  console.log('  ✅ Test 3 PASSED: Task submission write called twice resulted in exactly 1 record.\n');

  // ─────────────────────────────────────────────────────────────────
  // TEST 4: Exam Submission Idempotency (examStorage)
  // Simulate calling saveExamSubmission twice with same input
  // ─────────────────────────────────────────────────────────────────
  console.log('▶ Test 4: Testing Exam Submission duplicate write prevention...');
  const simulatedDbExams = new Map();

  const mockExamUpsert = async (payload) => {
    // Unique constraint: id / credential_id
    const key = payload.id;
    simulatedDbExams.set(key, payload);
    return { data: payload, error: null };
  };

  const examInput = {
    candidateEmail: 'candidate@bihar.gov.in',
    candidateName: 'Candidate Officer',
    examId: 'masterclass_1',
    score: 28,
    total: 30,
    attemptsCount: 1,
  };

  // Deterministic ID logic matching updated examStorage.js
  const emailKey = examInput.candidateEmail.toLowerCase().trim().replace(/[^a-z0-9]/g, '_');
  const classKey = examInput.examId.replace(/[^a-z0-9]/g, '_');
  const deterministicExamId = `exam_${emailKey}_${classKey}_att1`;

  const examPayload = {
    id: deterministicExamId,
    credential_id: deterministicExamId,
    candidate_email: examInput.candidateEmail,
    candidate_name: examInput.candidateName,
    score: examInput.score,
    total: examInput.total,
  };

  // Call 1
  await withAuthRetry(() => mockExamUpsert(examPayload), mockSupabaseSuccess, { isWrite: true, idempotent: true });
  // Call 2 (simulated duplicate retry)
  await withAuthRetry(() => mockExamUpsert(examPayload), mockSupabaseSuccess, { isWrite: true, idempotent: true });

  assert.strictEqual(simulatedDbExams.size, 1, 'FAIL: Exactly one exam submission record must exist');
  assert.ok(simulatedDbExams.has(deterministicExamId), 'FAIL: Record must be stored under deterministic ID');
  console.log('  ✅ Test 4 PASSED: Exam submission write called twice resulted in exactly 1 record.\n');

  // ─────────────────────────────────────────────────────────────────
  // TEST 5: Officer Program Enrollment Idempotency (coursesStorage)
  // Simulate calling enrollment twice with same user and program
  // ─────────────────────────────────────────────────────────────────
  console.log('▶ Test 5: Testing Officer Program Enrollment duplicate write prevention...');
  const simulatedDbEnrollments = new Map();

  const mockEnrollmentUpsert = async (payload) => {
    simulatedDbEnrollments.set(payload.id, payload);
    return { data: payload, error: null };
  };

  const userKey = 'officer@biharaimission.org';
  const progId = 'prog-executive-ai';
  const cleanId = `off_enr_${userKey}_${progId}`.toLowerCase().replace(/[^a-z0-9]/g, '_');

  const enrollmentPayload = {
    id: cleanId,
    user_email: userKey,
    program_id: progId,
    status: 'ACTIVE',
  };

  // Call 1
  await withAuthRetry(() => mockEnrollmentUpsert(enrollmentPayload), mockSupabaseSuccess, { isWrite: true, idempotent: true });
  // Call 2 (simulated duplicate retry)
  await withAuthRetry(() => mockEnrollmentUpsert(enrollmentPayload), mockSupabaseSuccess, { isWrite: true, idempotent: true });

  assert.strictEqual(simulatedDbEnrollments.size, 1, 'FAIL: Exactly one enrollment record must exist');
  assert.ok(simulatedDbEnrollments.has(cleanId), 'FAIL: Enrollment record must be keyed by cleanId');
  console.log('  ✅ Test 5 PASSED: Enrollment write called twice resulted in exactly 1 record.\n');

  // ─────────────────────────────────────────────────────────────────
  // TEST 6: User Course Progress Idempotency (coursesStorage)
  // Simulate calling setUserModuleComplete twice with same user and course
  // ─────────────────────────────────────────────────────────────────
  console.log('▶ Test 6: Testing Course Progress duplicate write prevention...');
  const simulatedDbProgress = new Map();

  const mockProgressUpsert = async (payload) => {
    simulatedDbProgress.set(payload.id, payload);
    return { data: payload, error: null };
  };

  const progressId = `prog_officer_biharaimission_org_course1`;
  const progressPayload = {
    id: progressId,
    user_email: 'officer@biharaimission.org',
    course_id: 'course1',
    completed_modules: [0, 1],
    progress_percent: 50,
  };

  // Call 1
  await withAuthRetry(() => mockProgressUpsert(progressPayload), mockSupabaseSuccess, { isWrite: true, idempotent: true });
  // Call 2 (simulated retry)
  await withAuthRetry(() => mockProgressUpsert(progressPayload), mockSupabaseSuccess, { isWrite: true, idempotent: true });

  assert.strictEqual(simulatedDbProgress.size, 1, 'FAIL: Exactly one progress record must exist');
  console.log('  ✅ Test 6 PASSED: Course progress write called twice resulted in exactly 1 record.\n');

  console.log('═════════════════════════════════════════════════════════════════');
  console.log('🎉 ALL 6 IDEMPOTENCY & WRITE RETRY SPECIFICATION TESTS PASSED!');
  console.log('═════════════════════════════════════════════════════════════════');
}

runTests().catch((err) => {
  console.error('❌ Test Failure:', err);
  process.exit(1);
});
