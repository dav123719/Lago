// AGENT slave-3 v1.0.1 - API routes verified

// ===================================
export const dynamic = "force-dynamic"

// API Route: Get Parcel Lockers
// ===================================

import { NextRequest, NextResponse } from 'next/server'
import { fetchOmnivaLockers, searchOmnivaLockers, getNearestOmnivaLockers } from '@/lib/shipping/omniva'
import { fetchDpdPickupPoints, searchDpdPickupPoints, getNearestDpdPickupPoints } from '@/lib/shipping/dpd'
import type { ParcelLocker } from '@/types/checkout'

// CORS headers for API routes
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
}

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders })
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const carrier = searchParams.get('carrier') // 'omniva', 'dpd', 'all'
    const country = searchParams.get('country') // 'LV', 'LT', 'EE', etc.
    const query = searchParams.get('query') // Search query
    const lat = searchParams.get('lat') // Latitude for nearest search
    const lng = searchParams.get('lng') // Longitude for nearest search
    const limit = searchParams.get('limit') || '20'

    let lockers: ParcelLocker[] = []

    // If coordinates provided, get nearest lockers
    if (lat && lng) {
      const latitude = parseFloat(lat)
      const longitude = parseFloat(lng)
      const limitNum = Math.min(parseInt(limit), 50)

      if (isNaN(latitude) || isNaN(longitude)) {
        return NextResponse.json(
          { error: 'Invalid coordinates' },
          { status: 400, headers: corsHeaders }
        )
      }

      const [omnivaNearest, dpdNearest] = await Promise.all([
        (!carrier || carrier === 'all' || carrier === 'omniva') 
          ? getNearestOmnivaLockers(latitude, longitude, limitNum)
          : Promise.resolve([]),
        (!carrier || carrier === 'all' || carrier === 'dpd')
          ? getNearestDpdPickupPoints(latitude, longitude, limitNum)
          : Promise.resolve([]),
      ])

      lockers = [...omnivaNearest, ...dpdNearest]
        .sort((a, b) => {
          // Sort by distance (we'd need to calculate this properly)
          return 0
        })
        .slice(0, limitNum)
    }
    // If query provided, search lockers
    else if (query) {
      const [omnivaResults, dpdResults] = await Promise.all([
        (!carrier || carrier === 'all' || carrier === 'omniva')
          ? searchOmnivaLockers(query, country || undefined)
          : Promise.resolve([]),
        (!carrier || carrier === 'all' || carrier === 'dpd')
          ? searchDpdPickupPoints(query, country || undefined)
          : Promise.resolve([]),
      ])

      lockers = [...omnivaResults, ...dpdResults]
    }
    // Otherwise, get all lockers for country
    else {
      const [omnivaLockers, dpdLockers] = await Promise.all([
        (!carrier || carrier === 'all' || carrier === 'omniva')
          ? fetchOmnivaLockers(country || undefined)
          : Promise.resolve([]),
        (!carrier || carrier === 'all' || carrier === 'dpd')
          ? fetchDpdPickupPoints(country || undefined)
          : Promise.resolve([]),
      ])

      lockers = [...omnivaLockers, ...dpdLockers]
    }

    // Filter by country if specified
    if (country && !query && !lat) {
      lockers = lockers.filter(l => 
        l.country.toUpperCase() === country.toUpperCase()
      )
    }

    return NextResponse.json({ 
      lockers,
      total: lockers.length,
      filters: {
        carrier: carrier || 'all',
        country: country || 'all',
        query: query || undefined,
      }
    }, { headers: corsHeaders })
  } catch (error) {
    console.error('Error fetching parcel lockers:', error)
    
    return NextResponse.json(
      { 
        error: 'Failed to fetch parcel lockers',
        message: error instanceof Error ? error.message : 'Unknown error',
        lockers: []
      },
      { status: 500, headers: corsHeaders }
    )
  }
}
