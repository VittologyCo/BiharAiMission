-- ==============================================================================
-- BIHAR AI MISSION - SECURE EMAIL EXISTENCE CHECK RPC (v2)
-- Run this in your Supabase SQL Editor (SQL Editor -> New Query -> Run)
-- Checks both public.user_details and auth.users safely under SECURITY DEFINER
-- without violating RLS policies.
-- ==============================================================================

DROP FUNCTION IF EXISTS public.check_user_email_exists(text);

CREATE OR REPLACE FUNCTION public.check_user_email_exists(email_input TEXT)
RETURNS boolean AS $$
DECLARE
  clean_email TEXT;
BEGIN
  clean_email := lower(trim(email_input));
  IF clean_email IS NULL OR clean_email = '' THEN
    RETURN false;
  END IF;

  -- 1. Check in public.user_details
  IF EXISTS (
    SELECT 1 FROM public.user_details
    WHERE lower(trim(email)) = clean_email
  ) THEN
    RETURN true;
  END IF;

  -- 2. Check in auth.users
  IF EXISTS (
    SELECT 1 FROM auth.users
    WHERE lower(trim(email)) = clean_email
  ) THEN
    RETURN true;
  END IF;

  RETURN false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION public.check_user_email_exists(TEXT) TO anon, authenticated, service_role;

NOTIFY pgrst, 'reload schema';
