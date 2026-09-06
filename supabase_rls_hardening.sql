-- ==============================================================================
-- BIHAR AI MISSION - RLS SECURITY HARDENING PATCH (v4 - COMPLETE CLEANUP)
-- Execute this entire file in Supabase SQL Editor, top to bottom.
-- Drops all legacy permissive (qual: true) policies and locks down RLS.
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. Secure daily_task_submissions
-- ------------------------------------------------------------------------------
ALTER TABLE public.daily_task_submissions ENABLE ROW LEVEL SECURITY;

-- Drop all legacy / conflicting policies (including those with wide-open qual: true)
DROP POLICY IF EXISTS "Allow candidates to insert task submissions" ON public.daily_task_submissions;
DROP POLICY IF EXISTS "Allow candidates and admins to view task submissions" ON public.daily_task_submissions;
DROP POLICY IF EXISTS "Allow update on task submissions" ON public.daily_task_submissions;
DROP POLICY IF EXISTS "Allow select on daily_task_submissions" ON public.daily_task_submissions;
DROP POLICY IF EXISTS "Allow update on daily_task_submissions" ON public.daily_task_submissions;
DROP POLICY IF EXISTS "Allow public insert to daily_task_submissions" ON public.daily_task_submissions;
DROP POLICY IF EXISTS "Allow authenticated or verified user insert" ON public.daily_task_submissions;
DROP POLICY IF EXISTS "Users can only read own submissions" ON public.daily_task_submissions;
DROP POLICY IF EXISTS "Users can only update own submissions" ON public.daily_task_submissions;
DROP POLICY IF EXISTS "Allow only own-identity insert" ON public.daily_task_submissions;

