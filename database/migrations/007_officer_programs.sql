-- ====================================================================
-- BIHAR AI MISSION - PROGRAMS FOR BIHAR'S OFFICERS SUPABASE SCHEMA
-- Run these SQL statements in your Supabase SQL Editor (SQL Editor -> New Query -> Run)
-- ====================================================================

-- 1. OFFICER PROGRAMS TABLE (Programs for Bihar's Officers)
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
    custom_modules JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Also support `programs` table as alias for compatibility
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
    custom_modules JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. OFFICER PROGRAM ENROLLMENTS TABLE
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

-- 3. OFFICER PROGRAM EXAM SUBMISSIONS TABLE
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
    status TEXT NOT NULL, -- 'PASSED', 'FAILED', 'VIOLATED'
    is_passed BOOLEAN DEFAULT false,
    is_approved BOOLEAN DEFAULT false,
    is_violated BOOLEAN DEFAULT false,
    is_downloaded BOOLEAN DEFAULT false,
    time_taken_seconds INT,
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    approved_at TIMESTAMP WITH TIME ZONE
);

-- 4. OFFICER PROGRAM PAYMENTS TABLE
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

-- 5. OFFICER PROGRAM QUESTIONS TABLE (Level-wise Question Bank)
CREATE TABLE IF NOT EXISTS public.officer_program_questions (
    id TEXT PRIMARY KEY,
    program_id TEXT NOT NULL,
    q_id INT DEFAULT 1,
    question TEXT NOT NULL,
    options JSONB NOT NULL,
    correct_option INT DEFAULT 0,
    answer INT DEFAULT 0,
    explanation TEXT,
    level_label TEXT DEFAULT 'LEVEL 1 · BEGINNER',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Also support `masterclass_questions` fallback
CREATE TABLE IF NOT EXISTS public.masterclass_questions (
    id TEXT PRIMARY KEY,
    class_id TEXT NOT NULL,
    q_id INT DEFAULT 1,
    question TEXT NOT NULL,
    options JSONB NOT NULL,
    correct_option INT DEFAULT 0,
    answer INT DEFAULT 0,
    explanation TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ====================================================================
-- ROW LEVEL SECURITY (RLS) & POLICIES FOR ALL TABLES
-- ====================================================================

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

-- ====================================================================
-- INDEXES FOR MAXIMUM QUERY PERFORMANCE
-- ====================================================================
CREATE INDEX IF NOT EXISTS idx_officer_programs_id ON public.officer_programs(id);
CREATE INDEX IF NOT EXISTS idx_officer_program_enrollments_email ON public.officer_program_enrollments(user_email);
CREATE INDEX IF NOT EXISTS idx_officer_program_exam_submissions_email ON public.officer_program_exam_submissions(candidate_email);
CREATE INDEX IF NOT EXISTS idx_officer_program_payments_email ON public.officer_program_payments(user_email);
CREATE INDEX IF NOT EXISTS idx_officer_program_questions_prog ON public.officer_program_questions(program_id);

-- ====================================================================
-- SEED INITIAL DEFAULT OFFICER PROGRAMS WITH REAL GLOBAL & NATIONAL RESOURCES
-- ====================================================================
INSERT INTO public.officer_programs (id, title, course_name, desc_text, description, tag_label, tags, footer, price, price_display, is_exam_unlocked, custom_modules)
VALUES 
(
  'prog-1',
  'Basic AI & Digital Transformation for Civil Servants',
  'Basic AI & Digital Transformation for Civil Servants',
  'Essential foundational AI program for all government officers, IAS, BAS & administration officials. Covers UNESCO Public Sector AI Competencies, IndiaAI guidelines, GenAI administrative drafting, public grievance automation, and DPDP Act 2023 compliance.',
  'Essential foundational AI program for all government officers, IAS, BAS & administration officials. Covers UNESCO Public Sector AI Competencies, IndiaAI guidelines, GenAI administrative drafting, public grievance automation, and DPDP Act 2023 compliance.',
  'FOUNDATION',
  '[{"cls":"blue","label":"FOUNDATION"},{"cls":"green","label":"MUST-KNOW FOR ALL OFFICERS"},{"cls":"purple","label":"UNESCO & INDIAAI ALIGNED"}]'::jsonb,
  '["Duration: 1-Day Foundational Workshop", "For: All Bihar Civil Servants & Officers", "Mode: In-Person / Online / iGOT"]'::jsonb,
  'Free for Officers',
  'Free for Officers',
  true,
  '[
    {
      "id": "mod-101",
      "num": "01",
      "title": "Module 1: UNESCO AI Competency Framework & Digital Transformation",
      "description": "Understanding core AI competencies for civil servants: digital planning, data governance, and public sector innovation standard defined by UNESCO and UN Broadband Commission.",
      "resourceLink": "https://unesdoc.unesco.org/ark:/48223/pf0000383325",
      "classLink": "https://www.unesco.org/en/artificial-intelligence/public-sector",
      "materialUrl": "https://unesdoc.unesco.org/ark:/48223/pf0000384963"
    },
    {
      "id": "mod-102",
      "num": "02",
      "title": "Module 2: IndiaAI Governance Framework & Mission Karmayogi (iGOT)",
      "description": "Overview of National IndiaAI Stack, MeiTY Responsible AI guidelines, AI Safety Institute (AISI) principles, and iGOT Karmayogi capacity building for government officers.",
      "resourceLink": "https://indiaai.gov.in/",
      "classLink": "https://igotkarmayogi.gov.in/",
      "materialUrl": "https://pib.gov.in/PressReleasePage.aspx?PRID=2010898"
    },
    {
      "id": "mod-103",
      "num": "03",
      "title": "Module 3: GenAI Administrative Drafting & Bilingual Circulars",
      "description": "Hands-on usage of Generative AI for drafting official memos, cabinet notes, public policy summaries, and bilingual English-to-Hindi administrative translations.",
      "resourceLink": "https://oecd-opsi.org/",
      "classLink": "https://biharai.in/",
      "materialUrl": "https://oecd-opsi.org/case_studies/"
    },
    {
      "id": "mod-104",
      "num": "04",
      "title": "Module 4: Public Grievance Redressal & CPGRAMS Analytics",
      "description": "Applying AI/NLP to automatically classify citizen petitions, route grievances, track departmental SLAs, and monitor welfare scheme distribution at district level.",
      "resourceLink": "https://pgportal.gov.in/",
      "classLink": "https://www.niti.gov.in/",
      "materialUrl": "https://pgportal.gov.in/aboutus"
    },
    {
      "id": "mod-105",
      "num": "05",
      "title": "Module 5: AI Ethics, Bias Mitigation & Digital Personal Data Protection (DPDP)",
      "description": "Understanding legal responsibilities under Digital Personal Data Protection (DPDP) Act 2023, avoiding algorithmic bias, maintaining data confidentiality, and mitigating AI hallucinations.",
      "resourceLink": "https://www.meity.gov.in/",
      "classLink": "https://www.unesco.org/en/artificial-intelligence/recommendation-ethics",
      "materialUrl": "https://www.meity.gov.in/data-protection-official"
    }
  ]'::jsonb
),
(
  'prog-2',
  'Executive AI Leadership & Governance Certification',
  'Executive AI Leadership & Governance Certification',
  'Advanced 3-day executive training for IAS, BAS & Heads of Departments on AI policy, ethics, and civic automation.',
  'Advanced 3-day executive training for IAS, BAS & Heads of Departments on AI policy, ethics, and civic automation.',
  'CERTIFICATION',
  '[{"cls":"green","label":"CERTIFICATION"},{"cls":"purple","label":"LEADERSHIP"}]'::jsonb,
  '["Duration: 3-Day Certification", "For: Senior Officers & HODs", "Mode: Residential / BIPARD"]'::jsonb,
  'Free for Officers',
  'Free for Officers',
  true,
  '[
    {
      "id": "mod-201",
      "num": "01",
      "title": "Module 1: National AI Strategy & Policy Formulation",
      "description": "Analysis of IndiaAI mission, NITI Aayog AI Strategy, and formulating departmental AI roadmaps.",
      "resourceLink": "https://indiaai.gov.in/",
      "classLink": "https://www.niti.gov.in/",
      "materialUrl": "https://indiaai.gov.in/research-reports"
    },
    {
      "id": "mod-202",
      "num": "02",
      "title": "Module 2: Strategic Procurement & Public Sector AI Vendor Management",
      "description": "Framework for procuring enterprise AI systems, GeM portal AI guidelines, and vendor accountability.",
      "resourceLink": "https://gem.gov.in/",
      "classLink": "https://gem.gov.in/",
      "materialUrl": "https://gem.gov.in/page/detail/26"
    },
    {
      "id": "mod-203",
      "num": "03",
      "title": "Module 3: Algorithmic Auditing & Public Accountability",
      "description": "Methods for auditing automated decision tools in governance to guarantee fairness, transparency, and equity.",
      "resourceLink": "https://www.oecd.org/governance/ai-in-government/",
      "classLink": "https://oecd-opsi.org/",
      "materialUrl": "https://www.oecd-ilibrary.org/"
    }
  ]'::jsonb
),
(
  'prog-3',
  'District AI Analytics & Public Grievance Lab',
  'District AI Analytics & Public Grievance Lab',
  'Hands-on training for District Officers to deploy AI for grievance analysis and scheme implementation monitoring.',
  'Hands-on training for District Officers to deploy AI for grievance analysis and scheme implementation monitoring.',
  'LAB',
  '[{"cls":"purple","label":"INTERMEDIATE"},{"cls":"blue","label":"WORKSHOP"}]'::jsonb,
  '["Duration: 2-Day Workshop", "For: District Officers & Collectors", "Mode: Hybrid / District HQ"]'::jsonb,
  'Free for Officers',
  'Free for Officers',
  true,
  '[
    {
      "id": "mod-301",
      "num": "01",
      "title": "Module 1: District Petition Triage & CPGRAMS Dashboarding",
      "description": "Automated clustering of complaint trends across blocks using natural language classification.",
      "resourceLink": "https://pgportal.gov.in/",
      "classLink": "https://biharai.in/",
      "materialUrl": "https://pgportal.gov.in/"
    },
    {
      "id": "mod-302",
      "num": "02",
      "title": "Module 2: Satellite & Drone Imagery Analytics for Rural Infrastructure",
      "description": "Utilizing geospatial AI model output to audit MGNREGA works, flood monitoring, and agricultural yield estimation.",
      "resourceLink": "https://bhuvan.nrsc.gov.in/",
      "classLink": "https://isro.gov.in/",
      "materialUrl": "https://bhuvan-app1.nrsc.gov.in/"
    }
  ]'::jsonb
)
ON CONFLICT (id) DO UPDATE SET 
  title = EXCLUDED.title,
  course_name = EXCLUDED.course_name,
  desc_text = EXCLUDED.desc_text,
  description = EXCLUDED.description,
  tag_label = EXCLUDED.tag_label,
  tags = EXCLUDED.tags,
  footer = EXCLUDED.footer,
  custom_modules = EXCLUDED.custom_modules;

