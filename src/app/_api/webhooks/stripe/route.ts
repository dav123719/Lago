// AGENT slave-3 v1.0.1 - API routes verified

// ===================================
export const dynamic = "force-dynamic"

// API Route: Stripe Webhook Handler
// ===================================

import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { stripe, constructWebhookEvent } from '@/lib/stripe/server'
import { createAdminClient } from '@/lib/supabase/admin'
import type Stripe from 'stripe'

// Type definitions for Supabase data
type Product = { id: string; name: string; sku: string; price: number; image?: string }
type CartItem = { 
  id: string; 
  cart_id: string; 
  product_id: string; 
  quantity: number; 
  price_at_time: number;
  product?: Product 
}
type Order = { id: string; order_number: string }

// CORS headers for API routes
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
}

// Environment variable validation
function validateEnv() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    throw new Error('Missing environment variable: NEXT_PUBLIC_SUPABASE_URL')
  }
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('Missing environment variable: SUPABASE_SERVICE_ROLE_KEY')
  }
  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    throw new Error('Missing environment variable: STRIPE_WEBHOOK_SECRET')
  }
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('Missing environment variable: STRIPE_SECRET_KEY')
  }
}

// Webhook secret
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders })
}

/**
 * Handle Stripe webhooks
 */
export async function POST(request: NextRequest) {
  try {
    // Validate environment variables
    validateEnv()

    // Get the raw body
    const payload = await request.text()
    
    // Get Stripe signature
    const headersList = await headers()
    const signature = headersList.get('stripe-signature')

    if (!signature) {
      return NextResponse.json(
        { error: 'Missing Stripe signature' },
        { status: 400, headers: corsHeaders }
      )
    }

    if (!webhookSecret) {
      console.error('STRIPE_WEBHOOK_SECRET not configured')
      return NextResponse.json(
        { error: 'Webhook secret not configured' },
        { status: 500, headers: corsHeaders }
      )
    }

    // Verify webhook signature
    let event: Stripe.Event
    try {
      event = constructWebhookEvent(payload, signature, webhookSecret)
    } catch (err) {
      console.error('Webhook signature verification failed:', err)
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400, headers: corsHeaders }
      )
    }

    // Initialize Supabase admin client
    const supabase = createAdminClient()

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        await handleCheckoutSessionCompleted(session, supabase)
        break
      }

      case 'checkout.session.expired': {
        const session = event.data.object as Stripe.Checkout.Session
        await handleCheckoutSessionExpired(session, supabase)
        break
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        await handlePaymentFailed(paymentIntent, supabase)
        break
      }

      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        await handlePaymentSucceeded(paymentIntent, supabase)
        break
      }

      case 'charge.refunded': {
        const charge = event.data.object as Stripe.Charge
        await handleRefund(charge, supabase)
        break
      }

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true }, { headers: corsHeaders })

  } catch (error) {
    console.error('Error handling webhook:', error)
    
    // Check if it's an environment variable error
    if (error instanceof Error && error.message.includes('Missing environment variable')) {
      return NextResponse.json(
        { 
          error: 'Server configuration error',
          message: error.message
        },
        { status: 500, headers: corsHeaders }
      )
    }
    
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500, headers: corsHeaders }
    )
  }
}

// ===================================
// Event Handlers
// ===================================

