-- ================================================================
-- SUPABASE SQL SCHEMA FOR CMS TABLES (BLOGS, PROGRAMS, COURSES, LIVE_CLASSES, MASTERCLASS_QUESTIONS)
-- ================================================================

-- 1. BLOGS TABLE
CREATE TABLE IF NOT EXISTS public.blogs (
  id text NOT NULL PRIMARY KEY,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  title text NOT NULL,
  category text NULL DEFAULT 'Governance'::text,
  author text NULL,
  author_role text NULL,
  date text NULL,
  read_time text NULL,
  excerpt text NULL,
  content text NULL,
  image text NULL,
  is_published boolean NULL DEFAULT true
);

-- 2. PROGRAMS TABLE (Officer Programs & Detailed Pages)
CREATE TABLE IF NOT EXISTS public.programs (
  id text NOT NULL PRIMARY KEY,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  title text NOT NULL,
  title_hi text NULL,
  desc_text text NULL,
  desc_hi text NULL,
  type text NULL DEFAULT 'program'::text,
  tags jsonb NULL,
  footer jsonb NULL,
  bullets jsonb NULL,
  bullets_hi jsonb NULL,
  is_coming_soon boolean NULL DEFAULT false,
  curtain_badge text NULL,
  curtain_badge_hi text NULL,
  curtain_sub text NULL,
  curtain_sub_hi text NULL,
  curtain_tag text NULL,
  curtain_tag_hi text NULL,
  overview_text text NULL,
  modules_count_text text NULL DEFAULT '06 Comprehensive Modules'::text,
  duration_text text NULL DEFAULT '6 Hrs Self-Paced Learning'::text,
  access_text text NULL DEFAULT '100% Free Forever Access'::text,
  medium_text text NULL DEFAULT 'EN + हिं Bilingual Medium'::text,
  custom_modules jsonb NULL
);

-- 3. COURSES TABLE
CREATE TABLE IF NOT EXISTS public.courses (
  id text NOT NULL PRIMARY KEY,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  title text NOT NULL,
  title_hi text NULL,
  category text NULL,
  duration text NULL,
  level text NULL,
  badge text NULL,
  modules_count integer NULL DEFAULT 6,
  description text NULL,
  desc_hi text NULL,
  bullets jsonb NULL,
  bullets_hi jsonb NULL,
  overview_text text NULL,
  modules_count_text text NULL DEFAULT '06 Comprehensive Modules'::text,
  duration_text text NULL DEFAULT '6 Hrs Self-Paced Learning'::text,
  access_text text NULL DEFAULT '100% Free Forever Access'::text,
  medium_text text NULL DEFAULT 'EN + हिं Bilingual Medium'::text,
  custom_modules jsonb NULL
);

-- 4. MASTERCLASSES & LIVE_CLASSES TABLES (Live Masterclasses)
CREATE TABLE IF NOT EXISTS public.masterclasses (
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
  questions jsonb NULL
);

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
  questions jsonb NULL
);

-- 5. MASTERCLASS_QUESTIONS TABLE (30 MCQ Certification Question Bank)
CREATE TABLE IF NOT EXISTS public.masterclass_questions (
  id text NOT NULL PRIMARY KEY,
  class_id text NULL DEFAULT 'global'::text,
  q_id integer NOT NULL,
  question text NOT NULL,
  options jsonb NOT NULL,
  answer integer NOT NULL DEFAULT 0,
  explanation text NULL,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Enable Row Level Security (RLS) on all tables
ALTER TABLE public.blogs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.masterclasses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.live_classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.masterclass_questions ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (Read & Write)
DROP POLICY IF EXISTS "Allow public read/write on blogs" ON public.blogs;
CREATE POLICY "Allow public read/write on blogs" ON public.blogs FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public read/write on programs" ON public.programs;
CREATE POLICY "Allow public read/write on programs" ON public.programs FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public read/write on courses" ON public.courses;
CREATE POLICY "Allow public read/write on courses" ON public.courses FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public read/write on masterclasses" ON public.masterclasses;
CREATE POLICY "Allow public read/write on masterclasses" ON public.masterclasses FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public read/write on live_classes" ON public.live_classes;
CREATE POLICY "Allow public read/write on live_classes" ON public.live_classes FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public read/write on masterclass_questions" ON public.masterclass_questions;
CREATE POLICY "Allow public read/write on masterclass_questions" ON public.masterclass_questions FOR ALL USING (true) WITH CHECK (true);

NOTIFY pgrst, 'reload schema';

