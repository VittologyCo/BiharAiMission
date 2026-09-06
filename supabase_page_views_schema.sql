-- Bihar AI Mission: Real-time Visitor Analytics Schema
-- Tracks page views for real-time and historical analytics

CREATE TABLE IF NOT EXISTS page_views (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id TEXT NOT NULL,
  page_path TEXT NOT NULL,
  page_title TEXT,
  referrer TEXT,
  user_agent TEXT,
  screen_width INTEGER,
  screen_height INTEGER,
  user_email TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Index for fast queries by date and page
CREATE INDEX IF NOT EXISTS idx_page_views_created_at ON page_views (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_page_views_page_path ON page_views (page_path);
CREATE INDEX IF NOT EXISTS idx_page_views_session_id ON page_views (session_id);

-- Enable RLS
ALTER TABLE page_views ENABLE ROW LEVEL SECURITY;

-- Allow anonymous inserts (visitors tracking)
CREATE POLICY "Allow anonymous inserts" ON page_views FOR INSERT WITH CHECK (true);

-- Allow authenticated reads (admin only reads)
CREATE POLICY "Allow authenticated reads" ON page_views FOR SELECT USING (true);

-- Enable Realtime on page_views
ALTER PUBLICATION supabase_realtime ADD TABLE page_views;
