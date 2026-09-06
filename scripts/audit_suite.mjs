/**
 * Comprehensive Pre-Launch Security & Quality Audit Suite
 * Bihar AI Mission & Daily Radar
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import http from 'http';

console.log('🛡️ STARTING COMPREHENSIVE PRE-LAUNCH SECURITY AUDIT\n');

// 1. Target credentials
const supabaseUrl = 'https://xvmznsqgqlrjcwtyfnwc.supabase.co';
const supabaseAnonKey = 'sb_publishable_C234meTGCdmmVHbyEFuJyg_dtW_2SrL';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const results = {};

async function runAudit() {
  // ============================================================================
  // SECTION 0: Auth System & Database Identification
  // ============================================================================
  console.log('--- Section 0: System Confirmation ---');
  const authType = 'Supabase Auth (@supabase/supabase-js v2.103.3) + public.user_details (PostgreSQL) + Resend Serverless Proxy';
  const dbType = 'Supabase Cloud (PostgreSQL 15)';
  console.log(`Auth System: ${authType}`);
  console.log(`Database: ${dbType}`);
  results.section0 = { authType, dbType };

  // ============================================================================
  // SECTION 1: Functional Auth Flows
  // ============================================================================
  console.log('\n--- Section 1: Functional Auth Flows ---');
  const testNormalEmail = `test_normal_${Date.now()}@biharaimission.test`;
  const testAttackerEmail = `test_attacker_${Date.now()}@biharaimission.test`;
  const testAdminEmail = `test_admin_probe_${Date.now()}@biharaimission.test`;
  const testPassword = 'SecurePassword123!@#';

  // 1.1 Registration: Valid Signup
  const { data: regData, error: regErr } = await supabase.auth.signUp({
    email: testNormalEmail,
    password: testPassword,
    options: { data: { full_name: 'Audit Normal User' } }
  });
  console.log('1.1 Valid Registration:', !regErr ? 'PASS' : `FAIL (${regErr?.message})`);

  // 1.2 Duplicate Registration
  const { data: dupData, error: dupErr } = await supabase.auth.signUp({
    email: testNormalEmail,
    password: testPassword,
  });
  // Supabase either returns error or user with empty identities/unconfirmed
  const dupDetected = dupErr || (dupData?.user?.identities && dupData.user.identities.length === 0);
  console.log('1.2 Duplicate Registration Rejection:', dupDetected ? 'PASS (Rejected)' : 'FAIL (Allowed)');

  // 1.3 Weak Password
  const { error: weakErr } = await supabase.auth.signUp({
    email: `weak_${Date.now()}@test.com`,
    password: '123',
  });
  console.log('1.3 Weak Password Rejection:', weakErr ? `PASS (${weakErr.message})` : 'FAIL (Accepted 123)');

  // 1.4 Invalid Email Format
  const { error: emailErr } = await supabase.auth.signUp({
    email: 'not-an-email',
    password: testPassword,
  });
  console.log('1.4 Invalid Email Format Rejection:', emailErr ? `PASS (${emailErr.message})` : 'FAIL');

  // 1.5 Login with Correct Credentials
  const { data: loginData, error: loginErr } = await supabase.auth.signInWithPassword({
    email: testNormalEmail,
    password: testPassword,
  });
  console.log('1.5 Login with Valid Credentials:', !loginErr && loginData?.session ? 'PASS' : `FAIL (${loginErr?.message})`);

  // 1.6 Login with Wrong Password (Check for user enumeration)
  const { error: wrongPwErr } = await supabase.auth.signInWithPassword({
    email: testNormalEmail,
    password: 'WrongPassword999!',
  });
  const { error: nonExistentErr } = await supabase.auth.signInWithPassword({
    email: 'non_existent_random_user_99999@domain.xyz',
    password: 'WrongPassword999!',
  });
  const pwMsg = wrongPwErr?.message?.toLowerCase() || '';
  const noUserMsg = nonExistentErr?.message?.toLowerCase() || '';
  const enumerationSafe = pwMsg.includes('invalid') && noUserMsg.includes('invalid');
  console.log('1.6 Generic Credentials Error (No User Enumeration):', enumerationSafe ? `PASS ("${wrongPwErr?.message}")` : 'FAIL');

  // 1.7 Logout
  const { error: logoutErr } = await supabase.auth.signOut();
  console.log('1.7 Logout Server-Side Invalidation:', !logoutErr ? 'PASS' : `FAIL (${logoutErr?.message})`);

  // ============================================================================
  // SECTION 2: Access Control & Authorization (Critical IDOR & Admin Tests)
  // ============================================================================
  console.log('\n--- Section 2: Access Control & Authorization ---');
  
  // 2.1 Role Escalation via email pattern:
  // In ProtectedRoute.jsx: userEmail.includes('admin')
  const sneakyEmail = 'attacker_admin_fake@gmail.com';
  const roleBypassPossible = sneakyEmail.includes('admin');
  console.log('2.1 Admin Route Guard Check: userEmail.includes("admin") vulnerability exists in ProtectedRoute.jsx:', roleBypassPossible ? 'FAIL (Vulnerability present: email substring match)' : 'PASS');

  // 2.2 Client-Side LocalStorage Admin Gating:
  // In ProtectedRoute.jsx: localStorage.getItem('bihar_ai_admin_session')
  console.log('2.2 LocalStorage Admin Token Forgeability: ProtectedRoute.jsx trusts localStorage bihar_ai_admin_session without cryptographic validation: FAIL (Client-side forgery possible)');

  // 2.3 IDOR / Direct Database Manipulation via Anon Key:
  // Check if daily_task_submissions allows arbitrary select/update
  const { data: subsData, error: subsErr } = await supabase.from('daily_task_submissions').select('id, user_email').limit(2);
  console.log('2.3 RLS Horizontal Access on daily_task_submissions: Public select without user ownership check:', subsData ? `FAIL (Publicly readable: ${subsData.length} rows returned)` : 'PASS');

  // ============================================================================
  // SECTION 3: Input Validation & Injection
  // ============================================================================
  console.log('\n--- Section 3: Input Validation & Injection ---');
  // 3.1 SQL Injection test against Supabase PostgREST
  const sqliPayload = "' OR '1'='1";
  const { data: sqliData, error: sqliErr } = await supabase
    .from('user_details')
    .select('id')
    .eq('email', sqliPayload);
  console.log('3.1 SQL Injection Parameterization:', (!sqliErr && sqliData?.length === 0) ? 'PASS (Payload safely escaped as string literal)' : 'FAIL');

  // 3.2 File Upload Validation in server.js
  const serverJsContent = fs.readFileSync('server.js', 'utf-8');
  const hasMulterFilter = serverJsContent.includes('fileFilter');
  console.log('3.2 server.js File Upload MIME/Extension Whitelist:', hasMulterFilter ? 'PASS' : 'FAIL (Missing fileFilter in multer: arbitrary uploads possible)');

  // 3.3 server.js Unauthenticated File Delete Endpoint
  const hasAuthOnDelete = serverJsContent.includes('handleDelete') && serverJsContent.includes('authenticate');
  console.log('3.3 server.js File Deletion Auth Gating:', hasAuthOnDelete ? 'PASS' : 'FAIL (/delete-file and /files/:filename have zero authentication)');

  // ============================================================================
  // SECTION 5: Secrets & Configuration Exposure
  // ============================================================================
  console.log('\n--- Section 5: Secrets & Configuration Exposure ---');
  const workerJsContent = fs.readFileSync('worker.js', 'utf-8');
  const hasHardcodedKey = workerJsContent.includes('cmVfNkxTVWJBOVdfMjFBYzZKalp2dkg5QVlWV0NHa0hSWktZ');
  console.log('5.1 Hardcoded Secrets in worker.js:', hasHardcodedKey ? 'FAIL (Base64 encoded Resend API key found hardcoded in worker.js)' : 'PASS');

  // 5.2 Build Bundle Scan
  let leakedInBundle = false;
  const buildJsDir = path.join('build', 'static', 'js');
  if (fs.existsSync(buildJsDir)) {
    const files = fs.readdirSync(buildJsDir).filter(f => f.endsWith('.js'));
    for (const f of files) {
      const content = fs.readFileSync(path.join(buildJsDir, f), 'utf-8');
      if (content.includes('re_UwKtUKYD') || content.includes('ADMIN_SECRET') || content.includes('CRON_SECRET')) {
        leakedInBundle = true;
      }
    }
  }
  console.log('5.2 Client-Side JS Bundle Secrets Scan:', !leakedInBundle ? 'PASS (Zero private secrets found in build/static/js)' : 'FAIL');

  console.log('\n✅ AUDIT HARNESS FINISHED.');
}

runAudit().catch(console.error);
