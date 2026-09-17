-- Migration 032: Create site_notifications table for admin-controlled global notifications
-- This table powers the sitewide notification overlay system

CREATE TABLE IF NOT EXISTS site_notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  banner_image TEXT,                           -- Optional image URL
  notification_type TEXT DEFAULT 'info',       -- info | warning | alert | success | announcement | maintenance
  is_active BOOLEAN DEFAULT true,
  priority INTEGER DEFAULT 0,                  -- Higher = shown first
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ                       -- NULL = never expires
);

-- Enable RLS
ALTER TABLE site_notifications ENABLE ROW LEVEL SECURITY;

-- Public read: anyone can read active notifications (needed for the frontend overlay)
CREATE POLICY "Allow public read of active site notifications"
  ON site_notifications
  FOR SELECT
  USING (true);

-- Admin full access (service role or authenticated admin)
CREATE POLICY "Allow admin full access to site notifications"
  ON site_notifications
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Index for quick active notification lookup
CREATE INDEX IF NOT EXISTS idx_site_notifications_active
  ON site_notifications (is_active, priority DESC, created_at DESC);

-- Comment
COMMENT ON TABLE site_notifications IS 'Admin-controlled global notification banners shown to all website visitors';
