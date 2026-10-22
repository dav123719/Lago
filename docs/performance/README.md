# LAGO engineering and performance evidence — October 22, 2026

This pass preserves the existing Latvian, English and Russian brand/content, public URL architecture, APIs and account model. Six specialist workstreams inspected first, then implemented separate scopes: frontend runtime; assets/delivery; backend/database; cleanup; account security; independent verification. The lead reviewed integration, ran checks and compares a production standalone build against the preceding live release.

## System and coverage

Ubuntu VPS → Cloudflare HTTPS → existing Apache → unprivileged `lago` systemd service → Next.js16.4.2 standalone/React19.3.1, Node22.23.3/npm10.9.9. Supabase project `nzqwnumtldkugceahskk` (eu-west-1) stores Auth/profiles/roles/audit. Sanity supplies CMS content/images; local content supplies application/material guidance and localized projects. npm lockfile remains authoritative. Original `/root/Lago` and unrelated vhosts/services were preserved; isolated existing-repository worktree `/tmp/lago-publish` was used.

| Subsystem / route family | Inspection and representative verification | Limits |
| --- | --- | --- |
| `/lv/`, `/en/`, `/ru/`; header/footer, material/application guidance | Production browser desktop/mobile; three-run LCP/CLS/network captures; language and navigation checks; homepage image/font delivery | No comparable field-user dataset yet |
| Localized surfaces/materials, furniture, about and project routes (`[...slug]`) | Deep measurements on LV guide and Silestone detail; sitemap HTTP/canonical/indexability sweep covers all public entries | Repeated templates are smoke-tested, not individually benchmarked |
| `/[locale]/projects` and `/[locale]/projects/[slug]`, Sanity content/edit UI | Static/dynamic routing reviewed; real project navigation; admin editor deferred and correct selected project tested | Live CMS writes not performed |
| `/[locale]/store`, `/store/product/[slug]`, filters/sort/pagination/stock | Production error-state measurement plus mocked successful catalog/race/history journey; explicit queries, parallel shell reads; product stock request tests | Commerce tables absent, so live catalog/detail purchase data unavailable |
| Cart/checkout/success, addresses/orders and admin orders | APIs/ownership/Stripe/webhook source reviewed; scoped cart lifecycle, stale identity isolation and order pagination/validation tests | Guest client/API ownership contracts differ; payments remain disabled; no actual purchase/order/address acceptance |
| `/[locale]/account`, Auth dialogs and `/auth/*` | Profile/recovery/session/callback/races/focus unit coverage; anonymous protected redirect/no-store; intercepted login/recovery browser feedback | Real successful sign-in, mail delivery, persisted profile changes and identity linking require controlled credentials/inbox/provider setup |
| `/admin/profiles`, private roles/audit/bootstrap | Authoritative user+RPC authorization, search/edit races, malformed/cross-origin denial, proxy-origin regression; actual DB aggregate owner grant check; isolated SQL bootstrap replay test | No credentialed browser admin edit/audit creation |
| Supabase schema/RLS/functions/triggers/indexes | Live introspection; additive bootstrap fix applied; real authenticated-role EXPLAIN ANALYZE read queries with synthetic nonowner UUID | Only one current user/profile; tiny-data timings are not scale evidence; no production load test |
| Contact, shipping rates/lockers | JSON validation/errors; shipping deterministic calculation tests; inspected carrier behavior | Outbound email not sent; DPD mock/Omniva fallback require verified carrier integration |
| Preview/project update, Sanity/Stripe webhooks | Guard/signature/source inspection and existing tests where configured; no changes to provider secrets | External webhook delivery and preview mutations not exercised |
| Assets/fonts/CSS/images/JS, build/test/deployment | Real production byte traces; glyph-subset manifest; truthful route gzip budgets; CI build/test gate; immutable release health/rollback; Apache private headers | No asset deletion based on single-route coverage; no broad CDN cache rules changed |
| Observability | First-party sampled numerical Web Vitals logs, bounded payload/log rate; error URL redaction | No paid monitoring, persistent visitor ID, raw URL or account content added |

See [frontend](frontend.md), [assets](../assets-delivery.md), [backend](backend.md), [account security](account-security.md), [cleanup/removal manifest](cleanup.md), and [independent verification](independent-verification.md).

