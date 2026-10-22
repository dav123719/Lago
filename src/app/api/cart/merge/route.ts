import { isValidQuantity, requestOriginAllowed } from '@/lib/security/cart'
// AGENT slave-3 v1.0.1 - API routes verified

// ===================================
export const dynamic = "force-dynamic"

// API Route: Merge Guest Cart with User Cart
// ===================================

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { createAdminClient } from '@/lib/supabase/admin'

// CORS headers for API routes
const corsHeaders = {
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
    if (!requestOriginAllowed(request.headers)) return NextResponse.json({ error: 'Invalid origin' }, { status: 403 })

    // Validate environment variables
    validateEnv()

    const body = await request.json()
    const authClient = await createClient()
    const { data: { user } } = await authClient.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    const guestSessionId = (await cookies()).get('cart_session')?.value
    const userId = user.id
    if (body.guestSessionId !== guestSessionId || (body.userId && body.userId !== userId)) return NextResponse.json({ error: 'Cart ownership mismatch' }, { status: 403 })

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
      .is('user_id', null)
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
      
      if (!isValidQuantity(typedItem.quantity)) throw new Error('Invalid cart quantity')
      // Check if same product exists in user cart
      const { data: existingItem } = await supabase
        .from('cart_items')
        .select('id, quantity')
        .eq('cart_id', userCartId)
        .eq('product_id', typedItem.product_id)
        .single() as { data: { id: string; quantity: number } | null, error: unknown }

      if (existingItem) {
        if (!isValidQuantity(existingItem.quantity + typedItem.quantity)) throw new Error('Invalid combined cart quantity')
        // Update quantity
        const { error: mergeError } = await supabase
          .from('cart_items')
          .update({ quantity: existingItem.quantity + typedItem.quantity })
          .eq('id', existingItem.id)
        if (mergeError) throw mergeError
      } else {
        // Insert new item
        const { error: mergeError } = await supabase
          .from('cart_items')
          .insert({
            cart_id: userCartId,
            product_id: typedItem.product_id,
            quantity: typedItem.quantity,
            price_at_time: typedItem.price_at_time,
          })
        if (mergeError) throw mergeError
      }
    }

    // Mark guest cart as converted
    const { error: convertError } = await supabase
      .from('carts')
      .update({ status: 'converted' })
      .eq('id', (guestCart as { id: string }).id)
    if (convertError) throw convertError

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
        message: 'Please try again or contact support'
      },
      { status: 500, headers: corsHeaders }
    )
  }
}
