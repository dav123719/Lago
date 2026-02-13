# LAGO Checkout System

Complete cart, checkout, and Stripe payment integration for LAGO luxury furniture e-commerce.

## Features

- **Guest Checkout**: No account required to complete purchase
- **Multi-step Checkout**: Shipping → Payment → Confirmation
- **Baltic Shipping**: Omniva, DPD, Latvijas Pasts support
- **Parcel Lockers**: Map-based locker selection
- **Server-side Price Validation**: All prices validated against database
- **Real-time Cart**: Supabase realtime sync across tabs
- **Stripe Integration**: Secure hosted checkout
- **Webhook Handling**: Automatic order creation on payment success

## File Structure

```
src/
├── app/
│   ├── [locale]/
│   │   ├── cart/
│   │   │   ├── page.tsx              # Cart page
│   │   │   └── CartPageClient.tsx    # Cart interactivity
│   │   ├── checkout/
│   │   │   ├── page.tsx              # Main checkout
│   │   │   ├── CheckoutClient.tsx    # Checkout flow
│   │   │   └── success/
│   │   │       └── page.tsx          # Order confirmation
│   │   └── layout.tsx                # CartProvider wrapper
│   └── api/
│       ├── cart/
│       │   └── total/
│       │       └── route.ts          # Get cart total
│       ├── checkout/
│       │   └── create-session/
│       │       └── route.ts          # Create Stripe session
│       ├── shipping/
│       │   ├── rates/
│       │   │   └── route.ts          # Get shipping rates
│       │   └── lockers/
│       │       └── route.ts          # Get parcel lockers
│       └── webhooks/
│           └── stripe/
│               └── route.ts          # Stripe webhooks
├── components/
│   ├── cart/
│   │   ├── CartButton.tsx            # Header cart icon
│   │   ├── CartDrawer.tsx            # Slide-out cart
│   │   ├── CartItem.tsx              # Cart line item
│   │   └── CartSummary.tsx           # Cart totals
│   └── checkout/
│       ├── CheckoutProgress.tsx      # Step indicator
│       ├── ShippingForm.tsx          # Address form
│       ├── ShippingMethodSelector.tsx # Carrier selection
│       └── StripePaymentForm.tsx     # Payment summary
├── contexts/
│   └── CartContext.tsx               # Global cart state
├── hooks/
│   ├── useCart.ts                    # Cart operations
│   ├── useGuestSession.ts            # Guest session management
│   └── useCookies.ts                 # Cookie utilities
├── lib/
│   ├── shipping/
│   │   ├── carriers.ts               # Carrier definitions
│   │   ├── rates.ts                  # Rate calculation
│   │   ├── omniva.ts                 # Omniva API
│   │   └── dpd.ts                    # DPD API
│   └── stripe/
│       ├── client.ts                 # Stripe.js loader
│       └── server.ts                 # Server-side Stripe
└── types/
    └── checkout.ts                   # TypeScript types
```

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Copy `.env.local.example` to `.env.local` and fill in:

```bash
cp .env.local.example .env.local
```

Required variables:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`

### 3. Setup Supabase Database

Run the schema file in Supabase SQL Editor:

```bash
# Located at: supabase/schema.sql
```

### 4. Configure Stripe Webhook

In Stripe Dashboard:
1. Go to Developers → Webhooks
2. Add endpoint: `https://your-site.com/api/webhooks/stripe`
3. Select events:
   - `checkout.session.completed`
   - `checkout.session.expired`
   - `payment_intent.payment_failed`
   - `payment_intent.succeeded`
   - `charge.refunded`

### 5. Test Locally

```bash
# Start development server
npm run dev

# In another terminal, forward Stripe webhooks
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

## Usage

### Adding to Cart

```tsx
import { useCartContext } from '@/contexts/CartContext'

function ProductCard({ product }) {
  const { addItem } = useCartContext()
  
  const handleAddToCart = () => {
    addItem(product.id, 1)
  }
  
  return (
    <button onClick={handleAddToCart}>
      Add to Cart
    </button>
  )
}
```

### Accessing Cart

The cart is available globally through context:

```tsx
const { 
  items,           // Cart items with product data
  itemCount,       // Total item quantity
  subtotal,        // Cart subtotal
  isLoading,       // Loading state
  isSyncing,       // Syncing state
  addItem,         // Add item to cart
  updateQuantity,  // Update item quantity
  removeItem,      // Remove item
  clearCart,       // Clear all items
  openCart,        // Open cart drawer
  closeCart,       // Close cart drawer
} = useCartContext()
```

## Shipping Methods

| Carrier | Method | Price | Free Threshold |
|---------|--------|-------|----------------|
| Omniva | Parcel Locker | €2.99 | €150 |
| Omniva | Courier | €5.99 | €250 |
| DPD | Pickup Locker | €2.99 | €150 |
| DPD | Home Delivery | €5.99 | €250 |
| Latvijas Pasts | Standard | €3.49 | €150 |
| Latvijas Pasts | International | €12.99 | €500 |
| LAGO | Showroom Pickup | FREE | - |

## Security

- **Server-side price calculation**: Client prices are never trusted
- **Stock validation**: Checked at every step
- **CSRF protection**: Origin validation on API routes
- **Stripe signature verification**: Webhook signature validated
- **RLS policies**: Row Level Security on all tables

## Guest Sessions

Guest users are tracked via:
- LocalStorage: `lago_guest_session_id`
- Cookie: `guest_session_id` (30-day expiry)

Sessions persist across page reloads and browser sessions.

## Database Triggers

### Merge Guest Cart on Login

```sql
-- Automatically merges guest cart with user cart on login
CREATE TRIGGER merge_guest_cart_on_login
AFTER UPDATE ON auth.users
FOR EACH ROW
EXECUTE FUNCTION merge_carts();
```

## Testing

### Test Cards (Stripe)

| Card Number | Scenario |
|-------------|----------|
| 4242 4242 4242 4242 | Success |
| 4000 0000 0000 0002 | Declined |
| 4000 0000 0000 3220 | 3D Secure |

## License

Private - LAGO Stone & Furniture