## Implemented behavior and evidence

- Defer auth forms/profile menu/cart drawer and project editor until needed, with immediate loading feedback. Public informational pages no longer create/query a cart or guest ID. Same-user refresh preserves the profile; save returns its confirmed row without a second read.
- Cancel/ignore obsolete catalog and admin queries, preserve useful results on refresh/failure, retry pagination without skipping pages, and keep filters/sort/back/forward deep links. Initial catalog requests fall from three to one in the measured interaction journey. Listing stock snapshots avoid one initial REST call per product card; realtime/manual refresh retained.
- Load only the active hero image initially; prepare the next after first load and pause animation when hidden/reduced motion. LCP image remains early/priority, existing image quality retained.
- Replace broad Latin Extended font fetches for Latvian characters with small content-hashed font overlays, retaining original full glyph fallbacks, Cyrillic faces, variable axes and branding. Reproducible sources/tool versions/sizes: `public/fonts/latvian-subsets.json`. No app dependency added.
- Remove duplicate late inline CSS: it overrode responsive Tailwind rules, stacking desktop store filters incorrectly. Localized SSR content has correct `lang`; a tiny component synchronizes document language during hydration/navigation. Root document's raw SSR `html` language remains Latvian because locale is below the root layout; localized content is explicitly scoped without making every page dynamic.
- Bound/validate admin order list requests and projections; run independent store-shell reads concurrently; reject malformed contact/shipping payloads and unsafe values. Remove trivial unbounded process-local shipping cache.
- Keep profiles/roles/private responses isolated; reject stale A→B→A async work. Recheck admin UI after auth/visibility changes; database authorization remains authoritative. Admin profile mutation compares browser origin with configured public origins, fixing the Apache loopback-URL mismatch without trusting forwarded-host input.
- Dialog focus trap/Escape/restore, recoverable profile-loading UI, safe idempotent callback exchange and UUID/expiry-scoped recovery state. No owner password changes, mail sends, verification bypass or metadata-derived roles.
- Fix error-report sampling/redaction/transport isolation and preserve compiler failure status. Only verified unused component deleted: `ToastProvider.tsx` (29 lines, already unbundled). No migrations, pending account features, CMS assets, tests or dependencies deleted.

## Measurement protocol and reproduction

Baseline local source `d511142`, live release `d04bc9abc3b2102dffe20a64ec0441930204a3bb`. Build mode is production `dist/standalone/server.js`, not development. Measurements run from this VPS; its geographical location was not independently established. Supabase region is separate from browser region. Raw captures include browser/Playwright/Node versions, CPU count, timestamps, routes, headers allowlist, resource waterfall, DOM/load timings, long tasks and cache conditions.

Three fresh anonymous contexts per route/device, each cold HTTP browser cache then warm repeat. Reduced motion, DPR1. Desktop1440×900, CPU1×, configured20ms/10Mbps down/2Mbps up. Mobile390×844 touch, CPU4×, configured80ms/1.6Mbps down/750kbps up. Server/CDN caches not purged. Loopback TTFB is observed as local latency; configured CDP throttling is not an Internet RTT or mobile hardware guarantee. No parallel builds/tests during final measurements. Five representative public routes include heaviest observed loading and store/list error state. Account/admin anonymous redirects/APIs have three HTTP samples; private success rendering remains unmeasured.

```bash
npm ci
npm run lint
npm run test:unit
# Set the existing safe build environment; never print or commit secrets.
npm run build
npm run type-check
npm run check:budgets
# In a separate process, copy public + dist/static into dist/standalone and run:
PORT=3200 HOSTNAME=127.0.0.1 NODE_ENV=production node dist/standalone/server.js
PERF_BASE_URL=http://127.0.0.1:3200 PERF_RUNS=3 \
  PERF_OUTPUT=docs/performance/after-origin.json node scripts/performance-measure.mjs
PERF_BASE_URL=http://127.0.0.1:3200 \
  PERF_OUTPUT=docs/performance/after-interactions.json node scripts/performance-interactions.mjs
PLAYWRIGHT_BASE_URL=http://127.0.0.1:3200 npx playwright test -c playwright.smoke.config.ts
# Isolated SQL only, tool installed outside app (never run SQL fixture on production):
node scripts/verify-owner-bootstrap.mjs /tmp/lago-sql-validation/node_modules/@electric-sql/pglite/dist/index.js
```

