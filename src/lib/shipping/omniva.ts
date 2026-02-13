// ===================================
// Omniva API Client
// ===================================

import type { ParcelLocker } from '@/types/checkout'

// Omniva API endpoints
const OMNIVA_API_BASE = 'https://www.omniva.ee/api'
const OMNIVA_LOCATIONS_URL = `${OMNIVA_API_BASE}/parcelMapJson`

// ===================================
// Types
// ===================================

interface OmnivaLocation {
  ZIP: string
  NAME: string
  TYPE: string // '0' = post office, '1' = locker
  A0_NAME: string // Country
  A1_NAME: string // Region
  A2_NAME: string // City
  A3_NAME: string // District
  A4_NAME: string // Street
  A5_NAME: string // Building
  A6_NAME: string // Entrance
  A7_NAME: string // Floor
  A8_NAME: string // Room
  X_COORDINATE: string
  Y_COORDINATE: string
  SERVICE_HOURS: string
  TEMP_SERVICE_HOURS: string
  TEMP_SERVICE_HOURS_UNTIL: string
  TEMP_SERVICE_HOURS2: string
  TEMP_SERVICE_HOURS_UNTIL2: string
  comment_est: string
  comment_eng: string
  comment_rus: string
  comment_lav: string
  comment_lit: string
  comment_fin: string
  MODIFIED: string
}

// ===================================
// Client
// ===================================

/**
 * Fetch Omniva parcel lockers
 */
export async function fetchOmnivaLockers(
  countryCode?: string
): Promise<ParcelLocker[]> {
  try {
    const response = await fetch(OMNIVA_LOCATIONS_URL, {
      next: { revalidate: 3600 }, // Cache for 1 hour
    })

    if (!response.ok) {
      throw new Error(`Omniva API error: ${response.status}`)
    }

    const data: OmnivaLocation[] = await response.json()

    // Filter and transform
    const lockers = data
      .filter(location => location.TYPE === '1') // Only parcel lockers
      .filter(location => 
        !countryCode || 
        location.A0_NAME.toUpperCase() === countryCode.toUpperCase()
      )
      .map(transformOmnivaLocker)
      .filter(Boolean) as ParcelLocker[]

    return lockers
  } catch (error) {
    console.error('Error fetching Omniva lockers:', error)
    return getFallbackLockers(countryCode)
  }
}

/**
 * Search Omniva lockers by city or address
 */
export async function searchOmnivaLockers(
  query: string,
  countryCode?: string
): Promise<ParcelLocker[]> {
  const lockers = await fetchOmnivaLockers(countryCode)
  
  const lowerQuery = query.toLowerCase()
  
  return lockers.filter(locker => 
    locker.name.toLowerCase().includes(lowerQuery) ||
    locker.address.toLowerCase().includes(lowerQuery) ||
    locker.city.toLowerCase().includes(lowerQuery) ||
    locker.postalCode.includes(query)
  )
}

/**
 * Get nearest lockers by coordinates
 */
export async function getNearestOmnivaLockers(
  latitude: number,
  longitude: number,
  limit: number = 5
): Promise<ParcelLocker[]> {
  const lockers = await fetchOmnivaLockers()

  // Calculate distances and sort
  const withDistance = lockers.map(locker => ({
    locker,
    distance: calculateDistance(
      latitude,
      longitude,
      locker.latitude,
      locker.longitude
    ),
  }))

  withDistance.sort((a, b) => a.distance - b.distance)

  return withDistance.slice(0, limit).map(d => d.locker)
}

// ===================================
// Transformers
// ===================================

function transformOmnivaLocker(location: OmnivaLocation): ParcelLocker | null {
  try {
    const lat = parseFloat(location.Y_COORDINATE)
    const lng = parseFloat(location.X_COORDINATE)

    if (isNaN(lat) || isNaN(lng)) {
      return null
    }

    // Build address string
    const addressParts = [
      location.A5_NAME, // Building
      location.A4_NAME, // Street
      location.A3_NAME, // District
    ].filter(Boolean)

    return {
      id: `omniva_${location.ZIP}`,
      name: location.NAME,
      address: addressParts.join(', '),
      city: location.A2_NAME,
      postalCode: location.ZIP,
      country: location.A0_NAME.toUpperCase(),
      latitude: lat,
      longitude: lng,
      carrier: 'omniva',
      isActive: true,
    }
  } catch (error) {
    console.error('Error transforming Omniva locker:', error)
    return null
  }
}

// ===================================
// Utilities
// ===================================

/**
 * Calculate distance between two coordinates using Haversine formula
 */
function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371 // Earth's radius in km
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

// ===================================
// Fallback Data
// ===================================

const fallbackLockers: ParcelLocker[] = [
  {
    id: 'omniva_10312',
    name: 'Rīga, Dzelzavas iela 120 (Alfa)',
    address: 'Dzelzavas iela 120',
    city: 'Rīga',
    postalCode: '10312',
    country: 'LV',
    latitude: 56.9755,
    longitude: 24.1994,
    carrier: 'omniva',
    isActive: true,
  },
  {
    id: 'omniva_1063',
    name: 'Rīga, Brīvības iela 372',
    address: 'Brīvības iela 372',
    city: 'Rīga',
    postalCode: '1063',
    country: 'LV',
    latitude: 56.9636,
    longitude: 24.1504,
    carrier: 'omniva',
    isActive: true,
  },
  {
    id: 'omniva_1050',
    name: 'Rīga, Stacijas laukums 2',
    address: 'Stacijas laukums 2',
    city: 'Rīga',
    postalCode: '1050',
    country: 'LV',
    latitude: 56.9463,
    longitude: 24.1050,
    carrier: 'omniva',
    isActive: true,
  },
]

function getFallbackLockers(countryCode?: string): ParcelLocker[] {
  if (!countryCode) return fallbackLockers
  return fallbackLockers.filter(l => l.country === countryCode.toUpperCase())
}
