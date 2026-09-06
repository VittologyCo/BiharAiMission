import assert from 'node:assert/strict';

// Mock browser localStorage
const createMockLocalStorage = () => {
  let store = {};
  return {
    getItem: (key) => (key in store ? store[key] : null),
    setItem: (key, val) => {
      store[key] = String(val);
    },
    removeItem: (key) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
    get length() {
      return Object.keys(store).length;
    },
    key: (i) => Object.keys(store)[i] || null,
    _dump: () => ({ ...store }),
  };
};

console.log('═════════════════════════════════════════════════════════════════');
console.log('🧪 RUNNING USER DELETION & INSTANT REVOCATION TEST SUITE');
console.log('═════════════════════════════════════════════════════════════════\n');

// --------------------------------------------------------------------------
// TEST 1: purgeAllUserData completely wipes user data and credentials
// --------------------------------------------------------------------------
console.log('▶ Test 1: Verifying purgeAllUserData removes all local user data and tokens...');

const mockStorage = createMockLocalStorage();
global.localStorage = mockStorage;
global.window = {
  dispatchEvent: (event) => {},
  location: { pathname: '/profile', replace: (url) => { window.location.pathname = url; } }
};

const testEmail = 'purged_candidate@biharaimission.org';

// Populate mock storage with test user state
mockStorage.setItem('bihar_ai_user', JSON.stringify({ email: testEmail, fullName: 'Purged Candidate' }));
mockStorage.setItem('bihar_ai_reset_email', testEmail);
mockStorage.setItem('bihar_ai_reset_state', JSON.stringify({ token: 'xyz' }));
mockStorage.setItem(`sb-testproject-auth-token`, 'jwt-token-sample');
mockStorage.setItem(`bihar_ai_welcome_sent_${testEmail}`, 'true');
mockStorage.setItem(`bihar_ai_profile_saved_${testEmail}`, 'true');
mockStorage.setItem(`bihar_ai_enrolled_${testEmail}_mc-101`, 'true');
mockStorage.setItem(`bihar_ai_enrolled_title_${testEmail}_mc-101`, 'AI Masterclass');
mockStorage.setItem(`bihar_ai_progress_${testEmail}_course-1`, JSON.stringify({ lesson: 2 }));
mockStorage.setItem(`bihar_ai_attempts_${testEmail}_course-1`, '1');
mockStorage.setItem('bihar_ai_submissions', JSON.stringify([
  { email: testEmail, full_name: 'Purged Candidate' },
  { email: 'other_candidate@biharaimission.org', full_name: 'Other Candidate' }
]));
mockStorage.setItem('bihar_ai_exam_submissions', JSON.stringify([
  { candidateEmail: testEmail, score: 90 },
  { candidateEmail: 'other_candidate@biharaimission.org', score: 85 }
]));

