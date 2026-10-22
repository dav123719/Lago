-- Idempotent account foundation for Supabase Auth. No auth.users rows or
-- existing application records are deleted or re-keyed by this migration.
BEGIN;

CREATE SCHEMA IF NOT EXISTS private;
REVOKE ALL ON SCHEMA private FROM PUBLIC, anon, authenticated;

CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text,
  first_name text,
  last_name text,
  phone text,
  avatar_url text,
  bio text,
  preferred_language text NOT NULL DEFAULT 'lv' CHECK (preferred_language IN ('lv', 'en', 'ru')),
  email_notifications boolean NOT NULL DEFAULT true,
  sms_notifications boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS full_name text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS first_name text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS last_name text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS phone text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS avatar_url text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS bio text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS preferred_language text NOT NULL DEFAULT 'lv';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email_notifications boolean NOT NULL DEFAULT true;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS sms_notifications boolean NOT NULL DEFAULT false;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS created_at timestamptz NOT NULL DEFAULT now();
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'lago_profiles_name_length') THEN
    ALTER TABLE public.profiles ADD CONSTRAINT lago_profiles_name_length
      CHECK (length(coalesce(full_name, '')) <= 120 AND length(coalesce(first_name, '')) <= 100 AND length(coalesce(last_name, '')) <= 100) NOT VALID;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'lago_profiles_contact_length') THEN
    ALTER TABLE public.profiles ADD CONSTRAINT lago_profiles_contact_length
      CHECK (length(coalesce(phone, '')) <= 50 AND length(coalesce(bio, '')) <= 500) NOT VALID;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'lago_profiles_avatar_https') THEN
    ALTER TABLE public.profiles ADD CONSTRAINT lago_profiles_avatar_https
      CHECK (avatar_url IS NULL OR (length(avatar_url) <= 2048 AND avatar_url ~ '^https://[^[:space:]]+$')) NOT VALID;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'lago_profiles_language') THEN
    ALTER TABLE public.profiles ADD CONSTRAINT lago_profiles_language
      CHECK (preferred_language IN ('lv', 'en', 'ru')) NOT VALID;
  END IF;
END;
$$;

CREATE OR REPLACE FUNCTION private.touch_profile_updated_at()
RETURNS trigger LANGUAGE plpgsql SET search_path = '' AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;
REVOKE ALL ON FUNCTION private.touch_profile_updated_at() FROM PUBLIC, anon, authenticated;
DROP TRIGGER IF EXISTS lago_profile_updated_at ON public.profiles;
CREATE TRIGGER lago_profile_updated_at BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION private.touch_profile_updated_at();

CREATE OR REPLACE FUNCTION private.provision_profile_for_auth_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE
  v_name text;
  v_avatar text;
