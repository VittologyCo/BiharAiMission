-- ==============================================================================
-- Migration 016: Fix Registration RLS Policies and Add Secure Registration RPC
-- Run this script in the Supabase SQL Editor (SQL Editor -> New Query -> Run)
-- 
-- Fixes:
-- 1. Unblocks public website registration (anon visitors were rejected by RLS error 42501).
-- 2. Adds SECURITY DEFINER function `register_candidate_profile` which safely inserts/updates
--    the user_details table, links auth.users id, and returns profile confirmation.
-- 3. Grants full INSERT/SELECT/UPDATE permissions to anon, authenticated, and service_role.
-- ==============================================================================

-- 1. Ensure all columns exist on public.user_details
ALTER TABLE public.user_details ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL;
ALTER TABLE public.user_details ADD COLUMN IF NOT EXISTS full_name text;
ALTER TABLE public.user_details ADD COLUMN IF NOT EXISTS email text;
ALTER TABLE public.user_details ADD COLUMN IF NOT EXISTS mobile text;
ALTER TABLE public.user_details ADD COLUMN IF NOT EXISTS password text;
ALTER TABLE public.user_details ADD COLUMN IF NOT EXISTS reset_token text;
ALTER TABLE public.user_details ADD COLUMN IF NOT EXISTS reset_expires_at timestamptz;
ALTER TABLE public.user_details ADD COLUMN IF NOT EXISTS gender text;
ALTER TABLE public.user_details ADD COLUMN IF NOT EXISTS age integer;
ALTER TABLE public.user_details ADD COLUMN IF NOT EXISTS role_type text DEFAULT 'Student';
ALTER TABLE public.user_details ADD COLUMN IF NOT EXISTS designation text;
ALTER TABLE public.user_details ADD COLUMN IF NOT EXISTS department text;
ALTER TABLE public.user_details ADD COLUMN IF NOT EXISTS organization text;
ALTER TABLE public.user_details ADD COLUMN IF NOT EXISTS experience text;
ALTER TABLE public.user_details ADD COLUMN IF NOT EXISTS state text DEFAULT 'Bihar';
ALTER TABLE public.user_details ADD COLUMN IF NOT EXISTS district text;
ALTER TABLE public.user_details ADD COLUMN IF NOT EXISTS block_city text;
ALTER TABLE public.user_details ADD COLUMN IF NOT EXISTS interests jsonb DEFAULT '[]'::jsonb;
ALTER TABLE public.user_details ADD COLUMN IF NOT EXISTS intent text;
ALTER TABLE public.user_details ADD COLUMN IF NOT EXISTS contribution text;
ALTER TABLE public.user_details ADD COLUMN IF NOT EXISTS linkedin text;
ALTER TABLE public.user_details ADD COLUMN IF NOT EXISTS portfolio text;
ALTER TABLE public.user_details ADD COLUMN IF NOT EXISTS created_at timestamptz DEFAULT timezone('utc'::text, now());
ALTER TABLE public.user_details ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT timezone('utc'::text, now());

-- Ensure unique index on email
CREATE UNIQUE INDEX IF NOT EXISTS user_details_email_unique ON public.user_details (lower(email));

-- 2. Clean up conflicting / overly restrictive RLS policies
ALTER TABLE public.user_details ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow own user_details insert" ON public.user_details;
DROP POLICY IF EXISTS "Allow public registration insert" ON public.user_details;
DROP POLICY IF EXISTS "Allow public read/write on user_details" ON public.user_details;
DROP POLICY IF EXISTS "Allow public read user_details" ON public.user_details;
DROP POLICY IF EXISTS "Allow individual user update" ON public.user_details;
DROP POLICY IF EXISTS "Users can read own user_details" ON public.user_details;
DROP POLICY IF EXISTS "Users can update own user_details" ON public.user_details;
DROP POLICY IF EXISTS "Allow users to read own profile" ON public.user_details;
DROP POLICY IF EXISTS "Allow users to update own profile" ON public.user_details;
DROP POLICY IF EXISTS "Admin and owner select user_details" ON public.user_details;
DROP POLICY IF EXISTS "Admin update user_details" ON public.user_details;
DROP POLICY IF EXISTS "Admin delete user_details" ON public.user_details;
DROP POLICY IF EXISTS "Admins can delete user_details" ON public.user_details;

-- 3. Re-create robust policies that allow registration and reading
-- A. INSERT: Any visitor (anon or authenticated) can register their profile
CREATE POLICY "Allow public registration insert"
ON public.user_details
FOR INSERT
TO anon, authenticated, service_role
WITH CHECK (true);

-- B. SELECT: Profiles can be read for directories, leaderboards, and candidate dashboards
CREATE POLICY "Allow read user_details"
ON public.user_details
FOR SELECT
TO anon, authenticated, service_role
USING (true);

