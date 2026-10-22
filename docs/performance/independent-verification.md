# Independent verification, 22 October 2026

Review scope: integrated changes in `/tmp/lago-publish`, compared with repository baseline `d511142`. Runtime baseline is the previously deployed release on loopback port 3100; candidate verification uses its separately built production server on port 3200. A source review is not a live account or database acceptance test.

## Independently inspected behavior

- `AuthContext` publishes a profile only for the current identity, session revision and request revision. An identity switch clears private profile state; token refresh preserves the existing profile and skips a redundant profile read. A confirmed save returns its row and invalidates older reads.
- `CartContext` remounts its identity-specific state on UUID changes. Cart queries are deferred until shopping/cart activation. Delayed results from an unmounted identity cannot populate the new identity's drawer. `useGuestSession` partitions stored cart/email keys and prevents the last account's guest cookie becoming the anonymous cart.
- `useAdmin` treats client state as advisory, resets on auth changes, and rechecks on visibility changes. Server APIs and database functions still enforce authorization.
- The PKCE callback shares one exchange promise across effect retries and cancels navigation after unmount. Recovery's UUID-scoped, expiring browser marker gates the UI; Supabase `getUser` and `updateUser` remain authoritative.
- Shared modal behavior moves focus inside, wraps Tab/Shift+Tab, closes on Escape, and restores focus and scroll style. Independent review caught a missing signup dialog ref/semantics; this was corrected before the production build.
- Admin profile responses and private account/admin/auth paths explicitly deny public caching. No service-role credential was added to the browser.
- First-party vitals collection accepts only bounded numerical metrics with coarse device/route groups, rejects extra fields, omits request credentials/referrer, and caps accepted log entries. No raw URL, account data or persistent visitor identifier is included in its application payload. These samples do not establish field percentiles by themselves.

## Production candidate verification

The final standalone production candidate built from source commit `e0c30a3` was tested at `http://127.0.0.1:3200`. All **25 Playwright smoke checks passed in 33.0 seconds** in Chromium, with one worker. These are functional checks without artificial network/CPU throttling; they are separate from the repeated performance measurements. Every sitemap URL returned HTTP 200 with canonical metadata and no `noindex`.

Seven page captures from the preceding `160f77c` candidate (identical visible rendering; the only later app change skips redundant language assignment) covered Latvian home at 1440/390 px, material guide and about/contact at 390 px, Russian home at 390 px, and English store at 1440/390 px. All returned 200, had one main H1, correct document/content language after hydration, no horizontal overflow, and no browser exceptions. Network failures were limited to the known unmocked store `/api/products/` 500 from the unavailable commerce schema; the UI exposes an error and retry rather than fabricated products. Screenshot/DOM/network observations are summarized in `verification-results.json`; captures are retained under `test-results/quality/`.

Visual review caught and fixed an actual responsive cascade bug: the late inline critical stylesheet repeated unlayered `.flex` and `.flex-col`, overriding Tailwind breakpoint utilities. Removing that redundant block restores the desktop catalog sidebar and hides its mobile-only filter toggle. The regular stylesheet already blocks rendering, so the duplicate was unnecessary. The catalog receives an H1 even without a featured product.

Language declarations now live on the server-rendered localized wrapper, and a tiny layout effect updates `document.documentElement.lang` before paint and on locale changes. The shared root HTML response still declares Latvian; the nested content has correct SSR language even without JavaScript. The final guard avoids assigning an already correct language, preventing unnecessary inherited `:lang` style invalidation; all four language unit checks passed independently. A future locale-specific root layout can remove that remaining root-level limitation without sacrificing static rendering.

The canonical HTTPS admin PATCH origin now reaches authentication (401 for anonymous requests) through the loopback listener; an attacker origin still gets 403. This verifies the reverse-proxy origin fix without performing an administrator mutation.

## Public deployment verification

After activation of release `a8eb51c89f598e215b24b122f1c86f0ea5a01b57`, the independent specialist reran the complete suite against **https://lago.lv**, through Cloudflare and Apache. **All 25 smoke checks passed in 40.7 seconds**, without retries. Application behavior matches the tested `e0c30a3` candidate. This public run verifies the deployed path separately from loopback-origin checks; it is not a Core Web Vitals benchmark or successful authenticated-account acceptance test.

The public checks verified all three locales and document languages, material/application routes and images, sitemap URL reachability/indexability, real 404 status, readiness, private cache headers, anonymous admin/account denials, canonical-origin admin PATCH reaching authentication, attacker-origin rejection, desktop/mobile store controls and controlled browser interaction behavior. Login, recovery email requests and catalog result fixtures remained intercepted; no accounts, emails, orders, payments or profile mutations were created.

Reproduce the public read-only suite:

```bash
PLAYWRIGHT_BASE_URL=https://lago.lv npx playwright test --config=playwright.smoke.config.ts
```

## Focused regression checks

Independent tests added:

- `src/__tests__/unit/modal-dialog-accessibility.test.tsx`: focus entry, both tab directions, Escape, invoking-control/scroll restoration, actual signup dialog semantics.
- `src/__tests__/unit/locale-document-language.test.tsx`: English entry and Russian/Latvian client-navigation language declarations.
- `src/__tests__/unit/guest-session-isolation.test.tsx`: no storage/session work before activation; A/B/guest cart and email separation; correct per-user restoration.
- `src/__tests__/smoke/quality-regression.spec.ts`: production-safe anonymous security/cache checks, cross-origin rejection, mocked login/recovery feedback, invalid callbacks, mocked catalog race/deep links/history, and all sitemap URLs.

The independent specialist personally ran 23 focused tests across seven security-related files and inspected their assertions, then reran all four language unit checks after the final guard. All passed. The lead integration run reports 233 passing unit tests; the independent specialist did not substitute that report for its focused checks and production browser verification. This covers controlled in-process behavior, not a real Supabase login or mailbox delivery.

Reproduce against a running production candidate:

```bash
npx vitest run src/__tests__/unit/account-isolation.test.tsx src/__tests__/unit/cart-session-runtime.test.tsx src/__tests__/unit/auth-callback-retry.test.tsx src/__tests__/unit/modal-dialog-accessibility.test.tsx src/__tests__/unit/guest-session-isolation.test.tsx src/__tests__/unit/auth-private-delivery.test.ts src/__tests__/unit/account-recovery.test.ts
PLAYWRIGHT_BASE_URL=http://127.0.0.1:3200 npx playwright test --config=playwright.smoke.config.ts
```

The existing legacy `src/__tests__/e2e/` suite assumes selectors and uncontrolled credentials that do not match the current app; it also contains mutating registration/password/payment journeys. It was preserved and was not executed against production. The explicit smoke configuration starts no development server and makes no real account, mail, order or payment mutations; login/recovery/catalog interactions are intercepted in the browser.

## Acceptance boundaries

The lead obtained fresh authorized SQL evidence of one verified reserved-owner Auth user, its profile and UUID-attached administrator grant; the earlier no-users/pending-owner report is stale. No controlled test credentials, OAuth provider credentials or test mailbox are available to this verification workstream. Registration confirmation, successful real sign-in, persisted authenticated profile editing, real recovery email consumption, authenticated admin profile editing/audit creation and live cross-user authorization remain unverified. Unit coverage and anonymous denials cannot establish those successes. Missing commerce tables also prevent real catalog/cart/checkout database acceptance. Existing `cart_session` API and `guest_session_id` client paths remain distinct and need a separate reviewed commerce integration migration before activation.
