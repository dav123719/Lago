-- EMPTY ISOLATED fixture database only, after foundation + bootstrap migration.
-- SET ROLE tests real column privileges/RLS and emulated JWT subject claims;
-- no service-role shortcuts for user/admin operations. Rolls all fixture writes back.
BEGIN;
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM auth.users) THEN RAISE EXCEPTION 'Requires an empty isolated fixture database'; END IF;
END; $$;
INSERT INTO auth.users(id, email, email_confirmed_at, email_change, raw_user_meta_data) VALUES
 ('00000000-0000-4000-8000-000000000011', 'ddabbis@gmail.com', now(), '', '{"full_name":"Verified owner"}'),
 ('00000000-0000-4000-8000-000000000012', 'alice@example.test', now(), '', '{"full_name":"Initial Alice","role":"admin"}'),
 ('00000000-0000-4000-8000-000000000013', 'bob@example.test', now(), '', '{}');
DO $$ BEGIN
  IF (SELECT count(*) FROM public.profiles) <> 3 THEN RAISE EXCEPTION 'Auth trigger did not provision one UUID profile each'; END IF;
END; $$;
SELECT 'trigger provisions UUID profiles' AS passed;

SET LOCAL ROLE anon;
DO $$ DECLARE command text; BEGIN
  IF current_user <> 'anon' THEN RAISE EXCEPTION 'Anonymous assertions bypassed role'; END IF;
  FOREACH command IN ARRAY ARRAY[
    'SELECT * FROM public.profiles',
    'UPDATE public.profiles SET full_name = ''Intruder''',
    'SELECT public.ensure_my_profile()',
    'SELECT public.is_current_user_admin()',
    'SELECT * FROM public.admin_search_profiles(NULL, 50)',
    'SELECT * FROM private.user_roles',
    'SELECT * FROM private.admin_profile_audit',
    'SELECT * FROM private.pending_admin_bootstrap'
  ] LOOP
    BEGIN EXECUTE command; RAISE EXCEPTION 'Anonymous operation unexpectedly authorized: %', command;
    EXCEPTION WHEN insufficient_privilege THEN NULL; END;
  END LOOP;
END; $$;
SELECT '8 anonymous private-account/function operations denied' AS passed;

SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claim.sub', '00000000-0000-4000-8000-000000000012', true);
DO $$ DECLARE n integer; v_profile public.profiles; command text; BEGIN
  IF current_user <> 'authenticated' THEN RAISE EXCEPTION 'Ordinary assertions bypassed role'; END IF;
  IF (SELECT count(*) FROM public.profiles) <> 1 OR NOT EXISTS(
    SELECT 1 FROM public.profiles WHERE id = '00000000-0000-4000-8000-000000000012'
  ) THEN RAISE EXCEPTION 'Self-only profile read failed'; END IF;
  IF EXISTS(SELECT 1 FROM public.profiles WHERE id = '00000000-0000-4000-8000-000000000013') THEN
    RAISE EXCEPTION 'Other profile visible'; END IF;
  IF public.is_current_user_admin() THEN RAISE EXCEPTION 'Editable role metadata escalated privileges'; END IF;
  UPDATE public.profiles SET full_name = 'Edited Alice', first_name = 'Alice', last_name = 'Example',
    phone = '+37100000000', bio = 'Fixture bio', avatar_url = 'https://example.test/avatar.png',
    preferred_language = 'en', email_notifications = false, sms_notifications = false
    WHERE id = auth.uid();
  GET DIAGNOSTICS n = ROW_COUNT;
  IF n <> 1 OR NOT EXISTS(SELECT 1 FROM public.profiles WHERE full_name = 'Edited Alice' AND bio = 'Fixture bio' AND preferred_language = 'en') THEN
    RAISE EXCEPTION 'Permitted profile update did not persist'; END IF;
  UPDATE public.profiles SET full_name = 'Unauthorized edit' WHERE id = '00000000-0000-4000-8000-000000000013';
  GET DIAGNOSTICS n = ROW_COUNT;
  IF n <> 0 THEN RAISE EXCEPTION 'Other profile was editable'; END IF;

  -- Repeated callback/onboarding repair is idempotent and preserves user edits.
  PERFORM public.ensure_my_profile();
  PERFORM public.ensure_my_profile();
  SELECT * INTO v_profile FROM public.profiles WHERE id = auth.uid();
  IF v_profile.full_name <> 'Edited Alice' OR v_profile.bio <> 'Fixture bio' OR
     (SELECT count(*) FROM public.profiles) <> 1 THEN RAISE EXCEPTION 'Provisioning overwrote edits or duplicated profiles'; END IF;

  FOREACH command IN ARRAY ARRAY[
    'UPDATE public.profiles SET id = ''00000000-0000-4000-8000-000000000014'' WHERE id = auth.uid()',
    'INSERT INTO public.profiles(id) VALUES (''00000000-0000-4000-8000-000000000014'')',
    'DELETE FROM public.profiles WHERE id = auth.uid()',
    'SELECT * FROM private.user_roles',
    'INSERT INTO private.user_roles(user_id,role,grant_source) VALUES (auth.uid(),''admin'',''self'')',
    'UPDATE private.user_roles SET user_id = auth.uid()',
    'DELETE FROM private.user_roles',
    'SELECT * FROM private.admin_profile_audit',
    'INSERT INTO private.admin_profile_audit(actor_user_id,target_user_id,changed_fields) VALUES (auth.uid(),auth.uid(),''{}'')',
    'UPDATE private.admin_profile_audit SET changed_fields = ''{}''',
    'DELETE FROM private.admin_profile_audit',
    'SELECT * FROM private.pending_admin_bootstrap',
    'UPDATE private.pending_admin_bootstrap SET granted_at = NULL',
    'INSERT INTO private.pending_admin_bootstrap(singleton,verified_email) VALUES (true,''alice@example.test'')',
    'DELETE FROM private.pending_admin_bootstrap',
    'SELECT * FROM public.admin_search_profiles(NULL,50)',
    'SELECT public.admin_update_profile(''00000000-0000-4000-8000-000000000013'',''Unauthorized'',NULL,NULL,NULL,NULL,NULL,''lv'')'
  ] LOOP
    BEGIN EXECUTE command; RAISE EXCEPTION 'Ordinary operation unexpectedly authorized: %', command;
    EXCEPTION WHEN insufficient_privilege THEN NULL; END;
  END LOOP;
