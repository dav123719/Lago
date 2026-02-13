// AGENT slave-3 v1.0.1 - API routes verified

// ============================================
export const dynamic = "force-dynamic"

// Add to Cart API Route
// ============================================

import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/client'
import { cookies } from 'next/headers'
import { randomUUID } from 'crypto'

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
}

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders })
}

export async function POST(req: NextRequest) {
  try {
    // Validate environment variables
    validateEnv()

    const body = await req.json()
    const { productId, variantId, quantity = 1 } = body

    if (!productId) {
      return NextResponse.json(
        { error: 'Product ID is required' },
        { status: 400, headers: corsHeaders }
      )
    }

    const supabase = createServerClient()

    // Get or create session ID for guest cart
    const cookieStore = await cookies()
    let sessionId = cookieStore.get('cart_session')?.value

    if (!sessionId) {
      sessionId = randomUUID()
      cookieStore.set('cart_session', sessionId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 30, // 30 days
      })
    }

    // Get product details
    const { data: product, error: productError } = await supabase
      .from('products')
      .select('*')
      .eq('id', productId)
      .single() as { data: unknown, error: unknown }

    if (productError || !product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404, headers: corsHeaders }
      )
    }

    const productData = product as { stock_quantity: number; compare_at_price: number | null; price: number }

    // Check stock
    if (productData.stock_quantity < quantity) {
      return NextResponse.json(
        { error: 'Insufficient stock' },
        { status: 400, headers: corsHeaders }
      )
    }

    // Get or create cart
    let { data: cart } = await supabase
      .from('carts')
      .select('id')
      .eq('guest_session_id', sessionId)
      .is('user_id', null)
      .single() as { data: { id: string } | null, error: unknown }

    if (!cart) {
      const { data: newCart, error: cartError } = await supabase
        .from('carts')
        .insert({
          guest_session_id: sessionId,
          status: 'active',
        })
        .select()
        .single()

      if (cartError) {
        throw cartError
      }

      cart = newCart as { id: string }
    }

    // Check if item already exists in cart
    const { data: existingItem } = await supabase
      .from('cart_items')
      .select('id, quantity')
      .eq('cart_id', cart.id)
      .eq('product_id', productId)
      .single() as { data: { id: string; quantity: number } | null, error: unknown }

    if (existingItem) {
      // Update quantity
      const { error: updateError } = await supabase
        .from('cart_items')
        .update({
          quantity: existingItem.quantity + quantity,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existingItem.id)

      if (updateError) {
        throw updateError
      }
    } else {
      // Add new item
      const { error: insertError } = await supabase
        .from('cart_items')
        .insert({
          cart_id: cart.id,
          product_id: productId,
          price_at_time: productData.compare_at_price || productData.price,
          quantity,
        })

      if (insertError) {
        throw insertError
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Item added to cart',
    }, { headers: corsHeaders })

  } catch (error) {
    console.error('Error adding to cart:', error)
    
    // Check if it's an environment variable error
    if (error instanceof Error && error.message.includes('Missing environment variable')) {
      return NextResponse.json(
        { error: 'Server configuration error', message: error.message },
        { status: 500, headers: corsHeaders }
      )
    }
    
    return NextResponse.json(
      { error: 'Failed to add item to cart' },
      { status: 500, headers: corsHeaders }
    )
  }
}
