-- ============================================================
-- Migration 023: Add 9 new Annexure-1 daily tasks (num 19-27)
-- Safe to re-run: each INSERT skips if num or tool_name exists.
-- Run in: Supabase ? SQL Editor ? New Query ? Run
-- ============================================================

INSERT INTO public.daily_tasks (num, tool_name, title, classwork, instructions, final_submission, category, is_active)
SELECT 19, 'DeepSeek', 'Quick Policy Query Assistant',
  'Use DeepSeek to rapidly answer routine departmental queries and cross-check facts against ChatGPT/Gemini outputs.',
  'Pose 5 common administrative queries (RTI process, leave rules, scheme eligibility, file movement, grievance timelines). Compare DeepSeek''s answers with another chatbot''s answers and note factual differences.',
  '["5 Q&A pairs", "Comparison note (DeepSeek vs other chatbot)"]'::jsonb,
  'AI Practical Classwork', true
WHERE NOT EXISTS (SELECT 1 FROM public.daily_tasks WHERE num = 19 OR tool_name = 'DeepSeek');

INSERT INTO public.daily_tasks (num, tool_name, title, classwork, instructions, final_submission, category, is_active)
SELECT 20, 'QuillBot', 'Official Circular Proofreading',
  'Proofread and paraphrase a draft government circular/office order for clarity and tone.',
  'Take a rough draft circular, run it through QuillBot''s grammar and paraphrasing tools, and produce a polished, formal final version without changing factual content.',
  '["Original draft", "Polished final circular", "List of key edits made"]'::jsonb,
  'AI Practical Classwork', true
WHERE NOT EXISTS (SELECT 1 FROM public.daily_tasks WHERE num = 20 OR tool_name = 'QuillBot');

INSERT INTO public.daily_tasks (num, tool_name, title, classwork, instructions, final_submission, category, is_active)
SELECT 21, 'Copy.ai', 'Scheme Launch Promotional Copy',
  'Draft promotional copy announcing the launch of a new government scheme or service.',
  'Generate a short announcement, a longer press-note style paragraph, and 3 social media captions publicising the scheme, in citizen-friendly language.',
  '["Short announcement", "Press-note paragraph", "3 social media captions"]'::jsonb,
  'AI Practical Classwork', true
WHERE NOT EXISTS (SELECT 1 FROM public.daily_tasks WHERE num = 21 OR tool_name = 'Copy.ai');

INSERT INTO public.daily_tasks (num, tool_name, title, classwork, instructions, final_submission, category, is_active)
SELECT 22, 'Grammarly', 'Official Email Correspondence',
  'Draft and refine formal email correspondence with a citizen or another department.',
  'Write a reply to a citizen grievance email and an inter-departmental coordination email. Use AI writing assistance to improve tone, grammar and professionalism.',
  '["Citizen reply email", "Inter-departmental email", "Before/after comparison"]'::jsonb,
  'AI Practical Classwork', true
WHERE NOT EXISTS (SELECT 1 FROM public.daily_tasks WHERE num = 22 OR tool_name = 'Grammarly');

INSERT INTO public.daily_tasks (num, tool_name, title, classwork, instructions, final_submission, category, is_active)
SELECT 23, 'Adobe Firefly', 'Campaign Visual Assets',
  'Generate visual assets for a public awareness campaign (e.g. cleanliness, digital literacy, voter awareness).',
  'Create 3 campaign images/graphics appropriate for public display, ensuring content is culturally appropriate and free of copyrighted material.',
  '["3 campaign images", "Prompts used"]'::jsonb,
  'AI Practical Classwork', true
WHERE NOT EXISTS (SELECT 1 FROM public.daily_tasks WHERE num = 23 OR tool_name = 'Adobe Firefly');

INSERT INTO public.daily_tasks (num, tool_name, title, classwork, instructions, final_submission, category, is_active)
SELECT 24, 'Leonardo.ai', 'Portal Icon & Asset Set',
  'Design a small icon/illustration set for a District Citizen Service Portal.',
  'Generate a consistent set of 6 icons/illustrations (e.g. grievance, tracking, login, services, feedback, helpdesk) suitable for a government web portal.',
  '["6 icons/illustrations", "Style notes"]'::jsonb,
  'AI Practical Classwork', true
WHERE NOT EXISTS (SELECT 1 FROM public.daily_tasks WHERE num = 24 OR tool_name = 'Leonardo.ai');

INSERT INTO public.daily_tasks (num, tool_name, title, classwork, instructions, final_submission, category, is_active)
SELECT 25, 'Figma AI', 'Service Portal UI Mockup',
  'Design a UI mockup for a departmental citizen service page using Figma AI.',
  'Create a mockup with a header, service list, application status tracker and feedback form. Focus on clarity and accessibility for citizens.',
  '["Figma mockup link/export", "Screenshot"]'::jsonb,
  'AI Practical Classwork', true
WHERE NOT EXISTS (SELECT 1 FROM public.daily_tasks WHERE num = 25 OR tool_name = 'Figma AI');

INSERT INTO public.daily_tasks (num, tool_name, title, classwork, instructions, final_submission, category, is_active)
SELECT 26, 'Tome', 'Department Overview Storytelling Deck',
  'Create a narrative-style deck introducing a department''s mandate, schemes and achievements.',
  'Build a storytelling deck (6-8 slides/sections) covering department mandate, key schemes, achievements and future roadmap.',
  '["Deck link/export"]'::jsonb,
  'AI Practical Classwork', true
WHERE NOT EXISTS (SELECT 1 FROM public.daily_tasks WHERE num = 26 OR tool_name = 'Tome');

INSERT INTO public.daily_tasks (num, tool_name, title, classwork, instructions, final_submission, category, is_active)
SELECT 27, 'Google AI Studio', 'Gemini-Powered Prototype',
  'Build a simple Gemini-powered chatbot prototype for citizen FAQ handling.',
  'Use Google AI Studio to configure a Gemini-based prompt/agent that answers basic citizen queries about a chosen government service, and test it with 5 sample questions.',
  '["Prototype link/export", "5 sample Q&A test results"]'::jsonb,
  'AI Practical Classwork', true
WHERE NOT EXISTS (SELECT 1 FROM public.daily_tasks WHERE num = 27 OR tool_name = 'Google AI Studio');

-- Verify: should show all 18 tasks (9 existing + 9 new)
SELECT num, tool_name, title, is_active
FROM public.daily_tasks
ORDER BY num;