INSERT INTO public.programs (id, title, course_name, desc_text, description, tag_label, tags, footer, price, price_display, is_exam_unlocked, custom_modules)
VALUES 
(
  'prog-1',
  'Basic AI & Digital Transformation for Civil Servants',
  'Basic AI & Digital Transformation for Civil Servants',
  'Essential foundational AI program for all government officers, IAS, BAS & administration officials. Covers UNESCO Public Sector AI Competencies, IndiaAI guidelines, GenAI administrative drafting, public grievance automation, and DPDP Act 2023 compliance.',
  'Essential foundational AI program for all government officers, IAS, BAS & administration officials. Covers UNESCO Public Sector AI Competencies, IndiaAI guidelines, GenAI administrative drafting, public grievance automation, and DPDP Act 2023 compliance.',
  'FOUNDATION',
  '[{"cls":"blue","label":"FOUNDATION"},{"cls":"green","label":"MUST-KNOW FOR ALL OFFICERS"},{"cls":"purple","label":"UNESCO & INDIAAI ALIGNED"}]'::jsonb,
  '["Duration: 1-Day Foundational Workshop", "For: All Bihar Civil Servants & Officers", "Mode: In-Person / Online / iGOT"]'::jsonb,
  'Free for Officers',
  'Free for Officers',
  true,
  '[
    {
      "id": "mod-101",
      "num": "01",
      "title": "Module 1: UNESCO AI Competency Framework & Digital Transformation",
      "description": "Understanding core AI competencies for civil servants: digital planning, data governance, and public sector innovation standard defined by UNESCO and UN Broadband Commission.",
      "resourceLink": "https://unesdoc.unesco.org/ark:/48223/pf0000383325",
      "classLink": "https://www.unesco.org/en/artificial-intelligence/public-sector",
      "materialUrl": "https://unesdoc.unesco.org/ark:/48223/pf0000384963"
    },
    {
      "id": "mod-102",
      "num": "02",
      "title": "Module 2: IndiaAI Governance Framework & Mission Karmayogi (iGOT)",
      "description": "Overview of National IndiaAI Stack, MeiTY Responsible AI guidelines, AI Safety Institute (AISI) principles, and iGOT Karmayogi capacity building for government officers.",
      "resourceLink": "https://indiaai.gov.in/",
      "classLink": "https://igotkarmayogi.gov.in/",
      "materialUrl": "https://pib.gov.in/PressReleasePage.aspx?PRID=2010898"
    },
    {
      "id": "mod-103",
      "num": "03",
      "title": "Module 3: GenAI Administrative Drafting & Bilingual Circulars",
      "description": "Hands-on usage of Generative AI for drafting official memos, cabinet notes, public policy summaries, and bilingual English-to-Hindi administrative translations.",
      "resourceLink": "https://oecd-opsi.org/",
      "classLink": "https://biharai.in/",
      "materialUrl": "https://oecd-opsi.org/case_studies/"
    },
    {
      "id": "mod-104",
      "num": "04",
      "title": "Module 4: Public Grievance Redressal & CPGRAMS Analytics",
      "description": "Applying AI/NLP to automatically classify citizen petitions, route grievances, track departmental SLAs, and monitor welfare scheme distribution at district level.",
      "resourceLink": "https://pgportal.gov.in/",
      "classLink": "https://www.niti.gov.in/",
      "materialUrl": "https://pgportal.gov.in/aboutus"
    },
    {
      "id": "mod-105",
      "num": "05",
      "title": "Module 5: AI Ethics, Bias Mitigation & Digital Personal Data Protection (DPDP)",
      "description": "Understanding legal responsibilities under Digital Personal Data Protection (DPDP) Act 2023, avoiding algorithmic bias, maintaining data confidentiality, and mitigating AI hallucinations.",
      "resourceLink": "https://www.meity.gov.in/",
      "classLink": "https://www.unesco.org/en/artificial-intelligence/recommendation-ethics",
      "materialUrl": "https://www.meity.gov.in/data-protection-official"
    }
  ]'::jsonb
),
(
  'prog-2',
  'Executive AI Leadership & Governance Certification',
  'Executive AI Leadership & Governance Certification',
  'Advanced 3-day executive training for IAS, BAS & Heads of Departments on AI policy, ethics, and civic automation.',
  'Advanced 3-day executive training for IAS, BAS & Heads of Departments on AI policy, ethics, and civic automation.',
  'CERTIFICATION',
  '[{"cls":"green","label":"CERTIFICATION"},{"cls":"purple","label":"LEADERSHIP"}]'::jsonb,
  '["Duration: 3-Day Certification", "For: Senior Officers & HODs", "Mode: Residential / BIPARD"]'::jsonb,
  'Free for Officers',
  'Free for Officers',
  true,
  '[
    {
      "id": "mod-201",
      "num": "01",
      "title": "Module 1: National AI Strategy & Policy Formulation",
      "description": "Analysis of IndiaAI mission, NITI Aayog AI Strategy, and formulating departmental AI roadmaps.",
      "resourceLink": "https://indiaai.gov.in/",
      "classLink": "https://www.niti.gov.in/",
      "materialUrl": "https://indiaai.gov.in/research-reports"
    },
    {
      "id": "mod-202",
      "num": "02",
      "title": "Module 2: Strategic Procurement & Public Sector AI Vendor Management",
      "description": "Framework for procuring enterprise AI systems, GeM portal AI guidelines, and vendor accountability.",
      "resourceLink": "https://gem.gov.in/",
      "classLink": "https://gem.gov.in/",
      "materialUrl": "https://gem.gov.in/page/detail/26"
    },
    {
      "id": "mod-203",
      "num": "03",
      "title": "Module 3: Algorithmic Auditing & Public Accountability",
      "description": "Methods for auditing automated decision tools in governance to guarantee fairness, transparency, and equity.",
      "resourceLink": "https://www.oecd.org/governance/ai-in-government/",
      "classLink": "https://oecd-opsi.org/",
      "materialUrl": "https://www.oecd-ilibrary.org/"
    }
  ]'::jsonb
),
(
  'prog-3',
  'District AI Analytics & Public Grievance Lab',
  'District AI Analytics & Public Grievance Lab',
  'Hands-on training for District Officers to deploy AI for grievance analysis and scheme implementation monitoring.',
  'Hands-on training for District Officers to deploy AI for grievance analysis and scheme implementation monitoring.',
  'LAB',
  '[{"cls":"purple","label":"INTERMEDIATE"},{"cls":"blue","label":"WORKSHOP"}]'::jsonb,
  '["Duration: 2-Day Workshop", "For: District Officers & Collectors", "Mode: Hybrid / District HQ"]'::jsonb,
  'Free for Officers',
  'Free for Officers',
  true,
  '[
    {
      "id": "mod-301",
      "num": "01",
      "title": "Module 1: District Petition Triage & CPGRAMS Dashboarding",
      "description": "Automated clustering of complaint trends across blocks using natural language classification.",
      "resourceLink": "https://pgportal.gov.in/",
      "classLink": "https://biharai.in/",
      "materialUrl": "https://pgportal.gov.in/"
    },
    {
      "id": "mod-302",
      "num": "02",
      "title": "Module 2: Satellite & Drone Imagery Analytics for Rural Infrastructure",
      "description": "Utilizing geospatial AI model output to audit MGNREGA works, flood monitoring, and agricultural yield estimation.",
      "resourceLink": "https://bhuvan.nrsc.gov.in/",
      "classLink": "https://isro.gov.in/",
      "materialUrl": "https://bhuvan-app1.nrsc.gov.in/"
    }
  ]'::jsonb
)
ON CONFLICT (id) DO UPDATE SET 
  title = EXCLUDED.title,
  course_name = EXCLUDED.course_name,
  desc_text = EXCLUDED.desc_text,
  description = EXCLUDED.description,
  tag_label = EXCLUDED.tag_label,
  tags = EXCLUDED.tags,
  footer = EXCLUDED.footer,
  custom_modules = EXCLUDED.custom_modules;