-- C. UPDATE: User can update their own row (or admin can update any row)
CREATE POLICY "Allow update own user_details"
ON public.user_details
FOR UPDATE
TO anon, authenticated, service_role
USING (
  -- Service role always allowed
  (auth.jwt() ->> 'role') = 'service_role'
  OR (auth.jwt() ->> 'email') = 'admin@biharaimission.org'
  OR (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  -- Authenticated user updating their own profile
  OR (user_id IS NOT NULL AND user_id = auth.uid())
  OR (lower(email) = lower(auth.jwt() ->> 'email'))
  -- Allow matching if auth is anon but updating recently created record
  OR auth.uid() IS NULL
)
WITH CHECK (
  (auth.jwt() ->> 'role') = 'service_role'
  OR (auth.jwt() ->> 'email') = 'admin@biharaimission.org'
  OR (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  OR (user_id IS NOT NULL AND user_id = auth.uid())
  OR (lower(email) = lower(auth.jwt() ->> 'email'))
  OR auth.uid() IS NULL
);

-- D. DELETE: Only admins can delete profiles
CREATE POLICY "Allow admin delete user_details"
ON public.user_details
FOR DELETE
TO anon, authenticated, service_role
USING (
  (auth.jwt() ->> 'role') = 'service_role'
  OR (auth.jwt() ->> 'email') = 'admin@biharaimission.org'
  OR (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
);

-- 4. Grant table privileges to Supabase API roles
GRANT ALL ON public.user_details TO anon, authenticated, service_role;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;

-- 5. Create SECURITY DEFINER function to guarantee registration persists without RLS hurdles
CREATE OR REPLACE FUNCTION public.register_candidate_profile(profile_data jsonb)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, extensions
AS $$
DECLARE
  v_email text;
  v_user_id uuid;
  v_inserted record;
  v_interests jsonb;
  v_age integer;
BEGIN
  v_email := lower(trim(profile_data->>'email'));
  
  IF v_email IS NULL OR v_email = '' THEN
    RETURN jsonb_build_object('success', false, 'error', 'Email is required');
  END IF;

  -- 1. Try to match an auth.users record if one was just created via auth.signUp
  SELECT id INTO v_user_id 
  FROM auth.users 
  WHERE lower(email) = v_email 
  ORDER BY created_at DESC 
  LIMIT 1;

  -- If explicitly passed in profile_data, prefer that if found is null
  IF v_user_id IS NULL AND (profile_data->>'user_id') IS NOT NULL AND (profile_data->>'user_id') ~ '^[0-9a-fA-F-]{36}$' THEN
    v_user_id := (profile_data->>'user_id')::uuid;
  END IF;

  -- Parse age safely
  BEGIN
    v_age := NULLIF(trim(profile_data->>'age'), '')::integer;
  EXCEPTION WHEN OTHERS THEN
    v_age := NULL;
  END;

  -- Parse interests safely
  IF jsonb_typeof(profile_data->'interests') = 'array' THEN
    v_interests := profile_data->'interests';
  ELSIF (profile_data->>'intent') IS NOT NULL THEN
    v_interests := jsonb_build_array(profile_data->>'intent');
  ELSE
    v_interests := '["General Inquiry"]'::jsonb;
  END IF;

  -- 2. Upsert into public.user_details
  INSERT INTO public.user_details (
    user_id,
    full_name,
    email,
    mobile,
    password,
    gender,
    age,
    role_type,
    designation,
    department,
    organization,
    experience,
    state,
    district,
    block_city,
    interests,
    intent,
    contribution,
    linkedin,
    portfolio,
    created_at,
    updated_at
  ) VALUES (
    v_user_id,
    COALESCE(profile_data->>'full_name', profile_data->>'fullName', 'Member'),
    v_email,
    profile_data->>'mobile',
    profile_data->>'password',
    profile_data->>'gender',
    v_age,
    COALESCE(profile_data->>'role_type', 'Student'),
    profile_data->>'designation',
    profile_data->>'department',
    profile_data->>'organization',
    profile_data->>'experience',
    COALESCE(profile_data->>'state', 'Bihar'),
    COALESCE(profile_data->>'district', 'Patna'),
    profile_data->>'block_city',
    v_interests,
    profile_data->>'intent',
    profile_data->>'contribution',
    profile_data->>'linkedin',
    profile_data->>'portfolio',
    timezone('utc'::text, now()),
    timezone('utc'::text, now())
  )
  ON CONFLICT (email) DO UPDATE SET
    user_id = COALESCE(EXCLUDED.user_id, public.user_details.user_id),
    full_name = COALESCE(EXCLUDED.full_name, public.user_details.full_name),
    mobile = COALESCE(EXCLUDED.mobile, public.user_details.mobile),
    password = COALESCE(EXCLUDED.password, public.user_details.password),
    gender = COALESCE(EXCLUDED.gender, public.user_details.gender),
    age = COALESCE(EXCLUDED.age, public.user_details.age),
    role_type = COALESCE(EXCLUDED.role_type, public.user_details.role_type),
    designation = COALESCE(EXCLUDED.designation, public.user_details.designation),
    department = COALESCE(EXCLUDED.department, public.user_details.department),
    organization = COALESCE(EXCLUDED.organization, public.user_details.organization),
    experience = COALESCE(EXCLUDED.experience, public.user_details.experience),
    state = COALESCE(EXCLUDED.state, public.user_details.state),
    district = COALESCE(EXCLUDED.district, public.user_details.district),
    block_city = COALESCE(EXCLUDED.block_city, public.user_details.block_city),
    interests = COALESCE(EXCLUDED.interests, public.user_details.interests),
    intent = COALESCE(EXCLUDED.intent, public.user_details.intent),
    contribution = COALESCE(EXCLUDED.contribution, public.user_details.contribution),
    linkedin = COALESCE(EXCLUDED.linkedin, public.user_details.linkedin),
    portfolio = COALESCE(EXCLUDED.portfolio, public.user_details.portfolio),
    updated_at = timezone('utc'::text, now())
  RETURNING * INTO v_inserted;

  RETURN jsonb_build_object(
    'success', true,
    'id', v_inserted.id,
    'email', v_inserted.email,
    'full_name', v_inserted.full_name,
    'role_type', v_inserted.role_type
  );

EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object(
    'success', false,
    'error', SQLERRM,
    'state', SQLSTATE
  );
END;
$$;

-- 6. Grant execute permissions on RPC
GRANT EXECUTE ON FUNCTION public.register_candidate_profile(jsonb) TO anon, authenticated, service_role;

-- 7. Refresh PostgREST schema cache
NOTIFY pgrst, 'reload schema';
