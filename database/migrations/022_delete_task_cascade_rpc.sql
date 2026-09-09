-- ============================================================
-- Migration 022: DB-level cascade delete RPC for daily tasks
-- Purpose: Creates a SECURITY DEFINER RPC that atomically
--          deletes all submissions + task row in one transaction.
--          Acts as a safety net if client-side cascade has a
--          network hiccup during deletion.
-- Usage:   Called automatically by the app; can also be run
--          manually: SELECT delete_task_with_cascade(5);
-- ============================================================

CREATE OR REPLACE FUNCTION public.delete_task_with_cascade(task_num INTEGER)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _deleted_submissions INTEGER := 0;
  _task_existed        BOOLEAN := false;
BEGIN
  -- Count how many submissions exist for this task
  SELECT COUNT(*) INTO _deleted_submissions
  FROM public.daily_task_submissions
  WHERE task_id = task_num;

  -- Delete all submissions for this task (files must be handled client-side)
  DELETE FROM public.daily_task_submissions
  WHERE task_id = task_num;

  -- Delete the task itself and check if it existed
  DELETE FROM public.daily_tasks
  WHERE num = task_num
  RETURNING true INTO _task_existed;

  RETURN jsonb_build_object(
    'success',              true,
    'task_num',             task_num,
    'task_existed',         COALESCE(_task_existed, false),
    'deleted_submissions',  _deleted_submissions
  );

EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object(
    'success', false,
    'error',   SQLERRM
  );
END;
$$;

-- Grant execute to all roles (same pattern as other RPCs in this project)
GRANT EXECUTE ON FUNCTION public.delete_task_with_cascade(INTEGER) TO anon, authenticated, service_role;
