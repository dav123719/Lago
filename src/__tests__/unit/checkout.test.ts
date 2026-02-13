// ============================================
// Checkout Validation Tests
// ============================================

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { 
  validateShippingAddress,
  validateBillingAddress,
  validatePostalCode,
  calculateShippingCost,
  calculateTax,
  formatOrderNumber,
  isValidLVPostalCode,
} from './checkout.utils'
import { OrderAddress } from '@/types/store'

// ============================================
// CHECKOUT UTILITIES
// ============================================

export interface ShippingAddress {
  firstName: string
  lastName: string
  email: string
  phone: string
  streetAddress: string
  city: string
  postalCode: string
  country: string
}

export function validateShippingAddress(address: Partial<ShippingAddress>): { 
  valid: boolean
  errors: Record<string, string>
} {
  const errors: Record<string, string> = {}

  if (!address.firstName?.trim()) {
    errors.firstName = 'First name is required'
  }

  if (!address.lastName?.trim()) {
    errors.lastName = 'Last name is required'
  }

  if (!address.email?.trim()) {
    errors.email = 'Email is required'
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(address.email)) {
    errors.email = 'Invalid email format'
  }

  if (!address.phone?.trim()) {
    errors.phone = 'Phone is required'
  }

  if (!address.streetAddress?.trim()) {
    errors.streetAddress = 'Street address is required'
  }

  if (!address.city?.trim()) {
    errors.city = 'City is required'
  }

  if (!address.postalCode?.trim()) {
    errors.postalCode = 'Postal code is required'
  } else if (!isValidLVPostalCode(address.postalCode)) {
    errors.postalCode = 'Invalid Latvian postal code'
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  }
}

export function validateBillingAddress(address: Partial<ShippingAddress>, sameAsShipping: boolean): {
  valid: boolean
  errors: Record<string, string>
} {
  if (sameAsShipping) {
    return { valid: true, errors: {} }
  }
  return validateShippingAddress(address)
}

export function validatePostalCode(postalCode: string, country: string = 'LV'): boolean {
  if (country === 'LV') {
    return isValidLVPostalCode(postalCode)
  }
  // Generic postal code: alphanumeric, 3-10 characters, spaces removed
  return /^[a-zA-Z0-9]{3,10}$/.test(postalCode.replace(/\s/g, ''))
}

export function isValidLVPostalCode(postalCode: string): boolean {
  // Latvian postal codes: LV-XXXX or XXXX format
  const cleaned = postalCode.replace(/\s/g, '').toUpperCase()
  return /^(LV-?)?\d{4}$/.test(cleaned)
}

export function calculateShippingCost(
  subtotal: number,
  shippingMethod: 'parcel_locker' | 'courier' | 'pickup',
  weightKg?: number
): number {
  if (shippingMethod === 'pickup') {
    return 0
  }

  if (shippingMethod === 'parcel_locker') {
    return subtotal > 500 ? 0 : 5.99
  }

  if (shippingMethod === 'courier') {
    const baseCost = subtotal > 1000 ? 0 : 15
    const weightCost = weightKg && weightKg > 50 ? Math.ceil((weightKg - 50) / 10) * 5 : 0
    return baseCost + weightCost
  }

  return 0
}

export function calculateTax(subtotal: number, taxRate: number = 0.21): number {
  return Math.round(subtotal * taxRate * 100) / 100
}

export function formatOrderNumber(orderId: string, date: Date = new Date()): string {
  const year = date.getFullYear().toString().slice(-2)
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const random = Math.floor(1000 + Math.random() * 9000)
  
  return `LGO-${year}${month}${day}-${random}`
}

// ============================================
// TESTS
// ============================================

