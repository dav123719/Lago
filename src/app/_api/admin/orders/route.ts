// AGENT slave-3 v1.0.1 - API routes verified

// ===================================
export const dynamic = "force-dynamic"

// Admin Orders API - List/update orders
// ===================================

import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/client'
import { checkAdminRole } from '@/lib/admin/auth'

// CORS headers for API routes
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
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

// GET /api/admin/orders - List all orders
export async function GET(request: NextRequest) {
  try {
    // Validate environment variables
    validateEnv()

    // Check admin authorization
    const isAdmin = await checkAdminRole()
    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403, headers: corsHeaders }
      )
    }

    const { searchParams } = new URL(request.url)
    
    // Parse filters
    const status = searchParams.get('status')
    const dateFrom = searchParams.get('dateFrom')
    const dateTo = searchParams.get('dateTo')
    const search = searchParams.get('search')
    const customer = searchParams.get('customer')
    const sortBy = searchParams.get('sortBy') || 'created_at'
    const sortOrder = searchParams.get('sortOrder') || 'desc'
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')

    const supabase = createServerClient()
    
    let query = supabase
      .from('orders')
      .select(`
        *,
        items:order_items(*)
      `, { count: 'exact' })

    // Apply filters
    if (status && status !== 'all') {
      query = query.eq('status', status)
    }
    if (dateFrom) {
      query = query.gte('created_at', dateFrom)
    }
    if (dateTo) {
      query = query.lte('created_at', dateTo)
    }
    if (search) {
      query = query.or(
        `order_number.ilike.%${search}%,guest_email.ilike.%${search}%`
      )
    }
    if (customer) {
      query = query.or(
        `guest_email.ilike.%${customer}%`
      )
    }

    // Apply sorting
    query = query.order(sortBy, { ascending: sortOrder === 'asc' })

    // Apply pagination
    const from = (page - 1) * limit
    const to = from + limit - 1
    query = query.range(from, to)

    const { data, error, count } = await query

    if (error) {
      console.error('Error fetching orders:', error)
      return NextResponse.json(
        { error: 'Failed to fetch orders' },
        { status: 500, headers: corsHeaders }
      )
    }

    return NextResponse.json({
      orders: data,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    }, { headers: corsHeaders })
  } catch (error) {
    console.error('Error in GET /api/admin/orders:', error)
    
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
      { error: 'Internal server error' },
      { status: 500, headers: corsHeaders }
    )
  }
}

// POST /api/admin/orders - Create new order (admin)
export async function POST(request: NextRequest) {
  try {
    // Validate environment variables
    validateEnv()

    // Check admin authorization
    const isAdmin = await checkAdminRole()
    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403, headers: corsHeaders }
      )
    }

    const body = await request.json()
    const supabase = createServerClient()

    // Create order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        ...body,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (orderError) {
      console.error('Error creating order:', orderError)
      return NextResponse.json(
        { error: 'Failed to create order' },
        { status: 500, headers: corsHeaders }
      )
    }

    // Add order items if provided
    if (body.items && body.items.length > 0) {
      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(
          body.items.map((item: Record<string, unknown>) => ({
            ...item,
            order_id: (order as { id: string }).id,
          }))
        )

      if (itemsError) {
        console.error('Error creating order items:', itemsError)
        // Continue - order was created
      }
    }

    return NextResponse.json({ order }, { status: 201, headers: corsHeaders })
  } catch (error) {
    console.error('Error in POST /api/admin/orders:', error)
    
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
      { error: 'Internal server error' },
      { status: 500, headers: corsHeaders }
    )
  }
}
