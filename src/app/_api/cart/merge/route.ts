// AGENT slave-3 v1.0.1 - API routes verified

// ===================================
export const dynamic = "force-dynamic"

// API Route: Merge Guest Cart with User Cart
// ===================================

import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

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

export async function POST(request: NextRequest) {
  try {
    // Validate environment variables
    validateEnv()

    const body = await request.json()
    const { guestSessionId, userId } = body

    if (!guestSessionId || !userId) {
      return NextResponse.json(
        { error: 'Missing required fields: guestSessionId and userId' },
        { status: 400, headers: corsHeaders }
      )
    }

    const supabase = createAdminClient()

    // Find guest cart
    const { data: guestCart, error: guestError } = await supabase
      .from('carts')
      .select('id')
      .eq('guest_session_id', guestSessionId)
      .eq('status', 'active')
      .single()

    if (guestError || !guestCart) {
      return NextResponse.json(
        { error: 'Guest cart not found' },
        { status: 404, headers: corsHeaders }
      )
    }

    // Find or create user cart
    const { data: userCart, error: userError } = await supabase
      .from('carts')
      .select('id')
      .eq('user_id', userId)
      .eq('status', 'active')
      .single()

    let userCartId: string

    if (userError || !userCart) {
      // Create new user cart
      const { data: newCart, error: createError } = await supabase
        .from('carts')
        .insert({ user_id: userId, status: 'active' })
        .select()
        .single()

      if (createError) throw createError
      userCartId = (newCart as { id: string }).id
    } else {
      userCartId = (userCart as { id: string }).id
    }

    // Get guest cart items
    const { data: guestItems, error: itemsError } = await supabase
      .from('cart_items')
      .select('*')
      .eq('cart_id', (guestCart as { id: string }).id) as { data: unknown[] | null, error: unknown }

    if (itemsError) throw itemsError

    // Merge items
    for (const item of guestItems || []) {
      const typedItem = item as { product_id: string; quantity: number; price_at_time: number }
      
      // Check if same product exists in user cart
      const { data: existingItem } = await supabase
        .from('cart_items')
        .select('id, quantity')
        .eq('cart_id', userCartId)
        .eq('product_id', typedItem.product_id)
        .single() as { data: { id: string; quantity: number } | null, error: unknown }

      if (existingItem) {
        // Update quantity
        await supabase
          .from('cart_items')
          .update({ quantity: existingItem.quantity + typedItem.quantity })
          .eq('id', existingItem.id)
      } else {
        // Insert new item
        await supabase
          .from('cart_items')
          .insert({
            cart_id: userCartId,
            product_id: typedItem.product_id,
            quantity: typedItem.quantity,
            price_at_time: typedItem.price_at_time,
          })
      }
    }

    // Mark guest cart as converted
    await supabase
      .from('carts')
      .update({ status: 'converted' })
      .eq('id', (guestCart as { id: string }).id)

    return NextResponse.json({ 
      success: true, 
      message: 'Carts merged successfully',
      cartId: userCartId
    }, { headers: corsHeaders })

  } catch (error) {
    console.error('Error merging carts:', error)
    
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
        error: 'Failed to merge carts',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500, headers: corsHeaders }
    )
  }
}