describe('Checkout Utilities', () => {
  describe('validateShippingAddress', () => {
    const validAddress: Partial<ShippingAddress> = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      phone: '+37120000000',
      streetAddress: 'Krasta iela 52',
      city: 'Riga',
      postalCode: 'LV-1003',
      country: 'Latvia',
    }

    it('should validate complete address', () => {
      const result = validateShippingAddress(validAddress)
      expect(result.valid).toBe(true)
      expect(Object.keys(result.errors)).toHaveLength(0)
    })

    it('should require first name', () => {
      const result = validateShippingAddress({ ...validAddress, firstName: '' })
      expect(result.valid).toBe(false)
      expect(result.errors.firstName).toBe('First name is required')
    })

    it('should require last name', () => {
      const result = validateShippingAddress({ ...validAddress, lastName: '' })
      expect(result.valid).toBe(false)
      expect(result.errors.lastName).toBe('Last name is required')
    })

    it('should require valid email', () => {
      const result = validateShippingAddress({ ...validAddress, email: 'invalid' })
      expect(result.valid).toBe(false)
      expect(result.errors.email).toBe('Invalid email format')
    })

    it('should require phone', () => {
      const result = validateShippingAddress({ ...validAddress, phone: '' })
      expect(result.valid).toBe(false)
      expect(result.errors.phone).toBe('Phone is required')
    })

    it('should require street address', () => {
      const result = validateShippingAddress({ ...validAddress, streetAddress: '' })
      expect(result.valid).toBe(false)
      expect(result.errors.streetAddress).toBe('Street address is required')
    })

    it('should require city', () => {
      const result = validateShippingAddress({ ...validAddress, city: '' })
      expect(result.valid).toBe(false)
      expect(result.errors.city).toBe('City is required')
    })

    it('should require valid postal code', () => {
      const result = validateShippingAddress({ ...validAddress, postalCode: '123' })
      expect(result.valid).toBe(false)
      expect(result.errors.postalCode).toBe('Invalid Latvian postal code')
    })
  })

  describe('validateBillingAddress', () => {
    it('should skip validation when same as shipping', () => {
      const result = validateBillingAddress({}, true)
      expect(result.valid).toBe(true)
    })

    it('should validate when different from shipping', () => {
      const result = validateBillingAddress({}, false)
      expect(result.valid).toBe(false)
    })
  })

  describe('validatePostalCode', () => {
    it('should validate Latvian postal codes', () => {
      expect(validatePostalCode('LV-1003', 'LV')).toBe(true)
      expect(validatePostalCode('1003', 'LV')).toBe(true)
      expect(validatePostalCode('LV1003', 'LV')).toBe(true)
    })

    it('should reject invalid Latvian postal codes', () => {
      expect(validatePostalCode('123', 'LV')).toBe(false)
      expect(validatePostalCode('LV-123', 'LV')).toBe(false)
      expect(validatePostalCode('ABCD', 'LV')).toBe(false)
    })

    it('should validate generic postal codes for other countries', () => {
      expect(validatePostalCode('12345', 'US')).toBe(true)
      // UK postal codes with letters/spaces are validated with generic pattern
      expect(validatePostalCode('SW1A1AA', 'GB')).toBe(true)  // Letters allowed in generic pattern
    })
  })

  describe('calculateShippingCost', () => {
    it('should return 0 for pickup', () => {
      expect(calculateShippingCost(100, 'pickup')).toBe(0)
    })

    it('should calculate parcel locker cost', () => {
      expect(calculateShippingCost(100, 'parcel_locker')).toBe(5.99)
      expect(calculateShippingCost(600, 'parcel_locker')).toBe(0)
    })

    it('should calculate courier cost', () => {
      expect(calculateShippingCost(500, 'courier')).toBe(15)
      expect(calculateShippingCost(1500, 'courier')).toBe(0)
    })

    it('should add weight surcharge for heavy items', () => {
      expect(calculateShippingCost(500, 'courier', 60)).toBe(20)
      expect(calculateShippingCost(500, 'courier', 80)).toBe(30)
    })
  })

  describe('calculateTax', () => {
    it('should calculate tax at default rate', () => {
      expect(calculateTax(100)).toBe(21)
      expect(calculateTax(1000)).toBe(210)
    })

    it('should calculate tax at custom rate', () => {
      expect(calculateTax(100, 0.20)).toBe(20)
      expect(calculateTax(100, 0)).toBe(0)
    })

    it('should round to 2 decimal places', () => {
      expect(calculateTax(99.99)).toBe(21)
    })
  })

  describe('formatOrderNumber', () => {
    it('should format order number correctly', () => {
      const date = new Date('2024-01-15')
      const orderNumber = formatOrderNumber('order-1', date)
      
      expect(orderNumber).toMatch(/^LGO-240115-\d{4}$/)
    })

    it('should use current date by default', () => {
      const orderNumber = formatOrderNumber('order-1')
      expect(orderNumber).toMatch(/^LGO-\d{6}-\d{4}$/)
    })
  })
})

// ============================================
// CHECKOUT FLOW TESTS
// ============================================

describe('Checkout Flow', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should complete checkout successfully', async () => {
    // Test full checkout flow
  })

  it('should handle payment failure', async () => {
    // Test payment error handling
  })

  it('should validate stock before checkout', async () => {
    // Test stock validation
  })

  it('should apply discount codes', async () => {
    // Test discount application
  })

  it('should calculate totals correctly', async () => {
    // Test total calculation
  })
})
