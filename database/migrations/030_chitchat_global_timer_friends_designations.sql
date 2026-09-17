-- ==============================================================================
-- BIHAR AI MISSION - MIGRATION 030: CHITCHAT REALTIME ENHANCEMENTS
-- 1. Synchronized Global Access Code Expiration (exact same remaining time for all users)
-- 2. Friend Request & Accept Approval Workflow (sender/receiver approval before 1-on-1 chat)
-- 3. Designation-Restricted Custom Groups (filter group access by user designation)
-- ==============================================================================

-- ─── 1. ACCESS CODES: AUTO-CALCULATE EXPIRES_AT ON CREATION ───
CREATE OR REPLACE FUNCTION public.set_chitchat_code_expiration()
RETURNS trigger AS $$
BEGIN
  IF NEW.expires_at IS NULL AND NEW.duration_minutes IS NOT NULL THEN
    NEW.expires_at := COALESCE(NEW.created_at, timezone('utc'::text, now())) + (NEW.duration_minutes || ' minutes')::interval;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_set_chitchat_code_expiration ON public.chitchat_access_codes;
CREATE TRIGGER trg_set_chitchat_code_expiration
BEFORE INSERT ON public.chitchat_access_codes
FOR EACH ROW
EXECUTE FUNCTION public.set_chitchat_code_expiration();

-- Backfill any existing active codes without expires_at
UPDATE public.chitchat_access_codes
SET expires_at = created_at + (duration_minutes || ' minutes')::interval
WHERE expires_at IS NULL AND duration_minutes IS NOT NULL;

