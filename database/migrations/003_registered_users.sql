-- =========================================================
-- SUPABASE GOOGLE OAUTH TABLE SCHEMA & AUTOMATIC TRIGGER
-- Run this script in your Supabase SQL Editor
-- =========================================================

-- 1. Table schema for registered_users with Google OAuth details:
CREATE TABLE IF NOT EXISTS public.registered_users (
  id TEXT PRIMARY KEY,
  full_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  avatar_url TEXT,
  designation TEXT DEFAULT 'Member',
  role_type TEXT DEFAULT 'Registered User',
  provider TEXT DEFAULT 'google',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Automatic trigger function to save new Google signups into registered_users table:
CREATE OR REPLACE FUNCTION public.handle_new_google_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.registered_users (id, full_name, email, avatar_url, provider)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NEW.email,
    NEW.raw_user_meta_data->>'avatar_url',
    NEW.raw_app_meta_data->>'provider'
  )
  ON CONFLICT (email) DO UPDATE
  SET updated_at = timezone('utc'::text, now()),
      avatar_url = EXCLUDED.avatar_url;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Bind trigger to auth.users table in Supabase:
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_google_user();

-- 4. Enable Row Level Security (RLS)
ALTER TABLE public.registered_users ENABLE ROW LEVEL SECURITY;

-- 5. Create RLS Policies for Public Access
DROP POLICY IF EXISTS "Allow public insert to registered_users" ON public.registered_users;
CREATE POLICY "Allow public insert to registered_users" 
ON public.registered_users FOR INSERT 
WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public select from registered_users" ON public.registered_users;
CREATE POLICY "Allow public select from registered_users" 
ON public.registered_users FOR SELECT 
USING (true);

DROP POLICY IF EXISTS "Allow public update to registered_users" ON public.registered_users;
CREATE POLICY "Allow public update to registered_users" 
ON public.registered_users FOR UPDATE 
USING (true);
