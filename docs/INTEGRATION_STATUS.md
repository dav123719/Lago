# Integration acceptance gates

The website can run with existing portfolio content while external integrations are unavailable.

- Supabase is now reachable and the supplied publishable and secret keys validate against its Data/Auth APIs. Required public tables (including profiles and products) are missing. No database changes were made. The reviewed baseline proposal in docs/SUPABASE_BASELINE.md requires connected SQL/management access before application. The verified keys are installed in private build/runtime configuration; the publishable key is embedded at build time while the secret stays server-only. Verify Auth redirect URLs and one authoritative database schema before enabling cart/auth/order workflows.
- Sanity API responds, but the configured production dataset contains zero project documents. Published projects fall back to the repository's original portfolio content. Supply a least-privilege token and verify Studio/admin login before using CMS writes.
- Stripe/email values in the original environment appear to be placeholders. Payment enablement requires `PAYMENTS_ENABLED=true` and must remain off until database ownership/RLS, transaction atomicity, webhook retries/idempotency and test-mode checkout have passed. Configure real keys only after those gates.
- Contact submission now uses Resend and reports HTTP 503 if sending is unavailable; it no longer falsely reports successful delivery or logs personal message contents. Verify sender domain and delivery with controlled recipients.
- Admin authority uses server-managed Supabase app_metadata.role. Public profile role fields and email domain are not authority. Assign admin app_metadata through a trusted administrative process and verify RLS.
- Existing database SQL files are competing designs, not a safe sequential migration set. Do not import them into a populated database without reconciliation and explicit approval for destructive changes.

No real payment, customer database write, or contact email was performed during deployment verification.
