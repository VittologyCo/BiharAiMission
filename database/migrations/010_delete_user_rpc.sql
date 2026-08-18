-- ====================================================================
-- SUPABASE RPC FUNCTION: DELETE USER BY ADMIN
-- Run this script in your Supabase SQL Editor (SQL Editor -> New Query -> Run)
-- ====================================================================

CREATE OR REPLACE FUNCTION public.delete_user_by_admin(email_input TEXT)
RETURNS void AS $$
DECLARE
  clean_email TEXT;
  auth_user_id UUID;
BEGIN
  clean_email := lower(trim(email_input));
  
  -- 1. Get user ID from auth.users if present
  SELECT id INTO auth_user_id FROM auth.users WHERE lower(email) = clean_email LIMIT 1;
  
  -- 2. Delete from all custom database tables
  DELETE FROM public.user_details WHERE lower(email) = clean_email;
  DELETE FROM public.users_details WHERE lower(email) = clean_email;
  DELETE FROM public.registered_users WHERE lower(email) = clean_email;
  DELETE FROM public.masterclass_enrollments WHERE lower(user_email) = clean_email;
  DELETE FROM public.exam_submissions WHERE lower(candidate_email) = clean_email;
  
  -- 3. Delete from auth.users (Supabase Auth)
  IF auth_user_id IS NOT NULL THEN
    DELETE FROM auth.users WHERE id = auth_user_id;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permissions for RPC execution
GRANT EXECUTE ON FUNCTION public.delete_user_by_admin(TEXT) TO anon, authenticated, service_role;
