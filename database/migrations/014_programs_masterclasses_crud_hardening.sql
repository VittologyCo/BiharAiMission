-- ==============================================================================
-- BIHAR AI MISSION - OFFICER PROGRAMS & MASTERCLASSES CRUD HARDENING (v2)
-- Run this entire script in Supabase SQL Editor (SQL Editor -> New Query -> Run)
-- Targets strictly existing tables: officer_programs, officer_program_questions,
-- masterclasses, and masterclass_questions.
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. Ensure RLS Policies for officer_programs & officer_program_questions
-- ------------------------------------------------------------------------------
ALTER TABLE public.officer_programs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read/write on officer_programs" ON public.officer_programs;
DROP POLICY IF EXISTS "Public access officer_programs" ON public.officer_programs;

CREATE POLICY "Allow public read/write on officer_programs" 
ON public.officer_programs 
FOR ALL 
USING (true) 
WITH CHECK (true);

ALTER TABLE public.officer_program_questions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read/write on officer_program_questions" ON public.officer_program_questions;
DROP POLICY IF EXISTS "Public access officer_program_questions" ON public.officer_program_questions;

CREATE POLICY "Allow public read/write on officer_program_questions" 
ON public.officer_program_questions 
FOR ALL 
USING (true) 
WITH CHECK (true);

-- ------------------------------------------------------------------------------
-- 2. Ensure RLS Policies for masterclasses & masterclass_questions
-- ------------------------------------------------------------------------------
ALTER TABLE public.masterclasses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read/write on masterclasses" ON public.masterclasses;
DROP POLICY IF EXISTS "Public access masterclasses" ON public.masterclasses;

CREATE POLICY "Allow public read/write on masterclasses" 
ON public.masterclasses 
FOR ALL 
USING (true) 
WITH CHECK (true);

ALTER TABLE public.masterclass_questions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read/write on masterclass_questions" ON public.masterclass_questions;
DROP POLICY IF EXISTS "Public access masterclass_questions" ON public.masterclass_questions;

CREATE POLICY "Allow public read/write on masterclass_questions" 
ON public.masterclass_questions 
FOR ALL 
USING (true) 
WITH CHECK (true);

-- ------------------------------------------------------------------------------
-- 3. Dedicated RPC: Delete Officer Program by Admin (SECURITY DEFINER)
-- ------------------------------------------------------------------------------
DROP FUNCTION IF EXISTS public.delete_officer_program_by_admin(text);

CREATE OR REPLACE FUNCTION public.delete_officer_program_by_admin(program_id_input TEXT)
RETURNS jsonb AS $$
DECLARE
  clean_id TEXT;
BEGIN
  clean_id := trim(program_id_input);
  IF clean_id IS NULL OR clean_id = '' THEN
    RETURN json_build_object('success', false, 'error', 'Program ID is required');
  END IF;

  -- 1. Delete associated questions from officer_program_questions
  DELETE FROM public.officer_program_questions WHERE program_id = clean_id;

  -- 2. Delete from officer_programs table
  DELETE FROM public.officer_programs WHERE id = clean_id;

  RETURN json_build_object('success', true, 'id', clean_id, 'message', 'Officer program deleted successfully');
EXCEPTION WHEN OTHERS THEN
  RETURN json_build_object('success', false, 'error', SQLERRM);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION public.delete_officer_program_by_admin(TEXT) TO anon, authenticated, service_role;

-- ------------------------------------------------------------------------------
-- 4. Dedicated RPC: Delete Masterclass by Admin (SECURITY DEFINER)
-- ------------------------------------------------------------------------------
DROP FUNCTION IF EXISTS public.delete_masterclass_by_admin(text);

CREATE OR REPLACE FUNCTION public.delete_masterclass_by_admin(class_id_input TEXT)
RETURNS jsonb AS $$
DECLARE
  clean_id TEXT;
BEGIN
  clean_id := trim(class_id_input);
  IF clean_id IS NULL OR clean_id = '' THEN
    RETURN json_build_object('success', false, 'error', 'Class ID is required');
  END IF;

  -- 1. Delete questions from masterclass_questions
  DELETE FROM public.masterclass_questions WHERE class_id = clean_id;

  -- 2. Delete from masterclasses table
  DELETE FROM public.masterclasses WHERE id = clean_id;

  RETURN json_build_object('success', true, 'id', clean_id, 'message', 'Masterclass deleted successfully');
EXCEPTION WHEN OTHERS THEN
  RETURN json_build_object('success', false, 'error', SQLERRM);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION public.delete_masterclass_by_admin(TEXT) TO anon, authenticated, service_role;
