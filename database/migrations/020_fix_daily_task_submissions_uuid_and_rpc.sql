-- ============================================================================
-- Migration 020: Fix daily_task_submissions UUID Type Error & Resilient RPC
-- ============================================================================
-- Resolves error:
--   "invalid input syntax for type uuid: sub_1788839321674_1"
--   POST /rest/v1/rpc/submit_candidate_task 400
--   POST /rest/v1/daily_task_submissions 400
--
-- 1. Alters id and user_id columns on public.daily_task_submissions to TEXT
--    (with USING id::text) so any legacy string or UUID is accepted without casting errors.
-- 2. Sets column default to gen_random_uuid()::text.
-- 3. Updates submit_candidate_task RPC with resilient conflict resolution and UUID safety.
-- ============================================================================

DO $$
BEGIN
  -- 1A. Ensure table exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'daily_task_submissions'
  ) THEN
    CREATE TABLE public.daily_task_submissions (
      id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
      user_id TEXT,
      user_email TEXT NOT NULL,
      user_name TEXT,
      user_district TEXT DEFAULT 'Bihar',
      user_designation TEXT DEFAULT 'Civic Candidate',
      task_id INTEGER NOT NULL,
      task_title TEXT,
      category TEXT DEFAULT 'AI Practical Classwork',
      file_url TEXT,
      file_name TEXT,
      file_size TEXT,
      drive_file_id TEXT,
      notes TEXT,
      status TEXT DEFAULT 'PENDING',
      admin_feedback TEXT,
      reviewed_by TEXT,
      reviewed_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()),
      updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
    );
  ELSE
    -- 1B. If column id exists and is of type uuid, alter to TEXT so it accepts any identifier
    IF EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_schema = 'public' 
        AND table_name = 'daily_task_submissions' 
        AND column_name = 'id' 
        AND data_type = 'uuid'
    ) THEN
      ALTER TABLE public.daily_task_submissions ALTER COLUMN id TYPE text USING id::text;
      ALTER TABLE public.daily_task_submissions ALTER COLUMN id SET DEFAULT gen_random_uuid()::text;
    END IF;

    -- 1C. If column user_id exists and is of type uuid, alter to TEXT
    IF EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_schema = 'public' 
        AND table_name = 'daily_task_submissions' 
        AND column_name = 'user_id' 
        AND data_type = 'uuid'
    ) THEN
      ALTER TABLE public.daily_task_submissions ALTER COLUMN user_id TYPE text USING user_id::text;
    END IF;
  END IF;

  -- 1D. Ensure unique constraint on (user_email, task_id) exists for idempotent upserts
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'daily_task_submissions_user_email_task_id_key'
  ) THEN
    ALTER TABLE public.daily_task_submissions
    ADD CONSTRAINT daily_task_submissions_user_email_task_id_key 
    UNIQUE (user_email, task_id);
  END IF;
END $$;

-- 2. Resilient submit_candidate_task RPC
CREATE OR REPLACE FUNCTION public.submit_candidate_task(submission_data jsonb)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_user_email text;
  v_task_id integer;
  v_user_id text;
  v_user_name text;
  v_user_district text;
  v_user_designation text;
  v_task_title text;
  v_category text;
  v_file_url text;
  v_file_name text;
  v_file_size text;
  v_drive_file_id text;
  v_notes text;
  v_raw_id text;
  v_raw_user_id text;
  v_existing_id text;
  v_result record;