END; $$;
SELECT 'self read/update; cross-user isolation; metadata role denial; provisioning idempotency; 17 privileged operations denied' AS passed;

-- Switch JWT subject within the same authenticated database role/connection.
SELECT set_config('request.jwt.claim.sub', '00000000-0000-4000-8000-000000000013', true);
DO $$ BEGIN
  IF (SELECT count(*) FROM public.profiles) <> 1 OR EXISTS(SELECT 1 FROM public.profiles WHERE full_name = 'Edited Alice') THEN
    RAISE EXCEPTION 'Previous user profile leaked after identity change'; END IF;
END; $$;
SELECT 'same-connection identity change remains isolated' AS passed;

SELECT set_config('request.jwt.claim.sub', '', true);
DO $$ BEGIN
  IF EXISTS(SELECT 1 FROM public.profiles) OR public.is_current_user_admin() THEN
    RAISE EXCEPTION 'Missing subject retains user data/role'; END IF;
  BEGIN PERFORM public.ensure_my_profile(); RAISE EXCEPTION 'Missing subject provisioned a profile';
  EXCEPTION WHEN insufficient_privilege THEN NULL; END;
END; $$;
SELECT 'cleared JWT subject reveals no profile/role and cannot provision' AS passed;

SELECT set_config('request.jwt.claim.sub', '00000000-0000-4000-8000-000000000011', true);
DO $$ DECLARE v_profile public.profiles; BEGIN
  IF current_user <> 'authenticated' OR NOT public.is_current_user_admin() THEN RAISE EXCEPTION 'Verified owner role check failed'; END IF;
  IF (SELECT count(*) FROM public.admin_search_profiles(NULL,50)) <> 3 OR
     (SELECT count(*) FROM public.admin_search_profiles('alice@example.test',50)) <> 1 THEN RAISE EXCEPTION 'Authorized admin search failed'; END IF;
  -- An admin cannot bypass self-profile RLS with an ordinary direct update.
  UPDATE public.profiles SET full_name = 'Bypassed RPC' WHERE id = '00000000-0000-4000-8000-000000000013';
  IF FOUND THEN RAISE EXCEPTION 'Admin bypassed audited RPC through direct profile update'; END IF;
  v_profile := public.admin_update_profile('00000000-0000-4000-8000-000000000013','Reviewed Bob','Bob',NULL,NULL,NULL,'Reviewed fixture','lv');
  IF v_profile.full_name <> 'Reviewed Bob' OR v_profile.id <> '00000000-0000-4000-8000-000000000013' THEN RAISE EXCEPTION 'Admin profile update failed'; END IF;
  -- No-op retries must not create additional audit entries.
  PERFORM public.admin_update_profile('00000000-0000-4000-8000-000000000013','Reviewed Bob','Bob',NULL,NULL,NULL,'Reviewed fixture','lv');
END; $$;
SELECT 'verified-owner admin search/edit succeeds through authorized RPC only' AS passed;

RESET ROLE;
DO $$ BEGIN
  IF (SELECT count(*) FROM private.admin_profile_audit) <> 1 OR NOT EXISTS (
    SELECT 1 FROM private.admin_profile_audit
    WHERE actor_user_id = '00000000-0000-4000-8000-000000000011'
      AND target_user_id = '00000000-0000-4000-8000-000000000013'
      AND changed_fields -> 'full_name' ->> 'after' = 'Reviewed Bob'
      AND created_at IS NOT NULL
      AND NOT (changed_fields ?| ARRAY['password','email','role','token'])
  ) THEN RAISE EXCEPTION 'Admin audit missing, wrong actor/target/fields, or duplicate'; END IF;
  IF (SELECT count(*) FROM private.user_roles) <> 1 OR
     (SELECT count(*) FROM public.profiles) <> 3 OR
     (SELECT full_name FROM public.profiles WHERE id='00000000-0000-4000-8000-000000000012') <> 'Edited Alice' THEN
    RAISE EXCEPTION 'Role count, UUID profiles or preserved ordinary edit changed unexpectedly'; END IF;
END; $$;
SELECT 'audit actor/target/time/changed fields, retry deduplication and intact roles/profiles verified' AS passed;
ROLLBACK;