-- Update claim_chitchat_code RPC to return global expires_at & reject expired codes
CREATE OR REPLACE FUNCTION public.claim_chitchat_code(
  p_user_email text,
  p_code text
)
RETURNS jsonb AS $$
DECLARE
  v_code_rec record;
  v_clean_code text;
  v_clean_email text;
  v_updated_claimed_by text;
  v_global_expires_at timestamptz;
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

  -- Ensure global expires_at exists
  v_global_expires_at := COALESCE(
    v_code_rec.expires_at,
    v_code_rec.created_at + (v_code_rec.duration_minutes || ' minutes')::interval
  );

  -- Reject if code has already expired
  IF v_global_expires_at <= timezone('utc'::text, now()) THEN
    RETURN jsonb_build_object('success', false, 'error', 'This access code has already expired.');
  END IF;

  -- Append user email to claimed_by list if not already present
  IF v_code_rec.claimed_by IS NULL OR trim(v_code_rec.claimed_by) = '' THEN
    v_updated_claimed_by := v_clean_email;
  ELSIF v_code_rec.claimed_by NOT ILIKE '%' || v_clean_email || '%' THEN
    v_updated_claimed_by := v_code_rec.claimed_by || ', ' || v_clean_email;
  ELSE
    v_updated_claimed_by := v_code_rec.claimed_by;
  END IF;

  -- Update record with latest claimed_by, keeping is_active = true and global expires_at
  UPDATE public.chitchat_access_codes
  SET 
    claimed_by = v_updated_claimed_by,
    claimed_at = timezone('utc'::text, now()),
    expires_at = v_global_expires_at,
    is_active = true
  WHERE id = v_code_rec.id;

  RETURN jsonb_build_object(
    'success', true,
    'code', v_clean_code,
    'duration_minutes', v_code_rec.duration_minutes,
    'expires_at', v_global_expires_at,
    'message', 'Code unlocked successfully! Access active until ' || to_char(v_global_expires_at, 'YYYY-MM-DD HH24:MI:SS UTC')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION public.claim_chitchat_code(text, text) TO anon, authenticated, service_role;

-- ─── 2. FRIEND REQUEST & APPROVAL WORKFLOW ───
ALTER TABLE public.chitchat_friends 
ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'accepted',
ADD COLUMN IF NOT EXISTS sender_email text NULL,
ADD COLUMN IF NOT EXISTS sender_name text NULL,
ADD COLUMN IF NOT EXISTS sender_username text NULL,
ADD COLUMN IF NOT EXISTS sender_designation text NULL;

CREATE INDEX IF NOT EXISTS idx_chitchat_friends_status ON public.chitchat_friends (lower(trim(user_email)), status);

-- RPC to send a friend request
CREATE OR REPLACE FUNCTION public.send_chitchat_friend_request(
  p_sender_email text,
  p_sender_name text,
  p_sender_username text,
  p_sender_designation text,
  p_receiver_email text,
  p_receiver_name text,
  p_receiver_username text,
  p_receiver_designation text
)
RETURNS jsonb AS $$
DECLARE
  v_sender text;
  v_receiver text;
  v_sender_count integer;
  v_receiver_count integer;
  v_existing record;
BEGIN
  v_sender := lower(trim(p_sender_email));
  v_receiver := lower(trim(p_receiver_email));

  IF v_sender = v_receiver THEN
    RETURN jsonb_build_object('success', false, 'error', 'You cannot add yourself as a friend.');
  END IF;

  -- Check sender's accepted friend count (max 5)
  SELECT count(*) INTO v_sender_count
  FROM public.chitchat_friends
  WHERE lower(trim(user_email)) = v_sender AND status = 'accepted';

  IF v_sender_count >= 5 THEN
    RETURN jsonb_build_object('success', false, 'error', 'Friend limit reached (max 5 friends).');
  END IF;

  -- Check if already connected or request pending
  SELECT * INTO v_existing
  FROM public.chitchat_friends
  WHERE (lower(trim(user_email)) = v_receiver AND lower(trim(friend_email)) = v_sender)
     OR (lower(trim(user_email)) = v_sender AND lower(trim(friend_email)) = v_receiver)
  LIMIT 1;

  IF FOUND THEN
    IF v_existing.status = 'accepted' THEN
      RETURN jsonb_build_object('success', false, 'error', 'You are already connected as friends.');
    ELSIF v_existing.status = 'pending' THEN
      RETURN jsonb_build_object('success', false, 'error', 'A friend request is already pending between you.');
    END IF;
  END IF;

  -- Insert pending friend request for receiver
  INSERT INTO public.chitchat_friends (
    user_email,
    friend_email,
    friend_name,
    friend_username,
    friend_designation,
    sender_email,
    sender_name,
    sender_username,
    sender_designation,
    status
  )
  VALUES (
    v_receiver,
    v_sender,
    p_sender_name,
    p_sender_username,
    p_sender_designation,
    v_sender,
    p_sender_name,
    p_sender_username,
    p_sender_designation,
    'pending'
  )
  ON CONFLICT (user_email, friend_email) DO UPDATE
  SET 
    status = 'pending',
    sender_email = v_sender,
    sender_name = p_sender_name,
    sender_username = p_sender_username,
    sender_designation = p_sender_designation,
    friend_name = p_sender_name,
    friend_username = p_sender_username,
    friend_designation = p_sender_designation,
    created_at = timezone('utc'::text, now());

  RETURN jsonb_build_object('success', true, 'message', 'Friend request sent successfully!');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION public.send_chitchat_friend_request(text, text, text, text, text, text, text, text) TO anon, authenticated, service_role;

-- RPC to accept or decline friend request
CREATE OR REPLACE FUNCTION public.respond_chitchat_friend_request(
  p_request_id uuid,
  p_user_email text,
  p_action text, -- 'accept' or 'decline'
  p_user_name text DEFAULT NULL,
  p_user_username text DEFAULT NULL,
  p_user_designation text DEFAULT NULL
)
RETURNS jsonb AS $$
DECLARE
  v_req record;
  v_clean_user text;
  v_user_count integer;
  v_sender_count integer;
BEGIN
  v_clean_user := lower(trim(p_user_email));

  SELECT * INTO v_req
  FROM public.chitchat_friends
  WHERE id = p_request_id AND lower(trim(user_email)) = v_clean_user;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Friend request not found or unauthorized.');
  END IF;

  IF p_action = 'decline' THEN
    DELETE FROM public.chitchat_friends WHERE id = p_request_id;
    RETURN jsonb_build_object('success', true, 'message', 'Friend request declined.');
  END IF;

  IF p_action = 'accept' THEN
    -- Check current user's friend limit
    SELECT count(*) INTO v_user_count
    FROM public.chitchat_friends
    WHERE lower(trim(user_email)) = v_clean_user AND status = 'accepted';

    IF v_user_count >= 5 THEN
      RETURN jsonb_build_object('success', false, 'error', 'Your friend list is full (maximum 5 friends allowed).');
    END IF;

    -- Check sender's friend limit
    SELECT count(*) INTO v_sender_count
    FROM public.chitchat_friends
    WHERE lower(trim(user_email)) = lower(trim(v_req.friend_email)) AND status = 'accepted';

    IF v_sender_count >= 5 THEN
      RETURN jsonb_build_object('success', false, 'error', 'Requester has reached their 5-friend limit.');
    END IF;

    -- 1. Mark this request as accepted
    UPDATE public.chitchat_friends
    SET status = 'accepted'
    WHERE id = p_request_id;

    -- 2. Create reciprocal friend row for the sender so both can chat 1-on-1
    INSERT INTO public.chitchat_friends (
      user_email,
      friend_email,
      friend_name,
      friend_username,
      friend_designation,
      sender_email,
      status
    )
    VALUES (
      lower(trim(v_req.friend_email)),
      v_clean_user,
      COALESCE(p_user_name, 'Connected Member'),
      COALESCE(p_user_username, 'member'),
      COALESCE(p_user_designation, 'Officer / Member'),
      v_clean_user,
      'accepted'
    )
    ON CONFLICT (user_email, friend_email) DO UPDATE
    SET 
      status = 'accepted',
      friend_name = EXCLUDED.friend_name,
      friend_username = EXCLUDED.friend_username,
      friend_designation = EXCLUDED.friend_designation;

    RETURN jsonb_build_object('success', true, 'message', 'Friend request accepted! You can now chat in real time.');
  END IF;

  RETURN jsonb_build_object('success', false, 'error', 'Invalid action specified.');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION public.respond_chitchat_friend_request(uuid, text, text, text, text, text) TO anon, authenticated, service_role;

-- ─── 3. DESIGNATION-RESTRICTED CUSTOM GROUPS ───
ALTER TABLE public.chitchat_groups
ADD COLUMN IF NOT EXISTS designations text[] NOT NULL DEFAULT '{}';

-- Ensure RLS allows read/write for all needed operations
DROP POLICY IF EXISTS "Allow public read/write on chitchat_friends" ON public.chitchat_friends;
CREATE POLICY "Allow public read/write on chitchat_friends" 
ON public.chitchat_friends 
FOR ALL 
TO anon, authenticated, service_role
USING (true) 
WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public read/write on chitchat_groups" ON public.chitchat_groups;
CREATE POLICY "Allow public read/write on chitchat_groups" 
ON public.chitchat_groups 
FOR ALL 
TO anon, authenticated, service_role
USING (true) 
WITH CHECK (true);

-- Ensure Realtime Publication
DO $$
BEGIN
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.chitchat_friends;
  EXCEPTION WHEN OTHERS THEN NULL;
  END;
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.chitchat_groups;
  EXCEPTION WHEN OTHERS THEN NULL;
  END;
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.chitchat_access_codes;
  EXCEPTION WHEN OTHERS THEN NULL;
  END;
END $$;
