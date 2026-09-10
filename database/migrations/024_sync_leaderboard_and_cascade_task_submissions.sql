-- ============================================================================
-- Migration 024: Sync Leaderboard, Purge Orphan Submissions & Realtime Cascade
-- ============================================================================
-- Purpose:
--   1. Clean up orphaned submissions for tasks that were deleted or deactivated.
--   2. Sync submission task titles with current daily_tasks titles.
--   3. Create a cascade trigger on daily_tasks so future task deletions or
--      deactivations automatically clean up related submissions.
--   4. Create an authoritative get_daily_task_leaderboard() RPC for sub-millisecond
--      realtime leaderboard calculation across backend, admin, and user interfaces.
--   5. Ensure full realtime publication for daily_tasks, daily_task_submissions,
--      and user_details.
-- ============================================================================

-- Step 1: Clean up any orphaned submissions whose task_id is no longer an active task
DELETE FROM public.daily_task_submissions
WHERE task_id NOT IN (
  SELECT num FROM public.daily_tasks WHERE is_active = true
);

-- Step 2: Sync existing submission task titles with current active daily_tasks titles
UPDATE public.daily_task_submissions s
SET task_title = t.title
FROM public.daily_tasks t
WHERE s.task_id = t.num 
  AND (s.task_title IS DISTINCT FROM t.title);

-- Step 3: Trigger for automatic cascade deletion and title sync on daily_tasks changes
CREATE OR REPLACE FUNCTION public.trigger_sync_daily_task_cascade()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- If a task is DELETED, automatically delete all its submissions
  IF TG_OP = 'DELETE' THEN
    DELETE FROM public.daily_task_submissions WHERE task_id = OLD.num;
    RETURN OLD;

  -- If a task is UPDATED
  ELSIF TG_OP = 'UPDATE' THEN
    -- If deactivated, delete or hide submissions
    IF NEW.is_active = false AND OLD.is_active = true THEN
      DELETE FROM public.daily_task_submissions WHERE task_id = NEW.num;
    END IF;

    -- If title changed, keep submissions in sync with the new title
    IF NEW.title IS DISTINCT FROM OLD.title THEN
      UPDATE public.daily_task_submissions 
      SET task_title = NEW.title 
      WHERE task_id = NEW.num;
    END IF;

    -- If task number was changed, cascade to submissions
    IF NEW.num IS DISTINCT FROM OLD.num THEN
      UPDATE public.daily_task_submissions
      SET task_id = NEW.num
      WHERE task_id = OLD.num;
    END IF;

    RETURN NEW;
  END IF;

  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS trg_sync_daily_task_cascade ON public.daily_tasks;
CREATE TRIGGER trg_sync_daily_task_cascade
AFTER DELETE OR UPDATE ON public.daily_tasks
FOR EACH ROW
EXECUTE FUNCTION public.trigger_sync_daily_task_cascade();

-- Step 4: Authoritative Real-Time Leaderboard RPC
-- Combines active tasks, deduplicated latest submissions, and candidate profile data
CREATE OR REPLACE FUNCTION public.get_daily_task_leaderboard()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _result JSONB;
BEGIN
  WITH active_tasks AS (
    SELECT num, title, tool_name
    FROM public.daily_tasks
    WHERE is_active = true
  ),
  valid_submissions AS (
    -- Deduplicate: keep ONLY the latest submission per user per active task
    SELECT DISTINCT ON (LOWER(TRIM(s.user_email)), s.task_id)
      LOWER(TRIM(s.user_email)) AS user_email,
      s.user_name,
      s.user_designation,
      s.user_district,
      s.task_id,
      COALESCE(t.title, s.task_title, 'Task #' || s.task_id) AS task_title,
      UPPER(COALESCE(s.status, 'PENDING')) AS status,
      s.file_name,
      s.file_url,
      s.updated_at,
      s.created_at
    FROM public.daily_task_submissions s
    INNER JOIN active_tasks t ON t.num = s.task_id
    ORDER BY LOWER(TRIM(s.user_email)), s.task_id, s.updated_at DESC, s.created_at DESC
  ),
  aggregated_users AS (
    SELECT
      vs.user_email AS email,
      COALESCE(NULLIF(TRIM(MAX(vs.user_name)), ''), NULLIF(TRIM(MAX(u.full_name)), ''), SPLIT_PART(vs.user_email, '@', 1)) AS name,
      COALESCE(NULLIF(TRIM(MAX(vs.user_designation)), ''), NULLIF(TRIM(MAX(u.designation)), ''), NULLIF(TRIM(MAX(u.role_type)), ''), 'Civic Candidate') AS designation,
      COALESCE(NULLIF(TRIM(MAX(u.organization)), ''), NULLIF(TRIM(MAX(u.department)), ''), '') AS organization,
      COALESCE(NULLIF(TRIM(MAX(vs.user_district)), ''), NULLIF(TRIM(MAX(u.district)), ''), 'Bihar') AS district,
      COUNT(vs.task_id)::INTEGER AS total,
      COUNT(CASE WHEN vs.status = 'APPROVED' THEN 1 END)::INTEGER AS approved,
      COUNT(CASE WHEN vs.status = 'PENDING' THEN 1 END)::INTEGER AS pending,
      COUNT(CASE WHEN vs.status = 'REJECTED' THEN 1 END)::INTEGER AS rejected,
      MAX(COALESCE(vs.updated_at, vs.created_at)) AS last_submission,
      JSONB_AGG(
        JSONB_BUILD_OBJECT(
          'taskId', vs.task_id,
          'taskTitle', vs.task_title,
          'status', vs.status,
          'fileName', vs.file_name,
          'fileUrl', vs.file_url,
          'submittedAt', COALESCE(vs.updated_at, vs.created_at)
        ) ORDER BY vs.task_id ASC
      ) AS tasks
    FROM valid_submissions vs
    LEFT JOIN public.user_details u ON LOWER(TRIM(u.email)) = vs.user_email
    GROUP BY vs.user_email
  ),
  ranked_users AS (
    SELECT
      ROW_NUMBER() OVER (
        ORDER BY total DESC, approved DESC, last_submission DESC
      )::INTEGER AS rank,
      email,
      name,
      designation,
      organization,
      district,
      total,
      approved,
      pending,
      rejected,
      last_submission,
      tasks
    FROM aggregated_users
  )
  SELECT COALESCE(JSONB_AGG(TO_JSONB(r) ORDER BY r.rank ASC), '[]'::JSONB)
  INTO _result
  FROM ranked_users r;

  RETURN _result;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_daily_task_leaderboard() TO anon, authenticated, service_role;

-- Step 5: Ensure REPLICA IDENTITY FULL & Publication for Realtime Streaming
ALTER TABLE public.daily_tasks REPLICA IDENTITY FULL;
ALTER TABLE public.daily_task_submissions REPLICA IDENTITY FULL;
ALTER TABLE public.user_details REPLICA IDENTITY FULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'daily_tasks'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.daily_tasks;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'daily_task_submissions'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.daily_task_submissions;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'user_details'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.user_details;
  END IF;
END $$;
