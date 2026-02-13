# LAGO E-Commerce Platform

A premium e-commerce platform for LAGO Stone & Furniture, built with Next.js 14+, Supabase, Sanity, and Stripe.

![LAGO Banner](https://lago.lv/images/logo/lago-logo.png)

> **Build Status:** ✅ SUCCESS (167 pages generated)  
> **System Version:** 1.0.1  
> **Last Updated:** 2026-02-12  
> **All Agents:** Completed
>
> See [BUILD_STATUS.md](BUILD_STATUS.md) for detailed build information.

## Features

- **Multi-Language**: Latvian (LV), English (EN), Russian (RU)
- **Authentication**: Google OAuth, Facebook OAuth, Email/Password
- **E-Commerce**: Full shopping cart, checkout, and order management
- **Payments**: Secure Stripe integration with webhook support
- **Shipping**: Baltic carrier integration (Omniva, DPD, Latvijas Pasts)
- **CMS**: Sanity-powered content with inline editing
- **Real-time**: Live stock updates, order status tracking
- **Admin Dashboard**: Order management, status updates, tracking

## Tech Stack

- **Framework**: Next.js 14+ (App Router, Static Export)
- **Styling**: Tailwind CSS with custom luxury dark theme
- **Database**: Supabase (PostgreSQL + Realtime)
- **Auth**: Supabase Auth
- **CMS**: Sanity.io
- **Payments**: Stripe
- **Testing**: Vitest (unit), Playwright (E2E)

## Quick Start

```bash
# Clone repository
git clone <repo-url>
cd lago

# Install dependencies
npm install --legacy-peer-deps

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

# OAuth
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
FACEBOOK_APP_ID=
FACEBOOK_APP_SECRET=
```

## Available Scripts

```bash
npm run dev           # Development server
npm run build         # Production build
npm run start         # Start production server
npm run lint          # ESLint
npm run test          # Run all tests
npm run test:unit     # Unit tests (Vitest)
npm run test:e2e      # E2E tests (Playwright)
npm run type-check    # TypeScript check
npm run format        # Format code with Prettier
```

## Testing

### Unit Tests
```bash
npm run test:unit
```

### E2E Tests
```bash
# Install Playwright browsers
npx playwright install

# Run E2E tests
npm run test:e2e

# Debug mode
npm run test:e2e:debug
```

## Deployment

### Build
```bash
npm run build
```

Output is in `/dist` directory (static export).

### Database Migrations
Run SQL in Supabase Dashboard → SQL Editor:
- `docs/schema/supabase-schema.sql`

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
4. Open Pull Request

## License

Private - All rights reserved

## Support

For support, email support@lago.lv or visit [lago.lv](https://lago.lv)
