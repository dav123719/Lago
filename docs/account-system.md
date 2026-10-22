# Supabase account system rollout

The application account implementation is in place, with the schema in `supabase/migrations/20261022170145_lago_account_system.sql`. This additive, idempotent migration has been applied to the production Supabase project. It creates UUID-keyed profiles, backfills only missing rows, sets self-service RLS, creates private role/audit/bootstrap tables, and provisions admin-only profile search/edit RPCs. It does not alter or combine Auth identities or delete application data.

## Migration and administrator bootstrap

The migration was applied through Supabase's scoped Management API migration endpoint. PostgREST now recognizes `profiles`, and unauthenticated requests to read profiles or call the admin-check RPC return permission denied. The October 22 engineering inspection now confirms one verified Auth user for `ddabbis@gmail.com`, with a profile and an administrator grant attached to that UUID. No personal password was changed and no invitation or verification email was sent by this pass. The original empty-user observation is historical. The migration grants the role only once for the exact verified email; if multiple verified accounts exist, it leaves bootstrap pending for review.

The additive migration `20261022193626_lock_owner_bootstrap.sql` is also applied. It uses the durable grant timestamp to prevent bootstrap replay if the original granted user is later deleted. Isolated PostgreSQL regression tests cover that edge; existing role/profile/audit data were retained.

## Auth URL configuration

The engineering pass configured and read back the production Site URL `https://lago.lv` and narrow callback path patterns (including query parameters), retaining localhost:3000 and 127.0.0.1:3000 development callbacks. See `performance/auth-redirect-configuration.json`. In Supabase Authentication → URL Configuration, maintain:

- `https://lago.lv/auth/callback`
- `https://www.lago.lv/auth/callback` only if the `www` hostname remains enabled
- Local development callback, for example `http://localhost:3000/auth/callback`

Use exact production entries and narrow local-development entries. The app constrains post-auth `next` redirects to same-site paths. Set the Auth password policy to at least 12 characters to match app-side validation.

## Email delivery

Configure a production SMTP provider in Supabase Authentication → SMTP Settings. Supply SMTP host, port/TLS, username, password, sender name, and a sender address on a domain authorized by that mail provider. Configure confirmation and recovery templates to use Supabase's `{{ .ConfirmationURL }}` (or the supported PKCE confirmation link) so Supabase can return through `/auth/callback`. Test signup confirmation, resend limits, password recovery, and email-change confirmation with a controlled inbox. An application `RESEND_API_KEY` does not configure Supabase Auth SMTP by itself.

## OAuth

Google and Facebook are currently disabled in Supabase Auth, and app feature flags default off. To enable a provider, create its OAuth application and set its client ID/secret in Supabase Authentication → Sign In / Providers, then add Supabase's displayed callback URL to that provider's authorized redirect URLs. Google uses its OAuth web client; Facebook uses its App ID and App Secret and requires its email permission if email identity is expected. Also set `NEXT_PUBLIC_GOOGLE_OAUTH_ENABLED=true` or `NEXT_PUBLIC_FACEBOOK_OAUTH_ENABLED=true` at build/runtime as appropriate. For signed-in manual identity connection, enable Supabase manual identity linking and set `NEXT_PUBLIC_MANUAL_IDENTITY_LINKING_ENABLED=true`.

Supabase automatic linking applies only when its verified-email rules are met. The app does not merge accounts by profile email. A provider with no verified email, a different address, or an identity already owned by another UUID must be resolved through the provider/Supabase-supported ownership flow; no account data is moved automatically.

## Verification after rollout

Use controlled test accounts and a test inbox to exercise registration, email confirmation, resend, normal sign-in/out, profile save/reload, recovery link consumption and password change, email change confirmation, provider sign-in/link/unlink, and admin authorization. Confirm unauthenticated and ordinary users cannot call admin RPCs or update another profile. Check the audit table after an admin profile edit. Keep the service-role key server-side; never add it to `NEXT_PUBLIC_*` variables.
