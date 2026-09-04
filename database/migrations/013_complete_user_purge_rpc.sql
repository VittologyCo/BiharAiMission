-- ====================================================================
-- SUPABASE RPC FUNCTION: COMPLETE USER PURGE & SESSION TERMINATION
-- Run this script in your Supabase SQL Editor (SQL Editor -> New Query -> Run)
-- Completely deletes user from auth.users, auth.sessions, and ALL data tables.
-- ====================================================================

-- Drop any existing function signature with different return types (boolean, void, jsonb)
DROP FUNCTION IF EXISTS public.delete_user_by_admin(text);
DROP FUNCTION IF EXISTS public.delete_user_by_admin(character varying);

CREATE OR REPLACE FUNCTION public.delete_user_by_admin(email_input TEXT)
RETURNS jsonb AS $$
DECLARE
  clean_email TEXT;
  auth_user_id UUID;
  deleted_tasks INT := 0;
  deleted_enrollments INT := 0;
  deleted_exams INT := 0;
BEGIN
  clean_email := lower(trim(email_input));
  
  IF clean_email IS NULL OR clean_email = '' THEN
    RETURN json_build_object('success', false, 'error', 'Email is required');
  END IF;

  -- 1. Get user ID from auth.users if present
  SELECT id INTO auth_user_id FROM auth.users WHERE lower(email) = clean_email LIMIT 1;
  
  -- 2. Delete from public.user_details (triggers RLS & Realtime DELETE events)
  DELETE FROM public.user_details 
  WHERE lower(email) = clean_email 
     OR (auth_user_id IS NOT NULL AND user_id = auth_user_id::text);
  
  -- 3. Delete from daily_task_submissions (all practical exercises & uploads)
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'daily_task_submissions') THEN
    DELETE FROM public.daily_task_submissions 
    WHERE lower(user_email) = clean_email 
       OR (auth_user_id IS NOT NULL AND user_id = auth_user_id::text);
  END IF;

  -- 4. Delete from officer_program_enrollments & masterclass_enrollments
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'officer_program_enrollments') THEN
    DELETE FROM public.officer_program_enrollments 
    WHERE lower(user_email) = clean_email 
       OR (auth_user_id IS NOT NULL AND user_id = auth_user_id::text);
  END IF;

  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'masterclass_enrollments') THEN
    DELETE FROM public.masterclass_enrollments 
    WHERE lower(user_email) = clean_email 
       OR (auth_user_id IS NOT NULL AND user_id = auth_user_id::text);
  END IF;

  -- 5. Delete from user_enrollments (if exists)
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'user_enrollments') THEN
    DELETE FROM public.user_enrollments WHERE lower(user_email) = clean_email;
  END IF;

  -- 6. Delete from all exam submissions & certification records
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'officer_program_exam_submissions') THEN
    DELETE FROM public.officer_program_exam_submissions WHERE lower(candidate_email) = clean_email;
  END IF;

  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'masterclass_exam_submissions') THEN
    DELETE FROM public.masterclass_exam_submissions WHERE lower(candidate_email) = clean_email;
  END IF;

  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'exam_submissions') THEN
    DELETE FROM public.exam_submissions WHERE lower(candidate_email) = clean_email;
  END IF;

  -- 7. Delete course progress
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'user_course_progress') THEN
    DELETE FROM public.user_course_progress WHERE lower(user_email) = clean_email;
  END IF;

  -- 8. Delete payments
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'masterclass_payments') THEN
    DELETE FROM public.masterclass_payments WHERE lower(user_email) = clean_email;
  END IF;

  -- 9. Delete admin_users entry (if user was listed as admin)
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'admin_users') THEN
    DELETE FROM public.admin_users 
    WHERE lower(email) = clean_email 
       OR (auth_user_id IS NOT NULL AND user_id = auth_user_id::text);
  END IF;

  -- 10. Delete legacy registered_users / users_details (safe table checks)
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'registered_users') THEN
    DELETE FROM public.registered_users WHERE lower(email) = clean_email;
  END IF;

  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'users_details') THEN
    DELETE FROM public.users_details WHERE lower(email) = clean_email;
  END IF;

  -- 11. Instantly terminate active Supabase Auth sessions & remove from auth.users
  IF auth_user_id IS NOT NULL THEN
    -- Invalidate and purge all active session tokens
    DELETE FROM auth.sessions WHERE user_id = auth_user_id;
    -- Delete from auth.users (cascades to all Supabase internal auth credentials)
    DELETE FROM auth.users WHERE id = auth_user_id;
  END IF;

  RETURN json_build_object(
    'success', true,
    'email', clean_email,
    'auth_user_id', auth_user_id,
    'message', 'User and all associated data completely purged.'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permissions for RPC execution
GRANT EXECUTE ON FUNCTION public.delete_user_by_admin(TEXT) TO anon, authenticated, service_role;
