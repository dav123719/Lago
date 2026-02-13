// AGENT slave-3 v1.0.1 - API routes verified

// ===================================
export const dynamic = "force-dynamic"

// Admin Order Tracking API - Add/update tracking info
// ===================================

import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/client'
import { checkAdminRole } from '@/lib/admin/auth'

// CORS headers for API routes
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, DELETE, OPTIONS',
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

// POST /api/admin/orders/[id]/tracking - Add/update tracking info
export async function POST(
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
    const { carrier, tracking_number, tracking_url, estimated_delivery } = body

    if (!carrier || !tracking_number) {
      return NextResponse.json(
        { error: 'Carrier and tracking number are required' },
        { status: 400, headers: corsHeaders }
      )
    }

    const supabase = createServerClient()

    // Build tracking object
    const trackingData = {
      carrier,
      tracking_number,
      tracking_url: tracking_url || null,
      shipped_at: new Date().toISOString(),
      estimated_delivery: estimated_delivery || null,
    }

    // Update order with tracking info
    const { data: order, error } = await supabase
      .from('orders')
      .update({
        tracking_info: trackingData,
        updated_at: new Date().toISOString(),
        // Auto-update status to shipped if not already
        status: 'shipped',
        shipped_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select(`
        *,
        items:order_items(*)
      `)
      .single()

    if (error) {
      console.error('Error updating tracking:', error)
      return NextResponse.json(
        { error: 'Failed to update tracking' },
        { status: 500, headers: corsHeaders }
      )
    }

    // Add status history entry (optional - if table exists)
    try {
      await supabase
        .from('order_status_history')
        .insert({
          order_id: id,
          status: 'shipped',
          notes: `Tracking added: ${carrier} - ${tracking_number}`,
          created_at: new Date().toISOString(),
        })
    } catch {
      // Table might not exist - continue
    }

    // TODO: Send shipping notification email to customer
    // await sendOrderShippedEmail(order, trackingData)

    return NextResponse.json({ order, tracking: trackingData }, { headers: corsHeaders })
  } catch (error) {
    console.error('Error in POST /api/admin/orders/[id]/tracking:', error)
    
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

// DELETE /api/admin/orders/[id]/tracking - Remove tracking info
export async function DELETE(
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

    const supabase = createServerClient()

    // Remove tracking info from order
    const { data: order, error } = await supabase
      .from('orders')
      .update({
        tracking_info: null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select(`
        *,
        items:order_items(*)
      `)
      .single()

    if (error) {
      console.error('Error removing tracking:', error)
      return NextResponse.json(
        { error: 'Failed to remove tracking' },
        { status: 500, headers: corsHeaders }
      )
    }

    return NextResponse.json({ order }, { headers: corsHeaders })
  } catch (error) {
    console.error('Error in DELETE /api/admin/orders/[id]/tracking:', error)
    
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
