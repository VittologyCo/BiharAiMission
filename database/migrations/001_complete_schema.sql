-- ====================================================================
-- BIHAR AI MISSION - COMPLETE SUPABASE DATABASE SCHEMA
-- Run this entire script in your Supabase SQL Editor (SQL Editor -> New Query -> Run)
-- ====================================================================

-- 1. REGISTERED USERS TABLE (User Signup & Profiles)
CREATE TABLE IF NOT EXISTS public.registered_users (
    id TEXT PRIMARY KEY,
    full_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    designation TEXT NOT NULL,
    role_type TEXT DEFAULT 'Registered User',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. USER DETAILS TABLE (User Profiles & Applications)
CREATE TABLE IF NOT EXISTS public.user_details (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    mobile TEXT,
    role_type TEXT NOT NULL,
    designation TEXT,
    department TEXT,
    organization TEXT,
    experience TEXT,
    district TEXT,
    block_city TEXT,
    state TEXT DEFAULT 'Bihar',
    interests JSONB,
    intent TEXT,
    contribution TEXT,
    linkedin TEXT,
    portfolio TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.users_details (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    mobile TEXT,
    role_type TEXT NOT NULL,
    designation TEXT,
    department TEXT,
    organization TEXT,
    experience TEXT,
    district TEXT,
    block_city TEXT,
    state TEXT DEFAULT 'Bihar',
    interests JSONB,
    intent TEXT,
    contribution TEXT,
    linkedin TEXT,
    portfolio TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. MASTERCLASS ENROLLMENTS & PAYMENTS TABLE
CREATE TABLE IF NOT EXISTS public.masterclass_enrollments (
    id TEXT PRIMARY KEY,
    user_id TEXT,
    user_email TEXT NOT NULL,
    user_name TEXT,
    class_id TEXT NOT NULL,
    class_title TEXT NOT NULL,
    amount_paid NUMERIC DEFAULT 499,
    payment_id TEXT,
    status TEXT DEFAULT 'ACTIVE',
    enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. EXAM SUBMISSIONS & ISSUED CERTIFICATES TABLE
CREATE TABLE IF NOT EXISTS public.exam_submissions (
    id TEXT PRIMARY KEY,
    credential_id TEXT UNIQUE NOT NULL,
    candidate_name TEXT NOT NULL,
    candidate_email TEXT NOT NULL,
    candidate_designation TEXT,
    masterclass_id TEXT,
    masterclass_title TEXT,
    score INT NOT NULL,
    total INT NOT NULL,
    percentage NUMERIC NOT NULL,
    status TEXT NOT NULL, -- 'PASSED', 'FAILED', 'VIOLATED'
    is_passed BOOLEAN DEFAULT false,
    is_approved BOOLEAN DEFAULT false,
    is_violated BOOLEAN DEFAULT false,
    is_downloaded BOOLEAN DEFAULT false,
    time_taken_seconds INT,
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    approved_at TIMESTAMP WITH TIME ZONE
);

-- 5. MASTERCLASSES & LIVE CLASSES TABLES (Admin Managed)
CREATE TABLE IF NOT EXISTS public.masterclasses (
    id TEXT PRIMARY KEY,
    course_name TEXT NOT NULL,
    course_desc TEXT,
    description TEXT,
    course_duration TEXT,
    duration TEXT,
    course_instructor TEXT,
    instructor TEXT,
    instructor_title TEXT,
    instructor_image TEXT,
    course_language TEXT,
    language TEXT,
    certificate_type TEXT DEFAULT 'Free certification',
    platform_name TEXT DEFAULT 'YouTube Live',
    scheduled_date_time TEXT,
    scheduled_time_text TEXT,
    join_url TEXT,
    meeting_url TEXT,
    buy_url TEXT,
    price_display TEXT DEFAULT 'Free',
    price TEXT DEFAULT 'Free',
    is_exam_unlocked BOOLEAN DEFAULT false,
    questions JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.live_classes (
    id TEXT PRIMARY KEY,
    course_name TEXT NOT NULL,
    course_desc TEXT,
    description TEXT,
    course_duration TEXT,
    duration TEXT,
    course_instructor TEXT,
    instructor TEXT,
    instructor_title TEXT,
    instructor_image TEXT,
    course_language TEXT,
    language TEXT,
    certificate_type TEXT DEFAULT 'Free certification',
    platform_name TEXT DEFAULT 'YouTube Live',
    scheduled_date_time TEXT,
    scheduled_time_text TEXT,
    join_url TEXT,
    meeting_url TEXT,
    buy_url TEXT,
    price_display TEXT DEFAULT 'Free',
    price TEXT DEFAULT 'Free',
    is_exam_unlocked BOOLEAN DEFAULT false,
    questions JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. CERTIFICATION TEST QUESTIONS BANK (Admin Managed)
CREATE TABLE IF NOT EXISTS public.masterclass_questions (
    id TEXT PRIMARY KEY,
    class_id TEXT NOT NULL,
    question_text TEXT NOT NULL,
    options JSONB NOT NULL,
    correct_option INT NOT NULL,
    explanation TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7. SITE SETTINGS TABLE (Curtain Settings & Certificate Signatories)
CREATE TABLE IF NOT EXISTS public.site_settings (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ====================================================================
-- ENABLE ROW LEVEL SECURITY (RLS) & PUBLIC ACCESS POLICIES
-- ====================================================================

-- Registered Users Policies
ALTER TABLE public.registered_users ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public access registered_users" ON public.registered_users;
CREATE POLICY "Public access registered_users" ON public.registered_users FOR ALL USING (true) WITH CHECK (true);

-- User Details Policies
ALTER TABLE public.user_details ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public access user_details" ON public.user_details;
CREATE POLICY "Public access user_details" ON public.user_details FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE public.users_details ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public access users_details" ON public.users_details;
CREATE POLICY "Public access users_details" ON public.users_details FOR ALL USING (true) WITH CHECK (true);

-- Masterclass Enrollments Policies
ALTER TABLE public.masterclass_enrollments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public access masterclass_enrollments" ON public.masterclass_enrollments;
CREATE POLICY "Public access masterclass_enrollments" ON public.masterclass_enrollments FOR ALL USING (true) WITH CHECK (true);

-- Exam Submissions Policies
ALTER TABLE public.exam_submissions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public access exam_submissions" ON public.exam_submissions;
CREATE POLICY "Public access exam_submissions" ON public.exam_submissions FOR ALL USING (true) WITH CHECK (true);

-- Masterclasses Policies
ALTER TABLE public.masterclasses ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public access masterclasses" ON public.masterclasses;
CREATE POLICY "Public access masterclasses" ON public.masterclasses FOR ALL USING (true) WITH CHECK (true);

-- Live Classes Policies
ALTER TABLE public.live_classes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public access live_classes" ON public.live_classes;
CREATE POLICY "Public access live_classes" ON public.live_classes FOR ALL USING (true) WITH CHECK (true);


-- Masterclass Questions Policies
ALTER TABLE public.masterclass_questions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public access masterclass_questions" ON public.masterclass_questions;
CREATE POLICY "Public access masterclass_questions" ON public.masterclass_questions FOR ALL USING (true) WITH CHECK (true);

-- Site Settings Policies
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public access site_settings" ON public.site_settings;
CREATE POLICY "Public access site_settings" ON public.site_settings FOR ALL USING (true) WITH CHECK (true);

-- ====================================================================
-- INDEXES FOR MAXIMUM QUERY PERFORMANCE
-- ====================================================================
CREATE INDEX IF NOT EXISTS idx_registered_users_email ON public.registered_users(email);
CREATE INDEX IF NOT EXISTS idx_user_details_email ON public.user_details(email);
CREATE INDEX IF NOT EXISTS idx_users_details_email ON public.users_details(email);
CREATE INDEX IF NOT EXISTS idx_masterclass_enrollments_email ON public.masterclass_enrollments(user_email);
CREATE INDEX IF NOT EXISTS idx_exam_submissions_email ON public.exam_submissions(candidate_email);
CREATE INDEX IF NOT EXISTS idx_exam_submissions_credential ON public.exam_submissions(credential_id);

-- ====================================================================
-- 8. PROGRAMS FOR BIHAR'S OFFICERS TABLES
-- ====================================================================
CREATE TABLE IF NOT EXISTS public.officer_programs (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    course_name TEXT,
    desc_text TEXT,
    description TEXT,
    duration TEXT,
    course_duration TEXT,
    instructor TEXT,
    course_instructor TEXT,
    instructor_title TEXT,
    instructor_image TEXT,
    language TEXT,
    course_language TEXT,
    certificate_type TEXT DEFAULT 'Government Executive Certificate',
    platform_name TEXT DEFAULT 'In-Person / Offline / BIPARD',
    scheduled_date_time TEXT,
    scheduled_time_text TEXT,
    join_url TEXT,
    meeting_url TEXT,
    buy_url TEXT,
    price TEXT DEFAULT 'Free for Officers',
    price_display TEXT DEFAULT 'Free for Officers',
    is_exam_unlocked BOOLEAN DEFAULT true,
    tag_label TEXT DEFAULT 'WORKSHOP',
    tags JSONB,
    footer JSONB,
    questions JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.programs (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    course_name TEXT,
    desc_text TEXT,
    description TEXT,
    duration TEXT,
    course_duration TEXT,
    instructor TEXT,
    course_instructor TEXT,
    instructor_title TEXT,
    instructor_image TEXT,
    language TEXT,
    course_language TEXT,
    certificate_type TEXT DEFAULT 'Government Executive Certificate',
    platform_name TEXT DEFAULT 'In-Person / Offline / BIPARD',
    scheduled_date_time TEXT,
    scheduled_time_text TEXT,
    join_url TEXT,
    meeting_url TEXT,
    buy_url TEXT,
    price TEXT DEFAULT 'Free for Officers',
    price_display TEXT DEFAULT 'Free for Officers',
    is_exam_unlocked BOOLEAN DEFAULT true,
    tag_label TEXT DEFAULT 'WORKSHOP',
    tags JSONB,
    footer JSONB,
    questions JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.officer_program_enrollments (
    id TEXT PRIMARY KEY,
    user_id TEXT,
    user_email TEXT NOT NULL,
    user_name TEXT,
    program_id TEXT NOT NULL,
    program_title TEXT NOT NULL,
    amount_paid NUMERIC DEFAULT 0,
    payment_id TEXT,
    status TEXT DEFAULT 'ACTIVE',
    enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.officer_program_exam_submissions (
    id TEXT PRIMARY KEY,
    credential_id TEXT UNIQUE NOT NULL,
    candidate_name TEXT NOT NULL,
    candidate_email TEXT NOT NULL,
    candidate_designation TEXT,
    program_id TEXT,
    program_title TEXT,
    score INT NOT NULL,
    total INT NOT NULL,
    percentage NUMERIC NOT NULL,
    status TEXT NOT NULL,
    is_passed BOOLEAN DEFAULT false,
    is_approved BOOLEAN DEFAULT false,
    is_violated BOOLEAN DEFAULT false,
    is_downloaded BOOLEAN DEFAULT false,
    time_taken_seconds INT,
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    approved_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE IF NOT EXISTS public.officer_program_payments (
    id TEXT PRIMARY KEY,
    user_id TEXT,
    user_email TEXT NOT NULL,
    user_name TEXT,
    program_id TEXT NOT NULL,
    program_title TEXT NOT NULL,
    transaction_id TEXT,
    merchant_transaction_id TEXT,
    amount NUMERIC DEFAULT 0,
    status TEXT DEFAULT 'SUCCESS',
    payment_gateway TEXT DEFAULT 'PhonePe',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.officer_program_questions (
    id TEXT PRIMARY KEY,
    program_id TEXT NOT NULL,
    question_text TEXT NOT NULL,
    options JSONB NOT NULL,
    correct_option INT NOT NULL,
    explanation TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS Policies
ALTER TABLE public.officer_programs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public access officer_programs" ON public.officer_programs;
CREATE POLICY "Public access officer_programs" ON public.officer_programs FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE public.programs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public access programs" ON public.programs;
CREATE POLICY "Public access programs" ON public.programs FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE public.officer_program_enrollments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public access officer_program_enrollments" ON public.officer_program_enrollments;
CREATE POLICY "Public access officer_program_enrollments" ON public.officer_program_enrollments FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE public.officer_program_exam_submissions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public access officer_program_exam_submissions" ON public.officer_program_exam_submissions;
CREATE POLICY "Public access officer_program_exam_submissions" ON public.officer_program_exam_submissions FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE public.officer_program_payments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public access officer_program_payments" ON public.officer_program_payments;
CREATE POLICY "Public access officer_program_payments" ON public.officer_program_payments FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE public.officer_program_questions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public access officer_program_questions" ON public.officer_program_questions;
CREATE POLICY "Public access officer_program_questions" ON public.officer_program_questions FOR ALL USING (true) WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_officer_programs_id ON public.officer_programs(id);
CREATE INDEX IF NOT EXISTS idx_officer_program_enrollments_email ON public.officer_program_enrollments(user_email);
CREATE INDEX IF NOT EXISTS idx_officer_program_exam_submissions_email ON public.officer_program_exam_submissions(candidate_email);
CREATE INDEX IF NOT EXISTS idx_officer_program_payments_email ON public.officer_program_payments(user_email);
CREATE INDEX IF NOT EXISTS idx_officer_program_questions_prog ON public.officer_program_questions(program_id);

