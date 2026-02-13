// AGENT slave-3 v1.0.1 - API routes verified

// ===================================
export const dynamic = "force-dynamic"

// Admin Order Status API - Update order status
// ===================================

import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/client'
import { checkAdminRole } from '@/lib/admin/auth'

// CORS headers for API routes
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'PUT, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
}

type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded'

// Valid status transitions
const validTransitions: Record<OrderStatus, OrderStatus[]> = {
  pending: ['confirmed', 'cancelled'],
  confirmed: ['processing', 'cancelled'],
  processing: ['shipped', 'cancelled'],
  shipped: ['delivered', 'cancelled'],
  delivered: ['refunded'],
  cancelled: [],
  refunded: [],
}

function isValidStatusTransition(currentStatus: OrderStatus, newStatus: OrderStatus): boolean {
  return validTransitions[currentStatus]?.includes(newStatus) || false
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

// PUT /api/admin/orders/[id]/status - Update order status
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Validate environment variables
    validateEnv()

    const { id } = await params

    // Check admin authorization
    const isAdmin = await checkAdminRole()
    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403, headers: corsHeaders }
      )
    }

    const body = await request.json()
    const { status, notes } = body

    if (!status) {
      return NextResponse.json(
        { error: 'Status is required' },
        { status: 400, headers: corsHeaders }
      )
    }

    const supabase = createServerClient()

    // Get current order
    const { data: currentOrder, error: fetchError } = await supabase
      .from('orders')
      .select('status')
      .eq('id', id)
      .single()

    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Order not found' },
          { status: 404, headers: corsHeaders }
        )
      }
      console.error('Error fetching order:', fetchError)
      return NextResponse.json(
        { error: 'Failed to fetch order' },
        { status: 500, headers: corsHeaders }
      )
    }

    // Validate status transition
    if (!currentOrder || !isValidStatusTransition((currentOrder as { status: OrderStatus }).status, status)) {
      return NextResponse.json(
        { 
          error: 'Invalid status transition',
          currentStatus: (currentOrder as { status: string })?.status,
          requestedStatus: status,
        },
        { status: 400, headers: corsHeaders }
      )
    }

    // Build update object with timestamp fields
    const updateData: Record<string, string> = {
      status,
      updated_at: new Date().toISOString(),
    }

    // Set timestamp based on status
    const timestampFields: Record<string, string> = {
      confirmed: 'confirmed_at',
      shipped: 'shipped_at',
      delivered: 'delivered_at',
      cancelled: 'cancelled_at',
      refunded: 'refunded_at',
    }

    if (timestampFields[status]) {
      updateData[timestampFields[status]] = new Date().toISOString()
    }

    // Update order
    const { data: order, error: updateError } = await supabase
      .from('orders')
      .update(updateData)
      .eq('id', id)
      .select(`
        *,
        items:order_items(*)
      `)
      .single()

    if (updateError) {
      console.error('Error updating order status:', updateError)
      return NextResponse.json(
        { error: 'Failed to update order status' },
        { status: 500, headers: corsHeaders }
      )
    }

    // Add status history entry (optional - if table exists)
    try {
      await supabase
        .from('order_status_history')
        .insert({
          order_id: id,
          status,
          notes: notes || null,
          created_at: new Date().toISOString(),
        })
    } catch {
      // Table might not exist - continue
    }

    // TODO: Send email notification to customer
    // await sendOrderStatusUpdateEmail(order, status)

    return NextResponse.json({ order }, { headers: corsHeaders })
  } catch (error) {
    console.error('Error in PUT /api/admin/orders/[id]/status:', error)
    
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