-- Strictly allow users to read only their own submissions (or genuine admin via app_metadata)
CREATE POLICY "Users can only read own submissions"
ON public.daily_task_submissions
FOR SELECT
USING (
    user_email = auth.jwt() ->> 'email'
    OR user_id::text = auth.uid()::text
    OR (auth.jwt() ->> 'email') = 'admin@biharaimission.org'
    OR (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
);

-- Strictly allow users to update only their own submissions (or genuine admin)
CREATE POLICY "Users can only update own submissions"
ON public.daily_task_submissions
FOR UPDATE
USING (
    user_email = auth.jwt() ->> 'email'
    OR user_id::text = auth.uid()::text
    OR (auth.jwt() ->> 'email') = 'admin@biharaimission.org'
    OR (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
)
WITH CHECK (
    user_email = auth.jwt() ->> 'email'
    OR user_id::text = auth.uid()::text
    OR (auth.jwt() ->> 'email') = 'admin@biharaimission.org'
    OR (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
);

-- Controlled insert: only allow users to insert submissions for their own verified identity
CREATE POLICY "Allow only own-identity insert"
ON public.daily_task_submissions
FOR INSERT
WITH CHECK (
    user_email = auth.jwt() ->> 'email'
    OR user_id::text = auth.uid()::text
);

-- ------------------------------------------------------------------------------
-- 2. Secure user_details
-- ------------------------------------------------------------------------------
ALTER TABLE public.user_details ENABLE ROW LEVEL SECURITY;

-- Drop all legacy / conflicting policies (CRITICAL: removes wide-open "Allow public read/write")
DROP POLICY IF EXISTS "Allow public read/write on user_details" ON public.user_details;
DROP POLICY IF EXISTS "Public insert user_details" ON public.user_details;
DROP POLICY IF EXISTS "Allow public registration insert" ON public.user_details;
DROP POLICY IF EXISTS "Admin and owner select user_details" ON public.user_details;
DROP POLICY IF EXISTS "Allow users to read own profile" ON public.user_details;
DROP POLICY IF EXISTS "Admin update user_details" ON public.user_details;
DROP POLICY IF EXISTS "Allow users to update own profile" ON public.user_details;
DROP POLICY IF EXISTS "Admin delete user_details" ON public.user_details;
DROP POLICY IF EXISTS "Allow public read user_details" ON public.user_details;
DROP POLICY IF EXISTS "Allow individual user update" ON public.user_details;
DROP POLICY IF EXISTS "Users can read own user_details" ON public.user_details;
DROP POLICY IF EXISTS "Users can update own user_details" ON public.user_details;
DROP POLICY IF EXISTS "Allow own user_details insert" ON public.user_details;

-- Users can read only their own profile, or genuine admin sees all
CREATE POLICY "Users can read own user_details"
ON public.user_details
FOR SELECT
USING (
    email = auth.jwt() ->> 'email'
    OR user_id::text = auth.uid()::text
    OR (auth.jwt() ->> 'email') = 'admin@biharaimission.org'
    OR (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
);

-- Users can update only their own profile, or genuine admin can update
CREATE POLICY "Users can update own user_details"
ON public.user_details
FOR UPDATE
USING (
    email = auth.jwt() ->> 'email'
    OR user_id::text = auth.uid()::text
    OR (auth.jwt() ->> 'email') = 'admin@biharaimission.org'
    OR (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
)
WITH CHECK (
    email = auth.jwt() ->> 'email'
    OR user_id::text = auth.uid()::text
    OR (auth.jwt() ->> 'email') = 'admin@biharaimission.org'
    OR (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
);

-- Users can insert only their own user_details record on signup
CREATE POLICY "Allow own user_details insert"
ON public.user_details
FOR INSERT
WITH CHECK (
    email = auth.jwt() ->> 'email'
    OR user_id::text = auth.uid()::text
);

-- Admin delete policy
CREATE POLICY "Admins can delete user_details"
ON public.user_details
FOR DELETE
USING (
    (auth.jwt() ->> 'email') = 'admin@biharaimission.org'
    OR (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
);

-- ------------------------------------------------------------------------------
-- 3. Secure admin_users (Privilege Escalation & Admin Enumeration Prevention)
-- ------------------------------------------------------------------------------
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public select admin_users" ON public.admin_users;
DROP POLICY IF EXISTS "Allow select admin_users" ON public.admin_users;
DROP POLICY IF EXISTS "Admins can view admin_users" ON public.admin_users;
DROP POLICY IF EXISTS "Admins can manage admin_users" ON public.admin_users;
DROP POLICY IF EXISTS "Only admins can read admin_users" ON public.admin_users;
DROP POLICY IF EXISTS "Strict read access on admin_users" ON public.admin_users;
DROP POLICY IF EXISTS "Strict insert on admin_users" ON public.admin_users;
DROP POLICY IF EXISTS "Strict update on admin_users" ON public.admin_users;
DROP POLICY IF EXISTS "Strict delete on admin_users" ON public.admin_users;

-- SELECT: Regular user can ONLY verify their own record; admin can view all
CREATE POLICY "Strict read access on admin_users"
ON public.admin_users
FOR SELECT
USING (
    email = auth.jwt() ->> 'email'
    OR user_id::text = auth.uid()::text
    OR (auth.jwt() ->> 'email') = 'admin@biharaimission.org'
    OR (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
);

-- INSERT: ONLY verified admin can add admins
CREATE POLICY "Strict insert on admin_users"
ON public.admin_users
FOR INSERT
WITH CHECK (
    (auth.jwt() ->> 'email') = 'admin@biharaimission.org'
    OR (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
);

-- UPDATE: ONLY verified admin can update admins
CREATE POLICY "Strict update on admin_users"
ON public.admin_users
FOR UPDATE
USING (
    (auth.jwt() ->> 'email') = 'admin@biharaimission.org'
    OR (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
)
WITH CHECK (
    (auth.jwt() ->> 'email') = 'admin@biharaimission.org'
    OR (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
);

-- DELETE: ONLY verified admin can remove admins
CREATE POLICY "Strict delete on admin_users"
ON public.admin_users
FOR DELETE
USING (
    (auth.jwt() ->> 'email') = 'admin@biharaimission.org'
    OR (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
);

-- ==============================================================================
-- SANITY CHECK: Run this to verify that NO "true" policies remain!
-- ==============================================================================
SELECT schemaname, tablename, policyname, cmd, qual, with_check
FROM pg_policies
WHERE tablename IN ('daily_task_submissions', 'user_details', 'admin_users')
ORDER BY tablename, cmd;
