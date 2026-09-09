-- ============================================================
-- Migration 023: Add 9 new Annexure-1 daily tasks into open slots
-- 
-- Existing 9 tasks remain untouched at their current positions:
--   #1  ChatGPT
--   #2  Microsoft Copilot
--   #3  Google Gemini
--   #4  Perplexity AI
--   #5  Character.ai
--   #6  Canva Magic Studio
--   #8  ElevenLabs
--   #9  Gamma App
--   #15 Zapier
--
-- The 9 new tasks fill the 9 available slots:
--   #7  DeepSeek
--   #10 QuillBot
--   #11 Copy.ai
--   #12 Grammarly
--   #13 Adobe Firefly
--   #14 Leonardo.ai
--   #16 Figma AI
--   #17 Tome
--   #18 Google AI Studio
--
-- Run in: Supabase -> SQL Editor -> New Query -> Run
-- ============================================================

-- Step 1: Clean up any tasks previously inserted at num >= 19 from prior drafts
DELETE FROM public.daily_tasks
WHERE num >= 19;

-- Also remove any duplicate entries for the 9 new tools if they exist outside their designated slots
DELETE FROM public.daily_tasks
WHERE tool_name IN (
  'DeepSeek', 'QuillBot', 'Copy.ai', 'Grammarly', 'Superhuman (Grammarly)',
  'Adobe Firefly', 'Leonardo.ai', 'Figma AI', 'Tome', 'Google AI Studio'
) AND num NOT IN (7, 10, 11, 12, 13, 14, 16, 17, 18);


-- Step 2: Insert the 9 new tasks into the open slots (7, 10, 11, 12, 13, 14, 16, 17, 18)

-- Slot 7: DeepSeek
INSERT INTO public.daily_tasks (num, tool_name, title, classwork, instructions, final_submission, category, is_active)
SELECT 7, 'DeepSeek', 'Quick Policy Query Assistant',
  'Use DeepSeek to rapidly answer routine departmental queries and cross-check facts against ChatGPT/Gemini outputs.',
  'Pose 5 common administrative queries (RTI process, leave rules, scheme eligibility, file movement, grievance timelines). Compare DeepSeek''s answers with another chatbot''s answers and note factual differences.',
  '["5 Q&A pairs", "Comparison note (DeepSeek vs other chatbot)"]'::jsonb,
  'AI Practical Classwork', true
WHERE NOT EXISTS (SELECT 1 FROM public.daily_tasks WHERE num = 7 OR tool_name = 'DeepSeek');

-- Slot 10: QuillBot
INSERT INTO public.daily_tasks (num, tool_name, title, classwork, instructions, final_submission, category, is_active)
SELECT 10, 'QuillBot', 'Official Circular Proofreading',
  'Proofread and paraphrase a draft government circular/office order for clarity and tone.',
  'Take a rough draft circular, run it through QuillBot''s grammar and paraphrasing tools, and produce a polished, formal final version without changing factual content.',
  '["Original draft", "Polished final circular", "List of key edits made"]'::jsonb,
  'AI Practical Classwork', true
WHERE NOT EXISTS (SELECT 1 FROM public.daily_tasks WHERE num = 10 OR tool_name = 'QuillBot');

-- Slot 11: Copy.ai
INSERT INTO public.daily_tasks (num, tool_name, title, classwork, instructions, final_submission, category, is_active)
SELECT 11, 'Copy.ai', 'Scheme Launch Promotional Copy',
  'Draft promotional copy announcing the launch of a new government scheme or service.',
  'Generate a short announcement, a longer press-note style paragraph, and 3 social media captions publicising the scheme, in citizen-friendly language.',
  '["Short announcement", "Press-note paragraph", "3 social media captions"]'::jsonb,
  'AI Practical Classwork', true
WHERE NOT EXISTS (SELECT 1 FROM public.daily_tasks WHERE num = 11 OR tool_name = 'Copy.ai');

