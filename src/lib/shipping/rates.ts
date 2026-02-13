// ===================================
// Shipping Rates Calculation
// ===================================

import type { ShippingRate, ShippingAddress, ShippingMethod } from '@/types/checkout'
import { shippingMethods, calculateShippingPrice, getMethodsForCountry } from './carriers'
import type { Locale } from '@/lib/i18n/config'

// ===================================
// Rate Calculation
// ===================================

export interface RateCalculationInput {
  address: ShippingAddress
  subtotal: number
  weightKg?: number
  dimensions?: {
    length: number
    width: number
    height: number
  }
}

export interface RateCalculationResult {
  rates: ShippingRate[]
  errors?: string[]
}

/**
 * Calculate all available shipping rates for an address
 */
export async function calculateRates(input: RateCalculationInput): Promise<RateCalculationResult> {
  const { address, subtotal, weightKg = 0 } = input
  const errors: string[] = []
  const rates: ShippingRate[] = []

  // Get methods available for the country
  const availableMethods = getMethodsForCountry(address.country)

  for (const method of availableMethods) {
    try {
      // Check weight limit
      if (weightKg > method.maxWeightKg) {
        errors.push(`${method.name}: Weight limit exceeded`)
        continue
      }

      // Calculate price
      const price = calculateShippingPrice(method, subtotal, weightKg)

      rates.push({
        carrier: method.carrier,
        method: method.id,
        name: method.name,
        price,
        currency: 'EUR',
        estimatedDelivery: method.estimatedDaysLocalized['en'],
        lockerCompatible: method.requiresLocker,
      })
    } catch (error) {
      errors.push(`${method.name}: ${error instanceof Error ? error.message : 'Calculation failed'}`)
    }
  }

  return { rates, errors: errors.length > 0 ? errors : undefined }
}

/**
 * Get shipping rate for a specific method
 */
export function getRateForMethod(
  methodId: string,
  subtotal: number,
  weightKg: number = 0
): ShippingRate | null {
  const method = shippingMethods.find(m => m.id === methodId)
  if (!method) return null

  try {
    const price = calculateShippingPrice(method, subtotal, weightKg)

    return {
      carrier: method.carrier,
      method: method.id,
      name: method.name,
      price,
      currency: 'EUR',
      estimatedDelivery: method.estimatedDaysLocalized['en'],
      lockerCompatible: method.requiresLocker,
    }
  } catch {
    return null
  }
}

/**
 * Format price for display
 */
export function formatShippingPrice(price: number, locale: Locale = 'lv'): string {
  const formatter = new Intl.NumberFormat(
    locale === 'en' ? 'en-US' : locale === 'ru' ? 'ru-RU' : 'lv-LV',
    {
      style: 'currency',
      currency: 'EUR',
    }
  )

  if (price === 0) {
    return locale === 'lv' ? 'Bezmaksas' : locale === 'ru' ? 'Бесплатно' : 'Free'
  }

  return formatter.format(price)
}

// ===================================
// Weight Calculation
// ===================================

interface CartItemWeight {
  weight: number
  quantity: number
}

/**
 * Calculate total weight from cart items
 */
export function calculateTotalWeight(items: CartItemWeight[]): number {
  return items.reduce((total, item) => total + (item.weight * item.quantity), 0)
}

// ===================================
// Free Shipping
// ===================================

export interface FreeShippingInfo {
  threshold: number
  remaining: number
  qualified: boolean
}

/**
 * Get free shipping information for a subtotal
 */
export function getFreeShippingInfo(subtotal: number): FreeShippingInfo {
  // Use the lowest threshold across all methods
  const thresholds = shippingMethods
    .map(m => m.freeShippingThreshold)
    .filter(t => t > 0)
  
  const threshold = Math.min(...thresholds)
  const remaining = Math.max(0, threshold - subtotal)

  return {
    threshold,
    remaining,
    qualified: subtotal >= threshold,
  }
}

// ===================================
// Rate Caching
// ===================================

interface CachedRate {
  rates: ShippingRate[]
  timestamp: number
  key: string
}

const rateCache = new Map<string, CachedRate>()
const CACHE_TTL = 5 * 60 * 1000 // 5 minutes

function generateCacheKey(input: RateCalculationInput): string {
  return `${input.address.country}-${input.address.postalCode}-${input.subtotal}-${input.weightKg || 0}`
}

/**
 * Get cached rates if available
 */
export function getCachedRates(input: RateCalculationInput): ShippingRate[] | null {
  const key = generateCacheKey(input)
  const cached = rateCache.get(key)

  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.rates
  }

  // Clean up expired cache
  if (cached) {
    rateCache.delete(key)
  }

  return null
}

/**
 * Cache calculated rates
 */
export function cacheRates(input: RateCalculationInput, rates: ShippingRate[]): void {
  const key = generateCacheKey(input)
  rateCache.set(key, {
    rates,
    timestamp: Date.now(),
    key,
  })
}

/**
 * Clear all cached rates
 */
export function clearRateCache(): void {
  rateCache.clear()
}
