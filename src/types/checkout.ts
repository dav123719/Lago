// ===================================
// Checkout & Cart Types
// ===================================

import { Locale } from '@/lib/i18n/config'

// ===================================
// Product Types
// ===================================

export interface Product {
  id: string
  name: string
  name_en?: string
  name_ru?: string
  slug: string
  description?: string
  price: number
  compare_at_price?: number
  image?: string
  stock_quantity: number
  sku: string
  category?: string
  weight_kg?: number
  dimensions?: {
    length: number
    width: number
    height: number
  }
  is_available: boolean
  metadata?: Record<string, unknown>
}

// ===================================
// Cart Types
// ===================================

export interface CartItem {
  id: string
  cart_id: string
  product_id: string
  quantity: number
  price_at_time: number
  created_at: string
  updated_at: string
  product?: Product
}

export interface Cart {
  id: string
  user_id?: string
  guest_session_id?: string
  status: 'active' | 'converted' | 'abandoned'
  created_at: string
  updated_at: string
  items: CartItem[]
}

export interface CartWithItems extends Cart {
  items: CartItem[]
}

export interface AddToCartInput {
  productId: string
  quantity: number
}

export interface UpdateCartItemInput {
  itemId: string
  quantity: number
}

// ===================================
// Shipping Types
// ===================================

export type CarrierType = 'omniva' | 'dpd' | 'latvijas_pasts' | 'pickup'

export interface ShippingAddress {
  firstName: string
  lastName: string
  email: string
  phone: string
  country: string
  city: string
  postalCode: string
  addressLine1: string
  addressLine2?: string
  companyName?: string
  vatNumber?: string
}

export interface ParcelLocker {
  id: string
  name: string
  address: string
  city: string
  postalCode: string
  country: string
  latitude: number
  longitude: number
  carrier: CarrierType
  isActive: boolean
}

export interface ShippingMethod {
  id: string
  carrier: CarrierType
  name: string
  nameLocalized: Record<Locale, string>
  description?: string
  price: number
  estimatedDays: string
  isExpress: boolean
  requiresLocker: boolean
  maxWeightKg?: number
}

export interface ShippingRate {
  carrier: CarrierType
  method: string
  name: string
  price: number
  currency: string
  estimatedDelivery: string
  lockerCompatible: boolean
}

export interface ShippingDetails {
  address: ShippingAddress
  method: ShippingMethod
  locker?: ParcelLocker
  notes?: string
}

// ===================================
// Checkout Types
// ===================================

export type CheckoutStep = 'cart' | 'shipping' | 'payment' | 'confirmation'

export interface CheckoutSession {
  id: string
  cart_id: string
  guest_session_id?: string
  user_id?: string
  status: 'pending' | 'processing' | 'completed' | 'cancelled' | 'failed'
  shipping_address: ShippingAddress
  shipping_method: ShippingMethod
  shipping_price: number
  subtotal: number
  total: number
  currency: string
  stripe_session_id?: string
  stripe_payment_intent_id?: string
  created_at: string
  updated_at: string
  expires_at: string
}

export interface CheckoutInput {
  cartId: string
  shippingAddress: ShippingAddress
  shippingMethodId: string
  lockerId?: string
}

export interface CheckoutTotals {
  subtotal: number
  shipping: number
  tax: number
  discount: number
  total: number
  currency: string
}

// ===================================
// Order Types
// ===================================

export type OrderStatus = 
  | 'pending' 
  | 'confirmed' 
  | 'processing' 
  | 'shipped' 
  | 'delivered' 
  | 'cancelled' 
  | 'refunded'

export type PaymentStatus = 
  | 'pending' 
  | 'authorized' 
  | 'captured' 
  | 'failed' 
  | 'refunded' 
  | 'cancelled'

export interface OrderItem {
  id: string
  order_id: string
  product_id: string
  product_name: string
  product_sku: string
  quantity: number
  unit_price: number
  total_price: number
  product_image?: string
}

export interface Order {
  id: string
  order_number: string
  user_id?: string
  guest_email?: string
  guest_session_id?: string
  status: OrderStatus
  payment_status: PaymentStatus
  shipping_address: ShippingAddress
  shipping_method: string
  shipping_price: number
  subtotal: number
  tax_amount: number
  discount_amount: number
  total: number
  currency: string
  notes?: string
  tracking_number?: string
  shipped_at?: string
  delivered_at?: string
  created_at: string
  updated_at: string
  items: OrderItem[]
}

// ===================================
// Stripe Types
// ===================================

export interface StripeCheckoutInput {
  cartId: string
  shippingAddress: ShippingAddress
  shippingMethod: ShippingMethod
  locker?: ParcelLocker
  successUrl: string
  cancelUrl: string
}

export interface StripeSessionResult {
  sessionId: string
  url: string
}

export interface StripeWebhookEvent {
  id: string
  object: string
  api_version: string
  created: number
  type: string
  data: {
    object: unknown
  }
}

// ===================================
// Guest Session Types
// ===================================

export interface GuestSession {
  id: string
  email?: string
  phone?: string
  created_at: string
  expires_at: string
  cart_id?: string
}

// ===================================
// API Response Types
// ===================================

export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface ShippingRatesResponse {
  rates: ShippingRate[]
}

export interface LockersResponse {
  lockers: ParcelLocker[]
}
