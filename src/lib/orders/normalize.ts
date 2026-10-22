import type { Order, ShippingAddress } from '@/types/orders'
const record = (value: unknown): Record<string, unknown> => value && typeof value === 'object' ? value as Record<string, unknown> : {}
export function normalizeOrder(value: unknown): Order {
  const row = record(value)
  if (typeof row.id !== 'string' || typeof row.order_number !== 'string') throw new Error('Invalid order response')
  const a = record(row.shipping_address)
  const address: ShippingAddress = {
    first_name: String(a.first_name ?? a.firstName ?? ''), last_name: String(a.last_name ?? a.lastName ?? ''),
    address1: String(a.address1 ?? a.addressLine1 ?? ''), address2: String(a.address2 ?? a.addressLine2 ?? ''),
    city: String(a.city ?? ''), postal_code: String(a.postal_code ?? a.postalCode ?? ''), country: String(a.country ?? ''),
  }
  return {
    id: row.id, order_number: row.order_number, user_id: String(row.user_id ?? ''),
    customer_email: String(row.customer_email ?? row.guest_email ?? ''),
    customer_name: String(row.customer_name ?? `${address.first_name} ${address.last_name}`.trim()),
    status: String(row.status ?? 'pending') as Order['status'], subtotal: Number(row.subtotal ?? 0),
    tax: Number(row.tax ?? row.tax_amount ?? 0), shipping: Number(row.shipping ?? row.shipping_price ?? 0),
    discount: Number(row.discount ?? row.discount_amount ?? 0), total: Number(row.total ?? 0), currency: String(row.currency ?? 'EUR'),
    shipping_address: address, billing_address: address, created_at: String(row.created_at ?? ''), updated_at: String(row.updated_at ?? ''),
    items: Array.isArray(row.items) ? row.items as Order['items'] : [],
  }
}
