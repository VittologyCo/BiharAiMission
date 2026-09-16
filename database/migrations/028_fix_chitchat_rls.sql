-- ==============================================================================
-- BIHAR AI MISSION - MIGRATION 028: FIX CHITCHAT RLS POLICIES & PERMISSIONS
-- Run this in your Supabase SQL Editor (SQL Editor -> New Query -> Run)
-- Fixes:
-- "new row violates row-level security policy for table 'chitchat_access_codes'"
-- and 403 Forbidden errors when generating codes, creating groups, or chatting.
-- ==============================================================================

-- 1. CHITCHAT ACCESS CODES
ALTER TABLE IF EXISTS public.chitchat_access_codes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read/write on chitchat_access_codes" ON public.chitchat_access_codes;
CREATE POLICY "Allow public read/write on chitchat_access_codes" 
ON public.chitchat_access_codes 
FOR ALL 
TO anon, authenticated, service_role
USING (true) 
WITH CHECK (true);

-- 2. CHITCHAT GROUPS
ALTER TABLE IF EXISTS public.chitchat_groups ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read/write on chitchat_groups" ON public.chitchat_groups;
CREATE POLICY "Allow public read/write on chitchat_groups" 
ON public.chitchat_groups 
FOR ALL 
TO anon, authenticated, service_role
USING (true) 
WITH CHECK (true);

-- 3. CHITCHAT FRIENDS
ALTER TABLE IF EXISTS public.chitchat_friends ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read/write on chitchat_friends" ON public.chitchat_friends;
CREATE POLICY "Allow public read/write on chitchat_friends" 
ON public.chitchat_friends 
FOR ALL 
TO anon, authenticated, service_role
USING (true) 
WITH CHECK (true);

-- 4. CHITCHAT MESSAGES
ALTER TABLE IF EXISTS public.chitchat_messages ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read/write on chitchat_messages" ON public.chitchat_messages;
CREATE POLICY "Allow public read/write on chitchat_messages" 
ON public.chitchat_messages 
FOR ALL 
TO anon, authenticated, service_role
USING (true) 
WITH CHECK (true);

-- 5. Explicit Grants to anon, authenticated, and service_role
GRANT ALL ON TABLE public.chitchat_access_codes TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.chitchat_groups TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.chitchat_friends TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.chitchat_messages TO anon, authenticated, service_role;

-- 6. Ensure publication contains all chitchat tables for instant realtime sync
DO $$
BEGIN
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.chitchat_messages;
  EXCEPTION WHEN OTHERS THEN
    NULL;
  END;
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.chitchat_groups;
  EXCEPTION WHEN OTHERS THEN
    NULL;
  END;
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.chitchat_access_codes;
  EXCEPTION WHEN OTHERS THEN
    NULL;
  END;
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.chitchat_friends;
  EXCEPTION WHEN OTHERS THEN
    NULL;
  END;
END $$;

-- 7. Fix officer_program_questions & masterclass_questions columns (Fixes 400 Bad Request on order=q_id)
ALTER TABLE IF EXISTS public.officer_program_questions ADD COLUMN IF NOT EXISTS q_id INT DEFAULT 1;
ALTER TABLE IF EXISTS public.officer_program_questions ADD COLUMN IF NOT EXISTS question TEXT;
ALTER TABLE IF EXISTS public.officer_program_questions ADD COLUMN IF NOT EXISTS answer INT DEFAULT 0;
ALTER TABLE IF EXISTS public.officer_program_questions ADD COLUMN IF NOT EXISTS level_label TEXT DEFAULT 'LEVEL 1 · BEGINNER';

ALTER TABLE IF EXISTS public.masterclass_questions ADD COLUMN IF NOT EXISTS q_id INT DEFAULT 1;
ALTER TABLE IF EXISTS public.masterclass_questions ADD COLUMN IF NOT EXISTS question TEXT;
ALTER TABLE IF EXISTS public.masterclass_questions ADD COLUMN IF NOT EXISTS answer INT DEFAULT 0;