BEGIN
  v_name := nullif(left(btrim(coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name', '')), 120), '');
  v_avatar := left(coalesce(new.raw_user_meta_data ->> 'avatar_url', new.raw_user_meta_data ->> 'picture', ''), 2048);
  IF v_avatar !~ '^https://[^[:space:]]+$' THEN v_avatar := NULL; END IF;

  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (new.id, v_name, v_avatar)
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$;
REVOKE ALL ON FUNCTION private.provision_profile_for_auth_user() FROM PUBLIC, anon, authenticated;
DROP TRIGGER IF EXISTS lago_profile_after_auth_user_insert ON auth.users;
CREATE TRIGGER lago_profile_after_auth_user_insert AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION private.provision_profile_for_auth_user();

-- Repair profiles for existing Auth users without overwriting user-edited rows.
INSERT INTO public.profiles (id, full_name, avatar_url)
SELECT u.id,
       nullif(left(btrim(coalesce(u.raw_user_meta_data ->> 'full_name', u.raw_user_meta_data ->> 'name', '')), 120), ''),
       CASE
         WHEN left(coalesce(u.raw_user_meta_data ->> 'avatar_url', u.raw_user_meta_data ->> 'picture', ''), 2048) ~ '^https://[^[:space:]]+$'
           THEN left(coalesce(u.raw_user_meta_data ->> 'avatar_url', u.raw_user_meta_data ->> 'picture', ''), 2048)
         ELSE NULL
       END
FROM auth.users AS u
ON CONFLICT (id) DO NOTHING;

CREATE TABLE IF NOT EXISTS private.user_roles (
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('admin')),
  granted_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  grant_source text NOT NULL,
  granted_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, role)
);
ALTER TABLE private.user_roles ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON private.user_roles FROM PUBLIC, anon, authenticated;

CREATE TABLE IF NOT EXISTS private.admin_profile_audit (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  actor_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  target_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  changed_fields jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE private.admin_profile_audit ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON private.admin_profile_audit FROM PUBLIC, anon, authenticated;

CREATE TABLE IF NOT EXISTS private.pending_admin_bootstrap (
  singleton boolean PRIMARY KEY DEFAULT true CHECK (singleton),
  verified_email text NOT NULL,
  granted_to uuid UNIQUE REFERENCES auth.users(id) ON DELETE SET NULL,
  granted_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE private.pending_admin_bootstrap ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON private.pending_admin_bootstrap FROM PUBLIC, anon, authenticated;
INSERT INTO private.pending_admin_bootstrap (singleton, verified_email)
VALUES (true, 'ddabbis@gmail.com')
ON CONFLICT (singleton) DO NOTHING;

CREATE OR REPLACE FUNCTION private.is_admin()
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = '' AS $$
  SELECT EXISTS (
    SELECT 1 FROM private.user_roles AS r
    WHERE r.user_id = (SELECT auth.uid()) AND r.role = 'admin'
  );
$$;
REVOKE ALL ON FUNCTION private.is_admin() FROM PUBLIC, anon;
GRANT USAGE ON SCHEMA private TO authenticated;
GRANT EXECUTE ON FUNCTION private.is_admin() TO authenticated;

CREATE OR REPLACE FUNCTION public.is_current_user_admin()
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = '' AS $$
  SELECT private.is_admin();
$$;
REVOKE ALL ON FUNCTION public.is_current_user_admin() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_current_user_admin() TO authenticated;

CREATE OR REPLACE FUNCTION public.ensure_my_profile()
RETURNS public.profiles LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE
  v_user auth.users%ROWTYPE;
  v_profile public.profiles%ROWTYPE;
  v_name text;
  v_avatar text;
BEGIN
  IF (SELECT auth.uid()) IS NULL THEN RAISE EXCEPTION 'Authentication required' USING ERRCODE = '42501'; END IF;
  SELECT * INTO v_user FROM auth.users WHERE id = (SELECT auth.uid());
  IF NOT FOUND THEN RAISE EXCEPTION 'Authenticated user not found' USING ERRCODE = 'P0002'; END IF;
  v_name := nullif(left(btrim(coalesce(v_user.raw_user_meta_data ->> 'full_name', v_user.raw_user_meta_data ->> 'name', '')), 120), '');
  v_avatar := left(coalesce(v_user.raw_user_meta_data ->> 'avatar_url', v_user.raw_user_meta_data ->> 'picture', ''), 2048);
  IF v_avatar !~ '^https://[^[:space:]]+$' THEN v_avatar := NULL; END IF;
  INSERT INTO public.profiles (id, full_name, avatar_url)
    VALUES (v_user.id, v_name, v_avatar) ON CONFLICT (id) DO NOTHING;
  SELECT * INTO v_profile FROM public.profiles WHERE id = v_user.id;
  RETURN v_profile;
END;
$$;
REVOKE ALL ON FUNCTION public.ensure_my_profile() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.ensure_my_profile() TO authenticated;

CREATE OR REPLACE FUNCTION private.grant_verified_owner_admin()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE v_pending private.pending_admin_bootstrap%ROWTYPE;
BEGIN
  IF new.email_confirmed_at IS NULL OR coalesce(new.email_change, '') <> '' OR
     lower(coalesce(new.email, '')) <> 'ddabbis@gmail.com' THEN RETURN new; END IF;
  SELECT * INTO v_pending FROM private.pending_admin_bootstrap
    WHERE singleton = true AND granted_to IS NULL FOR UPDATE;
  IF NOT FOUND THEN RETURN new; END IF;

  INSERT INTO private.user_roles (user_id, role, granted_by, grant_source)
  VALUES (new.id, 'admin', NULL, 'verified_owner_bootstrap')
  ON CONFLICT (user_id, role) DO NOTHING;
  UPDATE private.pending_admin_bootstrap
     SET granted_to = new.id, granted_at = now()
   WHERE singleton = true AND granted_to IS NULL;
  RETURN new;
END;
$$;
REVOKE ALL ON FUNCTION private.grant_verified_owner_admin() FROM PUBLIC, anon, authenticated;
DROP TRIGGER IF EXISTS lago_admin_bootstrap_after_auth_insert ON auth.users;
CREATE TRIGGER lago_admin_bootstrap_after_auth_insert AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION private.grant_verified_owner_admin();
DROP TRIGGER IF EXISTS lago_admin_bootstrap_after_email_verify ON auth.users;
CREATE TRIGGER lago_admin_bootstrap_after_email_verify AFTER UPDATE OF email_confirmed_at ON auth.users
FOR EACH ROW WHEN (new.email_confirmed_at IS NOT NULL)
EXECUTE FUNCTION private.grant_verified_owner_admin();

-- Cover the case where the verified owner already exists before this migration.
-- Grant only when there is exactly one verified matching UUID; ambiguous legacy
-- accounts leave the bootstrap pending for manual, proof-based review.
DO $$
DECLARE
  v_owner_id uuid;
BEGIN
  SELECT (array_agg(u.id))[1] INTO v_owner_id
  FROM auth.users AS u
  WHERE lower(u.email) = 'ddabbis@gmail.com'
    AND u.email_confirmed_at IS NOT NULL
    AND coalesce(u.email_change, '') = ''
  HAVING count(*) = 1;

  IF v_owner_id IS NOT NULL THEN
    PERFORM 1 FROM private.pending_admin_bootstrap
      WHERE singleton = true AND granted_to IS NULL FOR UPDATE;
    IF FOUND THEN
      INSERT INTO private.user_roles (user_id, role, granted_by, grant_source)
      VALUES (v_owner_id, 'admin', NULL, 'verified_owner_bootstrap')
      ON CONFLICT (user_id, role) DO NOTHING;
      UPDATE private.pending_admin_bootstrap
        SET granted_to = v_owner_id, granted_at = now()
        WHERE singleton = true AND granted_to IS NULL;
    END IF;
  END IF;
END;
$$;

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.profiles FROM PUBLIC, anon, authenticated;
GRANT SELECT ON public.profiles TO authenticated;
GRANT UPDATE (full_name, first_name, last_name, phone, avatar_url, bio,
  preferred_language, email_notifications, sms_notifications, updated_at)
  ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
DROP POLICY IF EXISTS lago_profiles_read_self ON public.profiles;
CREATE POLICY lago_profiles_read_self ON public.profiles FOR SELECT TO authenticated
  USING (id = (SELECT auth.uid()));
DROP POLICY IF EXISTS lago_profiles_update_self ON public.profiles;
CREATE POLICY lago_profiles_update_self ON public.profiles FOR UPDATE TO authenticated
  USING (id = (SELECT auth.uid())) WITH CHECK (id = (SELECT auth.uid()));

CREATE OR REPLACE FUNCTION public.admin_search_profiles(p_query text DEFAULT NULL, p_limit integer DEFAULT 50)
RETURNS TABLE (
  id uuid, email text, full_name text, first_name text, last_name text,
  phone text, avatar_url text, bio text, preferred_language text,
  created_at timestamptz, updated_at timestamptz
)
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = '' AS $$
BEGIN
  IF NOT private.is_admin() THEN RAISE EXCEPTION 'Administrator access required' USING ERRCODE = '42501'; END IF;
  RETURN QUERY
    SELECT p.id, u.email::text, p.full_name, p.first_name, p.last_name, p.phone,
           p.avatar_url, p.bio, p.preferred_language, p.created_at, p.updated_at
    FROM public.profiles AS p JOIN auth.users AS u ON u.id = p.id
    WHERE p_query IS NULL OR btrim(p_query) = '' OR
      u.email ILIKE '%' || btrim(p_query) || '%' OR
      coalesce(p.full_name, '') ILIKE '%' || btrim(p_query) || '%'
    ORDER BY p.updated_at DESC
    LIMIT greatest(1, least(coalesce(p_limit, 50), 100));
END;
$$;
REVOKE ALL ON FUNCTION public.admin_search_profiles(text, integer) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_search_profiles(text, integer) TO authenticated;

CREATE OR REPLACE FUNCTION public.admin_update_profile(
  p_user_id uuid, p_full_name text, p_first_name text, p_last_name text,
  p_phone text, p_avatar_url text, p_bio text, p_preferred_language text
)
RETURNS public.profiles LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE v_old public.profiles%ROWTYPE; v_new public.profiles%ROWTYPE; v_changes jsonb := '{}'::jsonb;
BEGIN
  IF NOT private.is_admin() THEN RAISE EXCEPTION 'Administrator access required' USING ERRCODE = '42501'; END IF;
  IF length(coalesce(p_full_name, '')) > 120 OR length(coalesce(p_first_name, '')) > 100 OR
     length(coalesce(p_last_name, '')) > 100 OR length(coalesce(p_phone, '')) > 50 OR
     length(coalesce(p_bio, '')) > 500 OR
     (p_avatar_url IS NOT NULL AND (length(p_avatar_url) > 2048 OR p_avatar_url !~ '^https://[^[:space:]]+$')) OR
     p_preferred_language NOT IN ('lv', 'en', 'ru') THEN
    RAISE EXCEPTION 'Invalid profile data' USING ERRCODE = '22023';
  END IF;
  SELECT * INTO v_old FROM public.profiles WHERE id = p_user_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Profile not found' USING ERRCODE = 'P0002'; END IF;
  IF v_old.full_name IS DISTINCT FROM p_full_name THEN v_changes := v_changes || jsonb_build_object('full_name', jsonb_build_object('before', v_old.full_name, 'after', p_full_name)); END IF;
  IF v_old.first_name IS DISTINCT FROM p_first_name THEN v_changes := v_changes || jsonb_build_object('first_name', jsonb_build_object('before', v_old.first_name, 'after', p_first_name)); END IF;
  IF v_old.last_name IS DISTINCT FROM p_last_name THEN v_changes := v_changes || jsonb_build_object('last_name', jsonb_build_object('before', v_old.last_name, 'after', p_last_name)); END IF;
  IF v_old.phone IS DISTINCT FROM p_phone THEN v_changes := v_changes || jsonb_build_object('phone', jsonb_build_object('before', v_old.phone, 'after', p_phone)); END IF;
  IF v_old.avatar_url IS DISTINCT FROM p_avatar_url THEN v_changes := v_changes || jsonb_build_object('avatar_url', jsonb_build_object('before', v_old.avatar_url, 'after', p_avatar_url)); END IF;
  IF v_old.bio IS DISTINCT FROM p_bio THEN v_changes := v_changes || jsonb_build_object('bio', jsonb_build_object('before', v_old.bio, 'after', p_bio)); END IF;
  IF v_old.preferred_language IS DISTINCT FROM p_preferred_language THEN v_changes := v_changes || jsonb_build_object('preferred_language', jsonb_build_object('before', v_old.preferred_language, 'after', p_preferred_language)); END IF;
  UPDATE public.profiles SET full_name=p_full_name, first_name=p_first_name,
    last_name=p_last_name, phone=p_phone, avatar_url=p_avatar_url, bio=p_bio,
    preferred_language=p_preferred_language
    WHERE id=p_user_id RETURNING * INTO v_new;
  IF v_changes <> '{}'::jsonb THEN
    INSERT INTO private.admin_profile_audit (actor_user_id, target_user_id, changed_fields)
    VALUES ((SELECT auth.uid()), p_user_id, v_changes);
  END IF;
  RETURN v_new;
END;
$$;
REVOKE ALL ON FUNCTION public.admin_update_profile(uuid,text,text,text,text,text,text,text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_update_profile(uuid,text,text,text,text,text,text,text) TO authenticated;

COMMIT;
