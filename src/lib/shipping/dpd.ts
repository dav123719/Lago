// ===================================
// DPD API Client
// ===================================

import type { ParcelLocker } from '@/types/checkout'

// DPD API endpoints
const DPD_API_BASE = 'https://api.dpd.lv'

// ===================================
// Types
// ===================================

interface DpdPickupPoint {
  id: string
  name: string
  address: string
  city: string
  postcode: string
  country: string
  latitude: number
  longitude: number
  type: 'locker' | 'shop'
  services: string[]
  openingHours: DpdOpeningHours[]
}

interface DpdOpeningHours {
  day: string
  open: string
  close: string
}

// ===================================
// Client
// ===================================

/**
 * Fetch DPD pickup points (parcel lockers and shops)
 */
export async function fetchDpdPickupPoints(
  countryCode?: string
): Promise<ParcelLocker[]> {
  try {
    // Note: This is a placeholder implementation.
    // DPD requires API key authentication. Replace with actual API call.
    // const response = await fetch(`${DPD_API_BASE}/pickup-points`, {
    //   headers: {
    //     'Authorization': `Bearer ${process.env.DPD_API_KEY}`,
    //   },
    // })

    // For now, return mock data
    const points = getMockDpdPoints()

    if (countryCode) {
      return points.filter(p => 
        p.country.toUpperCase() === countryCode.toUpperCase()
      )
    }

    return points
  } catch (error) {
    console.error('Error fetching DPD pickup points:', error)
    return getMockDpdPoints(countryCode)
  }
}

/**
 * Search DPD pickup points
 */
export async function searchDpdPickupPoints(
  query: string,
  countryCode?: string
): Promise<ParcelLocker[]> {
  const points = await fetchDpdPickupPoints(countryCode)
  
  const lowerQuery = query.toLowerCase()
  
  return points.filter(point => 
    point.name.toLowerCase().includes(lowerQuery) ||
    point.address.toLowerCase().includes(lowerQuery) ||
    point.city.toLowerCase().includes(lowerQuery) ||
    point.postalCode.includes(query)
  )
}

/**
 * Get nearest DPD pickup points
 */
export async function getNearestDpdPickupPoints(
  latitude: number,
  longitude: number,
  limit: number = 5
): Promise<ParcelLocker[]> {
  const points = await fetchDpdPickupPoints()

  const withDistance = points.map(point => ({
    point,
    distance: calculateDistance(
      latitude,
      longitude,
      point.latitude,
      point.longitude
    ),
  }))

  withDistance.sort((a, b) => a.distance - b.distance)

  return withDistance.slice(0, limit).map(d => d.point)
}

// ===================================
// Mock Data
// ===================================

const mockDpdPoints: ParcelLocker[] = [
  {
    id: 'dpd_riga_alfa',
    name: 'DPD Pickup - Alfa',
    address: 'Dzelzavas iela 120',
    city: 'Rīga',
    postalCode: '10312',
    country: 'LV',
    latitude: 56.9752,
    longitude: 24.1991,
    carrier: 'dpd',
    isActive: true,
  },
  {
    id: 'dpd_riga_origo',
    name: 'DPD Pickup - Origo',
    address: 'Stacijas laukums 4',
    city: 'Rīga',
    postalCode: '1050',
    country: 'LV',
    latitude: 56.9461,
    longitude: 24.1048,
    carrier: 'dpd',
    isActive: true,
  },
  {
    id: 'dpd_riga_spice',
    name: 'DPD Pickup - Spice',
    address: 'Lielirbes iela 29',
    city: 'Rīga',
    postalCode: '1046',
    country: 'LV',
    latitude: 56.9598,
    longitude: 24.0805,
    carrier: 'dpd',
    isActive: true,
  },
  {
    id: 'dpd_riga_dole',
    name: 'DPD Pickup - Dole',
    address: 'Maskavas iela 357',
    city: 'Rīga',
    postalCode: '1063',
    country: 'LV',
    latitude: 56.9245,
    longitude: 24.1821,
    carrier: 'dpd',
    isActive: true,
  },
  {
    id: 'dpd_riga_galerija_centrs',
    name: 'DPD Pickup - Galerija Centrs',
    address: 'Audēju iela 16',
    city: 'Rīga',
    postalCode: '1050',
    country: 'LV',
    latitude: 56.9484,
    longitude: 24.1083,
    carrier: 'dpd',
    isActive: true,
  },
]

function getMockDpdPoints(countryCode?: string): ParcelLocker[] {
  if (!countryCode) return mockDpdPoints
  return mockDpdPoints.filter(p => p.country === countryCode.toUpperCase())
}

// ===================================
// Utilities
// ===================================

function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371
  const dLat = toRadians(lat2 - lat1)
  const dLon = toRadians(lon2 - lon1)
  
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2)
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  
  return R * c
}

function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180)
}
