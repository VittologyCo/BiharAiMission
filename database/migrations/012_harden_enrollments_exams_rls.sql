-- ==============================================================================
-- BIHAR AI MISSION - RLS HARDENING FOR ENROLLMENTS & EXAM SUBMISSIONS (v1)
-- Run this script in Supabase SQL Editor (SQL Editor -> New Query -> Run)
-- Eliminates identity forgery across enrollments and certification exam submissions.
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. Secure officer_program_enrollments
-- ------------------------------------------------------------------------------
ALTER TABLE public.officer_program_enrollments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public access officer_program_enrollments" ON public.officer_program_enrollments;
DROP POLICY IF EXISTS "Allow only own-identity insert on officer_program_enrollments" ON public.officer_program_enrollments;
DROP POLICY IF EXISTS "Users can read own officer_program_enrollments" ON public.officer_program_enrollments;
DROP POLICY IF EXISTS "Users can update own officer_program_enrollments" ON public.officer_program_enrollments;

CREATE POLICY "Allow only own-identity insert on officer_program_enrollments"
ON public.officer_program_enrollments
FOR INSERT
WITH CHECK (
    user_email = auth.jwt() ->> 'email'
    OR user_id::text = auth.uid()::text
);

CREATE POLICY "Users can read own officer_program_enrollments"
ON public.officer_program_enrollments
FOR SELECT
USING (
    user_email = auth.jwt() ->> 'email'
    OR user_id::text = auth.uid()::text
    OR (auth.jwt() ->> 'email') = 'admin@biharaimission.org'
    OR (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
);

-- ------------------------------------------------------------------------------
-- 2. Secure masterclass_enrollments
-- ------------------------------------------------------------------------------
ALTER TABLE public.masterclass_enrollments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public access masterclass_enrollments" ON public.masterclass_enrollments;
DROP POLICY IF EXISTS "Allow only own-identity insert on masterclass_enrollments" ON public.masterclass_enrollments;
DROP POLICY IF EXISTS "Users can read own masterclass_enrollments" ON public.masterclass_enrollments;
DROP POLICY IF EXISTS "Users can update own masterclass_enrollments" ON public.masterclass_enrollments;

CREATE POLICY "Allow only own-identity insert on masterclass_enrollments"
ON public.masterclass_enrollments
FOR INSERT
WITH CHECK (
    user_email = auth.jwt() ->> 'email'
    OR user_id::text = auth.uid()::text
);

CREATE POLICY "Users can read own masterclass_enrollments"
ON public.masterclass_enrollments
FOR SELECT
USING (
    user_email = auth.jwt() ->> 'email'
    OR user_id::text = auth.uid()::text
    OR (auth.jwt() ->> 'email') = 'admin@biharaimission.org'
    OR (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
);

-- ------------------------------------------------------------------------------
-- 3. Secure officer_program_exam_submissions
-- ------------------------------------------------------------------------------
ALTER TABLE public.officer_program_exam_submissions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public access officer_program_exam_submissions" ON public.officer_program_exam_submissions;
DROP POLICY IF EXISTS "Allow only own-identity insert on officer_program_exam_submissions" ON public.officer_program_exam_submissions;
DROP POLICY IF EXISTS "Users can read own officer_program_exam_submissions" ON public.officer_program_exam_submissions;

CREATE POLICY "Allow only own-identity insert on officer_program_exam_submissions"
ON public.officer_program_exam_submissions
FOR INSERT
WITH CHECK (
    candidate_email = auth.jwt() ->> 'email'
);

CREATE POLICY "Users can read own officer_program_exam_submissions"
ON public.officer_program_exam_submissions
FOR SELECT
USING (
    candidate_email = auth.jwt() ->> 'email'
    OR (auth.jwt() ->> 'email') = 'admin@biharaimission.org'
    OR (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
);

-- ------------------------------------------------------------------------------
-- 4. Secure masterclass_exam_submissions
-- ------------------------------------------------------------------------------
ALTER TABLE public.masterclass_exam_submissions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public access masterclass_exam_submissions" ON public.masterclass_exam_submissions;
DROP POLICY IF EXISTS "Allow only own-identity insert on masterclass_exam_submissions" ON public.masterclass_exam_submissions;
DROP POLICY IF EXISTS "Users can read own masterclass_exam_submissions" ON public.masterclass_exam_submissions;

CREATE POLICY "Allow only own-identity insert on masterclass_exam_submissions"
ON public.masterclass_exam_submissions
FOR INSERT
WITH CHECK (
    candidate_email = auth.jwt() ->> 'email'
);

CREATE POLICY "Users can read own masterclass_exam_submissions"
ON public.masterclass_exam_submissions
FOR SELECT
USING (
    candidate_email = auth.jwt() ->> 'email'
    OR (auth.jwt() ->> 'email') = 'admin@biharaimission.org'
    OR (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
);
