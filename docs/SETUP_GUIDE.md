# LAGO E-Commerce Setup Guide

Complete step-by-step guide to set up the LAGO e-commerce platform.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Infrastructure Setup](#infrastructure-setup)
3. [Environment Configuration](#environment-configuration)
4. [Database Setup](#database-setup)
5. [Payment Setup](#payment-setup)
6. [OAuth Setup](#oauth-setup)
7. [Shipping Setup](#shipping-setup)
8. [CMS Setup](#cms-setup)
9. [Deployment](#deployment)
10. [Post-Launch](#post-launch)

---

## Prerequisites

### Required Accounts

- [ ] GitHub account (for CI/CD)
- [ ] Supabase account (database + auth)
- [ ] Stripe account (payments)
- [ ] Sanity account (CMS)
- [ ] Google Cloud account (OAuth)
- [ ] Meta for Developers (Facebook OAuth)
- [ ] Domain name with DNS access

### Local Development

```bash
# Required software
node --version  # v18+ required
npm --version   # v9+
git --version   # v2+

# Optional but recommended
stripe --version    # Stripe CLI for webhook testing
sanity --version    # Sanity CLI
```

---

## Infrastructure Setup

### 1. Supabase Project

1. Go to https://app.supabase.io
2. Click "New Project"
3. Enter project details:
   - Name: `lago-ecommerce`
   - Database Password: [Generate strong password]
   - Region: `North Europe` (closest to Baltics)
4. Wait for project creation (~2 minutes)

**Get credentials:**
- Project Settings → API
- Copy `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
- Copy `anon public` → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Copy `service_role secret` → `SUPABASE_SERVICE_ROLE_KEY` ⚠️ **Never expose this**

### 2. Sanity Project

```bash
# Install Sanity CLI globally
npm install -g @sanity/cli

# Create new project
sanity init

# Answer prompts:
# - Log in with Google/GitHub
# - Select "Create new project"
# - Project name: LAGO E-Commerce
# - Use the default dataset configuration? Yes
# - Project output path: ./sanity
# - Select project template: Clean project with no predefined schemas
```

**Get credentials:**
- Go to https://www.sanity.io/manage
- Select your project
- Project ID → `NEXT_PUBLIC_SANITY_PROJECT_ID`
- API → Tokens → Add API Token → Read + Write → `SANITY_API_READ_TOKEN` & `SANITY_API_WRITE_TOKEN`

### 3. Stripe Account

1. Go to https://dashboard.stripe.com/register
2. Complete account setup
3. Activate your account (submit business details)
4. Enable EUR currency

**Get test credentials:**
- Developers → API keys
- Publishable key → `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- Secret key → `STRIPE_SECRET_KEY`

---

## Environment Configuration

```bash
# Clone repository
git clone <your-repo-url>
cd lago

# Copy environment template
cp .env.local.example .env.local

# Install dependencies
npm install --legacy-peer-deps

# Edit .env.local with all your credentials
nano .env.local
```

### Required Environment Variables Checklist

| Variable | Source | Priority |
|----------|--------|----------|
| `NEXT_PUBLIC_APP_URL` | Your domain | Required |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase Dashboard | Required |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase Dashboard | Required |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase Dashboard | Required |
| `NEXT_PUBLIC_SANITY_PROJECT_ID` | Sanity Manage | Required |
| `SANITY_API_READ_TOKEN` | Sanity Tokens | Required |
| `SANITY_WEBHOOK_SECRET` | Generate random | Required |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe Dashboard | Required |
| `STRIPE_SECRET_KEY` | Stripe Dashboard | Required |

---

## Database Setup

### 1. Run Schema Migration

In Supabase Dashboard:
1. Go to SQL Editor
2. Create "New query"
3. Copy contents from `docs/schema/supabase-schema.sql`
4. Click "Run"

### 2. Verify Tables Created

```sql
-- Check tables exist
SELECT table_name 
FROM information.tables 
WHERE table_schema = 'public';

-- Expected: profiles, addresses, carts, cart_items, 
-- products, categories, orders, order_items, etc.
```

### 3. Set Up RLS Policies

RLS policies are included in the schema. Verify they're active:

```sql
-- Check RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';
```

### 4. Create First Admin User

```sql
-- After signing up with your email, run:
INSERT INTO user_roles (user_id, role, created_by)
SELECT 
  id as user_id,
  'super_admin' as role,
  id as created_by
FROM auth.users 
WHERE email = 'your-email@example.com';
```

---

## Payment Setup

### 1. Stripe Webhook Configuration

**For local development:**

```bash
# Install Stripe CLI
# macOS: brew install stripe/stripe-cli/stripe
# Linux: https://stripe.com/docs/stripe-cli#install

# Login
stripe login

# Forward webhooks to local dev server
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# Copy the webhook signing secret
# whsec_... → STRIPE_WEBHOOK_SECRET in .env.local
```

**For production:**

1. Stripe Dashboard → Developers → Webhooks
2. Add endpoint: `https://lago.lv/api/webhooks/stripe`
3. Select events:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `checkout.session.completed`
   - `checkout.session.expired`
   - `charge.refunded`
4. Copy signing secret → `STRIPE_WEBHOOK_SECRET`

### 2. Configure Payment Methods

Stripe Dashboard → Settings → Payment methods:
- Enable: Cards, Apple Pay, Google Pay
- For Baltics: Enable local methods if needed (Bank transfer, etc.)

### 3. Test Payment

Use Stripe test cards:
- Success: `4242 4242 4242 4242`
- Decline: `4000 0000 0000 0002`
- 3D Secure: `4000 0025 0000 3155`

---

## OAuth Setup

### Google OAuth

1. Go to https://console.cloud.google.com/apis/credentials
2. Create project "LAGO Website"
3. Configure OAuth consent screen:
   - User Type: External
   - App name: LAGO Stone & Furniture
   - User support email: your-email@lago.lv
   - Authorized domains: lago.lv, localhost
4. Create OAuth 2.0 credentials:
   - Application type: Web application
   - Name: LAGO Website
   - Authorized JavaScript origins:
     - `http://localhost:3000`
     - `https://lago.lv`
   - Authorized redirect URIs:
     - `http://localhost:3000/auth/callback`
     - `https://lago.lv/auth/callback`
5. Copy Client ID → `GOOGLE_CLIENT_ID`
6. Copy Client Secret → `GOOGLE_CLIENT_SECRET`

### Facebook OAuth

1. Go to https://developers.facebook.com/apps
2. Create App → Consumer → Next
3. Add Product → Facebook Login → Settings
4. Valid OAuth Redirect URIs:
   - `http://localhost:3000/auth/callback`
   - `https://lago.lv/auth/callback`
5. Settings → Basic:
   - Copy App ID → `FACEBOOK_APP_ID`
   - Copy App Secret → `FACEBOOK_APP_SECRET`

### Configure in Supabase

1. Supabase Dashboard → Authentication → Providers
2. Enable Google:
   - Client ID: from Google Console
   - Secret: from Google Console
3. Enable Facebook:
   - Client ID: App ID from Facebook
   - Secret: App Secret from Facebook

---

## Shipping Setup

### Omniva (Estonia)

1. Contact Omniva: https://www.omniva.ee/business/
2. Request API access for parcel lockers
3. Get API key → `OMNIVA_API_KEY`

### DPD (Baltics)

1. Contact DPD Latvia: https://www.dpd.com/lv/
2. Sign business agreement
3. Request API credentials → `DPD_API_KEY`

### Latvijas Pasts

1. Contact business support: https://www.pasts.lv/
2. Request API access
3. Get credentials → `LATVIJAS_PASTS_API_KEY`

### Configure Shipping Rates

Default rates are seeded in the database. Update in Supabase:

```sql
-- View current rates
SELECT * FROM shipping_rates;

-- Update rates as needed
UPDATE shipping_rates 
SET base_cost = 3.99 
WHERE carrier = 'omniva' AND service_code = 'parcel_locker';
```

---

## CMS Setup

### 1. Deploy Sanity Studio

```bash
# Navigate to sanity directory
cd sanity

# Install dependencies
npm install

# Login to Sanity
sanity login

# Deploy studio
sanity deploy
```

Access studio at: `https://your-project.sanity.studio`

### 2. Configure CORS

Sanity Dashboard → API → CORS Origins:
- `http://localhost:3000`
- `https://lago.lv`

### 3. Set Up Webhook

Sanity Dashboard → API → Webhooks:
- Name: "Sync to Supabase"
- URL: `https://lago.lv/api/webhooks/sanity`
- Dataset: production
- Trigger on: Create, Update, Delete
- Secret: Same as `SANITY_WEBHOOK_SECRET` in .env.local

### 4. Create Initial Content

In Sanity Studio:
1. Create categories: Stone Surfaces, Furniture, etc.
2. Create sample products
3. Migrate existing projects:

```bash
# Run migration script
npx ts-node scripts/migrate-projects-to-sanity.ts
```

---

## Deployment

### Build for Production

```bash
# Install dependencies
npm install --legacy-peer-deps --production

# Build static export
npm run build

# Output will be in /dist directory
```

### Server Configuration

Since this is a static export with API routes:

**Option 1: Self-hosted with Node.js**
```bash
# Start Next.js server
npm start
```

**Option 2: Static files + API server**
```bash
# Deploy /dist to CDN (CloudFlare, etc.)
# Deploy API routes separately or use serverless functions
```

### Nginx Configuration (if using reverse proxy)

```nginx
server {
    listen 80;
    server_name lago.lv www.lago.lv;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name lago.lv www.lago.lv;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    # Static files
    location / {
        root /var/www/lago/dist;
        try_files $uri $uri.html $uri/ =404;
    }

    # API routes
    location /api/ {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Stripe webhooks
    location /api/webhooks/stripe {
        proxy_pass http://localhost:3000;
        proxy_read_timeout 300s;
    }
}
```

---

## Post-Launch

### Verify Checklist

- [ ] Homepage loads correctly in all 3 languages
- [ ] Auth works (Google, Facebook, Email)
- [ ] Products display from Sanity
- [ ] Cart works (add, remove, update qty)
- [ ] Checkout flow completes
- [ ] Stripe payment succeeds
- [ ] Order appears in admin dashboard
- [ ] Order confirmation email (placeholder)
- [ ] Admin can update order status
- [ ] Realtime updates work
- [ ] Projects display with inline edit

### Monitoring

Set up monitoring for:
- Stripe webhooks (Dashboard → Developers → Webhooks → logs)
- Supabase logs (Dashboard → Logs)
- Google Analytics events
- Error tracking (Sentry if configured)

### Backup Strategy

1. **Database**: Supabase automated daily backups
2. **CMS Content**: Sanity history + dataset export
   ```bash
   sanity dataset export production backup.tar.gz
   ```
3. **Code**: Git repository

### Support Contacts

| Service | Support |
|---------|---------|
| Supabase | support@supabase.io |
| Sanity | slack.sanity.io |
| Stripe | support.stripe.com |
| Hosting | Your provider |

---

## Troubleshooting

### Common Issues

**"Invalid API key" errors**
- Check all env vars are set
- Restart dev server after env changes

**RLS policy violations**
- Verify user is authenticated
- Check user_roles table for admin access

**Stripe webhook failures**
- Verify webhook secret matches
- Check endpoint URL is accessible
- Review Stripe Dashboard webhook logs

**Sanity sync not working**
- Verify webhook is configured
- Check webhook secret in both places
- Review Vercel/Netlify function logs

---

## Next Steps

1. **Content**: Add all products to Sanity
2. **SEO**: Submit sitemap to Google Search Console
3. **Marketing**: Set up Facebook Pixel
4. **Legal**: Add Terms of Service, Privacy Policy
5. **Support**: Set up customer service email
