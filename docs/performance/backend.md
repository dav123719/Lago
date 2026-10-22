# Backend and database engineering review

Reviewed 2026-10-22 in `/tmp/lago-publish`, updated with final lead verification evidence in `database-live.json` and `database-verification.json`. Application/database claims below distinguish source inspection, local automated tests, live read-only probes, and the applied additive bootstrap-function migration. No accounts were created, emails sent, or owner passwords changed by this backend workstream.

## Coverage

| Subsystem | Inspection and result | Verification boundary |
| --- | --- | --- |
| Catalog API `/api/products` | Explicit public columns, input bounds, paginated results capped at 48, exact count. Existing validation retained. | Existing 10 unit tests pass; live catalog table absent. Query/index plans unavailable. |
| Store server metadata | Five independent requests (categories, min/max prices, material/finish attributes, featured product) previously serialized. Start all together. Replace category/featured wildcard selections with the fields actually consumed. Preserve a genuine zero maximum price with `??`. Empty min/max reads use `maybeSingle`. | New test proves all five requests start while every response is still pending, and validates zero handling and explicit projections. This establishes waterfall removal, not a measured production TTFB improvement. Store data can be prerendered at build time; benefit depends on rendering mode. |
| Shipping quote API | Calculation is a short traversal of configured methods, with no network/DB I/O. Remove unbounded arbitrary-key process Map and associated unused exports. Validate country, finite/nonnegative monetary/weight inputs, malformed JSON, and 4 KiB body cap; return `no-store`. Avoid retaining submitted address/contact data. | 20 focused quote tests; normal/free/weight-limited quotes, malformed inputs, and distinct quote requests. Calculation and existing configured methods retained. |
| Shipping locker APIs | Inspected carrier helpers and nearest/search path. Existing DPD results are mock data; Omniva has hardcoded fallback locations. Combined nearest sort returns zero and does not globally sort carrier results; inputs have weak bounds. | Not changed. Carrier directory must be verified before commerce launch. Do not treat existing fallback results as verified current delivery locations. |
| Contact `/api/contact` | Existing origin/body-size/type/field validation and escaped email retained. Malformed JSON now returns 400 instead of 500 without attempting email delivery. Removed obsolete comment claiming the endpoint only logs submissions. | Existing four tests plus malformed-JSON regression pass, with mocked email transport. Actual delivery remains unverified. |
| Admin order list API | Role guard remains authoritative before parsing/querying. Positive safe-integer pagination capped at page 10,000 and limit 100, sort/status allowlists, bounded grammar-safe search/customer values, validated date ranges, stable UUID tie-break sorting. List projection omits Stripe identifiers, notes, and full item snapshots; retains item IDs for counts. Private no-store responses and no wildcard CORS. | 24 focused route tests pass, including denied authorization before database access, malformed filters, bounds, safe email/name search and explicit projections. Orders table remains absent; authenticated database behavior is unverified. |
| Cart add/merge/total | Ownership/origin/quantity protections inspected. Merge has serial item lookups/writes; not atomic. Table prerequisites missing. | Existing security tests reviewed. No transaction/index claim or production mutation. |
| Checkout / Stripe webhooks | Prices loaded server-side; payment creation explicitly gated by `PAYMENTS_ENABLED`. Real transaction/idempotency/stock guarantees remain prerequisite work. Checkout currently omits destination/weight validation when selecting a configured shipping method, and attempts locker ID lookup via display-text search. | No real payment/webhook or commerce write performed. Keep payment activation gate disabled until isolated integration testing. |
| Sanity projects / sync / webhooks | Published client uses Sanity CDN; preview uses token and no CDN. Sync and signed webhooks inspected. Project detail can fetch CMS content in metadata and page; list queries unbounded. | No CMS writes or schema mutations. Public local fallback content retained. Database product/category sync cannot work without missing catalog tables. |
| Account profiles / roles / audit | Account migration inspected: profile UUID PK/FK; idempotent provisioning; private UUID-based roles, one-time verified-owner bootstrap, admin audit; own-row RLS uses `(SELECT auth.uid())`; bounded admin search limit 100. | Live schema/policy/index inspection confirms RLS and own-row rules; one verified reserved-owner UUID has a profile and admin role. Authenticated-role read-only EXPLAIN ANALYZE ran with a synthetic non-owner UUID. Actual browser sign-in, email delivery, profile writes, admin edits/audit and provider linking remain pending live acceptance tests. |

