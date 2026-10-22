# Supabase baseline proposal

As of 2026-10-18 the configured project API is reachable and accepts the supplied
publishable/secret keys. Public REST metadata reports no exposed definitions and
`products` returns PGRST205 (table not found). This does not establish that all
internal schemas are empty. No customer records were fetched and no database
writes were performed.

`supabase/migrations/20261018000000_production_baseline.sql` is a **reviewed proposal,
not an applied migration**. It initializes profiles, addresses, categories and
products only. It contains no DROP, TRUNCATE, data deletion, demo product seeding,
admin assignment, or existing-user backfill. CREATE TABLE intentionally fails if
any baseline table already exists; execution is transactional and must stop on
any error. Review actual PostgreSQL schema and trigger inventory before applying.
PostgreSQL parser validation passed (34 statements); the SQL has not been
executed against a PostgreSQL database in this session.

Use Supabase Dashboard SQL Editor for the exact project, or provide a direct
PostgreSQL connection through a server-side secret file (host, username, database,
port and password, TLS required). A suitably scoped Supabase Management API access
token is another option. Supabase `sb_publishable_` and `sb_secret_` application
keys authorize the Data/Auth APIs; they do not authorize arbitrary SQL DDL or
Management API project settings. Do not paste connection credentials in chat.

Do not import `supabase/schema.sql`, `docs/schema/supabase-schema.sql`, or the
historical orders migration. Do not run `supabase db push` over the current mixed
migration directory: it would also apply the unreconciled legacy orders design.
Apply only the explicitly reviewed baseline using SQL Editor or `psql` with
`ON_ERROR_STOP=1`. Archive/rebaseline migration history in a separate reviewed
change before adopting automatic schema deployment.

The proposal uses the localized fields expected by Sanity sync and read-only
generated compatibility aliases (`name`, `price`, `image`, `is_available`) expected
by the current catalog and cart code. Draft products are hidden by RLS. Private
cost prices are deliberately absent from publicly selectable products. Profile
updates cannot change email/id or any authority field; admin authority remains
server-managed Auth app_metadata. New Auth users receive profiles via a trusted
trigger. Existing Auth users require a separately reviewed additive backfill.

Auth configuration still requires site URL `https://lago.lv`, exact callback URL
`https://lago.lv/auth/callback`, enabled intended providers, and a working email
sender. These dashboard settings are not changed by the SQL proposal.

## Deferred commerce acceptance

Payments must remain `PAYMENTS_ENABLED=false`. Current browser cart hooks operate
directly on guest carts, but there is no secure database session binding for their
guest identifiers. Do not solve that by opening guest-cart SELECT/UPDATE access.
Route guest-cart actions through authenticated server endpoints with verified
HttpOnly ownership credentials, then implement and test their RLS contract.

Orders currently have conflicting field conventions across checkout webhook and
admin endpoints. Reconcile to one schema and implement an atomic transactional
order/stock RPC with webhook event uniqueness before enabling payment writes.
Do not apply the legacy decrement_stock function: its parameter names differ from
current code and silent insufficient-stock behavior is not suitable for payment
fulfillment. Verify duplicate webhook retries, stock contention, customers unable
to read other customers' orders, and unauthorized admin denial in a separate
staging project before production activation.

The portfolio does not require commerce tables; contact form delivery currently
uses an email provider, not Supabase. This baseline alone does not make checkout,
admin order management, CMS edits or contact delivery operational.
