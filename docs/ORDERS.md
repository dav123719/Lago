# LAGO Orders System

Complete orders, tracking, and admin functionality for LAGO luxury furniture e-commerce.

## Features

### Order Management
- Human-friendly order numbers: `LGO-YYMMDD-XXXX`
- Full order status workflow: pending → paid → processing → shipped → delivered
- Order cancellation and refund handling
- Ready for pickup option for local customers

### Realtime Updates
- Live order status updates via Supabase Realtime
- Toast notifications on status changes
- Sound notifications for important updates
- Live badge counts in admin sidebar

### Admin Dashboard
- Professional admin UI with lighter theme
- Order statistics and analytics
- Filter and search orders
- Export orders to CSV
- Status management with validation
- Tracking information management

### User Features
- Order history in account section
- Detailed order view with timeline
- Printable receipts
- Tracking information display
- Email notifications (placeholder)

## Order Status Flow

```
pending → paid → processing → shipped → delivered
   ↓        ↓         ↓           ↓
cancelled  refunded  ready_for_pickup
```

### Status Descriptions

| Status | Description | Next States |
|--------|-------------|-------------|
| `pending` | Order created, awaiting payment | `paid`, `cancelled` |
| `paid` | Payment confirmed | `processing`, `refunded`, `cancelled` |
| `processing` | Order being prepared | `shipped`, `ready_for_pickup`, `refunded` |
| `shipped` | Order in transit | `delivered`, `refunded` |
| `delivered` | Order received by customer | `refunded` |
| `cancelled` | Order cancelled | - |
| `refunded` | Payment refunded | - |
| `ready_for_pickup` | Ready for store pickup | `delivered`, `refunded` |

## File Structure

```
src/
├── types/
│   ├── orders.ts          # Order types, interfaces, utilities
│   └── database.ts        # Supabase database types
├── hooks/
│   ├── useOrders.ts       # Fetch user's orders
│   ├── useOrder.ts        # Single order with realtime updates
│   └── useAdminOrders.ts  # Admin order management
├── components/
│   ├── orders/
│   │   ├── OrderCard.tsx       # Order summary card
│   │   ├── OrderTimeline.tsx   # Status timeline
│   │   ├── OrderItems.tsx      # Items list
│   │   ├── TrackingInfo.tsx    # Carrier/tracking display
│   │   ├── OrderReceipt.tsx    # Printable receipt
│   │   └── OrderStatusToast.tsx # Realtime notifications
│   └── admin/
│       ├── AdminSidebar.tsx      # Navigation
│       ├── OrderTable.tsx        # Orders data table
│       ├── OrderStatusUpdater.tsx # Status change UI
│       ├── TrackingEditor.tsx    # Add tracking info
│       └── OrderFilters.tsx      # Filter controls
├── app/
│   ├── [locale]/
│   │   └── account/
│   │       └── orders/
│   │           ├── page.tsx      # Order history list
│   │           └── [id]/
│   │               └── page.tsx  # Order detail
│   └── admin/
│       ├── layout.tsx            # Admin layout
│       ├── dashboard/
│       │   └── page.tsx          # Admin home
│       └── orders/
│           ├── page.tsx          # All orders
│           └── [id]/
│               └── page.tsx      # Order edit/detail
├── app/api/
│   └── admin/
│       └── orders/
│           ├── route.ts          # List/create orders
│           └── [id]/
│               ├── route.ts      # Single order operations
│               ├── status/
│               │   └── route.ts  # Update status
│               └── tracking/
│                   └── route.ts  # Add tracking
├── lib/
│   ├── admin/
│   │   └── auth.ts             # Admin role checking
│   ├── email/
│   │   ├── send.ts             # Email sender interface
│   │   └── templates/
│   │       ├── order-confirmation.ts
│   │       └── order-shipped.ts
│   └── supabase/
│       └── client.ts           # Supabase client config
└── middleware.ts               # Route protection
```

## Database Schema

### orders
- `id` (UUID, PK)
- `order_number` (TEXT, UNIQUE)
- `user_id` (UUID, FK to auth.users)
- `customer_email`, `customer_name`, `customer_phone`
- `status` (TEXT with CHECK constraint)
- `subtotal`, `tax`, `shipping`, `discount`, `total` (DECIMAL)
- `currency` (TEXT, default 'EUR')
- `shipping_address`, `billing_address` (JSONB)
- `notes`, `internal_notes` (TEXT)
- `tracking` (JSONB)
- Timestamps: `created_at`, `updated_at`, `paid_at`, `shipped_at`, `delivered_at`, `cancelled_at`, `refunded_at`

### order_items
- `id` (UUID, PK)
- `order_id` (UUID, FK to orders)
- `product_id`, `product_name`, `product_sku`
- `quantity`, `unit_price`, `total_price`
- `image_url`, `options` (JSONB)

### order_status_history
- `id` (UUID, PK)
- `order_id` (UUID, FK to orders)
- `status`, `notes`
- `created_by` (UUID, FK to auth.users)
- `created_at`

### profiles
- `id` (UUID, PK, FK to auth.users)
- `email`, `full_name`, `phone`
- `role` (TEXT: 'admin', 'manager', 'customer')

## Environment Variables

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Email (placeholder - configure your provider)
EMAIL_FROM=orders@lago-furniture.com
EMAIL_REPLY_TO=support@lago-furniture.com
NEXT_PUBLIC_SITE_URL=https://lago-furniture.com
```

## Setup

1. **Run migrations:**
   ```bash
   supabase db push
   ```

2. **Set up RLS policies:**
   Migrations include all RLS policies for secure access control.

3. **Create admin users:**
   ```sql
   INSERT INTO profiles (id, email, role)
   VALUES ('user-uuid', 'admin@lago.com', 'admin');
   ```

4. **Configure email provider:**
   Update `src/lib/email/send.ts` with your email provider (SendGrid, AWS SES, Resend, etc.)

## Usage

### User: View Orders
```tsx
import { useOrders } from '@/hooks/useOrders'

function OrdersPage() {
  const { orders, isLoading, error } = useOrders(userId)
  // ...
}
```

### User: View Single Order
```tsx
import { useOrder } from '@/hooks/useOrder'

function OrderDetailPage({ orderId }: { orderId: string }) {
  const { order, isLoading } = useOrder(orderId, userId)
  // Realtime updates included
  // ...
}
```

### Admin: Manage Orders
```tsx
import { useAdminOrders } from '@/hooks/useAdminOrders'

function AdminOrdersPage() {
  const { 
    orders, 
    stats, 
    isLoading, 
    updateOrderStatus, 
    addTrackingInfo 
  } = useAdminOrders(filters)
  // ...
}
```

## Email Templates

Email templates are located in `src/lib/email/templates/`:

- `order-confirmation.ts` - Sent when order is created
- `order-shipped.ts` - Sent when order is shipped with tracking

Configure your email provider in `src/lib/email/send.ts`.

## Security

- RLS policies ensure users can only access their own orders
- Admin routes protected by middleware
- API routes check admin role
- Status transitions validated server-side

## Admin Authentication

Users with `role = 'admin'` or `role = 'manager'` in the `profiles` table have access to:
- `/admin` routes
- Admin API endpoints
- Order management features

## Realtime Subscriptions

The system uses Supabase Realtime for live updates:
- Users see status changes immediately
- Admin dashboard updates live
- Toast notifications on important changes
