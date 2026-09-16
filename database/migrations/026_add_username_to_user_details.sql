-- ==============================================================================
-- BIHAR AI MISSION - MIGRATION 026: ADD UNIQUE USERNAME (@) TO USER_DETAILS
-- Run this in your Supabase SQL Editor (SQL Editor -> New Query -> Run)
-- ==============================================================================

-- 1. Add username column to public.user_details if not present
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
      AND table_name = 'user_details' 
      AND column_name = 'username'
  ) THEN
    ALTER TABLE public.user_details ADD COLUMN username text NULL;
  END IF;
END $$;

-- 2. Create case-insensitive unique index on sanitized username
-- Strips leading '@', trims, and lowercases for unique check.
CREATE UNIQUE INDEX IF NOT EXISTS idx_user_details_username 
ON public.user_details (lower(trim(regexp_replace(username, '^@+', '')))) 
WHERE username IS NOT NULL AND trim(username) <> '';

-- 3. Trigger to guarantee immutability of username once set
CREATE OR REPLACE FUNCTION public.prevent_username_change()
RETURNS trigger AS $$
BEGIN
  -- If username was already set (not null and not empty) and is being changed to a different value, prevent it
  IF OLD.username IS NOT NULL AND trim(OLD.username) <> '' THEN
    IF lower(trim(regexp_replace(NEW.username, '^@+', ''))) IS DISTINCT FROM lower(trim(regexp_replace(OLD.username, '^@+', ''))) THEN
      RAISE EXCEPTION 'Username is permanent and cannot be changed once set.';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_prevent_username_change ON public.user_details;
CREATE TRIGGER trg_prevent_username_change
BEFORE UPDATE OF username ON public.user_details
FOR EACH ROW
EXECUTE FUNCTION public.prevent_username_change();

-- 4. RPC: Secure username existence / availability check
DROP FUNCTION IF EXISTS public.check_username_exists(TEXT);

CREATE OR REPLACE FUNCTION public.check_username_exists(username_input TEXT)
RETURNS boolean AS $$
DECLARE
  clean_username TEXT;
BEGIN
  clean_username := lower(trim(regexp_replace(username_input, '^@+', '')));
  IF clean_username IS NULL OR clean_username = '' THEN
    RETURN false;
  END IF;

  IF EXISTS (
    SELECT 1 FROM public.user_details
    WHERE lower(trim(regexp_replace(username, '^@+', ''))) = clean_username
  ) THEN
    RETURN true;
  END IF;

  RETURN false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION public.check_username_exists(TEXT) TO anon, authenticated, service_role;

-- 5. RPC: Claim / Set username for existing or newly registered candidate
DROP FUNCTION IF EXISTS public.claim_user_username(TEXT, TEXT);

CREATE OR REPLACE FUNCTION public.claim_user_username(email_input TEXT, username_input TEXT)
RETURNS jsonb AS $$
DECLARE
  clean_email TEXT;
  clean_user TEXT;
  existing_rec record;
BEGIN
  clean_email := lower(trim(email_input));
  clean_user := lower(trim(regexp_replace(username_input, '^@+', '')));

  IF clean_email IS NULL OR clean_email = '' THEN
    RETURN jsonb_build_object('success', false, 'error', 'Email is required');
  END IF;

  IF clean_user IS NULL OR clean_user = '' THEN
    RETURN jsonb_build_object('success', false, 'error', 'Username is required');
  END IF;

  -- Validate username format: alphanumeric and underscores only, 5 to 10 chars
  IF NOT (clean_user ~ '^[a-z0-9_]{5,10}$') THEN
    RETURN jsonb_build_object('success', false, 'error', 'Username must be 5-10 alphanumeric characters or underscore');
  END IF;

  -- Fetch existing user record
  SELECT * INTO existing_rec FROM public.user_details WHERE lower(trim(email)) = clean_email LIMIT 1;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'User account not found');
  END IF;

  -- If user already has a username set, prevent modification
  IF existing_rec.username IS NOT NULL AND trim(existing_rec.username) <> '' THEN
    IF lower(trim(regexp_replace(existing_rec.username, '^@+', ''))) = clean_user THEN
      RETURN jsonb_build_object('success', true, 'username', existing_rec.username, 'message', 'Username already assigned');
    ELSE
      RETURN jsonb_build_object('success', false, 'error', 'Username cannot be changed once set');
    END IF;
  END IF;

  -- Check if username is taken by another account
  IF EXISTS (
    SELECT 1 FROM public.user_details 
    WHERE lower(trim(regexp_replace(username, '^@+', ''))) = clean_user
      AND lower(trim(email)) <> clean_email
  ) THEN
    RETURN jsonb_build_object('success', false, 'error', 'Username is already taken');
  END IF;

  -- Update username in public.user_details
  UPDATE public.user_details
  SET username = clean_user, updated_at = timezone('utc'::text, now())
  WHERE lower(trim(email)) = clean_email;

  RETURN jsonb_build_object('success', true, 'username', clean_user);
EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object('success', false, 'error', SQLERRM);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION public.claim_user_username(TEXT, TEXT) TO anon, authenticated, service_role;

-- 6. Update register_candidate_profile RPC to include username persistence
CREATE OR REPLACE FUNCTION public.register_candidate_profile(profile_data jsonb)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, extensions
AS $$
DECLARE
  v_email text;
  v_username text;
  v_user_id uuid;
  v_inserted record;
  v_interests jsonb;
  v_age integer;
