import assert from 'node:assert/strict';

// Mock browser environment
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

process.env.REACT_APP_SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL || 'https://xvmznsqgqlrjcwtyfnwc.supabase.co';
process.env.REACT_APP_SUPABASE_PUBLISHABLE_KEY = process.env.REACT_APP_SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_C234meTGCdmmVHbyEFuJyg_dtW_2SrL';

const mockStorage = createMockLocalStorage();
global.localStorage = mockStorage;
global.window = {
  dispatchEvent: (event) => {},
};

console.log('═════════════════════════════════════════════════════════════════');
console.log('🧪 RUNNING OFFICER PROGRAMS & MASTERCLASSES CRUD TEST SUITE');
console.log('═════════════════════════════════════════════════════════════════\n');

// Import coursesStorage modules
const {
  getProgramsFromStorage,
  saveProgramsToStorage,
  getCoursesFromStorage,
  saveCoursesToStorage,
  getLiveClassesFromStorage,
  saveLiveClassesToStorage,
  deleteProgramFromSupabase,
  deleteCourseFromSupabase,
  deleteLiveClassFromSupabase,
} = await import('../src/utils/coursesStorage.js');

// --------------------------------------------------------------------------
// TEST 1: Officer Program deletion & empty storage persistence
// --------------------------------------------------------------------------
console.log('▶ Test 1: Verifying Officer Program deletion and no-resurrection...');

const samplePrograms = [
  { id: 'prog-1', title: 'Officer Program 1', type: 'program' },
  { id: 'prog-2', title: 'Officer Program 2', type: 'program' }
];
saveProgramsToStorage(samplePrograms);
assert.equal(getProgramsFromStorage().length, 2, 'Should have 2 programs initially');

// Simulate admin deleting prog-1
const remainingProgs = samplePrograms.filter(p => p.id !== 'prog-1');
saveProgramsToStorage(remainingProgs);
assert.equal(getProgramsFromStorage().length, 1, 'Should have 1 program after deleting prog-1');
assert.equal(getProgramsFromStorage()[0].id, 'prog-2', 'Remaining program should be prog-2');

// Simulate admin deleting prog-2 (empty state)
saveProgramsToStorage([]);
const emptyProgs = getProgramsFromStorage();
assert.equal(emptyProgs.length, 0, 'Should preserve empty array and NOT resurrect default programs');
console.log('  ✅ Test 1 PASSED: Officer Program deletion leaves clean state and does not auto-resurrect.');

// --------------------------------------------------------------------------
// TEST 2: Foundational Course deletion & empty storage persistence
// --------------------------------------------------------------------------
console.log('\n▶ Test 2: Verifying Foundational Course deletion and no-resurrection...');

const sampleCourses = [
  { id: 'course-1', title: 'Course 1', type: 'course' },
  { id: 'course-2', title: 'Course 2', type: 'course' }
];
saveCoursesToStorage(sampleCourses);
assert.equal(getCoursesFromStorage().length, 2, 'Should have 2 courses initially');

// Admin deletes all courses
saveCoursesToStorage([]);
const emptyCourses = getCoursesFromStorage();
assert.equal(emptyCourses.length, 0, 'Should preserve empty array when all courses are deleted');
console.log('  ✅ Test 2 PASSED: Course deletion properly cleared and preserved.');

// --------------------------------------------------------------------------
// TEST 3: Masterclass deletion & question cache cleanup
// --------------------------------------------------------------------------
console.log('\n▶ Test 3: Verifying Masterclass deletion and question cache cleanup...');

const sampleMasterclasses = [
  { id: 'live-101', courseName: 'Generative AI Workshop', isExamUnlocked: false },
  { id: 'live-102', courseName: 'Agentic AI Masterclass', isExamUnlocked: true }
];
saveLiveClassesToStorage(sampleMasterclasses);
mockStorage.setItem('bihar_ai_questions_live-101', JSON.stringify([{ id: 1, question: 'What is GenAI?' }]));

assert.equal(getLiveClassesFromStorage().length, 2, 'Should have 2 masterclasses initially');
assert.ok(mockStorage.getItem('bihar_ai_questions_live-101'), 'Questions cache should exist before delete');

// Delete live-101
const afterDelete = sampleMasterclasses.filter(m => m.id !== 'live-101');
saveLiveClassesToStorage(afterDelete);
await deleteLiveClassFromSupabase('live-101');

assert.equal(getLiveClassesFromStorage().length, 1, 'Should have 1 masterclass after deletion');
assert.equal(mockStorage.getItem('bihar_ai_questions_live-101'), null, 'Questions cache should be cleared on delete');
console.log('  ✅ Test 3 PASSED: Masterclass and associated question cache purged successfully.');

// --------------------------------------------------------------------------
// TEST 4: Delete function returns safe status objects
// --------------------------------------------------------------------------
console.log('\n▶ Test 4: Verifying deleteCourseFromSupabase & deleteProgramFromSupabase contracts...');

const courseDelRes = await deleteCourseFromSupabase('course-nonexistent');
assert.ok(courseDelRes && typeof courseDelRes.success === 'boolean', 'deleteCourseFromSupabase should return status object');

const progDelRes = await deleteProgramFromSupabase('prog-nonexistent');
assert.ok(progDelRes && typeof progDelRes.success === 'boolean', 'deleteProgramFromSupabase should return status object');

const liveDelRes = await deleteLiveClassFromSupabase('live-nonexistent');
assert.ok(liveDelRes && typeof liveDelRes.success === 'boolean', 'deleteLiveClassFromSupabase should return status object');

console.log('  ✅ Test 4 PASSED: All delete methods return valid { success, error } contracts.');

console.log('\n═════════════════════════════════════════════════════════════════');
console.log('🎉 ALL OFFICER PROGRAMS & MASTERCLASSES CRUD TESTS PASSED!');
console.log('═════════════════════════════════════════════════════════════════\n');
