# Integration acceptance gates

The website can run with existing portfolio content while external integrations are unavailable.

- Supabase URL from the original environment currently does not resolve. No database changes were made. Supply the active project URL and anon/service keys privately in /etc/lago/production.env (public variables also require a rebuild). Verify Auth redirect URLs and one authoritative database schema before enabling cart/auth/order workflows.
- Sanity API responds, but the configured production dataset contains zero project documents. Published projects fall back to the repository's original portfolio content. Supply a least-privilege token and verify Studio/admin login before using CMS writes.
- Stripe/email values in the original environment appear to be placeholders. Payment enablement requires `PAYMENTS_ENABLED=true` and is explicit and must remain off until database ownership/RLS, transaction atomicity, webhook retries/idempotency and test-mode checkout have passed. Configure real keys only after those gates.
- Contact submission now uses Resend and reports HTTP 503 if sending is unavailable; it no longer falsely reports successful delivery or logs personal message contents. Verify sender domain and delivery with controlled recipients.
- Admin authority uses server-managed Supabase app_metadata.role. Public profile role fields and email domain are not authority. Assign admin app_metadata through a trusted administrative process and verify RLS.
- Existing database SQL files are competing designs, not a safe sequential migration set. Do not import them into a populated database without reconciliation and explicit approval for destructive changes.

No real payment, customer database write, or contact email was performed during deployment verification.
