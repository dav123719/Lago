# LAGO E-Commerce Platform Architecture

## Executive Summary

Full-stack e-commerce + projects platform integrating:
- **Next.js 14+** (App Router, Static Export) with existing LV/EN/RU i18n
- **Supabase** (Auth, PostgreSQL, Realtime, Storage)
- **Sanity.io** (Headless CMS for products/projects/content)
- **Stripe** (Payments, webhooks)
- **Baltic Carriers** (Omniva, DPD, Latvijas Pasts integration)

## Core Principles

1. **Security First**: RLS policies on all tables, server-side price validation
2. **Type Safety**: Full TypeScript coverage, generated types from Supabase/Sanity
3. **Performance**: Edge caching, optimistic UI, image optimization
4. **UX Excellence**: Realtime updates, smooth animations, offline cart support

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              CLIENT LAYER                                    │
├─────────────────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐ │
│  │   Auth UI   │  │  Storefront │  │  Cart/Checkout│  │  Projects + Admin   │ │
│  │  (Modals)   │  │  (Sanity+SBP)│  │  (Stripe)    │  │  (Sanity Studio)    │ │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘  └──────────┬──────────┘ │
│         │                │                │                    │            │
│  ┌──────▼────────────────▼────────────────▼────────────────────▼──────────┐ │
│  │                     REACT CONTEXT / HOOKS                              │ │
│  │  AuthContext │ CartContext │ LocaleContext │ RealtimeProvider         │ │
│  └──────┬────────────────────────────────────────────────────────────────┘ │
└─────────┼───────────────────────────────────────────────────────────────────┘
          │
