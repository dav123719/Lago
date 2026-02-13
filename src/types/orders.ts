// ===================================
// Order Types & Interfaces
// ===================================

export type OrderStatus =
  | 'pending'
  | 'paid'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'refunded'
  | 'ready_for_pickup'

export interface OrderItem {
  id: string
  order_id: string
  product_id: string
  product_name: string
  product_sku: string
  quantity: number
  unit_price: number
  total_price: number
  image_url?: string
  options?: Record<string, string>
  created_at: string
}

export interface Order {
  id: string
  order_number: string
  user_id: string
  customer_email: string
  customer_name: string
  customer_phone?: string
  status: OrderStatus
  subtotal: number
  tax: number
  shipping: number
  discount: number
  total: number
  currency: string
  shipping_address: ShippingAddress
  billing_address: ShippingAddress
  notes?: string
  internal_notes?: string
  created_at: string
  updated_at: string
  paid_at?: string
  shipped_at?: string
  delivered_at?: string
  cancelled_at?: string
  refunded_at?: string
  items?: OrderItem[]
  tracking?: TrackingInfo
}

export interface ShippingAddress {
  first_name: string
  last_name: string
  company?: string
  address1: string
  address2?: string
  city: string
  state?: string
  postal_code: string
  country: string
  phone?: string
}

export interface TrackingInfo {
  carrier: string
  tracking_number: string
  tracking_url?: string
  shipped_at: string
  estimated_delivery?: string
}

export interface OrderStatusHistory {
  id: string
  order_id: string
  status: OrderStatus
  notes?: string
  created_by?: string
  created_at: string
}

export interface OrderFilters {
  status?: OrderStatus | 'all'
  dateFrom?: string
  dateTo?: string
  search?: string
  customer?: string
  sortBy?: 'created_at' | 'total' | 'status'
  sortOrder?: 'asc' | 'desc'
}

export interface OrderStats {
  total: number
  pending: number
  paid: number
  processing: number
  shipped: number
  delivered: number
  cancelled: number
  refunded: number
  revenue: number
}

// Status flow configuration
export const ORDER_STATUS_FLOW: Record<OrderStatus, OrderStatus[]> = {
  pending: ['paid', 'cancelled'],
  paid: ['processing', 'refunded', 'cancelled'],
  processing: ['shipped', 'ready_for_pickup', 'refunded'],
  shipped: ['delivered', 'refunded'],
  delivered: ['refunded'],
  cancelled: [],
  refunded: [],
  ready_for_pickup: ['delivered', 'refunded'],
}

// Status display configuration
export const ORDER_STATUS_CONFIG: Record<
  OrderStatus,
  { label: string; color: string; bgColor: string; icon: string }
> = {
  pending: {
    label: 'Pending',
    color: 'text-amber-400',
    bgColor: 'bg-amber-400/10',
    icon: 'Clock',
  },
  paid: {
    label: 'Paid',
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-400/10',
    icon: 'CheckCircle',
  },
  processing: {
    label: 'Processing',
    color: 'text-blue-400',
    bgColor: 'bg-blue-400/10',
    icon: 'Package',
  },
  shipped: {
    label: 'Shipped',
    color: 'text-purple-400',
    bgColor: 'bg-purple-400/10',
    icon: 'Truck',
  },
  delivered: {
    label: 'Delivered',
    color: 'text-green-400',
    bgColor: 'bg-green-400/10',
    icon: 'Home',
  },
  cancelled: {
    label: 'Cancelled',
    color: 'text-red-400',
    bgColor: 'bg-red-400/10',
    icon: 'XCircle',
  },
  refunded: {
    label: 'Refunded',
    color: 'text-gray-400',
    bgColor: 'bg-gray-400/10',
    icon: 'RotateCcw',
  },
  ready_for_pickup: {
    label: 'Ready for Pickup',
    color: 'text-cyan-400',
    bgColor: 'bg-cyan-400/10',
    icon: 'Store',
  },
}

// Generate human-friendly order number
export function generateOrderNumber(): string {
  const date = new Date()
  const yy = date.getFullYear().toString().slice(-2)
  const mm = String(date.getMonth() + 1).padStart(2, '0')
  const dd = String(date.getDate()).padStart(2, '0')
  const random = Math.floor(1000 + Math.random() * 9000)
  return `LGO-${yy}${mm}${dd}-${random}`
}

// Format currency
export function formatCurrency(amount: number, currency = 'EUR'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount)
}

// Format date
export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(d)
}

// Format date with time
export function formatDateTime(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(d)
}

// Check if status transition is valid
export function isValidStatusTransition(
  currentStatus: OrderStatus,
  newStatus: OrderStatus
): boolean {
  if (currentStatus === newStatus) return false
  return ORDER_STATUS_FLOW[currentStatus]?.includes(newStatus) || false
}

// Get available next statuses
export function getAvailableStatuses(currentStatus: OrderStatus): OrderStatus[] {
  return ORDER_STATUS_FLOW[currentStatus] || []
}
