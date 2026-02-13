// AGENT slave-3 v1.0.1 - API routes verified

// ===================================
export const dynamic = "force-dynamic"

// API Route: Get Shipping Rates
// ===================================

import { NextRequest, NextResponse } from 'next/server'
import { calculateRates, getCachedRates, cacheRates } from '@/lib/shipping/rates'
import type { ShippingAddress } from '@/types/checkout'

// CORS headers for API routes
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
}

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders })
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { address, subtotal, weightKg } = body

    // Validate required fields
    if (!address || !address.country || subtotal === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields: address.country and subtotal' },
        { status: 400, headers: corsHeaders }
      )
    }

    // Validate address structure
    const shippingAddress: ShippingAddress = {
      firstName: address.firstName || '',
      lastName: address.lastName || '',
      email: address.email || '',
      phone: address.phone || '',
      country: address.country,
      city: address.city || '',
      postalCode: address.postalCode || '',
      addressLine1: address.addressLine1 || '',
      addressLine2: address.addressLine2,
      companyName: address.companyName,
      vatNumber: address.vatNumber,
    }

    const input = {
      address: shippingAddress,
      subtotal: Number(subtotal),
      weightKg: weightKg ? Number(weightKg) : 0,
    }

    // Check cache first
    let rates = getCachedRates(input)

    if (!rates) {
      // Calculate rates
      const result = await calculateRates(input)
      rates = result.rates
      
      // Cache the results
      cacheRates(input, rates)

      // Log any calculation errors (but don't fail)
      if (result.errors) {
        console.warn('Shipping rate calculation warnings:', result.errors)
      }
    }

    return NextResponse.json({ rates }, { headers: corsHeaders })
  } catch (error) {
    console.error('Error calculating shipping rates:', error)
    
    return NextResponse.json(
      { 
        error: 'Failed to calculate shipping rates',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500, headers: corsHeaders }
    )
  }
}

// Also allow GET for simple country-based queries
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const country = searchParams.get('country')
    const subtotal = searchParams.get('subtotal')

    if (!country) {
      return NextResponse.json(
        { error: 'Missing required parameter: country' },
        { status: 400, headers: corsHeaders }
      )
    }

    const address: ShippingAddress = {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      country,
      city: '',
      postalCode: '',
      addressLine1: '',
    }

    const input = {
      address,
      subtotal: Number(subtotal) || 0,
      weightKg: 0,
    }

    let rates = getCachedRates(input)

    if (!rates) {
      const result = await calculateRates(input)
      rates = result.rates
      cacheRates(input, rates)
    }

    return NextResponse.json({ rates }, { headers: corsHeaders })
  } catch (error) {
    console.error('Error getting shipping rates:', error)
    
    return NextResponse.json(
      { 
        error: 'Failed to get shipping rates',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500, headers: corsHeaders }
    )
  }
}