Detailed waterfall JSON is versioned compressed (`*-origin.json.gz`); read with `gzip -dc FILE | python3 -m json.tool`. Numeric summary/table is generated alongside these files. Script interaction feedback is event→second animation frame, NOT INP. Search/navigation timings terminate at the current catalog500 response; they do not measure successful results. Observed long-task excess is neither INP nor Lighthouse TBT. No Lighthouse score or field p75 is inferred. A separate Cloudflare-path benchmark timed out after one completed pair; it provides no three-run public median and is excluded from comparisons.

## Results and completed checks

Full tables, all five routes, mobile/desktop cold/warm medians and observed ranges: [results.md](results.md); numerical detail [comparison.json](comparison.json). Raw sanitized waterfalls: `baseline-origin.json.gz`, `after-origin.json.gz`. Runtime source is local commit `e0c30a3`; subsequent source commits add evidence, fixture tests, CI checks and documentation only.

Mobile cold homepage LCP2648→1268ms (ranges2580–2648 and1172–1312), page weight779661→627176B. Font transfer278921→151847B (45.6% reduction). Unique initial home JS gzip290020→282979B (about2.4% reduction); shared CSS18045→18285B (+240B for font rules). Guide LCP1244→1052ms, projects2612→1540ms, Silestone3284→1980ms. Store remains3272ms and a broken catalog500 state, so it does not meet the2.5s lab target or successful-shopping acceptance.

Results remain mixed beyond loading: desktop project LCP median228→312ms within the wide original196–748ms range; desktop navigation-to-terminal-error205→235ms and search423→443ms; mobile navigation624→651ms while typing42→35.5ms and menu feedback100→84.7ms. One initial catalog request replaces three, but failed-query timing is variable and is not useful-results performance. No claim of faster runtime across every route is made.

[CPU investigation](cpu-investigation.md) uses three paired traces and a controlled three-pair experiment. Earlier candidate Silestone script time improved733→639ms while a redundant `html.lang` assignment caused full-page style invalidation. The implemented equality guard removes that work. Final unprofiled mobile observed long-task excess is homepage718→663ms, guide453→555ms, projects585→627ms, store496→499ms, Silestone540→564ms. Guide/project rendering remains an opportunity; font completion is more staggered despite lower payload and earlier LCP. These sums are not field INP or Lighthouse TBT. The prior intermediate captures are retained separately to explain the investigation, while the final comparison uses all three fresh runs from the corrected build.

- Baseline:113 unit tests /9files; TypeScript/build passed; lint0errors/64warnings.
- Integrated:233 unit tests /29files; TypeScript and production build passed; lint0errors/60warnings;125 prerendered route bundle checks passed.
- Independent:25 safe production browser checks passed, plus desktop/mobile review; lead separately inspected representative screenshots and API/SQL/source behavior.
- Isolated PostgreSQL: old bootstrap replay reproduced; additive fix applies twice;7 real-role assertion groups including25 explicit privileged-operation denials passed. Lead independently reran the complete runner.
- Apache syntax check and graceful reload passed after expanding private cache coverage to localized accounts; unrelated vhosts untouched.
- Legacy mutating E2E suite, real inbox/OAuth/authenticated browser profile/admin journeys and production commerce acceptance remain unverified for the reasons above. Security fixtures exercise actual PostgreSQL permissions with emulated JWT subjects, not real Supabase token issuance.

## Database, external configuration and security

Original migration `20261022170145_lago_account_system.sql` remains unchanged. New `20261022193626_lock_owner_bootstrap.sql` is applied and the live durable guard verified. It prevents a consumed bootstrap reopening if FK `granted_to` becomes NULL after account deletion. Existing profiles/roles/audits retained. Old-function SQL replay is reproduced in isolated PostgreSQL18.6/PGlite0.5.11, then fix applies twice and denies replacement-account grants; verification/role/search-path restrictions checked. No indexes added without evidence. Live authenticated-role nonowner lookup uses `profiles_pkey`; one read executed in0.102ms and admin-check RPC in1.344ms on one-row data. Those are isolated diagnostics, not before/after scale improvements.