## Live database diagnostics

Used server environment from `/etc/lago/production.env` without printing credentials. For table existence, issued a REST request selecting only `id` with `limit=0` using the server key. This reads no user/profile row content.

| Table | HTTP | PostgREST code |
| --- | ---: | --- |
| `profiles` | 200 | — |
| `addresses` | 404 | PGRST205 |
| `products` | 404 | PGRST205 |
| `categories` | 404 | PGRST205 |
| `carts` | 404 | PGRST205 |
| `cart_items` | 404 | PGRST205 |
| `orders` | 404 | PGRST205 |
| `order_items` | 404 | PGRST205 |
| `checkout_sessions` | 404 | PGRST205 |
| `order_status_history` | 404 | PGRST205 |

Anonymous `GET /rest/v1/profiles?select=id&limit=0` with the publishable key returned 401 / 42501 (permission denied), as expected. The same profile query with `Accept: application/vnd.pgrst.plan+json` returned 406 / PGRST107: REST query plans are not enabled.

The lead subsequently used the existing authorized Supabase Management API access for SQL metadata inspection and read-only query analysis. The initial role-context attempt in `database-live.json` failed with permission denied; the corrected check in `database-verification.json` confirms `current_user = authenticated` and successful plans. REST query-plan exposure was not enabled.

Live metadata confirms RLS enabled on `public.profiles` and private role/audit/bootstrap tables. Existing indexes are profile UUID primary key, role `(user_id, role)` primary key, bootstrap singleton primary key and granted-to unique key, and audit primary key. Own-profile SELECT/UPDATE policies use `id = (SELECT auth.uid())`, including UPDATE's WITH CHECK. No speculative indexes were added.

| Read-only database operation | Context | Execution time | Planning time | Interpretation |
| --- | --- | ---: | ---: | --- |
| Own-profile lookup under RLS | Actual `authenticated` database role; synthetic non-owner UUID; 0 matching rows | 0.102 ms | 9.255 ms | Plan uses `profiles_pkey` and initialized auth UID predicate. |
| Admin-check RPC | Same authenticated role/UUID context | 1.344 ms | 0.020 ms | Permission-check execution observed; not an admin profile mutation test. |

These are single diagnostic observations on a tiny live database with one Auth user/profile/admin grant, not three-run benchmarks, scale tests, route/API response times, or real-user percentile data. Network and application overhead are excluded. No authenticated owner session or password was used.

Final verification confirms exactly one verified Auth account for the reserved owner, one corresponding profile, one corresponding administrator grant, and consumed bootstrap. This corrects earlier reports that no accounts existed. It does not establish successful browser authentication or editable-profile/admin flows; no owner password was requested or reset.

No production scale/load tests ran. Catalog/commerce tables remain absent, so representative catalog filter/sort/search plans still cannot be obtained. For scale work, use an isolated staging database with synthetic data and realistic authenticated RLS claims, inspect candidate indexes against query plans, and account for write costs. Do not evaluate authorization solely through service-role queries. The old commerce SQL files contain competing designs; do not run `supabase db push` across them blindly. The already-applied account foundation remains unchanged.

## Verification and reproduction

Run from the repository:

```sh
npm run test:unit -- src/__tests__/unit/store-data.test.tsx src/__tests__/unit/shipping-rates-route.test.ts src/__tests__/unit/contact-route.test.ts src/__tests__/unit/products-route.test.ts
npm run test:unit -- src/__tests__/unit/admin-orders-route.test.ts
npm run type-check
npx eslint src/app/api/shipping/rates/route.ts src/lib/shipping/rates.ts src/app/api/contact/route.ts 'src/app/[locale]/store/page.tsx' src/__tests__/unit/shipping-rates-route.test.ts src/__tests__/unit/store-data.test.tsx src/__tests__/unit/contact-route.test.ts
```

