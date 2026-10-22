# LAGO — stone surfaces and custom furniture

The existing multilingual LAGO website, built with Next.js, Supabase and Sanity. The repository also contains commerce integrations that are not ready for live checkout.

![LAGO Banner](https://lago.lv/images/logo/lago-logo.png)

Current engineering evidence (22 October 2026): **233 unit tests**, **25 production browser smoke checks**, TypeScript and production build pass; lint has **0 errors / 60 warnings**. Build budgets cover **125 prerendered routes**. See [performance and subsystem coverage](docs/performance/README.md), [measured comparisons](docs/performance/results.md), and [account rollout](docs/account-system.md). Historical build reports below are not current acceptance evidence.

## Features and configuration status

- **Content**: Latvian, English and Russian; application/material guidance, projects and contact information.
- **Accounts**: Supabase email/password, confirmation/recovery, UUID profiles and audited administrator profile management. One verified reserved owner now has the admin grant; actual credentialed browser edits and mail-delivery flows still need controlled acceptance tests.
- **OAuth**: Application flows exist; Google/Facebook are disabled pending provider credentials/configuration.
- **CMS**: Sanity content/images, protected Studio and project editing paths. No live CMS mutation was performed by the optimization pass.
- **Commerce**: Store/cart/checkout/orders/Stripe/realtime/shipping code retained. Commerce database tables are absent, catalog requests fail, payments remain disabled and carrier mock/fallback data is not verified production service.

## Tech Stack

- **Framework**: Next.js 16 (App Router, Node.js server)
- **Styling**: Tailwind CSS with custom luxury dark theme
- **Database**: Supabase (PostgreSQL + Realtime)
- **Auth**: Supabase Auth
- **CMS**: Sanity.io
- **Payments**: Stripe
- **Testing**: Vitest (unit), Playwright (E2E)

## Quick Start

```bash
# Clone repository
git clone https://github.com/dav123719/Lago.git
cd Lago

# Install dependencies
npm ci

# Environment setup
cp .env.local.example .env.local
# Edit .env.local with your credentials

# Development server
npm run dev
```

Visit `http://localhost:3000`

## Project Structure

```
src/
├── app/              # Next.js App Router
│   ├── api/          # API routes (webhooks, checkout)
│   ├── [locale]/     # Localized pages
│   ├── admin/        # Admin dashboard
│   └── studio/       # Sanity Studio
├── components/       # React components
│   ├── auth/         # Authentication UI
│   ├── store/        # E-commerce components
│   ├── cart/         # Shopping cart
│   ├── checkout/     # Checkout flow
│   ├── orders/       # Order management
│   ├── admin/        # Admin components
│   └── sanity/       # Sanity components
├── lib/              # Utilities
│   ├── supabase/     # Supabase clients
│   ├── sanity/       # Sanity integration
│   ├── stripe/       # Stripe helpers
│   └── shipping/     # Carrier APIs
└── __tests__/        # Test files
```

## Documentation

- [Architecture](docs/ARCHITECTURE.md) - System design and data flow
- [Setup Guide](docs/SETUP_GUIDE.md) - Complete setup instructions
- [Implementation Plan](docs/IMPLEMENTATION_PLAN.md) - Development roadmap

## Environment Variables

See `.env.local.example` for all required variables.

Key variables:
```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Sanity
NEXT_PUBLIC_SANITY_PROJECT_ID=
SANITY_API_READ_TOKEN=
SANITY_API_WRITE_TOKEN=

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=

# Optional browser provider controls; configure provider secrets inside Supabase Auth.
NEXT_PUBLIC_GOOGLE_OAUTH_ENABLED=false
NEXT_PUBLIC_FACEBOOK_OAUTH_ENABLED=false
NEXT_PUBLIC_MANUAL_IDENTITY_LINKING_ENABLED=false
```

## Available Scripts

```bash
npm run dev           # Development server
npm run build         # Production build
npm run start         # Start production server
npm run lint          # ESLint
npm run test          # Unit + legacy E2E (see safe testing guidance below)
npm run test:unit     # Unit tests (Vitest)
npm run test:e2e      # E2E tests (Playwright)
npm run type-check    # TypeScript check
npm run check:budgets # Initial production route JS/CSS/HTML gzip limits
npm run format        # Format code with Prettier
```

## Testing

### Unit Tests
```bash
npm run test:unit
```

### Safe production-build browser checks

```bash
npx playwright install chromium
# Start the separately built standalone candidate first.
PLAYWRIGHT_BASE_URL=http://127.0.0.1:3200 npx playwright test -c playwright.smoke.config.ts
```

These checks intercept auth submissions and test safe public/anonymous paths. They do not prove real confirmation/recovery email delivery or authenticated edits. The legacy `src/__tests__/e2e/` suite assumes missing selectors, uncontrolled credentials and fictional fixtures; do not run its registration/password/payment mutations against production. See the [cleanup review](docs/performance/cleanup.md) and [independent verification](docs/performance/independent-verification.md).

## Deployment

### Build
```bash
npm run build
```

Output uses Next.js standalone server mode. See [production deployment](docs/DEPLOYMENT.md) and [integration acceptance gates](docs/INTEGRATION_STATUS.md). Do not serve `dist/` as static HTML.

### Database Migrations
The account foundation `supabase/migrations/20261022170145_lago_account_system.sql` and additive bootstrap guard `20261022193626_lock_owner_bootstrap.sql` are applied. Check actual migration history before applying anything. Historical commerce SQL contains competing schemas; do not run all files or blindly push them to production. See [database findings and isolated tests](docs/performance/backend.md).

### Stripe Webhooks
For local development:
```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

For production, configure webhook endpoint in Stripe Dashboard.

## Contributing

1. Create feature branch: `git checkout -b feature/my-feature`
2. Commit changes: `git commit -m 'Add feature'`
3. Push to branch: `git push origin feature/my-feature`
4. Follow the intended branch permissions/protection rules. Direct commits do not require a fork; use a review only where needed.
5. The production workflow is manual and main-only; advancing a working branch does not automatically deploy it. Use the reviewed immutable-release process in [deployment evidence](docs/performance/README.md).

## License

Private - All rights reserved

## Support

Use the verified contact information published at [lago.lv](https://lago.lv).
