-- ====================================================================
-- SUPABASE SQL SCHEMA FOR MASTERCLASSES & USER PAYMENTS TABLES
-- Run this script in your Supabase SQL Editor (SQL Editor -> New Query -> Run)
-- ====================================================================

-- 1. MASTERCLASSES TABLE (Admin Managed Masterclass Cards)
CREATE TABLE IF NOT EXISTS public.masterclasses (
  id text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT timezone ('utc'::text, now()),
  course_name text NOT NULL,
  course_desc text NULL,
  description text NULL,
  course_duration text NULL,
  duration text NULL,
  course_instructor text NULL,
  instructor text NULL,
  instructor_title text NULL,
  instructor_image text NULL,
  course_language text NULL,
  language text NULL,
  certificate_type text NULL DEFAULT 'Free certification'::text,
  platform_name text NULL DEFAULT 'YouTube Live'::text,
  scheduled_date_time text NULL,
  scheduled_time_text text NULL,
  join_url text NULL,
  meeting_url text NULL,
  buy_url text NULL,
  price_display text NULL DEFAULT 'Free'::text,
  price text NULL DEFAULT 'Free'::text,
  is_exam_unlocked boolean NULL DEFAULT false,
  questions jsonb NULL,
  is_session_ended boolean NULL DEFAULT false,
  is_ended boolean NULL DEFAULT false,
  session_status text NULL DEFAULT 'LIVE'::text,
  recording_url text NULL,
  recorded_url text NULL,
  session_ended_at timestamp with time zone NULL,
  CONSTRAINT masterclasses_pkey PRIMARY KEY (id)
) TABLESPACE pg_default;

-- 2. LIVE_CLASSES TABLE (Compatible Schema for live class queries)
CREATE TABLE IF NOT EXISTS public.live_classes (
  id text NOT NULL PRIMARY KEY,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  course_name text NOT NULL,
  course_desc text NULL,
  description text NULL,
  course_duration text NULL,
  duration text NULL,
  course_instructor text NULL,
  instructor text NULL,
  instructor_title text NULL,
  instructor_image text NULL,
  course_language text NULL,
  language text NULL,
  certificate_type text NULL DEFAULT 'Free certification'::text,
  platform_name text NULL DEFAULT 'YouTube Live'::text,
  scheduled_date_time text NULL,
  scheduled_time_text text NULL,
  join_url text NULL,
  meeting_url text NULL,
  buy_url text NULL,
  price_display text NULL DEFAULT 'Free'::text,
  price text NULL DEFAULT 'Free'::text,
  is_exam_unlocked boolean NULL DEFAULT false,
  questions jsonb NULL,
  is_session_ended boolean NULL DEFAULT false,
  is_ended boolean NULL DEFAULT false,
  session_status text NULL DEFAULT 'LIVE'::text,
  recording_url text NULL,
  recorded_url text NULL,
  session_ended_at timestamp with time zone NULL
) TABLESPACE pg_default;

-- 3. USER PAYMENTS TABLE (Tracks Payment History & PhonePe UPI Transactions Per User)
CREATE TABLE IF NOT EXISTS public.masterclass_payments (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  user_email text NOT NULL,
  user_name text NULL,
  masterclass_id text NOT NULL,
  masterclass_name text NULL,
  amount numeric(10,2) NOT NULL DEFAULT 0.00,
  currency text NOT NULL DEFAULT 'INR'::text,
  payment_status text NOT NULL DEFAULT 'SUCCESS'::text, -- 'SUCCESS', 'PENDING', 'FAILED'
  payment_gateway text NOT NULL DEFAULT 'PHONEPE_UPI'::text,
  transaction_id text NOT NULL,
  utr_number text NULL,
  raw_response jsonb NULL,
  CONSTRAINT masterclass_payments_pkey PRIMARY KEY (id)
) TABLESPACE pg_default;

-- Safe Column Alterations for Existing Databases
ALTER TABLE public.masterclasses ADD COLUMN IF NOT EXISTS meeting_url text;
ALTER TABLE public.masterclasses ADD COLUMN IF NOT EXISTS buy_url text;
ALTER TABLE public.masterclasses ADD COLUMN IF NOT EXISTS price_display text DEFAULT 'Free';
ALTER TABLE public.masterclasses ADD COLUMN IF NOT EXISTS price text DEFAULT 'Free';
ALTER TABLE public.masterclasses ADD COLUMN IF NOT EXISTS is_exam_unlocked boolean DEFAULT false;
ALTER TABLE public.masterclasses ADD COLUMN IF NOT EXISTS questions jsonb;
ALTER TABLE public.masterclasses ADD COLUMN IF NOT EXISTS recording_url text;
ALTER TABLE public.masterclasses ADD COLUMN IF NOT EXISTS recorded_url text;
ALTER TABLE public.masterclasses ADD COLUMN IF NOT EXISTS is_session_ended boolean DEFAULT false;
ALTER TABLE public.masterclasses ADD COLUMN IF NOT EXISTS is_ended boolean DEFAULT false;
ALTER TABLE public.masterclasses ADD COLUMN IF NOT EXISTS session_status text DEFAULT 'LIVE';
ALTER TABLE public.masterclasses ADD COLUMN IF NOT EXISTS session_ended_at timestamp with time zone;

ALTER TABLE public.live_classes ADD COLUMN IF NOT EXISTS meeting_url text;
ALTER TABLE public.live_classes ADD COLUMN IF NOT EXISTS buy_url text;
ALTER TABLE public.live_classes ADD COLUMN IF NOT EXISTS price_display text DEFAULT 'Free';
ALTER TABLE public.live_classes ADD COLUMN IF NOT EXISTS price text DEFAULT 'Free';
ALTER TABLE public.live_classes ADD COLUMN IF NOT EXISTS is_exam_unlocked boolean DEFAULT false;
ALTER TABLE public.live_classes ADD COLUMN IF NOT EXISTS questions jsonb;
ALTER TABLE public.live_classes ADD COLUMN IF NOT EXISTS recording_url text;
ALTER TABLE public.live_classes ADD COLUMN IF NOT EXISTS recorded_url text;
ALTER TABLE public.live_classes ADD COLUMN IF NOT EXISTS is_session_ended boolean DEFAULT false;
ALTER TABLE public.live_classes ADD COLUMN IF NOT EXISTS is_ended boolean DEFAULT false;
ALTER TABLE public.live_classes ADD COLUMN IF NOT EXISTS session_status text DEFAULT 'LIVE';
ALTER TABLE public.live_classes ADD COLUMN IF NOT EXISTS session_ended_at timestamp with time zone;

-- Enable Row Level Security (RLS) on all tables
ALTER TABLE public.masterclasses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.live_classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.masterclass_payments ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (Read, Insert, Update, Delete)
DROP POLICY IF EXISTS "Allow public read/write on masterclasses" ON public.masterclasses;
CREATE POLICY "Allow public read/write on masterclasses" ON public.masterclasses FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public read/write on live_classes" ON public.live_classes;
CREATE POLICY "Allow public read/write on live_classes" ON public.live_classes FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public read/write on masterclass_payments" ON public.masterclass_payments;
CREATE POLICY "Allow public read/write on masterclass_payments" ON public.masterclass_payments FOR ALL USING (true) WITH CHECK (true);

NOTIFY pgrst, 'reload schema';