Workstream results: 36 tests passed across the initial four files; an additional 24 admin-order-route tests passed after independent review identified unbounded/unsafe filters. Full TypeScript check passed after the admin-order follow-up; targeted lint passed for both groups without warnings. The lead repeats full checks on the final integrated tree. Existing catalog baseline alone was 10 passing tests. Full-suite/build/browser results are recorded by the lead verification workstream.

HTTPS API timing attempts from Python to the public shipping endpoint received 403 responses, not an application quote. Those request times are excluded from backend performance claims. Direct Supabase REST probes were reachable; existence checks are not query performance measurements.

## Removal manifest and caching rules

- Removed the 55-line rates cache block from `src/lib/shipping/rates.ts` (`getCachedRates`, `cacheRates`, `clearRateCache`, arbitrary-key Map). `rg` confirmed its only consumers were the two quote handlers, now calculating directly. The cached operation performs no upstream request and the Map had no capacity limit or sweep for never-revisited keys. No account data/caching changed.
- Removed unused type imports from the store server page after the fetch refactor.
- Quotes explicitly use `Cache-Control: no-store`; no public or private application cache introduced.
- Store helper concurrency uses the existing anonymous public client and per-invocation results. It does not memoize auth, profile, role, or user-specific data.

## Prioritized remaining work

1. Reconcile/migrate catalog/commerce schema in an authorized staging environment before enabling online commerce. Existing missing-table fallbacks do not establish a working shop.
2. Complete real account tests with controlled identities and a test mailbox; the reserved verified owner already has a profile/admin role, but browser sign-in, profile saves and administrator edits remain unverified. Email confirmation is required; custom SMTP and Google/Facebook providers were not configured at inspection. Auth Site URL/redirect correction is tracked separately by the lead.
3. Verify carrier directory integrations, destination/weight validation and order/payment transaction safety; disable mock directory choices in a separate reviewed commerce change.
4. Replace all-row store material/finish facet reads with an indexed aggregate/RPC once representative schema/data and plans exist. Current REST default row caps can truncate facet discovery in large catalogs. Do not add a production RPC against an absent table.
5. Reconcile duplicate historical database type/schema definitions and obsolete setup documentation against authoritative applied migrations. No migration history deleted.

## Primary documentation consulted

