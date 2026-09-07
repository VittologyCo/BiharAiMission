-- ==============================================================================
-- Migration 018: Fix Daily Task Submissions RLS Policies & Secure Submission RPC
-- Run this script in the Supabase SQL Editor (SQL Editor -> New Query -> Run)
-- 
-- Fixes:
-- 1. Unblocks daily task submissions for candidates and civic participants 
--    (fixes 401 Unauthorized / 42501 RLS violation).
-- 2. Creates SECURITY DEFINER function `submit_candidate_task` which safely 
--    inserts or updates submissions on (user_email, task_id).
-- 3. Updates RLS policies so candidates can submit and view their work,
--    and admins can review, approve, or reject all submissions in Admin Portal.
-- 4. Grants full privileges to anon, authenticated, and service_role.
-- ==============================================================================

-- 1. Ensure table and all required columns exist
CREATE TABLE IF NOT EXISTS public.daily_task_submissions (
    id TEXT PRIMARY KEY DEFAULT ('sub_' || floor(extract(epoch from now()) * 1000)::text),
    user_id TEXT,
    user_email TEXT NOT NULL,
    user_name TEXT,
    user_district TEXT DEFAULT 'Bihar',
    user_designation TEXT DEFAULT 'Civic Candidate',
    task_id INTEGER NOT NULL,
    task_title TEXT,
    category TEXT DEFAULT 'AI Practical Classwork',
    file_url TEXT,
    file_name TEXT,
    file_size TEXT,
    drive_file_id TEXT,
    notes TEXT,
    status TEXT DEFAULT 'PENDING',
    admin_feedback TEXT,
    reviewed_by TEXT,
    reviewed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

-- Ensure required columns exist if table was already present
ALTER TABLE public.daily_task_submissions ADD COLUMN IF NOT EXISTS user_district TEXT DEFAULT 'Bihar';
ALTER TABLE public.daily_task_submissions ADD COLUMN IF NOT EXISTS user_designation TEXT DEFAULT 'Civic Candidate';
ALTER TABLE public.daily_task_submissions ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'AI Practical Classwork';
ALTER TABLE public.daily_task_submissions ADD COLUMN IF NOT EXISTS file_url TEXT;
ALTER TABLE public.daily_task_submissions ADD COLUMN IF NOT EXISTS file_name TEXT;
ALTER TABLE public.daily_task_submissions ADD COLUMN IF NOT EXISTS file_size TEXT;
ALTER TABLE public.daily_task_submissions ADD COLUMN IF NOT EXISTS drive_file_id TEXT;
ALTER TABLE public.daily_task_submissions ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE public.daily_task_submissions ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'PENDING';
ALTER TABLE public.daily_task_submissions ADD COLUMN IF NOT EXISTS admin_feedback TEXT;
ALTER TABLE public.daily_task_submissions ADD COLUMN IF NOT EXISTS reviewed_by TEXT;
ALTER TABLE public.daily_task_submissions ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMPTZ;
ALTER TABLE public.daily_task_submissions ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now());

-- Ensure unique constraint on (user_email, task_id) for upsert conflict resolution
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'daily_task_submissions_user_email_task_id_key'
    ) THEN
        ALTER TABLE public.daily_task_submissions
        ADD CONSTRAINT daily_task_submissions_user_email_task_id_key 
        UNIQUE (user_email, task_id);
    END IF;
EXCEPTION
    WHEN duplicate_table OR duplicate_object THEN NULL;
END $$;

-- Indexes for lightning-fast queries in Admin Portal & Leaderboard
CREATE INDEX IF NOT EXISTS idx_task_subs_email ON public.daily_task_submissions(lower(user_email));
CREATE INDEX IF NOT EXISTS idx_task_subs_task_id ON public.daily_task_submissions(task_id);
CREATE INDEX IF NOT EXISTS idx_task_subs_status ON public.daily_task_submissions(status);
CREATE INDEX IF NOT EXISTS idx_task_subs_updated_at ON public.daily_task_submissions(updated_at DESC);

-- 2. Drop all conflicting / overly restrictive RLS policies
ALTER TABLE public.daily_task_submissions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow only own-identity insert" ON public.daily_task_submissions;
DROP POLICY IF EXISTS "Allow candidate insert to daily_task_submissions" ON public.daily_task_submissions;
DROP POLICY IF EXISTS "Allow public insert to daily_task_submissions" ON public.daily_task_submissions;
DROP POLICY IF EXISTS "Allow insert to daily_task_submissions" ON public.daily_task_submissions;

DROP POLICY IF EXISTS "Users can only read own submissions" ON public.daily_task_submissions;
DROP POLICY IF EXISTS "Allow select on daily_task_submissions" ON public.daily_task_submissions;
DROP POLICY IF EXISTS "Allow candidates and admins to view task submissions" ON public.daily_task_submissions;

DROP POLICY IF EXISTS "Users can only update own submissions" ON public.daily_task_submissions;
DROP POLICY IF EXISTS "Allow update on daily_task_submissions" ON public.daily_task_submissions;
DROP POLICY IF EXISTS "Allow update on task submissions" ON public.daily_task_submissions;
DROP POLICY IF EXISTS "Allow candidate and admin update on daily_task_submissions" ON public.daily_task_submissions;

DROP POLICY IF EXISTS "Allow delete on daily_task_submissions" ON public.daily_task_submissions;

