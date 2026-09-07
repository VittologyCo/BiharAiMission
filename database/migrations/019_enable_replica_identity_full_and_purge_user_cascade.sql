-- ==============================================================================
-- Migration 019: Enable REPLICA IDENTITY FULL & Cascade Purge for Instant Revocation
-- Run this script in the Supabase SQL Editor (SQL Editor -> New Query -> Run)
-- 
-- Fixes:
-- 1. Sets REPLICA IDENTITY FULL on user_details and daily_task_submissions so that 
--    Supabase Realtime DELETE events include the email, user_id, and all columns.
--    This enables instantaneous automatic force-logout across all devices and tabs.
-- 2. Upgrades `delete_user_by_admin(email_input text)` RPC function to atomically
--    purge the user from auth.users, auth.sessions, auth.refresh_tokens, and all
--    application database tables in one clean transaction.
-- ==============================================================================

-- 1. Enable REPLICA IDENTITY FULL on all user-related tables
-- This ensures that PostgreSQL sends the full row (including email and id) on DELETE events
ALTER TABLE public.user_details REPLICA IDENTITY FULL;
ALTER TABLE public.daily_task_submissions REPLICA IDENTITY FULL;

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'officer_program_enrollments') THEN
        ALTER TABLE public.officer_program_enrollments REPLICA IDENTITY FULL;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'masterclass_enrollments') THEN
        ALTER TABLE public.masterclass_enrollments REPLICA IDENTITY FULL;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_enrollments') THEN
        ALTER TABLE public.user_enrollments REPLICA IDENTITY FULL;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'exam_submissions') THEN
        ALTER TABLE public.exam_submissions REPLICA IDENTITY FULL;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'officer_program_exam_submissions') THEN
        ALTER TABLE public.officer_program_exam_submissions REPLICA IDENTITY FULL;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'masterclass_exam_submissions') THEN
        ALTER TABLE public.masterclass_exam_submissions REPLICA IDENTITY FULL;
    END IF;
EXCEPTION
    WHEN OTHERS THEN NULL;
END $$;

-- 2. Complete Atomic Purge RPC Function
CREATE OR REPLACE FUNCTION public.delete_user_by_admin(email_input text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, extensions
AS $$
DECLARE
  v_clean_email text;
  v_auth_uid uuid;
  v_count integer := 0;
BEGIN
  v_clean_email := lower(trim(email_input));
  
  IF v_clean_email IS NULL OR v_clean_email = '' THEN
    RETURN jsonb_build_object('success', false, 'error', 'Valid email is required');
  END IF;

  -- Protect Super Admin account from accidental deletion
  IF v_clean_email = 'admin@biharaimission.org' THEN
    RETURN jsonb_build_object('success', false, 'error', 'Super Admin account cannot be deleted');
  END IF;

  -- 1. Find user in auth.users
  SELECT id INTO v_auth_uid 
  FROM auth.users 
  WHERE lower(email) = v_clean_email 
  LIMIT 1;

  -- 2. Delete from public application tables
  DELETE FROM public.user_details WHERE lower(email) = v_clean_email;
  GET DIAGNOSTICS v_count = ROW_COUNT;

  DELETE FROM public.daily_task_submissions WHERE lower(user_email) = v_clean_email;
  
  -- Delete from enrollments & exams
  BEGIN
    DELETE FROM public.officer_program_enrollments WHERE lower(user_email) = v_clean_email;
  EXCEPTION WHEN undefined_table THEN NULL; END;

  BEGIN
    DELETE FROM public.masterclass_enrollments WHERE lower(user_email) = v_clean_email;
  EXCEPTION WHEN undefined_table THEN NULL; END;

  BEGIN
    DELETE FROM public.user_enrollments WHERE lower(user_email) = v_clean_email;
  EXCEPTION WHEN undefined_table THEN NULL; END;

  BEGIN
    DELETE FROM public.officer_program_exam_submissions WHERE lower(candidate_email) = v_clean_email;
  EXCEPTION WHEN undefined_table THEN NULL; END;

  BEGIN
    DELETE FROM public.masterclass_exam_submissions WHERE lower(candidate_email) = v_clean_email;
  EXCEPTION WHEN undefined_table THEN NULL; END;

  BEGIN
    DELETE FROM public.exam_submissions WHERE lower(candidate_email) = v_clean_email;
  EXCEPTION WHEN undefined_table THEN NULL; END;

  BEGIN
    DELETE FROM public.user_course_progress WHERE lower(user_email) = v_clean_email;
  EXCEPTION WHEN undefined_table THEN NULL; END;

  BEGIN
    DELETE FROM public.masterclass_payments WHERE lower(user_email) = v_clean_email;
  EXCEPTION WHEN undefined_table THEN NULL; END;

  BEGIN
    DELETE FROM public.admin_users WHERE lower(email) = v_clean_email;
  EXCEPTION WHEN undefined_table THEN NULL; END;

  -- 3. Invalidate active auth sessions and tokens if user existed in auth.users
  IF v_auth_uid IS NOT NULL THEN
    -- Delete from custom user_id matches
    DELETE FROM public.user_details WHERE user_id = v_auth_uid;
    DELETE FROM public.daily_task_submissions WHERE user_id = v_auth_uid::text;

    -- Delete auth sessions and refresh tokens (forces instant token rejection on Supabase API)
    BEGIN
      DELETE FROM auth.sessions WHERE user_id = v_auth_uid;
    EXCEPTION WHEN OTHERS THEN NULL; END;

    BEGIN
      DELETE FROM auth.refresh_tokens WHERE session_id IN (
        SELECT id FROM auth.sessions WHERE user_id = v_auth_uid
      );
    EXCEPTION WHEN OTHERS THEN NULL; END;

    -- Delete user record from auth.users
    DELETE FROM auth.users WHERE id = v_auth_uid;
  END IF;

  RETURN jsonb_build_object(
    'success', true, 
    'message', 'User and all associated data purged successfully from database and auth system',
    'email', v_clean_email,
    'details_deleted', v_count
  );
EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object('success', false, 'error', SQLERRM);
END;
$$;

GRANT EXECUTE ON FUNCTION public.delete_user_by_admin(text) TO anon, authenticated, service_role;