- [Supabase query optimization](https://supabase.com/docs/guides/database/query-optimization)
- [Supabase row-level security and policy performance](https://supabase.com/docs/guides/database/postgres/row-level-security)
- [Next.js route handlers](https://nextjs.org/docs/app/api-reference/file-conventions/route)

## Additive owner-bootstrap security migration

Independent review found a replay edge: the existing `granted_to` FK uses `ON DELETE SET NULL`. Deleting the original administrator retained `granted_at` but made the old function eligible to grant the reserved email again. Applied `supabase/migrations/20261022193626_lock_owner_bootstrap.sql`; this changes only `private.grant_verified_owner_admin()` and requires both `granted_to IS NULL` and `granted_at IS NULL` when locking and updating the pending row. Original applied migration history, the reserved address, verification requirement, row lock, UUID-based role, grant source and execution restrictions are retained. No existing role/audit/profile/bootstrap data is changed.

Migration status: **applied to production through the authorized Management API**. Migration history records version `20261022193626`, name `lock_owner_bootstrap`, alongside account foundation version `20261022170145`. A subsequent live function check confirmed the durable guard is present, with one Auth user and one admin grant preserved. The local migration filename and SQL runner reference were aligned to the server-recorded version. This migration does not run the old foundation's one-off backfill block again.

SQL was executed against PostgreSQL 18.6 in PGlite 0.5.11 with a minimal synthetic Supabase Auth schema. The test first reproduced the bug against the original foundation, then applied the new migration twice and passed assertions for unverified-owner denial, unrelated verified-user denial, pending-email-change denial, verified owner grant, repeated verification idempotency, preservation of grant history after deletion, and no grant to a replacement account. It also checked `SECURITY DEFINER`, empty `search_path`, and denied direct execute for anon/authenticated roles. This is a real isolated SQL/trigger test; it does not verify production Supabase email/identity behavior or two-session concurrency. Single-engine PGlite cannot establish PostgreSQL lock contention behavior; the existing `FOR UPDATE` locking path remains intact.

Reproduce without adding a project runtime/development dependency or starting a database service:

```sh
npm install --prefix /tmp/lago-sql-validation --ignore-scripts --no-audit --no-fund @electric-sql/pglite@0.5.11
node scripts/verify-owner-bootstrap.mjs /tmp/lago-sql-validation/node_modules/@electric-sql/pglite/dist/index.js
```

The runner creates in-memory databases only. `supabase/tests/owner_bootstrap.sql` is strictly an empty isolated-fixture regression script, never a production migration/test command.

Locking/recovery: function replacement runs in one transaction with a 5-second lock timeout and 30-second statement timeout, performs no table rewrite and acquires no bootstrap-row write lock during migration. Failure before commit leaves the prior function in place. Application release rollback does not require undoing this compatible database fix. Do not restore the unsafe function or clear `granted_at`; forward-fix an unexpected integration issue after reviewing the durable consumption record. Recovery of a deleted administrator requires a separate audited, owner-verified privileged process rather than replaying automatic bootstrap.

## Isolated account RLS and administrator RPC integration regression

`supabase/tests/account_rls.sql`, invoked by the same SQL runner, now exercises the unchanged foundation plus applied bootstrap fix using real PostgreSQL roles in the isolated PGlite database. The minimal fixture's `auth.uid()` reads `request.jwt.claim.sub`; each user operation runs under `SET LOCAL ROLE authenticated` or `anon`, not the owner/service role. Three synthetic Auth UUIDs and metadata exist only inside a rolled-back in-memory fixture transaction. There are no production/test-service writes, Auth HTTP calls, password operations or emails.

Seven assertion groups passed:

1. Auth trigger provisions exactly one UUID-keyed profile for each synthetic account.
2. Eight anonymous private-profile/table/function operations are denied.
3. Ordinary user can read/update permitted fields on their own row; cannot see/update another row; editable `role` metadata does not confer admin; repeated `ensure_my_profile()` calls preserve edited fields and profile cardinality. Seventeen privileged operations are denied, including UUID mutation, profile insert/delete, roles/audit/bootstrap reads and writes, and admin search/update RPCs.
4. Switching the JWT subject in the same authenticated database connection exposes only the next user's profile.
5. Clearing the JWT subject reveals no profile/admin authority and denies profile provisioning.
6. Verified-owner admin can search and update another profile using the authorized RPC; an ordinary direct profile UPDATE remains subject to own-row RLS even for that administrator.
7. After resetting to the fixture-owner role only for independent inspection, the audit contains exactly one record with expected actor, target, timestamp and changed profile fields; no-op retry creates no extra audit, role/profile counts remain intact, and the ordinary user's edited name is preserved.

The 25 explicitly denied operations are executed and must raise PostgreSQL `insufficient_privilege`; cross-user UPDATE additionally must affect zero rows. This checks actual PostgreSQL policy/function behavior rather than a mocked Supabase client or SQL-string assertions. All seven groups passed on PostgreSQL 18.6 / PGlite 0.5.11, alongside the existing bootstrap replay regression. Reproduce with the same runner command above.

These isolated tests do not establish live Supabase JWT issuance/session restoration, browser/client cache isolation, confirmation/recovery email delivery, provider linking, persistence through a real login cycle, or production administrator UI/audit behavior. The minimal Auth fixture covers fields consumed by these migrations rather than Supabase Auth's complete managed schema. Two-session concurrency remains untested in the single-session WASM engine.
