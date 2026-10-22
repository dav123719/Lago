# Account, private-state, and cache review

Reviewed the implementation in `/tmp/lago-publish` for the October 2026 engineering pass. This is an application/static-schema review plus controlled SDK/API tests, not evidence that a personal account or email-delivery journey has passed in production.

## Coverage

| Subsystem | References | Review and result |
| --- | --- | --- |
| Browser session/profile | `src/contexts/AuthContext.tsx` | Auth callback remains synchronous; profile work runs outside the auth lock. Identity/session/request revisions prevent obsolete data from publishing. Token refresh preserves the loaded profile and avoids another profile query. Explicit reload can recover from a failed load. |
| Profile editing | `src/app/[locale]/account/page.tsx`, `AuthContext.updateProfile` | Inputs have labels/autocomplete/bounds. Initial profile loading is distinct from public auth loading. Mutation returns the confirmed row in one request; zero-row failure is not success. A prior session's completed save cannot overwrite the current profile. |
| Recovery and callback | `src/app/auth/callback/AuthCallbackContent.tsx`, `src/app/auth/reset-password/ResetPasswordForm.tsx`, `src/lib/auth/recovery.ts` | Effect retries reuse the PKCE exchange promise; no redirect after unmount. Removed the artificial success wait. Recovery UI marker is UUID-bound, expires after 15 minutes, and clears after use/logout; Supabase remains the authority for password updates. Missing/invalid auth gets retry UI. |
| Auth dialogs | `src/components/auth/{Login,Signup,ForgotPassword}Modal.tsx`, `src/hooks/useModalDialog.ts` | Dialog semantics, initial focus, Tab wrapping, Escape close, focus restoration and scroll-lock cleanup. Thrown network failures release loading state and do not announce success. |
| Admin UI role | `src/hooks/useAdmin.ts` | Rechecks on auth events and tab visibility; clears old admin UI state immediately on logout/identity change. In-flight old results are ignored. No cached client role is used to authorize a mutation. |
| Admin profile search/edit | `src/app/admin/profiles/page.tsx`, `src/app/api/admin/profiles/route.ts` | Typing no longer triggers an unfiltered search per keystroke. Explicit search aborts old requests and ignores old results. Saves retain submitted filter and success feedback; overlapping saves are disabled. API verifies user and DB role for every request, validates malformed bodies safely, rejects cross-origin edits, and returns private/no-store responses including failures. |
| Private HTTP delivery | `src/middleware.ts`, `src/lib/supabase/middleware.ts`, `next.config.js` | Account/admin/auth/studio responses are private/no-store. API routes also have private headers through deployment config. Anonymous requests without a Supabase session cookie skip session-client work. Present (including chunked) auth cookies still invoke authoritative `getUser`; a PKCE verifier alone is not a session. Refreshed session-cookie responses are no-store. |
| Browser cart | `src/contexts/CartContext.tsx`, `src/hooks/useGuestSession.ts` | Public informational pages no longer query/create a cart or guest identifier automatically. Cart activates on cart/checkout/product routes or opening the drawer. Context state/subscriptions and storage are partitioned by auth UUID. Previous-identity requests cannot publish into the new context. Mutation errors and invalid quantities are surfaced. This is client isolation, not proof of server-side commerce readiness. |
| Schema and permissions | `supabase/migrations/20261022170145_lago_account_system.sql` | UUID profile PK; own-row RLS with limited update grants; private role/audit tables; privileged functions have fixed search paths and restricted execution. Profile provisioning uses conflict-do-nothing to preserve edited data. Admin checks use private role records. |
| Admin bootstrap | same migration | Reserved owner remains exactly `ddabbis@gmail.com`. Trigger requires confirmed email and no pending email change, grants the verified UUID under lock, and records grant source/time. No app form grants roles and no email verification was bypassed. |

## Deterministic request/work reductions

These counts are demonstrated by controlled regression tests and source inspection, not production latency or field percentiles.

