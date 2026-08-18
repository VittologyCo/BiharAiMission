-- ================================================================
-- SUPABASE SQL SCHEMA FOR PUBLIC.USER_DETAILS TABLE
-- ================================================================

CREATE TABLE IF NOT EXISTS public.user_details (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  full_name text NOT NULL,
  email text NOT NULL,
  mobile text NULL,
  gender text NULL,
  age integer NULL,
  role_type text NOT NULL,
  designation text NULL,
  department text NULL,
  organization text NULL,
  experience text NULL,
  state text NULL DEFAULT 'Bihar'::text,
  district text NULL,
  block_city text NULL,
  interests jsonb NULL,
  intent text NULL,
  contribution text NULL,
  linkedin text NULL,
  portfolio text NULL,
  CONSTRAINT user_details_pkey PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS public.users_details (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  full_name text NOT NULL,
  email text NOT NULL,
  mobile text NULL,
  gender text NULL,
  age integer NULL,
  role_type text NOT NULL,
  designation text NULL,
  department text NULL,
  organization text NULL,
  experience text NULL,
  state text NULL DEFAULT 'Bihar'::text,
  district text NULL,
  block_city text NULL,
  interests jsonb NULL,
  intent text NULL,
  contribution text NULL,
  linkedin text NULL,
  portfolio text NULL,
  CONSTRAINT users_details_pkey PRIMARY KEY (id)
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.user_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users_details ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Allow public read/write on user_details" ON public.user_details;
DROP POLICY IF EXISTS "Allow public read/write on users_details" ON public.users_details;

-- Create policies for public access
CREATE POLICY "Allow public read/write on user_details" ON public.user_details FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read/write on users_details" ON public.users_details FOR ALL USING (true) WITH CHECK (true);