Fresh aggregate confirms the verified `ddabbis@gmail.com` user owns one profile and one UUID-based admin grant. This supersedes historical pending/empty-user reports; browser login/admin-edit success is still unverified. Supabase Site URL was incorrectly localhost and is now configured/read back as `https://lago.lv`, with narrow production/development callback paths and query patterns; prior URL config backed up. Google/Facebook remain disabled without provider credentials. Custom SMTP is absent: configure SMTP host/port/TLS/username/password and verified sender, then controlled confirmation/recovery/email-change inbox tests. Built-in email request success alone is not delivery proof. Never submit personal owner passwords for testing.

Live introspection found only public `profiles` plus private role/audit/bootstrap tables; no commerce schema. Historical competing commerce SQL must not be blindly applied. Do not enable checkout before a reviewed schema/RLS/guest-ownership integration and staging payment tests. No production scale fixtures or load tests were created.

## Cache, budgets and monitoring

Public hashed Next assets and new content-addressed fonts: immutable one year; changing bytes creates a new URL. Original public filenames retain revalidation-compatible freshness. Public prerendered content follows Next cache/ISR headers; CMS freshness follows existing Sanity webhook/revalidation behavior. No new shared HTML cache rule or service worker added. Account/admin/auth/studio/private APIs and refreshed session responses: private/no-store at application and Apache. All APIs remain no-store at Apache. Client account/cart state is scoped to UUID/request generation; role checks on every privileged mutation cannot be replaced by a stale UI cache.

`performance-budgets.json` is a deterministic unique initial HTML script/CSS gzip check across125 prerendered routes (framework runtime included); approximately10% JS/CSS headroom and a conservative40kB HTML ceiling. CI and approved deployment build fail on regressions. Dynamic/private and interaction chunks require separate browser coverage. Targets remain mobile/desktop field p75 LCP≤2.5s, INP≤200ms, CLS≤0.1, with~100ms feedback aspiration. Lab timings below are not those percentiles. Suggested journey guardrails: one initial catalog request, no document reload for filters/back, and stale response rejection (automated).

Web Vitals:10% per-page random sampling, no persistent user identifier, only LCP/INP/CLS number + coarse initial-document group and mobile/desktop. Endpoint caps512B and300 accepted metrics/minute with private/no-store. Existing systemd journal stores bounded accepted numerical log entries. No automatic public dashboard or paid service. Aggregate after excluding this test window:

```bash
journalctl -u lago --since '2026-10-23' --no-pager -o cat | node scripts/summarize-vitals.mjs
```

Aggregator refuses p75 for groups with fewer than100samples; this is a reporting floor, not proof that samples represent real-user population. Disable with `NEXT_PUBLIC_WEB_VITALS_ENABLED=false` at build. No field dataset is claimed yet.

## Deployment and rollback

GitHub `dav123719/Lago` is authoritative. Work was done on an isolated local optimization branch, preserving original dirty checkout/history. Existing main-only production workflow remains manually authorized; no branch protection bypass or untrusted root runner introduced. Repository API confirms this is the existing non-fork `dav123719/Lago`, default `main`, branch reports protected=false and repository rulesets are empty. The connector cannot read the administration-only protection endpoint (403); there is no evidence that a mandatory PR rule caused the current branching. Plain Git transport lacks credentials and the connector ref-update endpoint previously fails internally, so publish through a new working branch rather than rewriting or blindly replacing main. See `github-workflow.json`. CI validates npm lockfile/build/tests/typecheck/critical audit/budgets. A separate CI job installs pinned PGlite0.5.11 outside application dependencies and runs bootstrap plus real-role RLS fixtures without any production credentials. Deployment helper is root-owned and validates archive SHA/path/file types, switches immutable releases atomically, runs unprivileged service, health-checks and automatically restores previous release on failure. Keep `/etc/lago/production.env` separate from source/artifact and writable cache under `/var/cache/lago/RELEASE`.

