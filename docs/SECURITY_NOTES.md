# Deployment security notes

The dependency audit is not clean. Compatible dependency updates address patchable findings, including Sharp, Sanity-related dependencies, and test tooling; rerun `npm audit` against the committed lockfile when reviewing a release. An audit count alone does not establish runtime exploitability or absence of risk.

## Residual build-tool advisory

`braces` through 3.0.3 is affected by [GHSA-vfj7-8cjw-p6xm](https://github.com/advisories/GHSA-vfj7-8cjw-p6xm), a stack-exhaustion denial of service from deeply nested patterns. The advisory lists no patched version. Tailwind CSS 3, fast-glob, micromatch, and parts of the ESLint dependency tree inherit this finding. A forced Tailwind major migration or an incompatible ESLint downgrade is not an appropriate automatic deployment fix.

The reviewed application uses developer-controlled Tailwind content globs. These packages were absent as separately installed packages from the inspected Next.js standalone runtime output; this observation does not prove that every bundled dependency is free of vulnerabilities. Deploy the newly built standalone artifact rather than the complete development `node_modules` tree. Do not run development servers in production or accept visitor-controlled build/glob configuration.

Run builds and tests as an unprivileged account using trusted repository inputs. Keep production secrets out of untrusted pull-request workflows and build jobs. Review upstream patches and regenerate the audit before future releases. Next.js bundles some internal dependencies; update Next.js rather than attempting unsupported edits inside its compiled modules.

## Commerce activation gate

Checkout returns HTTP 503 unless `PAYMENTS_ENABLED` is exactly `true`, even when Stripe credentials are configured. Leave this disabled until the real Supabase project and authoritative schema have been verified.

Before enabling payments, validate row-level security for customer and guest carts, protected roles, and orders; implement and verify transactional order creation, stock reservation/decrement, webhook idempotency, and safe concurrent cart merging. Current application-level ownership checks supplement database authorization and do not replace it. Cart merge performs multiple writes and is not an atomic transaction. Real checkout, refunds, signed webhook retries, and stock consistency require integration testing against an isolated staging database before production activation. Do not apply competing schema files blindly or make destructive production database changes.

The configured Supabase endpoint and external integration credentials must be independently verified. A successful site build and healthy public pages do not establish that authentication, orders, mail delivery, or payments work.

## Structured data

JSON-LD scripts use `serializeJsonLd`, which escapes literal `<` characters before inserting JSON into HTML. This prevents CMS content containing `</script>` from escaping the structured-data element. DOM containment and JSON roundtrip tests cover malicious payloads. Keep this helper in use for new structured-data script blocks.