async function handleCheckoutSessionCompleted(
  session: Stripe.Checkout.Session,
  supabase: ReturnType<typeof createAdminClient>
) {
  console.log('Processing completed checkout session:', session.id)

  const metadata = session.metadata || {}
  const cartId = metadata.cart_id
  const locale = metadata.locale || 'lv'

  if (!cartId) {
    console.error('No cart_id in session metadata')
    return
  }

  // Get cart items
  const { data: cartItems, error: itemsError } = await supabase
    .from('cart_items')
    .select(`
      *,
      product:products(*)
    `)
    .eq('cart_id', cartId) as { data: CartItem[] | null; error: unknown }

  if (itemsError || !cartItems) {
    console.error('Failed to fetch cart items:', itemsError)
    return
  }

  // Calculate totals
  const subtotal = cartItems.reduce((sum, item) => {
    const productPrice = item.product?.price
    const itemPrice = productPrice || item.price_at_time
    return sum + itemPrice * item.quantity
  }, 0)

  const shippingPrice = parseFloat(metadata.shipping_price || '0')
  const total = parseFloat(metadata.total || '0')

  // Generate order number
  const orderNumber = generateOrderNumber()

  // Get shipping details from session
  const shippingDetails = session.shipping_details
  const customerEmail = session.customer_email || metadata.customer_email

  // Create order
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert({
      order_number: orderNumber,
      user_id: metadata.user_id || null,
      guest_email: customerEmail,
      guest_session_id: metadata.guest_session_id || null,
      status: 'confirmed',
      payment_status: 'captured',
      shipping_address: {
        firstName: shippingDetails?.name?.split(' ')[0] || '',
        lastName: shippingDetails?.name?.split(' ').slice(1).join(' ') || '',
        email: customerEmail || '',
        phone: session.customer_details?.phone || '',
        country: shippingDetails?.address?.country || '',
        city: shippingDetails?.address?.city || '',
        postalCode: shippingDetails?.address?.postal_code || '',
        addressLine1: shippingDetails?.address?.line1 || '',
        addressLine2: shippingDetails?.address?.line2 || '',
      },
      shipping_method: metadata.shipping_method || '',
      shipping_price: shippingPrice,
      subtotal,
      tax_amount: 0, // Calculate if needed
      discount_amount: 0,
      total,
      currency: 'EUR',
      stripe_session_id: session.id,
      stripe_payment_intent_id: session.payment_intent as string,
    })
    .select()
    .single() as { data: Order; error: unknown }

  if (orderError) {
    console.error('Failed to create order:', orderError)
    return
  }

  // Create order items
  const orderItems = cartItems.map(item => ({
    order_id: order.id,
    product_id: item.product_id,
    product_name: item.product?.name || '',
    product_sku: item.product?.sku || '',
    quantity: item.quantity,
    unit_price: item.product?.price || item.price_at_time,
    total_price: (item.product?.price || item.price_at_time) * item.quantity,
    product_image: item.product?.image,
  }))

  const { error: itemsInsertError } = await supabase
    .from('order_items')
    .insert(orderItems)

  if (itemsInsertError) {
    console.error('Failed to create order items:', itemsInsertError)
  }

  // Update product stock
  for (const item of cartItems) {
    const { error: stockError } = await supabase.rpc('decrement_stock', {
      p_product_id: item.product_id,
      p_quantity: item.quantity,
    })

    if (stockError) {
      console.error(`Failed to update stock for product ${item.product_id}:`, stockError)
    }
  }

  // Update cart status
  await supabase
    .from('carts')
    .update({ status: 'converted' })
    .eq('id', cartId)

  // Update checkout session status
  await supabase
    .from('checkout_sessions')
    .update({ status: 'completed' })
    .eq('stripe_session_id', session.id)

  // Send order confirmation email (implement based on your email provider)
  console.log(`Order ${orderNumber} created successfully`)

  // TODO: Send email notification
  // await sendOrderConfirmationEmail(order, customerEmail)
}

async function handleCheckoutSessionExpired(
  session: Stripe.Checkout.Session,
  supabase: ReturnType<typeof createAdminClient>
) {
  console.log('Checkout session expired:', session.id)

  await supabase
    .from('checkout_sessions')
    .update({ status: 'expired' })
    .eq('stripe_session_id', session.id)
}

async function handlePaymentFailed(
  paymentIntent: Stripe.PaymentIntent,
  supabase: ReturnType<typeof createAdminClient>
) {
  console.log('Payment failed:', paymentIntent.id)

  await supabase
    .from('checkout_sessions')
    .update({ status: 'failed' })
    .eq('stripe_payment_intent_id', paymentIntent.id)
}

async function handlePaymentSucceeded(
  paymentIntent: Stripe.PaymentIntent,
  supabase: ReturnType<typeof createAdminClient>
) {
  console.log('Payment succeeded:', paymentIntent.id)

  // Update order payment status
  await supabase
    .from('orders')
    .update({ payment_status: 'captured' })
    .eq('stripe_payment_intent_id', paymentIntent.id)
}

async function handleRefund(
  charge: Stripe.Charge,
  supabase: ReturnType<typeof createAdminClient>
) {
  console.log('Refund processed:', charge.id)

  // Find and update order
  const { data: orders } = await supabase
    .from('orders')
    .select('id')
    .eq('stripe_payment_intent_id', charge.payment_intent as string)
    .limit(1) as { data: { id: string }[] | null; error: unknown }

  if (orders && orders.length > 0) {
    await supabase
      .from('orders')
      .update({ 
        payment_status: 'refunded',
        status: 'cancelled'
      })
      .eq('id', orders[0].id)
  }
}

// ===================================
// Utilities
// ===================================

function generateOrderNumber(): string {
  const date = new Date()
  const year = date.getFullYear().toString().slice(-2)
  const month = (date.getMonth() + 1).toString().padStart(2, '0')
  const day = date.getDate().toString().padStart(2, '0')
  const random = Math.floor(1000 + Math.random() * 9000)
  
  return `LAGO${year}${month}${day}-${random}`
}