Before activation, build/candidate test; package standalone with public/static, excluding secrets/symlinks; stage `/srv/lago/incoming/COMMIT.tar.gz`; invoke `/usr/local/sbin/lago-release COMMIT SHA256`. Back up only relevant Apache config, `apache2ctl configtest`, graceful reload. Existing virtual hosts preserved. To manually restore a retained release: atomically repoint `/srv/lago/current` to the prior release and restart only `lago`, then check local/public health. Do not roll back the applied security migration to the replay-vulnerable function. Callback URL restoration backup exists under root-only deployment backups; restoring localhost is not an appropriate normal rollback.

## Live release verification

Activated GitHub source commit `a8eb51c89f598e215b24b122f1c86f0ea5a01b57` using the verified archive and existing rollback helper. Its source tree matches local evidence commit `340da21`; application files match measured runtime source `e0c30a3`. Follow-up commits contain operational verification/configuration evidence. Previous release `d04bc9abc3b2102dffe20a64ec0441930204a3bb` remains available for rollback.

The actual **https://lago.lv** path passed **25/25 independent browser smoke checks in40.7s**, without retries. Lead HTTP checks passed18 assertions across public/localized pages, health, canonical HTTPS redirects, private redirects/API denial, trusted-vs-attacker origin and font freshness. Origin TLS verifies normally (curl verification result0). Lago and Apache are active; application process runs as `lago` and systemd startup is enabled. Sample hashed JS/CSS return correct MIME types, gzip, immutable one-year freshness and Cloudflare HIT. Details: [deployment-verification.json](deployment-verification.json).

Standard combined access logs could record callback query codes and referring callback URLs. The Lago-only named access format now records method/path/protocol without query and replaces referrer with a constant. All three Lago vhosts use it; unrelated vhost logging is unchanged. Config was backed up, syntax-tested, gracefully reloaded and independently reviewed. A synthetic origin-TLS probe verified query/referrer omission; old logs were retained. Cloudflare rejected the synthetic query/referrer probe403, so origin TLS isolated the logging test; normal public/browser checks passed. No WAF policy was weakened. [Apache log format reference](https://httpd.apache.org/docs/2.4/mod/mod_log_config.html).

Production3100 now serves the new release. To reproduce the historical comparison, start the retained baseline on an unused loopback port such as3201 and the candidate on3200 using the existing authorized environment, then set `PERF_BASE_URL` or `CPU_ENDPOINTS` explicitly. Do not stop or rebind live3100. Capture metadata records the historical endpoints used during this pass.

## Remaining findings, by impact/effort

1. High: complete verified commerce schema/ownership/carriers/payments before offering checkout. Requires coordinated product/data migration, not a speed-only patch.
2. High: supply controlled mailbox/session and provider credentials; verify genuine confirmation/recovery/profile/admin edit/audit and cross-user RLS with live identities. No personal password reset needed.
3. Medium: audit retained transitive vulnerabilities individually. Current audit:0critical/13high/8moderate total; production dependency graph0critical/10high/6moderate, including Sanity tooling. Some suggested fixes change/downgrade major framework tooling. No blanket upgrades/overrides performed; no exploitability conclusion from counts alone.
4. Medium: shared initial JavaScript still includes site header/Auth/Supabase/UI; further server/client boundary work needs separate profile-guided review. Per-card realtime subscriptions remain for live stock.
5. Medium: legacy browser E2E suite assumes missing test IDs/fictional products and uncontrolled mail/payment mutations; retained, documented, not run against production. Current safe smoke suite uses real accessible selectors/interceptions.
6. Low: root raw SSR `html lang` remains LV while localized content and hydrated document use correct language. Moving to per-locale root layouts is a broader routing change intentionally deferred.

## Primary documentation consulted

[Core Web Vitals definitions/field targets](https://web.dev/articles/vitals), [LCP resource delivery](https://web.dev/articles/optimize-lcp), [code splitting](https://web.dev/learn/performance/code-split-javascript), [HTTP caching](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Caching), [Supabase query optimization](https://supabase.com/docs/guides/database/query-optimization), [RLS performance/security](https://supabase.com/docs/guides/database/postgres/row-level-security), [Next lazy loading](https://nextjs.org/docs/app/guides/lazy-loading), [Next useReportWebVitals](https://nextjs.org/docs/app/api-reference/functions/use-report-web-vitals), [Supabase redirect URLs](https://supabase.com/docs/guides/auth/redirect-urls), [Apache headers](https://httpd.apache.org/docs/2.4/mod/mod_headers.html).
