// AGENT slave-3 v1.0.1 - API routes verified

// ===================================
export const dynamic = "force-dynamic"

// API Route: Get Cart Total
// ===================================

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// CORS headers for API routes
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
}

// Environment variable validation
function validateEnv() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    throw new Error('Missing environment variable: NEXT_PUBLIC_SUPABASE_URL')
  }
  if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    throw new Error('Missing environment variable: NEXT_PUBLIC_SUPABASE_ANON_KEY')
  }
}

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders })
}

export async function GET(request: NextRequest) {
  try {
    // Validate environment variables
    validateEnv()

    const { searchParams } = new URL(request.url)
    const cartId = searchParams.get('cart_id')

    if (!cartId) {
      return NextResponse.json(
        { error: 'Missing cart_id parameter' },
        { status: 400, headers: corsHeaders }
      )
    }

    const supabase = await createClient()

    // Fetch cart items with product prices
    const { data: cartItems, error } = await supabase
      .from('cart_items')
      .select(`
        quantity,
        price_at_time,
        product:products(price)
      `)
      .eq('cart_id', cartId) as { data: unknown[] | null, error: unknown }

    if (error) {
      throw error
    }

    // Calculate total
    const subtotal = cartItems?.reduce((sum, item) => {
      const typedItem = item as { price_at_time: number | null; product: unknown }
      const productData = typedItem.product as { price: number } | null
      const price = typedItem.price_at_time || productData?.price || 0
      const typedItemQty = item as { quantity: number }
      return sum + price * typedItemQty.quantity
    }, 0) || 0

    const itemCount = cartItems?.reduce((sum, item) => {
      const typedItem = item as { quantity: number }
      return sum + typedItem.quantity
    }, 0) || 0

    return NextResponse.json({
      subtotal,
      itemCount,
      currency: 'EUR',
    }, { headers: corsHeaders })

  } catch (error) {
    console.error('Error fetching cart total:', error)
    
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
        error: 'Failed to fetch cart total',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500, headers: corsHeaders }
    )
  }
}
