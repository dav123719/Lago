// AGENT slave-3 v1.0.1 - API routes verified

// ===================================
export const dynamic = "force-dynamic"

// Admin Orders API - List/update orders
// ===================================

import { NextRequest, NextResponse } from 'next/server'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { checkAdminRole } from '@/lib/admin/auth'

// CORS headers for API routes
const corsHeaders = {
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Cache-Control': 'private, no-store',
}

const ORDER_STATUSES = new Set(['pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded', 'ready_for_pickup'])
const SORT_COLUMNS = new Set(['created_at', 'updated_at', 'order_number', 'total', 'status'])
// List responses omit Stripe identifiers, notes and full item snapshots. Detail
// endpoints remain responsible for loading the complete selected order.
const LIST_COLUMNS = 'id,order_number,user_id,guest_email,status,total,currency,shipping_address,created_at,updated_at,items:order_items(id)'

class InvalidFilter extends Error {}

function parsePage(value: string | null, fallback: number, maximum: number): number {
  if (value === null) return fallback
  if (!/^[1-9]\d*$/.test(value)) throw new InvalidFilter('Invalid pagination')
  const number = Number(value)
  if (!Number.isSafeInteger(number)) throw new InvalidFilter('Invalid pagination')
  return Math.min(number, maximum)
}

function parseSearch(value: string | null): string | null {
  const search = value?.trim() || null
  // PostgREST OR strings have their own filter grammar. Keep its delimiters and
  // wildcard syntax out of interpolated values while allowing normal names and
  // email addresses, including apostrophes, plus signs and Latvian letters.
  if (search && (search.length > 120 || !/^[\p{L}\p{N} @._+'-]+$/u.test(search))) {
    throw new InvalidFilter('Invalid search')
  }
  return search?.replaceAll('_', '\\_') || null
}

function parseDate(value: string | null): string | null {
  if (!value) return null
  if (!/^\d{4}-\d{2}-\d{2}(?:T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?(?:Z|[+-]\d{2}:\d{2}))?$/.test(value) || !Number.isFinite(Date.parse(value))) {
    throw new InvalidFilter('Invalid date')
  }
  // Reject normalized impossible calendar dates such as February 30.
  if (new Date(value.slice(0, 10)).toISOString().slice(0, 10) !== value.slice(0, 10)) throw new InvalidFilter('Invalid date')
  return value
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
    
    const status = searchParams.get('status')
    if (status && status !== 'all' && !ORDER_STATUSES.has(status)) throw new InvalidFilter('Invalid status')
    const dateFrom = parseDate(searchParams.get('dateFrom'))
    const dateTo = parseDate(searchParams.get('dateTo'))
    if (dateFrom && dateTo && Date.parse(dateFrom) > Date.parse(dateTo)) throw new InvalidFilter('Invalid date range')
    const search = parseSearch(searchParams.get('search'))
    const customer = parseSearch(searchParams.get('customer'))
    const sortBy = searchParams.get('sortBy') || 'created_at'
    const sortOrder = searchParams.get('sortOrder') || 'desc'
    if (!SORT_COLUMNS.has(sortBy) || !['asc', 'desc'].includes(sortOrder)) throw new InvalidFilter('Invalid sort')
    const page = parsePage(searchParams.get('page'), 1, 10_000)
    const limit = parsePage(searchParams.get('limit'), 50, 100)

    const supabase = await createServerClient()
    
    let query = supabase
      .from('orders')
      .select(LIST_COLUMNS, { count: 'exact' })

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
      query = query.ilike('guest_email', `%${customer}%`)
    }

    // Apply sorting
    query = query.order(sortBy, { ascending: sortOrder === 'asc' }).order('id', { ascending: true })

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
    if (error instanceof InvalidFilter) return NextResponse.json({ error: error.message }, { status: 400, headers: corsHeaders })
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
    const supabase = await createServerClient()

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
