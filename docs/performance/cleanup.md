# Maintainability and verified cleanup

This workstream reviewed dependency references, standalone helpers, error reporting,
legacy browser tests, and maintenance scripts in the existing application. It did
not treat absent ordinary imports as evidence that framework routes, CMS assets,
migrations, account features, or public files were disposable.

## Implemented fixes

- `src/lib/error/reporting.tsx`: remove query strings and fragments from automatically
  attached page URLs. Supabase confirmation/recovery callbacks can contain
  authentication codes or access tokens in those locations. This does not promise
  automatic scrubbing of arbitrary caller-supplied messages/context; callers must
  not put credentials there.
- Apply the configured sampling and `beforeSend` redaction hook to global events
  and explicit captures consistently. A sample rate of `0` now sends no events
  (previously `0 || 1` enabled every explicit error).
- Guard browser-only `navigator` access during server-side reporting, fall back to
  fetch when `sendBeacon` rejects its queue, and isolate transport/serialization
  exceptions so reporting cannot break an error boundary.
- No reporting endpoint or paid monitoring service was added. `initErrorReporting`
  currently has no application initialization caller, so these are correctness and
  privacy safeguards for existing helpers, not a measured production speed gain.

- `scripts/check-types.sh`: preserve the compiler exit status and complete
  diagnostics. The previous `tsc | head -30` pipeline could return success for
  type errors because it returned the status of `head`. Arguments are forwarded.

## Removal manifest

| Removed item | Evidence | Effect |
| --- | --- | --- |
| `src/components/providers/ToastProvider.tsx` (29 lines) | Whole-repository text search found no import, export, dynamic reference, or configuration reference; it is an ordinary component outside file-routing directories. `src/app/[locale]/layout.tsx` renders its own active Sonner `Toaster`. | Removes an unused duplicate wrapper; no claimed JavaScript savings because it was already outside the active dependency graph. |

No dependencies, migrations, authentication flows, public/CMS assets, or legacy
tests were removed.

## Dependency decisions

- Keep `styled-components`: `npm explain styled-components --depth=2` confirms
  required peers of Sanity, `next-sanity`, `@sanity/vision`, and `@sanity/ui`.
  Lack of a direct app import is insufficient evidence for removal.
- Keep `@stripe/stripe-js`: `src/lib/stripe/client.ts` exposes checkout helpers
  through `src/lib/stripe/index.ts`. Its wrapper currently has no active consumer,
  while server checkout integration exists. Removing unfinished checkout tooling
  requires a product decision, and it does not currently burden public bundles
  merely by being installed.
- Keep `@sanity/vision`, `@sanity/webhook`, `@sanity/client`, `@sanity/image-url`,
  `next-sanity`, and `sonner`: each has concrete configuration, API, migration,
  image-builder, studio, or UI consumers.
- No mass major-version upgrades were attempted for transitive tooling advisories.
  Security updates need individual compatibility checks and a lockfile review.

## Legacy browser-test drift

The existing `src/__tests__/e2e/{auth,projects,purchase}.spec.ts` files are retained,
but are **not reliable acceptance evidence** for the implemented UI:

- They rely on `data-testid` selectors that do not exist in application source
  (`rg -n 'data-testid=' src --glob '!**/__tests__/**'` returns no matches).
- Auth tests assume login/registration tabs, first/last-name forms, and immediate
  post-registration access. Current auth uses modal forms, a full-name field,
  confirmation email, and a separate recovery route.
- They hardcode `test@example.com` credentials and create registration addresses
  without a controlled mailbox. Running these blindly can send real email or
  mutate shared accounts.
- Project and purchase tests assume fictional `test-project` and `test-product`
  detail slugs rather than discovering real fixtures.
- Project assertions such as `expect(locator).toHaveCount.greaterThan(0)` are not
  Playwright assertions and fail when reached.
- Purchase tests assume an unimplemented `/checkout/payment` navigation and
  prepopulated carts. These are test assumptions, not proof of a working order.

Do not delete these tests or turn them into unconditional skips to obtain a green
check. Replace assumptions incrementally with actual accessible UI selectors and
controlled fixtures. Use `playwright.smoke.config.ts` for current read-only
production smoke tests; authenticated email/payment journeys additionally require
controlled test identities, mailbox/provider configuration, and nonproduction
payment fixtures. Browser tests using stubs must be described as application
coverage rather than verification of external delivery.

## Reproduction

```bash
npx vitest run src/__tests__/unit/error-reporting.test.ts
npx eslint src/lib/error/reporting.tsx src/__tests__/unit/error-reporting.test.ts --no-warn-ignored
npm explain styled-components --depth=2
rg -n 'ToastProvider' src sanity scripts .github
rg -n 'data-testid=' src --glob '!**/__tests__/**'
```

Focused reporting regression tests: 7 passed. A temporary stub `npx` returning
exit status 42 confirmed `scripts/check-types.sh` returns 42 (and forwards compiler
arguments); no repository compiler binary or project data was changed. Targeted lint: passed without
warnings. Final integrated build/typecheck/unit/browser results are recorded by
the lead verification report, rather than inferred from this helper-only check.

## Maintenance risks

- `scripts/build.sh` and `scripts/fix-common.sh` remove build output. Only use them
  in an inactive development/release checkout, never the live release directory.
- Broad fallback/error suppression in legacy integrations should be addressed
  against controlled fixtures, not rewritten from static assumptions.
- A disabled or unconfigured integration is retained intentionally when it supports
  an existing product path; missing production credentials remain explicit limits.