┌─────────▼───────────────────────────────────────────────────────────────────┐
│                              API LAYER                                       │
├─────────────────────────────────────────────────────────────────────────────┤
│  /api/auth/*        /api/store/*        /api/checkout/*        /api/webhooks│
│  ├─ callback        ├─ products         ├─ create-session      ├─ stripe    │
│  ├─ session         ├─ categories       ├─ verify-payment      ├─ omniva    │
│  └─ profile         ├─ search           └─ shipping-rates      └─ dpd       │
│                     └─ inventory                                          │
└─────────┬───────────────────────────────────────────────────────────────────┘
          │
┌─────────▼───────────────────────────────────────────────────────────────────┐
│                           SERVICE LAYER                                      │
├─────────────────────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────────────────┐  │
│  │  Supabase Auth  │  │  Supabase DB    │  │      Sanity CDN             │  │
│  │  (OAuth/Email)  │  │  (RLS Policies) │  │  (Content Delivery)         │  │
│  └─────────────────┘  └─────────────────┘  └─────────────────────────────┘  │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────────────────┐  │
│  │ Stripe Payments │  │  Baltic Carriers│  │    Realtime Subscriptions   │  │
│  │  (PCI Compliant)│  │  (Shipping APIs)│  │    (Cart/Stock/Orders)      │  │
│  └─────────────────┘  └─────────────────┘  └─────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Data Flow: Product → Cart → Order

```
┌────────────────────────────────────────────────────────────────────────────┐
│ SANITY (Source of Truth - Content)                                         │
│ ├── Products: name, description, images, base_price, variants             │
│ ├── Projects: portfolio showcases with inline editing                     │
│ └── Categories: hierarchical organization                                 │
└──────────────────┬─────────────────────────────────────────────────────────┘
                   │ Webhook / Sync
                   ▼
┌────────────────────────────────────────────────────────────────────────────┐
│ SUPABASE (Source of Truth - Commerce)                                      │
│ ├── products (synced from Sanity): sku, price, stock, status              │
│ ├── carts: session_id/user_id, items[], expires_at                        │
│ ├── orders: user_id, items[], totals, status, shipping, payment_ref       │
│ └── inventory_transactions: stock movements audit trail                   │
└──────────────────┬─────────────────────────────────────────────────────────┘
                   │ Server Actions / API
                   ▼
┌────────────────────────────────────────────────────────────────────────────┐
│ STRIPE (Payment Processing)                                                │
│ ├── Checkout Session: line_items with server-calculated prices            │
│ ├── Payment Intent: confirm, capture                                      │
│ └── Webhooks: payment_intent.succeeded → create order                     │
└────────────────────────────────────────────────────────────────────────────┘
```

---

## Security Model

### Row Level Security (RLS) Strategy

| Table | Policy | Rule |
|-------|--------|------|
| profiles | Own data only | `auth.uid() = id` |
| profiles | Admin access | `auth.uid() IN (SELECT user_id FROM user_roles WHERE role = 'admin')` |
| carts | Own or session | `user_id = auth.uid() OR (session_id = current_setting('app.session_id') AND user_id IS NULL)` |
| orders | Own or admin | `user_id = auth.uid() OR auth.uid() IN (SELECT user_id FROM user_roles WHERE role IN ('admin', 'support'))` |
| addresses | Own only | `user_id = auth.uid()` |
| products | Public read | `true` (public catalog) |
| inventory | Service only | `auth.uid() IN (SELECT user_id FROM user_roles WHERE role = 'service')` |

### Admin Privilege Escalation

```sql
-- Secure admin checks via database function
CREATE OR REPLACE FUNCTION is_admin(user_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = user_uuid 
    AND role IN ('admin', 'super_admin')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

---

## Multi-Language Strategy

### Content Localization Matrix

| Content Type | Source | LV | EN | RU |
|--------------|--------|----|----|----|
| Product info | Sanity | ✓ | ✓ | ✓ |
| Project info | Sanity | ✓ | ✓ | ✓ |
| UI strings | translations.ts | ✓ | ✓ | ✓ |
| User content | Supabase | User's choice | - | - |
| Order data | Supabase | Latin only | - | - |

### URL Structure

```
/[locale]/store                    # Store homepage
/[locale]/store/[category]         # Category page
/[locale]/store/product/[slug]     # Product detail
/[locale]/projects                 # Projects portfolio
/[locale]/projects/[slug]          # Project detail
/[locale]/cart                     # Cart page
/[locale]/checkout                 # Checkout flow
/[locale]/account                  # User dashboard
/[locale]/account/orders           # Order history
/[locale]/account/orders/[id]      # Order detail
```

---

## Order Lifecycle

```
┌─────────┐    ┌─────────┐    ┌─────────┐    ┌─────────┐    ┌─────────┐
│  CART   │───▶│ PENDING │───▶│  PAID   │───▶│PROCESSING│───▶│SHIPPED  │
└─────────┘    └─────────┘    └────┬────┘    └────┬────┘    └────┬────┘
                                   │              │              │
                              ┌────▼────┐    ┌────▼────┐    ┌────▼────┐
                              │CANCELLED│    │REFUNDED │    │DELIVERED│
                              │(timeout)│    │(partial)│    │         │
                              └─────────┘    └─────────┘    └─────────┘
```

### Status Transitions

- `pending` → `paid` (Stripe webhook)
- `pending` → `cancelled` (timeout 24h, or manual)
- `paid` → `processing` (admin action)
- `processing` → `shipped` (admin + tracking info)
- `shipped` → `delivered` (carrier webhook or manual)
- Any → `refunded` (Stripe refund webhook)

---

## Realtime Features

| Feature | Implementation | Channel |
|---------|---------------|---------|
| Stock updates | Supabase Realtime | `table:products:stock_quantity` |
| Cart sync | LocalStorage + Merge on login | N/A |
| Order status | Supabase Realtime | `table:orders:id=eq.${orderId}` |
| Price changes | Sanity webhook → Supabase | N/A |

---

## File Organization

```
src/
├── app/
│   ├── api/                    # API routes
│   │   ├── auth/
│   │   ├── checkout/
│   │   ├── webhooks/
│   │   └── shipping/
│   ├── [locale]/
│   │   ├── store/
│   │   ├── cart/
│   │   ├── checkout/
│   │   ├── account/
│   │   └── projects/
│   └── layout.tsx
├── components/
│   ├── auth/                   # Auth modals, buttons
│   ├── store/                  # Product cards, filters
│   ├── cart/                   # Cart drawer, items
│   ├── checkout/               # Checkout forms
│   ├── account/                # Profile, orders UI
│   └── admin/                  # Admin panels
├── lib/
│   ├── supabase/               # Client/server clients
│   ├── sanity/                 # Sanity client, queries
│   ├── stripe/                 # Stripe helpers
│   ├── shipping/               # Carrier integrations
│   └── i18n/                   # Existing + new keys
├── hooks/
│   ├── useAuth.ts
│   ├── useCart.ts
│   ├── useRealtime.ts
│   └── useShipping.ts
├── types/
│   ├── database.ts             # Supabase generated
│   └── sanity.ts               # Sanity generated
└── styles/
    └── store-theme.css         # Additional e-commerce styles
```

---

## Environment Variables

See `.env.local.example` for full list. Key variables:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=          # Client-safe
NEXT_PUBLIC_SUPABASE_ANON_KEY=     # Client-safe
SUPABASE_SERVICE_ROLE_KEY=         # Server-only

# Sanity
NEXT_PUBLIC_SANITY_PROJECT_ID=     # Client-safe
NEXT_PUBLIC_SANITY_DATASET=        # Client-safe
SANITY_API_TOKEN=                  # Server-only
SANITY_WEBHOOK_SECRET=             # Server-only

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=# Client-safe
STRIPE_SECRET_KEY=                 # Server-only
STRIPE_WEBHOOK_SECRET=             # Server-only

# OAuth
GOOGLE_CLIENT_ID=                  # Server-only
GOOGLE_CLIENT_SECRET=              # Server-only
FACEBOOK_APP_ID=                   # Server-only
FACEBOOK_APP_SECRET=               # Server-only

# Shipping Carriers
OMNIVA_API_KEY=                    # Server-only
DPD_API_KEY=                       # Server-only
LATVIJAS_PASTS_API_KEY=            # Server-only

# App
NEXT_PUBLIC_APP_URL=               # Client-safe (for redirects)
```

---

## Implementation Phases

### Phase 1: Auth + Profile (Week 1)
- Supabase Auth setup (Google, Facebook, Email)
- User profiles table with RLS
- Auth UI (dropdown menu, modals)
- Admin roles table

### Phase 2: Storefront (Week 1-2)
- Sanity schemas for products/categories
- Product sync to Supabase
- Store page with filters/search
- Product detail pages

### Phase 3: Cart + Checkout (Week 2)
- Cart system (guest + logged-in)
- Cart drawer UI
- Stripe Checkout integration
- Server-side price validation

### Phase 4: Orders + Admin (Week 3)
- Order creation on payment success
- Order tracking timeline
- Admin dashboard for order management
- Email notifications (placeholder)

### Phase 5: Projects + Sanity Studio (Week 3-4)
- Inline editing for projects
- Image optimization pipeline
- Realtime preview

### Phase 6: Polish (Week 4)
- Performance optimization
- SEO metadata
- Accessibility audit
- Testing (unit/E2E)
