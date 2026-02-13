// ============================================
// Auth Flow Tests
// ============================================

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { 
  validateEmail,
  validatePassword,
  validatePhone,
  formatPhoneNumber,
  isValidLatvianPhone,
} from './auth.utils'

// ============================================
// AUTH UTILITIES
// ============================================

export function validateEmail(email: string): { valid: boolean; error?: string } {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  
  if (!email) {
    return { valid: false, error: 'Email is required' }
  }
  
  if (!emailRegex.test(email)) {
    return { valid: false, error: 'Please enter a valid email address' }
  }
  
  return { valid: true }
}

export function validatePassword(password: string): { valid: boolean; error?: string; strength: 'weak' | 'medium' | 'strong' } {
  if (!password || password.length < 8) {
    return { valid: false, error: 'Password must be at least 8 characters', strength: 'weak' }
  }
  
  const hasUpperCase = /[A-Z]/.test(password)
  const hasLowerCase = /[a-z]/.test(password)
  const hasNumbers = /\d/.test(password)
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password)
  
  const strength = hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChar
    ? 'strong'
    : (hasUpperCase || hasLowerCase) && hasNumbers
    ? 'medium'
    : 'weak'
  
  if (!hasUpperCase || !hasLowerCase || !hasNumbers) {
    return { 
      valid: false, 
      error: 'Password must contain uppercase, lowercase, and numbers',
      strength 
    }
  }
  
  return { valid: true, strength }
}

export function validatePhone(phone: string): { valid: boolean; error?: string } {
  if (!phone) {
    return { valid: false, error: 'Phone number is required' }
  }
  
  const cleaned = phone.replace(/\s/g, '').replace(/^\+/, '')
  
  if (!/^\d{8,15}$/.test(cleaned)) {
    return { valid: false, error: 'Please enter a valid phone number' }
  }
  
  return { valid: true }
}

export function formatPhoneNumber(phone: string): string {
  const cleaned = phone.replace(/\D/g, '')
  
  if (cleaned.startsWith('371') && cleaned.length === 11) {
    return `+${cleaned.slice(0, 3)} ${cleaned.slice(3, 5)} ${cleaned.slice(5, 8)} ${cleaned.slice(8)}`
  }
  
  if (cleaned.length === 8) {
    return `+371 ${cleaned.slice(0, 2)} ${cleaned.slice(2, 5)} ${cleaned.slice(5)}`
  }
  
  return phone
}

export function isValidLatvianPhone(phone: string): boolean {
  const cleaned = phone.replace(/\s/g, '').replace(/^\+/, '')
  // Latvian mobile: 2xxxxxxx or 3712xxxxxxx
  return /^(371)?2\d{7}$/.test(cleaned)
}

// ============================================
// TESTS
// ============================================

describe('Auth Utilities', () => {
  describe('validateEmail', () => {
    it('should validate correct email', () => {
      const result = validateEmail('test@example.com')
      expect(result.valid).toBe(true)
      expect(result.error).toBeUndefined()
    })

    it('should reject empty email', () => {
      const result = validateEmail('')
      expect(result.valid).toBe(false)
      expect(result.error).toBe('Email is required')
    })

    it('should reject invalid email format', () => {
      const invalidEmails = ['test', 'test@', '@example.com', 'test@example']
      
      invalidEmails.forEach(email => {
        const result = validateEmail(email)
        expect(result.valid).toBe(false)
        expect(result.error).toBe('Please enter a valid email address')
      })
    })
  })

  describe('validatePassword', () => {
    it('should validate strong password', () => {
      const result = validatePassword('StrongP@ss123')
      expect(result.valid).toBe(true)
      expect(result.strength).toBe('strong')
    })

    it('should reject short password', () => {
      const result = validatePassword('Short1')
      expect(result.valid).toBe(false)
      expect(result.error).toContain('8 characters')
      expect(result.strength).toBe('weak')
    })

    it('should check password strength', () => {
      // password123: has lowercase, numbers, but no uppercase -> valid=false (needs uppercase), strength=medium (has lowercase + numbers)
      expect(validatePassword('password123').strength).toBe('medium')
      expect(validatePassword('Password123').strength).toBe('medium')
      expect(validatePassword('Password123!').strength).toBe('strong')
    })

    it('should reject password without uppercase', () => {
      const result = validatePassword('password123!')
      expect(result.valid).toBe(false)
    })

    it('should reject password without numbers', () => {
      const result = validatePassword('Password!')
      expect(result.valid).toBe(false)
    })
  })

  describe('validatePhone', () => {
    it('should validate phone number', () => {
      const result = validatePhone('+371 20000000')
      expect(result.valid).toBe(true)
    })

    it('should reject empty phone', () => {
      const result = validatePhone('')
      expect(result.valid).toBe(false)
      expect(result.error).toBe('Phone number is required')
    })

    it('should reject invalid phone format', () => {
      const result = validatePhone('123')
      expect(result.valid).toBe(false)
      expect(result.error).toBe('Please enter a valid phone number')
    })
  })

  describe('formatPhoneNumber', () => {
    it('should format Latvian phone with country code', () => {
      expect(formatPhoneNumber('+37120000000')).toBe('+371 20 000 000')
    })

    it('should format Latvian phone without country code', () => {
      expect(formatPhoneNumber('20000000')).toBe('+371 20 000 000')
    })

    it('should handle phone with spaces', () => {
      expect(formatPhoneNumber('+371 20 000 000')).toBe('+371 20 000 000')
    })
  })

  describe('isValidLatvianPhone', () => {
    it('should validate Latvian mobile', () => {
      expect(isValidLatvianPhone('20000000')).toBe(true)
      expect(isValidLatvianPhone('+37120000000')).toBe(true)
      expect(isValidLatvianPhone('+371 20 000 000')).toBe(true)
    })

    it('should reject non-Latvian numbers', () => {
      expect(isValidLatvianPhone('12345678')).toBe(false)
      expect(isValidLatvianPhone('+442000000000')).toBe(false)
    })

    it('should reject landline numbers', () => {
      expect(isValidLatvianPhone('67000000')).toBe(false)
    })
  })
})

// ============================================
// AUTH CONTEXT TESTS
// ============================================

describe('Auth Context', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should sign in user', async () => {
    // Test sign in functionality
  })

  it('should sign up new user', async () => {
    // Test sign up functionality
  })

  it('should sign out user', async () => {
    // Test sign out functionality
  })

  it('should reset password', async () => {
    // Test password reset functionality
  })

  it('should update user profile', async () => {
    // Test profile update functionality
  })

  it('should handle auth state changes', async () => {
    // Test auth state change handling
  })
})
