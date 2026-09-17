-- ==============================================================================
-- BIHAR AI MISSION - MIGRATION 029: MULTI-USER 6-DIGIT ACCESS CODES
-- Allows multiple users to use the same admin-created 6-digit access code.
-- Keep is_active = true upon claim and append user emails to claimed_by.
-- ==============================================================================

CREATE OR REPLACE FUNCTION public.claim_chitchat_code(
  p_user_email text,
  p_code text
)
RETURNS jsonb AS $$
DECLARE
  v_code_rec record;
  v_user_expires_at timestamptz;
  v_clean_code text;
  v_clean_email text;
  v_updated_claimed_by text;
BEGIN
  v_clean_code := upper(trim(p_code));
  v_clean_email := lower(trim(p_user_email));

  IF v_clean_code IS NULL OR length(v_clean_code) <> 6 THEN
    RETURN jsonb_build_object('success', false, 'error', 'Please enter a valid 6-digit access code.');
  END IF;

  SELECT * INTO v_code_rec 
  FROM public.chitchat_access_codes 
  WHERE code = v_clean_code AND is_active = true
  LIMIT 1;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Invalid or inactive 6-digit access code.');
  END IF;

  -- Calculate user's expiration from current time based on duration_minutes
  v_user_expires_at := timezone('utc'::text, now()) + (v_code_rec.duration_minutes || ' minutes')::interval;

  -- Append user email to claimed_by list if not already present
  IF v_code_rec.claimed_by IS NULL OR trim(v_code_rec.claimed_by) = '' THEN
    v_updated_claimed_by := v_clean_email;
  ELSIF v_code_rec.claimed_by NOT ILIKE '%' || v_clean_email || '%' THEN
    v_updated_claimed_by := v_code_rec.claimed_by || ', ' || v_clean_email;
  ELSE
    v_updated_claimed_by := v_code_rec.claimed_by;
  END IF;

  -- Update record without deactivating: keep is_active = true so multiple users can use it
  UPDATE public.chitchat_access_codes
  SET 
    claimed_by = v_updated_claimed_by,
    claimed_at = timezone('utc'::text, now()),
    is_active = true
  WHERE id = v_code_rec.id;

  RETURN jsonb_build_object(
    'success', true,
    'code', v_clean_code,
    'duration_minutes', v_code_rec.duration_minutes,
    'expires_at', v_user_expires_at,
    'message', 'Code unlocked successfully! Access granted for ' || v_code_rec.duration_minutes || ' minutes.'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
