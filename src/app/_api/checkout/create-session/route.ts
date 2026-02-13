// ===================================
// API Route: Create Stripe Checkout Session
// ===================================
// AGENT slave-5 v1.0.1 - Checkout flow verified

export const dynamic = "force-dynamic"

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createCheckoutSession, isStripeConfigured } from '@/lib/stripe/server'
import { getRateForMethod } from '@/lib/shipping/rates'
import type { ShippingAddress, ShippingMethod, Product, Cart, CartItem, ParcelLocker } from '@/types/checkout'
// AGENT slave-8 v1.0.1 - Final optimization complete

// CORS headers for API routes
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
}

// CSRF protection - validate origin
const ALLOWED_ORIGINS = [
  process.env.NEXT_PUBLIC_SITE_URL,
  process.env.NEXT_PUBLIC_VERCEL_URL ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}` : null,
].filter((origin): origin is string => Boolean(origin))

// Environment variable validation
function validateEnv() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    throw new Error('Missing environment variable: NEXT_PUBLIC_SUPABASE_URL')
  }
  if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    throw new Error('Missing environment variable: NEXT_PUBLIC_SUPABASE_ANON_KEY')
  }
  // Stripe configuration is optional - checkout will fail gracefully if not configured
  if (!isStripeConfigured) {
    console.warn('⚠️  STRIPE_SECRET_KEY not configured - Stripe payments will be disabled')
  }
  if (!process.env.NEXT_PUBLIC_SITE_URL) {
    throw new Error('Missing environment variable: NEXT_PUBLIC_SITE_URL')
  }
}

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders })
}

export async function POST(request: NextRequest) {
  try {
    // Validate environment variables
    validateEnv()

    // Validate origin for CSRF protection
    const origin = request.headers.get('origin')
    const referer = request.headers.get('referer')
    
    const isValidOrigin = ALLOWED_ORIGINS.some(allowed => 
      origin?.startsWith(allowed) || referer?.startsWith(allowed)
    )

    if (process.env.NODE_ENV === 'production' && !isValidOrigin) {
      return NextResponse.json(
        { error: 'Invalid origin' },
        { status: 403, headers: corsHeaders }
      )
    }

    // Parse request body
    const body = await request.json()
    const { 
      cartId, 
      shippingAddress, 
      shippingMethodId,
      lockerId,
      locale = 'lv'
    } = body

    // Validate required fields
    if (!cartId || !shippingAddress || !shippingMethodId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400, headers: corsHeaders }
      )
    }

    // Initialize Supabase
    const supabase = await createClient()

    // ============================================
    // CRITICAL: Validate cart and fetch current prices from database
    // Never trust client-sent prices
    // ============================================
    
    const { data: cart, error: cartError } = await supabase
      .from('carts')
      .select('*')
      .eq('id', cartId)
      .single() as { data: Cart | null, error: unknown }

    if (cartError || !cart) {
      return NextResponse.json(
        { error: 'Cart not found' },
        { status: 404, headers: corsHeaders }
      )
    }

    // Fetch cart items with current product data
    const { data: cartItems, error: itemsError } = await supabase
      .from('cart_items')
      .select(`
        *,
        product:products(*)
      `)
      .eq('cart_id', cartId)

    if (itemsError || !cartItems || cartItems.length === 0) {
      return NextResponse.json(
        { error: 'Cart is empty' },
        { status: 400, headers: corsHeaders }
      )
    }

    // Validate stock and get current prices
    const validatedItems: Array<{ product: Product; quantity: number; price_at_time: number }> = []
    for (const item of cartItems as CartItem[]) {
      const product = item.product as Product

      // Check product availability
      if (!product.is_available) {
        return NextResponse.json(
          { error: `Product "${product.name}" is no longer available` },
          { status: 400, headers: corsHeaders }
        )
      }

      // Check stock
      if (product.stock_quantity < item.quantity) {
        return NextResponse.json(
          { error: `Not enough stock for "${product.name}". Only ${product.stock_quantity} available.` },
          { status: 400, headers: corsHeaders }
        )
      }

      // Use current price from database (server-side validation)
      validatedItems.push({
        product: product as Product,
        quantity: item.quantity,
        price_at_time: product.price, // Server-validated price
      })
    }

    // Calculate subtotal from validated prices
    const subtotal = validatedItems.reduce(
      (sum, item) => sum + item.price_at_time * item.quantity,
      0
    )

    // ============================================
    // Validate and calculate shipping
    // ============================================

    const shippingRate = getRateForMethod(shippingMethodId, subtotal)
    if (!shippingRate) {
      return NextResponse.json(
        { error: 'Invalid shipping method' },
        { status: 400, headers: corsHeaders }
      )
    }

    // Fetch locker if required
    let locker: ParcelLocker | null = null
    if (shippingRate.lockerCompatible && lockerId) {
      // Fetch locker details from API - use internal _api path
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
      const lockersResponse = await fetch(
        `${siteUrl}/_api/shipping/lockers?query=${encodeURIComponent(lockerId)}`
      )
      const lockersData = await lockersResponse.json() as { lockers?: ParcelLocker[] }
      
      locker = lockersData?.lockers?.find((l) => l.id === lockerId) || null
    }

    // Build shipping method object
    const shippingMethod: ShippingMethod = {
      id: shippingRate.method,
      carrier: shippingRate.carrier,
      name: shippingRate.name,
      nameLocalized: { lv: shippingRate.name, en: shippingRate.name, ru: shippingRate.name },
      price: shippingRate.price,
      estimatedDays: shippingRate.estimatedDelivery,
      isExpress: false,
      requiresLocker: shippingRate.lockerCompatible,
    }

    // ============================================
    // Create checkout session
    // ============================================

    // Check if Stripe is configured
    if (!isStripeConfigured) {
      return NextResponse.json(
        { 
          error: 'Payment system not configured',
          message: 'Stripe is not configured. Please contact support.'
        },
        { status: 503, headers: corsHeaders }
      )
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
    const successUrl = `${siteUrl}/${locale}/checkout/success?session_id={CHECKOUT_SESSION_ID}`
    const cancelUrl = `${siteUrl}/${locale}/checkout?cart_id=${cartId}`

    const session = await createCheckoutSession({
      cartItems: validatedItems,
      shippingAddress: shippingAddress as ShippingAddress,
      shippingMethod,
      shippingPrice: shippingRate.price,
      locker: locker || undefined,
      successUrl,
      cancelUrl,
      metadata: {
        cart_id: cartId,
        locale,
        guest_session_id: cart.guest_session_id || '',
      },
    })

    // Store checkout session reference in database
    await supabase
      .from('checkout_sessions')
      .insert({
        cart_id: cartId,
        stripe_session_id: session.sessionId,
        status: 'pending',
        shipping_address: shippingAddress,
        shipping_method: shippingMethod,
        shipping_price: shippingRate.price,
        subtotal,
        total: subtotal + shippingRate.price,
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
      })

    return NextResponse.json({
      sessionId: session.sessionId,
      url: session.url,
    }, { headers: corsHeaders })

  } catch (error) {
    console.error('Error creating checkout session:', error)
    
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
      { 
        error: 'Failed to create checkout session',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500, headers: corsHeaders }
    )
  }
}