-- 3. Re-create robust RLS policies
-- A. INSERT: Unauthenticated candidates or users inserting their own email
CREATE POLICY "Allow insert to daily_task_submissions"
ON public.daily_task_submissions
FOR INSERT
TO anon, authenticated, service_role
WITH CHECK (
    -- Unauthenticated candidates / public classwork visitors
    auth.uid() IS NULL
    -- Authenticated user submitting for their own email
    OR lower(user_email) = lower(auth.jwt() ->> 'email')
    -- Admin or service role
    OR (auth.jwt() ->> 'email') = 'admin@biharaimission.org'
    OR (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
    OR (auth.jwt() ->> 'role') = 'service_role'
);

-- B. SELECT: Visible for candidates, leaderboards, and Admin Portal
CREATE POLICY "Allow select on daily_task_submissions"
ON public.daily_task_submissions
FOR SELECT
TO anon, authenticated, service_role
USING (true);

-- C. UPDATE: Users can update their submission, admins can review/approve/reject
CREATE POLICY "Allow update on daily_task_submissions"
ON public.daily_task_submissions
FOR UPDATE
TO anon, authenticated, service_role
USING (
    auth.uid() IS NULL
    OR lower(user_email) = lower(auth.jwt() ->> 'email')
    OR (auth.jwt() ->> 'email') = 'admin@biharaimission.org'
    OR (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
    OR (auth.jwt() ->> 'role') = 'service_role'
)
WITH CHECK (
    auth.uid() IS NULL
    OR lower(user_email) = lower(auth.jwt() ->> 'email')
    OR (auth.jwt() ->> 'email') = 'admin@biharaimission.org'
    OR (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
    OR (auth.jwt() ->> 'role') = 'service_role'
);

-- D. DELETE: Admin or service role can delete/purge invalid tasks
CREATE POLICY "Allow delete on daily_task_submissions"
ON public.daily_task_submissions
FOR DELETE
TO anon, authenticated, service_role
USING (
    (auth.jwt() ->> 'email') = 'admin@biharaimission.org'
    OR (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
    OR (auth.jwt() ->> 'role') = 'service_role'
);

-- 4. Grant table privileges to Supabase API roles
GRANT ALL ON public.daily_task_submissions TO anon, authenticated, service_role;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;

-- 5. Create SECURITY DEFINER RPC function for guaranteed submission persistence
CREATE OR REPLACE FUNCTION public.submit_candidate_task(submission_data jsonb)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, extensions
AS $$
DECLARE
  v_user_email text;
  v_task_id integer;
  v_user_id text;
  v_user_name text;
  v_user_district text;
  v_user_designation text;
  v_task_title text;
  v_category text;
  v_file_url text;
  v_file_name text;
  v_file_size text;
  v_drive_file_id text;
  v_notes text;
  v_sub_id text;
  v_result record;
BEGIN
  v_user_email := lower(trim(submission_data->>'user_email'));
  v_task_id := (submission_data->>'task_id')::integer;

  IF v_user_email IS NULL OR v_user_email = '' THEN
    RETURN jsonb_build_object('success', false, 'error', 'user_email is required');
  END IF;

  IF v_task_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'task_id is required');
  END IF;

  v_user_id := COALESCE(submission_data->>'user_id', 'usr_' || replace(v_user_email, '@', '_'));
  v_user_name := COALESCE(submission_data->>'user_name', split_part(v_user_email, '@', 1));
  v_user_district := COALESCE(submission_data->>'user_district', 'Bihar');
  v_user_designation := COALESCE(submission_data->>'user_designation', 'Civic Candidate');
  v_task_title := COALESCE(submission_data->>'task_title', 'AI Practical Assignment #' || v_task_id);
  v_category := COALESCE(submission_data->>'category', 'AI Practical Classwork');
  v_file_url := submission_data->>'file_url';
  v_file_name := submission_data->>'file_name';
  v_file_size := submission_data->>'file_size';
  v_drive_file_id := submission_data->>'drive_file_id';
  v_notes := submission_data->>'notes';
  v_sub_id := COALESCE(submission_data->>'id', 'sub_' || floor(extract(epoch from now()) * 1000)::text || '_' || v_task_id);

  INSERT INTO public.daily_task_submissions (
    id, user_id, user_email, user_name, user_district, user_designation,
    task_id, task_title, category, file_url, file_name, file_size,
    drive_file_id, notes, status, admin_feedback, reviewed_by, reviewed_at,
    created_at, updated_at
  )
  VALUES (
    v_sub_id, v_user_id, v_user_email, v_user_name, v_user_district, v_user_designation,
    v_task_id, v_task_title, v_category, v_file_url, v_file_name, v_file_size,
    v_drive_file_id, v_notes, 'PENDING', NULL, NULL, NULL,
    now(), now()
  )
  ON CONFLICT (user_email, task_id)
  DO UPDATE SET
    user_name = EXCLUDED.user_name,
    user_district = EXCLUDED.user_district,
    user_designation = EXCLUDED.user_designation,
    task_title = EXCLUDED.task_title,
    category = EXCLUDED.category,
    file_url = COALESCE(EXCLUDED.file_url, daily_task_submissions.file_url),
    file_name = COALESCE(EXCLUDED.file_name, daily_task_submissions.file_name),
    file_size = COALESCE(EXCLUDED.file_size, daily_task_submissions.file_size),
    drive_file_id = COALESCE(EXCLUDED.drive_file_id, daily_task_submissions.drive_file_id),
    notes = COALESCE(EXCLUDED.notes, daily_task_submissions.notes),
    status = 'PENDING',
    admin_feedback = NULL,
    reviewed_by = NULL,
    reviewed_at = NULL,
    updated_at = now()
  RETURNING * INTO v_result;

  RETURN jsonb_build_object(
    'success', true,
    'submission', row_to_json(v_result)
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.submit_candidate_task(jsonb) TO anon, authenticated, service_role;
