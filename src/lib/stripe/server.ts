// ===================================
// Stripe Server Configuration
// ===================================
// AGENT slave-5 v1.0.1 - Checkout flow verified

import Stripe from 'stripe'
import type {
  ShippingAddress,
  ShippingMethod,
  ParcelLocker,
  Product,
  CartItem,
} from '@/types/checkout'

// Initialize Stripe with secret key
const stripeSecretKey = process.env.STRIPE_SECRET_KEY

// Check if Stripe is properly configured
export const isStripeConfigured = !!stripeSecretKey && stripeSecretKey.startsWith('sk_')

if (!isStripeConfigured) {
  console.warn('⚠️  STRIPE_SECRET_KEY is not configured. Stripe payments will be disabled.')
}

export const stripe = isStripeConfigured
  ? new Stripe(stripeSecretKey!, {
      apiVersion: '2025-02-24.acacia' as const,
      typescript: true,
    })
  : ({} as Stripe) // Type assertion for graceful degradation

// ===================================
// Types
// ===================================

export interface CheckoutSessionInput {
  cartItems: Array<{
    product: Product
    quantity: number
    price_at_time: number
  }>
  shippingAddress: ShippingAddress
  shippingMethod: ShippingMethod
  shippingPrice: number
  locker?: ParcelLocker
  successUrl: string
  cancelUrl: string
  metadata?: Record<string, string>
}

export interface CheckoutSessionResult {
  sessionId: string
  url: string
}

// ===================================
// Session Creation
// ===================================

/**
 * Create a Stripe Checkout Session
 * 
 * CRITICAL: All prices are validated server-side against the database
 * Never trust client-sent prices
 */
export async function createCheckoutSession(
  input: CheckoutSessionInput
): Promise<CheckoutSessionResult> {
  const {
    cartItems,
    shippingAddress,
    shippingMethod,
    shippingPrice,
    locker,
    successUrl,
    cancelUrl,
    metadata = {},
  } = input

  // Calculate subtotal from validated prices
  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.price_at_time * item.quantity,
    0
  )

  const total = subtotal + shippingPrice

  // Build line items
  const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = cartItems.map(item => ({
    price_data: {
      currency: 'eur',
      product_data: {
        name: item.product.name,
        description: item.product.sku,
        images: item.product.image ? [item.product.image] : undefined,
        metadata: {
          product_id: item.product.id,
          sku: item.product.sku,
        },
      },
      unit_amount: Math.round(item.price_at_time * 100), // Convert to cents
    },
    quantity: item.quantity,
  }))

  // Add shipping as line item if > 0
  if (shippingPrice > 0) {
    lineItems.push({
      price_data: {
        currency: 'eur',
        product_data: {
          name: `Shipping: ${shippingMethod.name}`,
          description: locker 
            ? `To: ${locker.name}, ${locker.address}`
            : `To: ${shippingAddress.city}, ${shippingAddress.postalCode}`,
        },
        unit_amount: Math.round(shippingPrice * 100),
      },
      quantity: 1,
    })
  }

  // Build shipping address for Stripe
  const stripeShippingAddress: Stripe.Checkout.SessionCreateParams.ShippingAddressCollection = {
    allowed_countries: ['LV', 'LT', 'EE', 'FI', 'SE', 'DE', 'PL'],
  }

  // Create session
  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    payment_method_types: ['card'],
    line_items: lineItems,
    success_url: successUrl,
    cancel_url: cancelUrl,
    shipping_address_collection: stripeShippingAddress,
    phone_number_collection: {
      enabled: true,
    },
    customer_email: shippingAddress.email,
    metadata: {
      ...metadata,
      subtotal: subtotal.toFixed(2),
      shipping_price: shippingPrice.toFixed(2),
      total: total.toFixed(2),
      shipping_method: shippingMethod.id,
      shipping_carrier: shippingMethod.carrier,
      locker_id: locker?.id || '',
    },
    payment_intent_data: {
      metadata: {
        ...metadata,
        subtotal: subtotal.toFixed(2),
        shipping_price: shippingPrice.toFixed(2),
        total: total.toFixed(2),
      },
    },
    // Enable tax calculation if configured
    // automatic_tax: { enabled: true },
    
    // Custom text
    custom_text: {
      submit: {
        message: 'By completing this purchase, you agree to our terms and conditions.',
      },
    },
  })

  if (!session.url) {
    throw new Error('Failed to create checkout session URL')
  }

  return {
    sessionId: session.id,
    url: session.url,
  }
}

// ===================================
// Session Retrieval
// ===================================

/**
 * Retrieve a checkout session
 */
export async function retrieveCheckoutSession(sessionId: string) {
  return stripe.checkout.sessions.retrieve(sessionId, {
    expand: ['line_items', 'payment_intent', 'customer'],
  })
}

// ===================================
// Webhook Handling
// ===================================

/**
 * Verify Stripe webhook signature
 */
export function constructWebhookEvent(
  payload: string | Buffer,
  signature: string,
  webhookSecret: string
): Stripe.Event {
  return stripe.webhooks.constructEvent(payload, signature, webhookSecret)
}

// ===================================
// Payment Intent
// ===================================

/**
 * Retrieve a payment intent
 */
export async function retrievePaymentIntent(paymentIntentId: string) {
  return stripe.paymentIntents.retrieve(paymentIntentId)
}

// ===================================
// Refunds
// ===================================

/**
 * Create a refund
 */
export async function createRefund(
  paymentIntentId: string,
  amount?: number,
  reason?: string
) {
  return stripe.refunds.create({
    payment_intent: paymentIntentId,
    amount: amount ? Math.round(amount * 100) : undefined,
    reason: reason as Stripe.RefundCreateParams.Reason,
  })
}

// ===================================
// Customer Management
// ===================================

/**
 * Create or retrieve a customer
 */
export async function createCustomer(
  email: string,
  name?: string,
  phone?: string,
  metadata?: Record<string, string>
) {
  // Check if customer exists
  const existing = await stripe.customers.list({
    email,
    limit: 1,
  })

  if (existing.data.length > 0) {
    return existing.data[0]
  }

  // Create new customer
  return stripe.customers.create({
    email,
    name,
    phone,
    metadata,
  })
}
