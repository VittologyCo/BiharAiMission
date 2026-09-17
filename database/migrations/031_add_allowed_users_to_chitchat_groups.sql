-- Migration 031: Add allowed_users to chitchat_groups for private curated groups (e.g. "AI Club")
-- Run this in Supabase SQL Editor if you want native column support.
-- The frontend also includes zero-downtime backwards compatibility.

ALTER TABLE public.chitchat_groups
ADD COLUMN IF NOT EXISTS allowed_users text[] NOT NULL DEFAULT '{}';

-- Re-grant permissions
GRANT ALL ON TABLE public.chitchat_groups TO anon, authenticated, service_role;

-- Ensure realtime
DO $$
BEGIN
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.chitchat_groups;
  EXCEPTION WHEN OTHERS THEN NULL;
  END;
END $$;
