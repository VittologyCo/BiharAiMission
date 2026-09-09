-- ============================================================
-- Migration 021: Add device_type column to page_views
-- Purpose: Store pre-computed device type ('Mobile' | 'Desktop')
--          on insert so bulk analytics queries never need to
--          fetch the large user_agent column — reduces egress.
-- ============================================================

-- 1. Add device_type column (nullable so old rows are unaffected)
ALTER TABLE public.page_views
  ADD COLUMN IF NOT EXISTS device_type TEXT DEFAULT 'Desktop';

-- 2. Backfill existing rows from user_agent where possible
--    (basic heuristic matching the client-side getDeviceType())
UPDATE public.page_views
SET device_type = CASE
  WHEN user_agent ~* 'android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini'
    THEN 'Mobile'
  ELSE 'Desktop'
END
WHERE device_type IS NULL OR device_type = 'Desktop';

-- 3. Add index for analytics queries that filter by device_type
CREATE INDEX IF NOT EXISTS idx_page_views_device_type
  ON public.page_views (device_type);

-- 4. Add index on created_at for faster date-range count queries
CREATE INDEX IF NOT EXISTS idx_page_views_created_at
  ON public.page_views (created_at);

-- Optional: if you want to eventually drop the large user_agent column
-- to save storage/egress, you can run this AFTER verifying device_type
-- is populated correctly (uncomment when ready):
-- ALTER TABLE public.page_views DROP COLUMN IF EXISTS user_agent;