| Trigger | Before | After | Evidence |
| --- | --- | --- | --- |
| Same-user token refresh | profile cleared + 1 profile read | profile retained + 0 profile reads | `account-isolation.test.tsx` |
| Successful profile save | 1 update + 1 separate profile read | 1 update returning confirmed profile | `account-isolation.test.tsx` |
| Public informational page cart startup | 1 cart lookup, then item read or cart insert if schema available | 0 cart queries until shopping intent | `cart-session-runtime.test.tsx` |
| Admin search typing | effect called empty search on every query change | 0 typing requests; 1 per submit | `admin-profiles-races.test.tsx` |
| Successful callback | intentional 1,000 ms success timer before navigation | 0 ms intentional success timer | callback source + `auth-callback-retry.test.tsx` (not network timing) |

## Reproduce focused verification

```sh
npm run type-check
npx vitest run \
  src/__tests__/unit/auth-provider.test.tsx \
  src/__tests__/unit/auth-redirect.test.ts \
  src/__tests__/unit/account-isolation.test.tsx \
  src/__tests__/unit/account-recovery.test.ts \
  src/__tests__/unit/auth-callback-retry.test.tsx \
  src/__tests__/unit/auth-private-delivery.test.ts \
  src/__tests__/unit/admin-profiles-races.test.tsx \
  src/__tests__/unit/admin-profiles-security.test.ts \
  src/__tests__/unit/use-admin-session.test.tsx \
  src/__tests__/unit/cart-session-runtime.test.tsx \
  src/__tests__/unit/modal-dialog-accessibility.test.tsx \
  src/__tests__/unit/guest-session-isolation.test.tsx
```

The test suite controls SDK responses, including errors and delayed results. It verifies session-isolation and denial behavior without creating production users, resetting personal passwords, sending mail, or fabricating OAuth success. Production-build/browser/HTTP measurements are recorded separately by the lead/verification workstreams.

## Limits and pending live acceptance

- No authorized test mailbox or controlled authenticated test session was available to this workstream. Signup→delivered confirmation→sign-in; delivered password recovery→password update→sign-in; persisted profile editing; admin edits/audit and provider linking remain pending live verification.
- Lead verification subsequently confirmed one verified reserved owner, one matching profile and one UUID-based admin grant. This database result is not a credentialed browser-login or profile-edit test.
- Google/Facebook application flags remain contingent on real provider configuration; neither provider was enabled or asserted to work here. No merge-by-email shortcut was introduced.
- This specialist made no infrastructure mutations. The lead applied the reviewed additive bootstrap function migration and corrected Supabase callback URLs; no owner credentials, provider settings, SMTP, DNS, or existing migrations were changed.
- Commerce is not production verified. The repository's browser `guest_session_id` mechanism differs from hardened server API `cart_session` ownership cookies, and prior deployment reports missing commerce tables. Client partitioning does not repair that server contract, enable checkout, or replace a schema/RLS review. Retain disabled checkout until one ownership contract and end-to-end tests exist.
- The reported bootstrap replay edge was fixed and applied in new migration `20261022193626_lock_owner_bootstrap.sql`; the live function contains the durable `granted_at IS NULL` guard. See database evidence and isolated replay tests.

## Recovery and rollback

These changes add no database dependency. Roll back through the existing immutable-release mechanism; do not revert the applied account schema, remove roles/audit records, or clear real users. The new recovery marker intentionally invalidates old unscoped `"1"` browser markers: request a new recovery link after rollback/version transitions if needed. Test private response headers on the actual Apache/Cloudflare path because app configuration alone cannot prove CDN behavior.

## Primary references

- [Supabase server-side Next.js clients](https://supabase.com/docs/guides/auth/server-side/creating-a-client?queryGroups=framework&framework=nextjs): server verification and refreshed-session caching constraints.
- [Supabase identity linking](https://supabase.com/docs/guides/auth/auth-identity-linking): automatic/manual linking remains Supabase-managed, with no application-side email merge.
- [MDN HTTP caching](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Caching): private versus shared-cache storage and no-store semantics.
