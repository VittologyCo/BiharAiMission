-- ====================================================================
-- BIHAR AI MISSION: SECURE USER DETAILS SCHEMA & HASHED PASSWORDS
-- Run this in your Supabase SQL Editor (SQL Editor -> New Query -> Run)
-- ====================================================================

-- 1. Ensure pgcrypto extension is active for bcrypt hashing
CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;

-- 2. Clean & Update public.user_details table schema
CREATE TABLE IF NOT EXISTS public.user_details (
  id uuid not null default gen_random_uuid(),
  created_at timestamp with time zone not null default timezone('utc'::text, now()),
  full_name text not null,
  email text not null,
  mobile text not null,
  gender text null,
  age integer null,
  role_type text not null,
  designation text null,
  department text null,
  organization text null,
  experience integer null,
  state text null default 'Bihar'::text,
  district text null default 'Not Specified'::text,
  block_city text null,
  interests jsonb null,
  intent text null default 'General Inquiry'::text,
  contribution text null,
  linkedin text null,
  portfolio text null,
  user_id uuid null,
  updated_at timestamp with time zone null default timezone('utc'::text, now()),
  password text null,
  reset_token text null,
  reset_expires_at timestamp with time zone null,
  constraint user_details_pkey primary key (id),
  constraint user_details_email_key unique (email),
  constraint user_details_user_id_fkey foreign KEY (user_id) references auth.users (id) on delete set null
);

-- Ensure all required columns exist and clean up any unused ones
ALTER TABLE public.user_details ADD COLUMN IF NOT EXISTS password text;
ALTER TABLE public.user_details ADD COLUMN IF NOT EXISTS reset_token text;
ALTER TABLE public.user_details ADD COLUMN IF NOT EXISTS reset_expires_at timestamp with time zone;
ALTER TABLE public.user_details DROP COLUMN IF EXISTS reset_code;

-- Ensure indexes exist for fast lookup
CREATE INDEX IF NOT EXISTS idx_user_details_email ON public.user_details USING btree (lower(email));
CREATE INDEX IF NOT EXISTS idx_user_details_user_id ON public.user_details USING btree (user_id);

-- 3. Row Level Security & Permissions
ALTER TABLE public.user_details ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read/write on user_details" ON public.user_details;
CREATE POLICY "Allow public read/write on user_details" 
  ON public.user_details 
  FOR ALL 
  USING (true) 
  WITH CHECK (true);

GRANT ALL ON public.user_details TO anon, authenticated, service_role;

-- 4. Secure RPC function: Hash password with bcrypt and sync user_details + auth.users
CREATE OR REPLACE FUNCTION public.reset_user_password_direct(email_input TEXT, new_password TEXT)
RETURNS json AS $$
DECLARE
  clean_email TEXT;
  auth_user_id UUID;
  crypted_pw TEXT;
  user_found BOOLEAN := false;
BEGIN
  clean_email := lower(trim(email_input));
  
  -- Compute secure bcrypt hash
  BEGIN
    crypted_pw := extensions.crypt(new_password, extensions.gen_salt('bf', 10));
  EXCEPTION WHEN OTHERS THEN
    crypted_pw := crypt(new_password, gen_salt('bf', 10));
  END;

  -- Step A: Store ONLY the hashed password in public.user_details
  UPDATE public.user_details 
  SET password = crypted_pw,
      reset_token = NULL,
      reset_expires_at = NULL,
      updated_at = timezone('utc'::text, now())
  WHERE lower(trim(email)) = clean_email;

  IF FOUND THEN
    user_found := true;
  END IF;

  -- Step B: Update and sync with Supabase auth.users
  SELECT id INTO auth_user_id FROM auth.users WHERE lower(trim(email)) = clean_email LIMIT 1;
  
  IF auth_user_id IS NOT NULL THEN
    user_found := true;
    UPDATE auth.users 
    SET encrypted_password = crypted_pw,
        updated_at = timezone('utc'::text, now())
    WHERE id = auth_user_id;

    -- Link user_id in user_details if null
    UPDATE public.user_details 
    SET user_id = auth_user_id 
    WHERE lower(trim(email)) = clean_email AND user_id IS NULL;
  END IF;
  
  IF NOT user_found THEN
    INSERT INTO public.user_details (full_name, email, mobile, role_type, password)
    VALUES (split_part(clean_email, '@', 1), clean_email, 'Not Specified', 'Registered User', crypted_pw);
  END IF;

  RETURN json_build_object(
    'success', true, 
    'message', 'Password hashed and updated in database successfully.'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION public.reset_user_password_direct(TEXT, TEXT) TO anon, authenticated, service_role;

-- 5. Trigger to automatically hash password on user_details INSERT / UPDATE if entered
CREATE OR REPLACE FUNCTION public.hash_user_details_password()
RETURNS TRIGGER AS $$
BEGIN
  -- Only hash if password is provided and not already a bcrypt hash (starts with $2a$, $2b$, or $2y$)
  IF NEW.password IS NOT NULL AND NEW.password !~ '^\$2[aby]\$[0-9]{2}\$' THEN
    BEGIN
      NEW.password := extensions.crypt(NEW.password, extensions.gen_salt('bf', 10));
    EXCEPTION WHEN OTHERS THEN
      NEW.password := crypt(NEW.password, gen_salt('bf', 10));
    END;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_hash_user_details_password ON public.user_details;
CREATE TRIGGER trg_hash_user_details_password
  BEFORE INSERT OR UPDATE OF password ON public.user_details
  FOR EACH ROW
  EXECUTE FUNCTION public.hash_user_details_password();

-- Notify PostgREST to reload schema
NOTIFY pgrst, 'reload schema';

-- 6. Secure RPC: Verify user password using bcrypt (used by login fallback)
CREATE OR REPLACE FUNCTION public.verify_user_password(email_input TEXT, password_input TEXT)
RETURNS json AS $$
DECLARE
  clean_email TEXT;
  stored_hash TEXT;
  rec RECORD;
BEGIN
  clean_email := lower(trim(email_input));

  -- Look up user and their hashed password
  SELECT id, full_name, email, designation, mobile, district, password
  INTO rec
  FROM public.user_details
  WHERE lower(trim(email)) = clean_email
  LIMIT 1;

  IF rec IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'User not found');
  END IF;

  stored_hash := rec.password;

  IF stored_hash IS NULL OR stored_hash = '' THEN
    RETURN json_build_object('success', false, 'error', 'No password set for this account');
  END IF;

  -- Secure bcrypt verification: crypt(plaintext, stored_hash) should equal stored_hash
  BEGIN
    IF extensions.crypt(password_input, stored_hash) = stored_hash THEN
      RETURN json_build_object(
        'success', true,
        'user_id', rec.id,
        'full_name', rec.full_name,
        'email', rec.email,
        'designation', rec.designation,
        'mobile', rec.mobile,
        'district', rec.district
      );
    ELSE
      RETURN json_build_object('success', false, 'error', 'Invalid password');
    END IF;
  EXCEPTION WHEN OTHERS THEN
    -- Fallback if extensions schema not available
    IF crypt(password_input, stored_hash) = stored_hash THEN
      RETURN json_build_object(
        'success', true,
        'user_id', rec.id,
        'full_name', rec.full_name,
        'email', rec.email,
        'designation', rec.designation,
        'mobile', rec.mobile,
        'district', rec.district
      );
    ELSE
      RETURN json_build_object('success', false, 'error', 'Invalid password');
    END IF;
  END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION public.verify_user_password(TEXT, TEXT) TO anon, authenticated, service_role;

-- Re-notify after adding new function
NOTIFY pgrst, 'reload schema';
