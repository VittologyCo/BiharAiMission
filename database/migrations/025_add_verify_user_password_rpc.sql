-- ============================================================================
-- Migration 025: Create verify_user_password RPC for direct user authentication
-- ============================================================================
-- Purpose:
--   Enables the backend authentication fallback to verify user passwords against
--   public.user_details (bcrypt hashed) when standard Supabase Auth returns 400.
-- ============================================================================

-- Ensure pgcrypto extension is active for bcrypt crypt() hashing
CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;

-- Create the verify_user_password function
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
    -- Fallback if extensions schema is public
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

-- Grant execution to all clients (anon, authenticated, service_role)
GRANT EXECUTE ON FUNCTION public.verify_user_password(TEXT, TEXT) TO anon, authenticated, service_role;

-- Notify PostgREST to immediately refresh its schema cache
NOTIFY pgrst, 'reload schema';