BEGIN
  v_email := lower(trim(profile_data->>'email'));
  
  IF v_email IS NULL OR v_email = '' THEN
    RETURN jsonb_build_object('success', false, 'error', 'Email is required');
  END IF;

  -- Clean username: remove leading @, lowercase, trim
  IF (profile_data->>'username') IS NOT NULL AND trim(profile_data->>'username') <> '' THEN
    v_username := lower(trim(regexp_replace(profile_data->>'username', '^@+', '')));
    -- Check uniqueness if provided
    IF EXISTS (
      SELECT 1 FROM public.user_details
      WHERE lower(trim(regexp_replace(username, '^@+', ''))) = v_username
        AND lower(trim(email)) <> v_email
    ) THEN
      RETURN jsonb_build_object('success', false, 'error', 'Username is already taken');
    END IF;
  ELSE
    v_username := NULL;
  END IF;

  -- 1. Try to match an auth.users record if one was just created via auth.signUp
  SELECT id INTO v_user_id 
  FROM auth.users 
  WHERE lower(email) = v_email 
  ORDER BY created_at DESC 
  LIMIT 1;

  -- If explicitly passed in profile_data, prefer that if found is null
  IF v_user_id IS NULL AND (profile_data->>'user_id') IS NOT NULL AND (profile_data->>'user_id') ~ '^[0-9a-fA-F-]{36}$' THEN
    v_user_id := (profile_data->>'user_id')::uuid;
  END IF;

  -- Parse age safely
  BEGIN
    v_age := NULLIF(trim(profile_data->>'age'), '')::integer;
  EXCEPTION WHEN OTHERS THEN
    v_age := NULL;
  END;

  -- Parse interests safely
  IF jsonb_typeof(profile_data->'interests') = 'array' THEN
    v_interests := profile_data->'interests';
  ELSIF (profile_data->>'intent') IS NOT NULL THEN
    v_interests := jsonb_build_array(profile_data->>'intent');
  ELSE
    v_interests := '["General Inquiry"]'::jsonb;
  END IF;

  -- 2. Upsert into public.user_details
  INSERT INTO public.user_details (
    user_id,
    full_name,
    username,
    email,
    mobile,
    password,
    gender,
    age,
    role_type,
    designation,
    department,
    organization,
    experience,
    state,
    district,
    block_city,
    interests,
    intent,
    contribution,
    linkedin,
    portfolio,
    created_at,
    updated_at
  ) VALUES (
    v_user_id,
    COALESCE(profile_data->>'full_name', profile_data->>'fullName', 'Member'),
    v_username,
    v_email,
    profile_data->>'mobile',
    profile_data->>'password',
    profile_data->>'gender',
    v_age,
    COALESCE(profile_data->>'role_type', 'Student'),
    profile_data->>'designation',
    profile_data->>'department',
    profile_data->>'organization',
    profile_data->>'experience',
    COALESCE(profile_data->>'state', 'Bihar'),
    COALESCE(profile_data->>'district', 'Patna'),
    profile_data->>'block_city',
    v_interests,
    profile_data->>'intent',
    profile_data->>'contribution',
    profile_data->>'linkedin',
    profile_data->>'portfolio',
    timezone('utc'::text, now()),
    timezone('utc'::text, now())
  )
  ON CONFLICT (email) DO UPDATE SET
    user_id = COALESCE(EXCLUDED.user_id, public.user_details.user_id),
    full_name = COALESCE(EXCLUDED.full_name, public.user_details.full_name),
    -- Keep existing username if already set; only assign if previously NULL
    username = COALESCE(public.user_details.username, EXCLUDED.username),
    mobile = COALESCE(EXCLUDED.mobile, public.user_details.mobile),
    password = COALESCE(EXCLUDED.password, public.user_details.password),
    gender = COALESCE(EXCLUDED.gender, public.user_details.gender),
    age = COALESCE(EXCLUDED.age, public.user_details.age),
    role_type = COALESCE(EXCLUDED.role_type, public.user_details.role_type),
    designation = COALESCE(EXCLUDED.designation, public.user_details.designation),
    department = COALESCE(EXCLUDED.department, public.user_details.department),
    organization = COALESCE(EXCLUDED.organization, public.user_details.organization),
    experience = COALESCE(EXCLUDED.experience, public.user_details.experience),
    state = COALESCE(EXCLUDED.state, public.user_details.state),
    district = COALESCE(EXCLUDED.district, public.user_details.district),
    block_city = COALESCE(EXCLUDED.block_city, public.user_details.block_city),
    interests = COALESCE(EXCLUDED.interests, public.user_details.interests),
    intent = COALESCE(EXCLUDED.intent, public.user_details.intent),
    contribution = COALESCE(EXCLUDED.contribution, public.user_details.contribution),
    linkedin = COALESCE(EXCLUDED.linkedin, public.user_details.linkedin),
    portfolio = COALESCE(EXCLUDED.portfolio, public.user_details.portfolio),
    updated_at = timezone('utc'::text, now())
  RETURNING * INTO v_inserted;

  RETURN jsonb_build_object(
    'success', true,
    'id', v_inserted.id,
    'email', v_inserted.email,
    'username', v_inserted.username,
    'full_name', v_inserted.full_name,
    'role_type', v_inserted.role_type
  );

EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object(
    'success', false,
    'error', SQLERRM,
    'state', SQLSTATE
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.register_candidate_profile(jsonb) TO anon, authenticated, service_role;

-- 7. Reload schema cache for PostgREST
NOTIFY pgrst, 'reload schema';
