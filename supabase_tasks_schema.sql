-- ==============================================================================
-- BIHAR AI MISSION - DAILY TASKS & SUBMISSIONS COMPLETE SCHEMA
-- Execute this SQL in your Supabase Dashboard -> SQL Editor
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. TABLE: daily_tasks (Admin Task Creator / Manager)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.daily_tasks (
    id SERIAL PRIMARY KEY,
    num INTEGER UNIQUE NOT NULL,
    tool_name TEXT NOT NULL,
    title TEXT NOT NULL,
    classwork TEXT NOT NULL,
    instructions TEXT NOT NULL,
    final_submission JSONB DEFAULT '[]'::jsonb,
    category TEXT DEFAULT 'AI Practical Classwork',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- ------------------------------------------------------------------------------
-- 2. TABLE: daily_task_submissions (Candidate Submissions & Admin Review)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.daily_task_submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT,
    user_email TEXT NOT NULL,
    user_name TEXT,
    user_district TEXT,
    task_id INTEGER NOT NULL,
    task_title TEXT NOT NULL,
    category TEXT DEFAULT 'AI Practical Classwork',
    file_url TEXT,
    file_name TEXT,
    file_size TEXT,
    submission_link TEXT,
    notes TEXT,
    drive_file_id TEXT,
    status TEXT NOT NULL DEFAULT 'PENDING', -- 'PENDING', 'APPROVED', 'REJECTED'
    admin_feedback TEXT,
    reviewed_by TEXT,
    reviewed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    CONSTRAINT unique_user_task UNIQUE (user_email, task_id)
);

-- ------------------------------------------------------------------------------
-- 3. INDEXES FOR HIGH PERFORMANCE
-- ------------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_daily_tasks_num ON public.daily_tasks(num);
CREATE INDEX IF NOT EXISTS idx_daily_tasks_active ON public.daily_tasks(is_active);

CREATE INDEX IF NOT EXISTS idx_task_subs_email ON public.daily_task_submissions(user_email);
CREATE INDEX IF NOT EXISTS idx_task_subs_task_id ON public.daily_task_submissions(task_id);
CREATE INDEX IF NOT EXISTS idx_task_subs_status ON public.daily_task_submissions(status);
CREATE INDEX IF NOT EXISTS idx_task_subs_created_at ON public.daily_task_submissions(created_at DESC);

-- ------------------------------------------------------------------------------
-- 4. ROW LEVEL SECURITY (RLS) POLICIES
-- ------------------------------------------------------------------------------
ALTER TABLE public.daily_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_task_submissions ENABLE ROW LEVEL SECURITY;

-- daily_tasks policies
CREATE POLICY "Allow public read access to active daily tasks"
ON public.daily_tasks
FOR SELECT
USING (true);

CREATE POLICY "Allow admin write/update access to daily tasks"
ON public.daily_tasks
FOR ALL
USING (true)
WITH CHECK (true);

-- daily_task_submissions policies
CREATE POLICY "Allow public insert to daily_task_submissions"
ON public.daily_task_submissions
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Allow select on daily_task_submissions"
ON public.daily_task_submissions
FOR SELECT
USING (true);

CREATE POLICY "Allow update on daily_task_submissions"
ON public.daily_task_submissions
FOR UPDATE
USING (true)
WITH CHECK (true);

-- ------------------------------------------------------------------------------
-- 5. SUPABASE STORAGE BUCKET: task-submissions (Direct & Fast File Uploads)
-- ------------------------------------------------------------------------------
INSERT INTO storage.buckets (id, name, public) 
VALUES ('task-submissions', 'task-submissions', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Drop existing storage policies if re-running
DROP POLICY IF EXISTS "Allow public uploads to task-submissions" ON storage.objects;
DROP POLICY IF EXISTS "Allow public downloads from task-submissions" ON storage.objects;

-- Create storage policies
CREATE POLICY "Allow public uploads to task-submissions"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'task-submissions');

CREATE POLICY "Allow public downloads from task-submissions"
ON storage.objects FOR SELECT
USING (bucket_id = 'task-submissions');