BEGIN
  v_user_email := lower(trim(submission_data->>'user_email'));
  v_task_id := (submission_data->>'task_id')::integer;

  IF v_user_email IS NULL OR v_user_email = '' THEN
    RETURN jsonb_build_object('success', false, 'error', 'user_email is required');
  END IF;

  IF v_task_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'task_id is required');
  END IF;

  v_raw_user_id := trim(COALESCE(submission_data->>'user_id', ''));
  IF v_raw_user_id ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' THEN
    v_user_id := v_raw_user_id;
  ELSE
    IF EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_schema = 'public' 
        AND table_name = 'daily_task_submissions' 
        AND column_name = 'user_id' 
        AND data_type = 'text'
    ) THEN
      v_user_id := COALESCE(NULLIF(v_raw_user_id, ''), 'usr_' || replace(v_user_email, '@', '_'));
    ELSE
      v_user_id := NULL;
    END IF;
  END IF;

  v_user_name := COALESCE(submission_data->>'user_name', split_part(v_user_email, '@', 1));
  v_user_district := COALESCE(submission_data->>'user_district', 'Bihar');
  v_user_designation := COALESCE(submission_data->>'user_designation', 'Civic Candidate');
  v_task_title := COALESCE(submission_data->>'task_title', 'AI Practical Assignment #' || v_task_id);
  v_category := COALESCE(submission_data->>'category', 'AI Practical Classwork');
  v_file_url := submission_data->>'file_url';
  v_file_name := submission_data->>'file_name';
  v_file_size := submission_data->>'file_size';
  v_drive_file_id := submission_data->>'drive_file_id';
  v_notes := submission_data->>'notes';

  -- Check if a submission already exists for this candidate & task
  SELECT id::text INTO v_existing_id 
  FROM public.daily_task_submissions 
  WHERE lower(user_email) = v_user_email AND task_id = v_task_id 
  LIMIT 1;

  IF v_existing_id IS NOT NULL THEN
    -- Update existing record cleanly without re-casting or altering its primary key
    UPDATE public.daily_task_submissions
    SET
      user_name = v_user_name,
      user_district = v_user_district,
      user_designation = v_user_designation,
      task_title = v_task_title,
      category = v_category,
      file_url = COALESCE(v_file_url, daily_task_submissions.file_url),
      file_name = COALESCE(v_file_name, daily_task_submissions.file_name),
      file_size = COALESCE(v_file_size, daily_task_submissions.file_size),
      drive_file_id = COALESCE(v_drive_file_id, daily_task_submissions.drive_file_id),
      notes = COALESCE(v_notes, daily_task_submissions.notes),
      status = 'PENDING',
      admin_feedback = NULL,
      reviewed_by = NULL,
      reviewed_at = NULL,
      updated_at = now()
    WHERE id::text = v_existing_id
    RETURNING * INTO v_result;
  ELSE
    -- Insert new row.
    -- If submission_data provided a valid UUID, use it. Otherwise, generate gen_random_uuid()::text.
    v_raw_id := trim(COALESCE(submission_data->>'id', ''));
    IF v_raw_id ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' THEN
      INSERT INTO public.daily_task_submissions (
        id, user_id, user_email, user_name, user_district, user_designation,
        task_id, task_title, category, file_url, file_name, file_size,
        drive_file_id, notes, status, admin_feedback, reviewed_by, reviewed_at,
        created_at, updated_at
      )
      VALUES (
        v_raw_id, v_user_id, v_user_email, v_user_name, v_user_district, v_user_designation,
        v_task_id, v_task_title, v_category, v_file_url, v_file_name, v_file_size,
        v_drive_file_id, v_notes, 'PENDING', NULL, NULL, NULL,
        now(), now()
      )
      RETURNING * INTO v_result;
    ELSE
      -- Insert without specifying id so column DEFAULT handles it seamlessly
      INSERT INTO public.daily_task_submissions (
        user_id, user_email, user_name, user_district, user_designation,
        task_id, task_title, category, file_url, file_name, file_size,
        drive_file_id, notes, status, admin_feedback, reviewed_by, reviewed_at,
        created_at, updated_at
      )
      VALUES (
        v_user_id, v_user_email, v_user_name, v_user_district, v_user_designation,
        v_task_id, v_task_title, v_category, v_file_url, v_file_name, v_file_size,
        v_drive_file_id, v_notes, 'PENDING', NULL, NULL, NULL,
        now(), now()
      )
      RETURNING * INTO v_result;
    END IF;
  END IF;

  RETURN jsonb_build_object(
    'success', true,
    'submission', row_to_json(v_result)
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.submit_candidate_task(jsonb) TO anon, authenticated, service_role;

-- 3. Ensure permissions and Realtime replica identity
ALTER TABLE public.daily_task_submissions REPLICA IDENTITY FULL;
GRANT ALL ON public.daily_task_submissions TO anon, authenticated, service_role;
