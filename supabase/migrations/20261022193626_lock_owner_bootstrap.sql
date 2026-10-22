-- Preserve consumption of the one-time owner bootstrap after the granted Auth
-- user is deleted. Its FK intentionally clears granted_to, but granted_at is the
-- durable consumption marker. Existing roles, audit rows and timestamps stay put.
BEGIN;
SET LOCAL lock_timeout = '5s';
SET LOCAL statement_timeout = '30s';

CREATE OR REPLACE FUNCTION private.grant_verified_owner_admin()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE v_pending private.pending_admin_bootstrap%ROWTYPE;
BEGIN
  IF new.email_confirmed_at IS NULL OR coalesce(new.email_change, '') <> '' OR
     lower(coalesce(new.email, '')) <> 'ddabbis@gmail.com' THEN RETURN new; END IF;
  SELECT * INTO v_pending FROM private.pending_admin_bootstrap
    WHERE singleton = true AND granted_to IS NULL AND granted_at IS NULL FOR UPDATE;
  IF NOT FOUND THEN RETURN new; END IF;

  INSERT INTO private.user_roles (user_id, role, granted_by, grant_source)
  VALUES (new.id, 'admin', NULL, 'verified_owner_bootstrap')
  ON CONFLICT (user_id, role) DO NOTHING;
  UPDATE private.pending_admin_bootstrap
     SET granted_to = new.id, granted_at = now()
   WHERE singleton = true AND granted_to IS NULL AND granted_at IS NULL;
  RETURN new;
END;
$$;
REVOKE ALL ON FUNCTION private.grant_verified_owner_admin() FROM PUBLIC, anon, authenticated;

COMMIT;