-- Slot 12: Grammarly
INSERT INTO public.daily_tasks (num, tool_name, title, classwork, instructions, final_submission, category, is_active)
SELECT 12, 'Grammarly', 'Official Email Correspondence',
  'Draft and refine formal email correspondence with a citizen or another department.',
  'Write a reply to a citizen grievance email and an inter-departmental coordination email. Use AI writing assistance to improve tone, grammar and professionalism.',
  '["Citizen reply email", "Inter-departmental email", "Before/after comparison"]'::jsonb,
  'AI Practical Classwork', true
WHERE NOT EXISTS (SELECT 1 FROM public.daily_tasks WHERE num = 12 OR tool_name = 'Grammarly');

-- Slot 13: Adobe Firefly
INSERT INTO public.daily_tasks (num, tool_name, title, classwork, instructions, final_submission, category, is_active)
SELECT 13, 'Adobe Firefly', 'Campaign Visual Assets',
  'Generate visual assets for a public awareness campaign (e.g. cleanliness, digital literacy, voter awareness).',
  'Create 3 campaign images/graphics appropriate for public display, ensuring content is culturally appropriate and free of copyrighted material.',
  '["3 campaign images", "Prompts used"]'::jsonb,
  'AI Practical Classwork', true
WHERE NOT EXISTS (SELECT 1 FROM public.daily_tasks WHERE num = 13 OR tool_name = 'Adobe Firefly');

-- Slot 14: Leonardo.ai
INSERT INTO public.daily_tasks (num, tool_name, title, classwork, instructions, final_submission, category, is_active)
SELECT 14, 'Leonardo.ai', 'Portal Icon & Asset Set',
  'Design a small icon/illustration set for a District Citizen Service Portal.',
  'Generate a consistent set of 6 icons/illustrations (e.g. grievance, tracking, login, services, feedback, helpdesk) suitable for a government web portal.',
  '["6 icons/illustrations", "Style notes"]'::jsonb,
  'AI Practical Classwork', true
WHERE NOT EXISTS (SELECT 1 FROM public.daily_tasks WHERE num = 14 OR tool_name = 'Leonardo.ai');

-- Slot 16: Figma AI
INSERT INTO public.daily_tasks (num, tool_name, title, classwork, instructions, final_submission, category, is_active)
SELECT 16, 'Figma AI', 'Service Portal UI Mockup',
  'Design a UI mockup for a departmental citizen service page using Figma AI.',
  'Create a mockup with a header, service list, application status tracker and feedback form. Focus on clarity and accessibility for citizens.',
  '["Figma mockup link/export", "Screenshot"]'::jsonb,
  'AI Practical Classwork', true
WHERE NOT EXISTS (SELECT 1 FROM public.daily_tasks WHERE num = 16 OR tool_name = 'Figma AI');

-- Slot 17: Tome
INSERT INTO public.daily_tasks (num, tool_name, title, classwork, instructions, final_submission, category, is_active)
SELECT 17, 'Tome', 'Department Overview Storytelling Deck',
  'Create a narrative-style deck introducing a department''s mandate, schemes and achievements.',
  'Build a storytelling deck (6-8 slides/sections) covering department mandate, key schemes, achievements and future roadmap.',
  '["Deck link/export"]'::jsonb,
  'AI Practical Classwork', true
WHERE NOT EXISTS (SELECT 1 FROM public.daily_tasks WHERE num = 17 OR tool_name = 'Tome');

-- Slot 18: Google AI Studio
INSERT INTO public.daily_tasks (num, tool_name, title, classwork, instructions, final_submission, category, is_active)
SELECT 18, 'Google AI Studio', 'Gemini-Powered Prototype',
  'Build a simple Gemini-powered chatbot prototype for citizen FAQ handling.',
  'Use Google AI Studio to configure a Gemini-based prompt/agent that answers basic citizen queries about a chosen government service, and test it with 5 sample questions.',
  '["Prototype link/export", "5 sample Q&A test results"]'::jsonb,
  'AI Practical Classwork', true
WHERE NOT EXISTS (SELECT 1 FROM public.daily_tasks WHERE num = 18 OR tool_name = 'Google AI Studio');

-- Step 3: Verification - should show all 18 tasks consecutively ordered 1 through 18
SELECT num, tool_name, title, is_active
FROM public.daily_tasks
ORDER BY num ASC;
