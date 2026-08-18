-- ================================================================
-- SUPABASE SQL SCHEMA FOR PUBLIC.USER_ENROLLMENTS TABLE
-- ================================================================

CREATE TABLE IF NOT EXISTS public.user_enrollments (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  user_email text NOT NULL,
  user_name text NULL,
  course_id text NOT NULL,
  course_title text NOT NULL,
  course_type text NULL DEFAULT 'Masterclass'::text,
  joined_date text NULL,
  status text NULL DEFAULT 'Enrolled'::text,
  certificate_url text NULL,
  CONSTRAINT user_enrollments_pkey PRIMARY KEY (id),
  CONSTRAINT user_enrollments_user_course_key UNIQUE (user_email, course_id)
) TABLESPACE pg_default;

-- Enable Row Level Security (RLS)
ALTER TABLE public.user_enrollments ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Allow public insert to user_enrollments" ON public.user_enrollments;
DROP POLICY IF EXISTS "Allow public select on user_enrollments" ON public.user_enrollments;
DROP POLICY IF EXISTS "Allow public update on user_enrollments" ON public.user_enrollments;

-- Create policies for public access
CREATE POLICY "Allow public insert to user_enrollments" 
  ON public.user_enrollments 
  FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Allow public select on user_enrollments" 
  ON public.user_enrollments 
  FOR SELECT 
  USING (true);

CREATE POLICY "Allow public update on user_enrollments" 
  ON public.user_enrollments 
  FOR UPDATE 
  USING (true);