-- ------------------------------------------------------------------------------
-- 6. SEED DEFAULT 18 AI PRACTICAL CLASSWORK ASSIGNMENTS
-- ------------------------------------------------------------------------------
INSERT INTO public.daily_tasks (num, tool_name, title, classwork, instructions, final_submission, category)
VALUES
(1, 'ChatGPT', 'Government Officer''s AI Assistant', 'Create a citizen-facing FAQ for a government service.', 'Generate 10 frequently asked citizen questions and clear, polite, citizen-friendly answers. Do not invent rules or deadlines; identify when the citizen should contact the concerned office.', '["10 FAQs", "1-page Citizen Help Guide"]'::jsonb, 'AI Practical Classwork'),
(2, 'Microsoft Copilot', 'Research & Briefing', 'Prepare a one-page briefing note on a current administrative issue.', 'Choose one topic such as AI in education, digital payments, cyber fraud, smart agriculture or waste management. Research key findings and prepare an executive summary.', '["1-page briefing note", "Sources used"]'::jsonb, 'AI Practical Classwork'),
(3, 'Google Gemini', 'Multimodal Administrative Analysis', 'Analyse an image of a government/public-service environment from an administrative perspective.', 'Use an image such as an overcrowded office, traffic junction, waste dumping area, government school or PHC waiting area. Identify 5 observable problems, possible causes and practical interventions.', '["5 problems", "Root causes", "5 interventions", "Priority ranking"]'::jsonb, 'AI Practical Classwork'),
(4, 'Perplexity AI', 'Research Assignment', 'Research: “How can Artificial Intelligence improve District Administration?”', 'Find 3 government initiatives, 2 international examples, 3 practical use cases and 5 credible sources. Clearly distinguish verified facts from recommendations.', '["1-page research brief", "5 credible sources"]'::jsonb, 'AI Practical Classwork'),
(5, 'Character.ai', 'Stakeholder Simulation', 'Simulate conversations with stakeholders for introduction of an online grievance system.', 'Interview/simulate a citizen, elderly citizen, rural citizen, government clerk and district officer. Extract concerns and identify common themes.', '["5 stakeholder perspectives", "10 key insights"]'::jsonb, 'AI Practical Classwork'),
(6, 'Canva Magic Studio', 'Public Awareness Materials', 'Create public awareness creatives for a government campaign.', 'Design an infographic, WhatsApp poster and social media post with clear, culturally appropriate language.', '["1 Infographic", "1 WhatsApp poster", "1 Social media post"]'::jsonb, 'AI Practical Classwork'),
(7, 'Suno / Udio', 'Public Service Audio / Jingle', 'Create a 30–60 second public awareness jingle/audio message.', 'Produce an audio piece for voter awareness, cleanliness, road safety or digital literacy.', '["30-60 second audio file", "Lyrics/script sheet"]'::jsonb, 'AI Practical Classwork'),
(8, 'ElevenLabs', 'Multilingual Voice Broadcast', 'Create a 60-second official audio announcement in Hindi and English.', 'Generate high-clarity voice output in both languages with professional tone suitable for public distribution.', '["60-second Hindi audio", "60-second English audio", "Script document"]'::jsonb, 'AI Practical Classwork'),
(9, 'Gamma App', 'Presentation Creation', 'Create an 8-slide presentation on “AI Tools in Public Administration”.', 'Include title, agenda, administrative challenges, 5 AI tools with use cases, ethics & risks, and conclusion.', '["8-slide presentation link/export"]'::jsonb, 'AI Practical Classwork'),
(10, 'Beautiful.ai', 'Executive Dashboard', 'Design an Executive Dashboard for Monitoring Government Schemes.', 'Structure KPI cards, District Performance chart, Timeline visual and Action Items panel.', '["4-slide executive dashboard presentation"]'::jsonb, 'AI Practical Classwork'),
(11, 'ChatDOC', 'Document Intelligence', 'Upload a government policy document or report and perform systematic analysis.', 'Extract summary, key provisions, beneficiaries, timelines and responsibilities with specific page references.', '["Structured analysis report with citations"]'::jsonb, 'AI Practical Classwork'),
(12, 'Julius AI', 'Administrative Data Analysis', 'Analyse a sample public administration dataset.', 'Generate 3 visualizations, compute key statistical measures, identify top 3 trends and draft a 5-point data insight note.', '["3 charts/graphs", "Statistical summary", "5-point data insight note"]'::jsonb, 'AI Practical Classwork'),
(13, 'Replit', 'Simple Administrative Tool', 'Build a simple web application for citizen query routing or token management.', 'Deploy a functional web app accepting inputs, applying logic and displaying clear output.', '["Working application link", "Code file / repository link", "1-page user guide"]'::jsonb, 'AI Practical Classwork'),
(14, 'v0 by Vercel', 'Citizen Portal UI', 'Generate a modern UI for a District Citizen Service Portal.', 'Design a responsive web interface with citizen login, service catalogue, tracking and grievance submission.', '["Live preview link / React component code"]'::jsonb, 'AI Practical Classwork'),
(15, 'Zapier', 'Process Automation', 'Design and build an automated workflow for citizen grievance or feedback handling.', 'Create trigger-action sequence routing submissions to email, Google Sheet, or Telegram.', '["Workflow diagram/screenshot", "Live Zap link or test log", "1-page process documentation"]'::jsonb, 'AI Practical Classwork'),
(16, 'Make (Integromat)', 'Multi-Step Workflow', 'Build a multi-step administrative automation pipeline with conditional logic.', 'Implement data receipt, validation, conditional routing, database entry and notification dispatch.', '["Scenario export / blueprint JSON", "Annotated screenshot", "1-page process brief"]'::jsonb, 'AI Practical Classwork'),
(17, 'HeyGen', 'Official Video Announcement', 'Create a 60-second AI-avatar-presented public service video announcement.', 'Configure realistic avatar, natural speech delivery, background and subtitles for public dissemination.', '["60-second MP4 video", "Video script", "Distribution plan note"]'::jsonb, 'AI Practical Classwork'),
(18, 'Descript', 'Audio/Video Editing', 'Edit an official recorded address or interview using text-based editing.', 'Remove filler words, enhance audio clarity, add captions and export clean video.', '["Edited video/audio file", "Transcript with edits marked", "1-paragraph edit summary"]'::jsonb, 'AI Practical Classwork')
ON CONFLICT (num) DO UPDATE SET
  tool_name = EXCLUDED.tool_name,
  title = EXCLUDED.title,
  classwork = EXCLUDED.classwork,
  instructions = EXCLUDED.instructions,
  final_submission = EXCLUDED.final_submission,
  category = EXCLUDED.category,
  updated_at = now();
