-- ================================================================
-- SUPABASE SQL SCHEMA FOR PUBLIC.EXAM_SUBMISSIONS TABLE
-- Bihar AI Mission Certification Exam & Verification System
-- Execute this query in your Supabase SQL Editor (https://app.supabase.com)
-- ================================================================

CREATE TABLE IF NOT EXISTS public.exam_submissions (
  id text NOT NULL,
  credential_id text NOT NULL,
  candidate_name text NOT NULL,
  candidate_email text NOT NULL,
  candidate_designation text NULL DEFAULT 'Government Officer / Learner',
  candidate_phone text NULL,
  exam_id text NULL,
  masterclass_id text NULL,
  masterclass_title text NOT NULL,
  score numeric(5,2) NOT NULL DEFAULT 0,
  raw_score numeric(5,2) NOT NULL DEFAULT 0,
  total numeric(5,2) NOT NULL DEFAULT 30,
  percentage numeric(5,2) NOT NULL DEFAULT 0,
  warning_count integer NOT NULL DEFAULT 0,
  penalty_deduction numeric(5,2) NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'PASSED',
  is_passed boolean NOT NULL DEFAULT false,
  is_approved boolean NOT NULL DEFAULT false,
  is_violated boolean NOT NULL DEFAULT false,
  is_downloaded boolean NOT NULL DEFAULT false,
  time_taken_seconds integer NOT NULL DEFAULT 0,
  question_responses jsonb NULL,
  issue_date text NULL,
  submitted_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  date_folder text NULL,
  CONSTRAINT exam_submissions_pkey PRIMARY KEY (id),
  CONSTRAINT exam_submissions_credential_id_key UNIQUE (credential_id)
) TABLESPACE pg_default;

-- High-performance indices for fast verification & search
CREATE INDEX IF NOT EXISTS idx_exam_submissions_credential_id ON public.exam_submissions (credential_id);
CREATE INDEX IF NOT EXISTS idx_exam_submissions_candidate_email ON public.exam_submissions (candidate_email);

-- Enable Row Level Security (RLS)
ALTER TABLE public.exam_submissions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Allow public insert to exam_submissions" ON public.exam_submissions;
DROP POLICY IF EXISTS "Allow public select on exam_submissions" ON public.exam_submissions;
DROP POLICY IF EXISTS "Allow public update on exam_submissions" ON public.exam_submissions;
DROP POLICY IF EXISTS "Allow public delete on exam_submissions" ON public.exam_submissions;

-- Create policies for public access (Candidate Submissions & Verification & Admin Approvals)
CREATE POLICY "Allow public insert to exam_submissions" 
  ON public.exam_submissions 
  FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Allow public select on exam_submissions" 
  ON public.exam_submissions 
  FOR SELECT 
  USING (true);

CREATE POLICY "Allow public update on exam_submissions" 
  ON public.exam_submissions 
  FOR UPDATE 
  USING (true);

CREATE POLICY "Allow public delete on exam_submissions" 
  ON public.exam_submissions 
  FOR DELETE 
  USING (true);
