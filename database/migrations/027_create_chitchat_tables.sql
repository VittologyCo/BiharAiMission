-- ============================================================================
-- Bihar AI Mission: Migration 027 - Chit-Chat (Gup-Shup) Community System
-- Features:
-- 1. chitchat_messages: text, media_url, media_type, channel_id, channel_type, sender metadata
-- 2. chitchat_friends: 1-on-1 friend connections (strictly capped at 5 per user)
-- 3. chitchat_groups: Admin-managed custom and clubbed department groups
-- 4. chitchat_access_codes: Timed 6-digit access passes with duration_minutes
-- 5. 15-day auto-purge function: purge_expired_chitchat()
-- ============================================================================

-- 1. CHITCHAT ACCESS CODES (Timed 6-digit passes)
CREATE TABLE IF NOT EXISTS public.chitchat_access_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code varchar(6) NOT NULL UNIQUE,
  duration_minutes integer NOT NULL DEFAULT 60,
  created_by text NOT NULL DEFAULT 'Admin',
  claimed_by text NULL,
  claimed_at timestamptz NULL,
  expires_at timestamptz NULL,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_chitchat_access_codes_code ON public.chitchat_access_codes (code);

-- 2. CHITCHAT GROUPS (Admin-created department / clubbed groups)
CREATE TABLE IF NOT EXISTS public.chitchat_groups (
  id text PRIMARY KEY,
  name text NOT NULL,
  description text NULL,
  departments text[] NOT NULL DEFAULT '{}',
  created_by text NOT NULL DEFAULT 'Admin',
  created_at timestamptz NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Seed default overall group and primary department groups
INSERT INTO public.chitchat_groups (id, name, description, departments, created_by)
VALUES 
  ('overall', '🏛️ All Bihar AI Community (समग्र राज्य समूह)', 'Open statewide forum for all registered officers and candidates across Bihar.', '{"ALL"}', 'System'),
  ('dept_it_ai', '💻 Information Technology & AI', 'Dedicated hub for IT, software, AI engineers, and technical cadres.', '{"Information Technology", "Science & Technology", "Technical"}', 'System'),
  ('dept_education', '🎓 Education & Academic Research', 'Teachers, professors, researchers, students, and academic leaders.', '{"Education", "Higher Education", "Research"}', 'System'),
  ('dept_healthcare', '🏥 Health & Family Welfare', 'Doctors, medical professionals, healthcare officers, and hospital staff.', '{"Health", "Medical", "Family Welfare"}', 'System'),
  ('dept_agriculture', '🌾 Agriculture & Rural Development', 'Agricultural officers, rural development managers, and farm innovators.', '{"Agriculture", "Rural Development", "Panchayati Raj"}', 'System'),
  ('dept_revenue_admin', '⚖️ General Administration & Revenue', 'Administrative officers, revenue officers, district administration, and governance.', '{"General Administration", "Revenue", "Police", "Finance"}', 'System')
ON CONFLICT (id) DO UPDATE 
SET name = EXCLUDED.name, description = EXCLUDED.description, departments = EXCLUDED.departments;

-- 3. CHITCHAT FRIENDS (Capped at 5 friends max per user)
CREATE TABLE IF NOT EXISTS public.chitchat_friends (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_email text NOT NULL,
  friend_email text NOT NULL,
  friend_name text NOT NULL,
  friend_username text NOT NULL,
  friend_designation text NULL,
  created_at timestamptz NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT chitchat_unique_friend_pair UNIQUE (user_email, friend_email)
);

CREATE INDEX IF NOT EXISTS idx_chitchat_friends_user ON public.chitchat_friends (lower(trim(user_email)));

-- 4. CHITCHAT MESSAGES (Expiring after 15 days)
CREATE TABLE IF NOT EXISTS public.chitchat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  channel_type text NOT NULL, -- 'overall' | 'department' | 'direct' | 'admin_group'
  channel_id text NOT NULL,   -- e.g. 'overall', 'dept_it_ai', 'dm_user1_user2', etc.
  sender_email text NOT NULL,
  sender_name text NOT NULL,
  sender_username text NOT NULL,
  sender_designation text NULL,
  recipient_email text NULL,  -- only for direct messages
  message_text text NULL,
  media_url text NULL,        -- local server storage URL
  media_type text NULL,       -- 'image' | 'video' | 'audio' | 'file'
  media_filename text NULL,
  created_at timestamptz NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_chitchat_messages_channel ON public.chitchat_messages (channel_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_chitchat_messages_created ON public.chitchat_messages (created_at DESC);

-- 5. RPC: Claim 6-Digit Timed Access Code
CREATE OR REPLACE FUNCTION public.claim_chitchat_code(
  p_user_email text,
  p_code text
)
RETURNS jsonb AS $$
DECLARE
  v_code_rec record;
  v_expires_at timestamptz;
  v_clean_code text;
  v_clean_email text;
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

  -- Calculate expiration from current time based on duration_minutes
  v_expires_at := timezone('utc'::text, now()) + (v_code_rec.duration_minutes || ' minutes')::interval;

  -- Mark code claimed
  UPDATE public.chitchat_access_codes
  SET 
    claimed_by = v_clean_email,
    claimed_at = timezone('utc'::text, now()),
    expires_at = v_expires_at,
    is_active = false
  WHERE id = v_code_rec.id;

  RETURN jsonb_build_object(
    'success', true,
    'code', v_clean_code,
    'duration_minutes', v_code_rec.duration_minutes,
    'expires_at', v_expires_at,
    'message', 'Code unlocked successfully! Access granted for ' || v_code_rec.duration_minutes || ' minutes.'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION public.claim_chitchat_code(text, text) TO anon, authenticated, service_role;

-- 6. RPC: Add Friend with strictly enforced 5-friend limit
CREATE OR REPLACE FUNCTION public.add_chitchat_friend(
  p_user_email text,
  p_friend_email text,
  p_friend_name text,
  p_friend_username text,
  p_friend_designation text DEFAULT NULL
)
RETURNS jsonb AS $$
DECLARE
  v_count integer;
  v_clean_user text;
  v_clean_friend text;
BEGIN
  v_clean_user := lower(trim(p_user_email));
  v_clean_friend := lower(trim(p_friend_email));

  IF v_clean_user = v_clean_friend THEN
    RETURN jsonb_build_object('success', false, 'error', 'You cannot add yourself as a friend.');
  END IF;

  -- Check existing count for this user
  SELECT count(*) INTO v_count 
  FROM public.chitchat_friends 
  WHERE lower(trim(user_email)) = v_clean_user;

  IF v_count >= 5 THEN
    RETURN jsonb_build_object('success', false, 'error', 'Friend limit reached. You can chat separately with up to 5 friends only.');
  END IF;

  -- Insert friend connection
  INSERT INTO public.chitchat_friends (user_email, friend_email, friend_name, friend_username, friend_designation)
  VALUES (v_clean_user, v_clean_friend, p_friend_name, p_friend_username, p_friend_designation)
  ON CONFLICT (user_email, friend_email) DO UPDATE 
  SET friend_name = EXCLUDED.friend_name, friend_username = EXCLUDED.friend_username, friend_designation = EXCLUDED.friend_designation;

  RETURN jsonb_build_object('success', true, 'message', 'Friend added successfully!', 'current_count', v_count + 1);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION public.add_chitchat_friend(text, text, text, text, text) TO anon, authenticated, service_role;

-- 7. RPC: 15-Day Auto-Purge of Old Chat Messages (WhatsApp-Style Expiring Data)
CREATE OR REPLACE FUNCTION public.purge_expired_chitchat()
RETURNS integer AS $$
DECLARE
  v_deleted integer;
BEGIN
  DELETE FROM public.chitchat_messages 
  WHERE created_at < (timezone('utc'::text, now()) - INTERVAL '15 days');

  GET DIAGNOSTICS v_deleted = ROW_COUNT;
  RETURN v_deleted;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION public.purge_expired_chitchat() TO anon, authenticated, service_role;

-- 8. RLS Policies and Permissions (Allow Read/Write for Chit-Chat Tables)
ALTER TABLE public.chitchat_access_codes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read/write on chitchat_access_codes" ON public.chitchat_access_codes;
CREATE POLICY "Allow public read/write on chitchat_access_codes" 
ON public.chitchat_access_codes 
FOR ALL 
TO anon, authenticated, service_role
USING (true) 
WITH CHECK (true);

ALTER TABLE public.chitchat_groups ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read/write on chitchat_groups" ON public.chitchat_groups;
CREATE POLICY "Allow public read/write on chitchat_groups" 
ON public.chitchat_groups 
FOR ALL 
TO anon, authenticated, service_role
USING (true) 
WITH CHECK (true);

ALTER TABLE public.chitchat_friends ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read/write on chitchat_friends" ON public.chitchat_friends;
CREATE POLICY "Allow public read/write on chitchat_friends" 
ON public.chitchat_friends 
FOR ALL 
TO anon, authenticated, service_role
USING (true) 
WITH CHECK (true);

ALTER TABLE public.chitchat_messages ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read/write on chitchat_messages" ON public.chitchat_messages;
CREATE POLICY "Allow public read/write on chitchat_messages" 
ON public.chitchat_messages 
FOR ALL 
TO anon, authenticated, service_role
USING (true) 
WITH CHECK (true);

GRANT ALL ON public.chitchat_access_codes TO anon, authenticated, service_role;
GRANT ALL ON public.chitchat_groups TO anon, authenticated, service_role;
GRANT ALL ON public.chitchat_friends TO anon, authenticated, service_role;
GRANT ALL ON public.chitchat_messages TO anon, authenticated, service_role;

-- 9. Enable Realtime Publications on tables
DO $$
BEGIN
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.chitchat_messages;
  EXCEPTION WHEN OTHERS THEN
    NULL;
  END;
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.chitchat_groups;
  EXCEPTION WHEN OTHERS THEN
    NULL;
  END;
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.chitchat_access_codes;
  EXCEPTION WHEN OTHERS THEN
    NULL;
  END;
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.chitchat_friends;
  EXCEPTION WHEN OTHERS THEN
    NULL;
  END;
END $$;