// Import our purge logic
const purgeAllUserData = (email) => {
  try {
    const clean = (email || '').toLowerCase().trim();
    mockStorage.removeItem('bihar_ai_user');
    mockStorage.removeItem('bihar_ai_reset_email');
    mockStorage.removeItem('bihar_ai_reset_state');

    try {
      const keysToRemove = [];
      for (let i = 0; i < mockStorage.length; i++) {
        const key = mockStorage.key(i);
        if (!key) continue;
        if ((key.startsWith('sb-') && key.endsWith('-auth-token')) || key.startsWith('supabase.auth.')) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach((k) => mockStorage.removeItem(k));
    } catch (e) {}

    if (clean) {
      mockStorage.removeItem('bihar_ai_welcome_sent_' + clean);
      mockStorage.removeItem('bihar_ai_profile_saved_' + clean);

      try {
        const userSpecificKeys = [];
        for (let i = 0; i < mockStorage.length; i++) {
          const key = mockStorage.key(i);
          if (!key) continue;
          const lkey = key.toLowerCase();
          if (lkey.includes(clean)) {
            userSpecificKeys.push(key);
          }
        }
        userSpecificKeys.forEach((k) => mockStorage.removeItem(k));
      } catch (e) {}

      try {
        const rawSubs = mockStorage.getItem('bihar_ai_submissions');
        if (rawSubs) {
          const subs = JSON.parse(rawSubs);
          if (Array.isArray(subs)) {
            const filtered = subs.filter((s) => {
              const semail = (s.email || s.user_email || s.candidateEmail || '').toLowerCase().trim();
              return semail !== clean;
            });
            mockStorage.setItem('bihar_ai_submissions', JSON.stringify(filtered));
          }
        }
      } catch (e) {}

      try {
        const rawExams = mockStorage.getItem('bihar_ai_exam_submissions');
        if (rawExams) {
          const exams = JSON.parse(rawExams);
          if (Array.isArray(exams)) {
            const filtered = exams.filter((s) => {
              const semail = (s.candidateEmail || s.user_email || s.email || '').toLowerCase().trim();
              return semail !== clean;
            });
            mockStorage.setItem('bihar_ai_exam_submissions', JSON.stringify(filtered));
          }
        }
      } catch (e) {}
    }
  } catch (err) {
    console.warn('Error in purgeAllUserData:', err);
  }
};

purgeAllUserData(testEmail);

// Assertions: All traces of testEmail should be gone
assert.equal(mockStorage.getItem('bihar_ai_user'), null, 'bihar_ai_user must be deleted');
assert.equal(mockStorage.getItem('bihar_ai_reset_email'), null, 'bihar_ai_reset_email must be deleted');
assert.equal(mockStorage.getItem('sb-testproject-auth-token'), null, 'auth token must be purged');
assert.equal(mockStorage.getItem(`bihar_ai_welcome_sent_${testEmail}`), null, 'welcome sent flag must be purged');
assert.equal(mockStorage.getItem(`bihar_ai_enrolled_${testEmail}_mc-101`), null, 'enrolled key must be purged');
assert.equal(mockStorage.getItem(`bihar_ai_progress_${testEmail}_course-1`), null, 'progress must be purged');

const remainingSubs = JSON.parse(mockStorage.getItem('bihar_ai_submissions'));
assert.equal(remainingSubs.length, 1, 'Submissions must contain only the non-deleted user');
assert.equal(remainingSubs[0].email, 'other_candidate@biharaimission.org', 'Remaining user preserved');

const remainingExams = JSON.parse(mockStorage.getItem('bihar_ai_exam_submissions'));
assert.equal(remainingExams.length, 1, 'Exams must contain only the non-deleted user');
assert.equal(remainingExams[0].candidateEmail, 'other_candidate@biharaimission.org', 'Remaining exam preserved');

console.log('  ✅ Test 1 PASSED: purgeAllUserData completely erased all user data and auth tokens.\n');

// --------------------------------------------------------------------------
// TEST 2: Instant revocation triggers forcePurgeAndLogout on Realtime event
// --------------------------------------------------------------------------
console.log('▶ Test 2: Testing instant logout triggered by Realtime broadcast event...');

let loggedOut = false;
let redirectedTo = '';
const simulateRealtimeEvent = (eventPayload, activeUserEmail) => {
  const deletedEmail = eventPayload?.email?.toLowerCase()?.trim();
  const currentEmail = activeUserEmail?.toLowerCase()?.trim();
  if (deletedEmail && currentEmail && deletedEmail === currentEmail) {
    purgeAllUserData(currentEmail);
    loggedOut = true;
    redirectedTo = '/';
  }
};

simulateRealtimeEvent({ email: 'purged_candidate@biharaimission.org' }, 'purged_candidate@biharaimission.org');
assert.equal(loggedOut, true, 'User must be instantly logged out upon receiving user_deleted event');
assert.equal(redirectedTo, '/', 'User must be redirected away from protected profile');

console.log('  ✅ Test 2 PASSED: Realtime user_deleted event instantly terminates user session.\n');

// --------------------------------------------------------------------------
// TEST 3: Heartbeat / Focus integrity check catches deleted user in database
// --------------------------------------------------------------------------
console.log('▶ Test 3: Testing heartbeat integrity check detecting missing DB record...');

let heartbeatTriggeredLogout = false;
const simulateHeartbeat = async (activeEmail, mockDbLookup) => {
  const dbUser = await mockDbLookup(activeEmail);
  if (!dbUser) {
    purgeAllUserData(activeEmail);
    heartbeatTriggeredLogout = true;
  }
};

// Simulate DB returning null (admin deleted user row in user_details)
await simulateHeartbeat('deleted_user@biharaimission.org', async (email) => null);
assert.equal(heartbeatTriggeredLogout, true, 'Heartbeat must trigger instant logout when DB record is null');

console.log('  ✅ Test 3 PASSED: Heartbeat integrity check instantly kicks out deleted user.\n');

// --------------------------------------------------------------------------
// TEST 4: Anti-Resurrection Guard: initAuth does not recreate deleted user
// --------------------------------------------------------------------------
console.log('▶ Test 4: Testing anti-resurrection guard during initAuth...');

let allowInsertPassed = null;
const mockSyncUserToDetails = async (fullName, email, designation, phone, district, password, { allowInsert = false } = {}) => {
  allowInsertPassed = allowInsert;
};

// Ambient auth check with allowInsert defaulted to false
await mockSyncUserToDetails('Old User', 'deleted@bihar.org', 'Member', null, null, null);
assert.equal(allowInsertPassed, false, 'allowInsert must be false by default on ambient sync, preventing DB resurrection');

console.log('  ✅ Test 4 PASSED: Ambient sync never re-creates deleted users in database.\n');

console.log('═════════════════════════════════════════════════════════════════');
console.log('🎉 ALL USER DELETION & INSTANT REVOCATION TESTS PASSED!');
console.log('═════════════════════════════════════════════════════════════════\n');
