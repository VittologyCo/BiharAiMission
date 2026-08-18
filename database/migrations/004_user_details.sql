-- ================================================================
-- SAFE MIGRATION SCRIPT: RENAME get_involved TO user_details
-- Run this script in Supabase SQL Editor (SQL Editor -> New Query -> Run)
-- IMPORTANT: This script ONLY renames and updates — NO data will be lost or deleted!
-- ================================================================

-- 1. Rename existing get_involved table to user_details (if user_details does not already exist)
DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'get_involved') 
     AND NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'user_details') THEN
    ALTER TABLE public.get_involved RENAME TO user_details;
  END IF;
END $$;

-- 2. Rename primary key constraint if needed
DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_constraint WHERE conname = 'get_involved_pkey') THEN
    ALTER TABLE public.user_details RENAME CONSTRAINT get_involved_pkey TO user_details_pkey;
  END IF;
END $$;

-- 3. Ensure all columns exist on user_details (in case any were missing)
ALTER TABLE public.user_details ADD COLUMN IF NOT EXISTS mobile text;
ALTER TABLE public.user_details ADD COLUMN IF NOT EXISTS gender text;
ALTER TABLE public.user_details ADD COLUMN IF NOT EXISTS age integer;
ALTER TABLE public.user_details ADD COLUMN IF NOT EXISTS designation text;
ALTER TABLE public.user_details ADD COLUMN IF NOT EXISTS department text;
ALTER TABLE public.user_details ADD COLUMN IF NOT EXISTS organization text;
ALTER TABLE public.user_details ADD COLUMN IF NOT EXISTS experience text;
ALTER TABLE public.user_details ADD COLUMN IF NOT EXISTS district text;
ALTER TABLE public.user_details ADD COLUMN IF NOT EXISTS block_city text;
ALTER TABLE public.user_details ADD COLUMN IF NOT EXISTS state text DEFAULT 'Bihar';
ALTER TABLE public.user_details ADD COLUMN IF NOT EXISTS interests jsonb;
ALTER TABLE public.user_details ADD COLUMN IF NOT EXISTS intent text;
ALTER TABLE public.user_details ADD COLUMN IF NOT EXISTS contribution text;
ALTER TABLE public.user_details ADD COLUMN IF NOT EXISTS linkedin text;
ALTER TABLE public.user_details ADD COLUMN IF NOT EXISTS portfolio text;

-- 4. Create a VIEW for users_details (so both user_details and users_details work seamlessly with zero data duplication)
CREATE OR REPLACE VIEW public.users_details AS SELECT * FROM public.user_details;

-- 5. Enable Row Level Security (RLS) on user_details
ALTER TABLE public.user_details ENABLE ROW LEVEL SECURITY;

-- 6. Re-create public read/write access policy
DROP POLICY IF EXISTS "Allow public read/write on user_details" ON public.user_details;
DROP POLICY IF EXISTS "Allow public read/write on get_involved" ON public.user_details;
DROP POLICY IF EXISTS "Public access get_involved" ON public.user_details;
DROP POLICY IF EXISTS "Allow public insert to get_involved" ON public.user_details;
DROP POLICY IF EXISTS "Allow public select on get_involved" ON public.user_details;

CREATE POLICY "Allow public read/write on user_details" 
  ON public.user_details 
  FOR ALL 
  USING (true) 
  WITH CHECK (true);

-- 7. Grant PostgREST permissions
GRANT ALL ON public.user_details TO anon, authenticated, service_role;
GRANT ALL ON public.users_details TO anon, authenticated, service_role;

-- 8. Notify PostgREST to reload schema
NOTIFY pgrst, 'reload schema';
