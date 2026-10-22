-- Regression assertions for an EMPTY, ISOLATED PostgreSQL test database only.
-- Apply the account foundation and bootstrap-lock migrations to the minimal
-- auth fixture first. Never use this file against production or a populated DB.
-- All fixture writes below roll back; no network/email/provider calls occur.
BEGIN;
DO $$
DECLARE
  v_owner uuid := '00000000-0000-4000-8000-000000000001';
  v_replacement uuid := '00000000-0000-4000-8000-000000000002';
  v_stranger uuid := '00000000-0000-4000-8000-000000000003';
  v_changed uuid := '00000000-0000-4000-8000-000000000004';
  v_granted_at timestamptz;
  v_count bigint;
BEGIN
  IF EXISTS (SELECT 1 FROM auth.users) OR EXISTS (SELECT 1 FROM private.user_roles) OR
     EXISTS (SELECT 1 FROM private.pending_admin_bootstrap WHERE granted_at IS NOT NULL OR granted_to IS NOT NULL) THEN
    RAISE EXCEPTION 'Requires an empty isolated fixture database';
  END IF;
  INSERT INTO auth.users (id, email, email_confirmed_at, email_change, raw_user_meta_data)
  VALUES (v_owner, 'ddabbis@gmail.com', NULL, '', '{"role":"admin"}'),
         (v_stranger, 'someone@example.test', now(), '', '{"role":"admin"}'),
         (v_changed, 'ddabbis@gmail.com', now(), 'other@example.test', '{}');
  IF EXISTS (SELECT 1 FROM private.user_roles) THEN
    RAISE EXCEPTION 'Unverified owner, unrelated verified email or pending email change received admin';
  END IF;

  UPDATE auth.users SET email_confirmed_at = now() WHERE id = v_owner;
  SELECT count(*) INTO v_count FROM private.user_roles
    WHERE user_id = v_owner AND role = 'admin' AND grant_source = 'verified_owner_bootstrap';
  IF v_count <> 1 THEN RAISE EXCEPTION 'Verified reserved owner did not receive exactly one grant'; END IF;
  SELECT granted_at INTO v_granted_at FROM private.pending_admin_bootstrap WHERE granted_to = v_owner;
  IF v_granted_at IS NULL THEN RAISE EXCEPTION 'Bootstrap consumption was not recorded'; END IF;

  -- Callback retries remain idempotent and do not alter consumption history.
  UPDATE auth.users SET email_confirmed_at = email_confirmed_at WHERE id = v_owner;
  IF (SELECT count(*) FROM private.user_roles WHERE user_id = v_owner) <> 1 OR
     (SELECT granted_at FROM private.pending_admin_bootstrap) IS DISTINCT FROM v_granted_at THEN
    RAISE EXCEPTION 'Repeated verification changed the grant/history';
  END IF;

  DELETE FROM auth.users WHERE id = v_owner;
  IF (SELECT granted_to FROM private.pending_admin_bootstrap) IS NOT NULL OR
     (SELECT granted_at FROM private.pending_admin_bootstrap) IS DISTINCT FROM v_granted_at THEN
    RAISE EXCEPTION 'Deletion did not retain the consumed bootstrap marker';
  END IF;
  INSERT INTO auth.users (id, email, email_confirmed_at, email_change, raw_user_meta_data)
  VALUES (v_replacement, 'ddabbis@gmail.com', now(), '', '{"role":"admin"}');
  UPDATE auth.users SET email_confirmed_at = email_confirmed_at WHERE id = v_replacement;
  IF EXISTS (SELECT 1 FROM private.user_roles WHERE user_id = v_replacement) OR
     (SELECT granted_at FROM private.pending_admin_bootstrap) IS DISTINCT FROM v_granted_at THEN
    RAISE EXCEPTION 'Consumed owner bootstrap replayed after account deletion';
  END IF;
END;
$$;
ROLLBACK;
