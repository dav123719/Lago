// ===================================
// Guest Session Hook
// ===================================
// Manages guest session ID for non-logged-in users
// Persists in localStorage and cookie for SSR compatibility

'use client'

import { useState, useEffect, useCallback } from 'react'
import { useCookies } from './useCookies'

const GUEST_SESSION_KEY = 'lago_guest_session_id'
const GUEST_SESSION_COOKIE = 'guest_session_id'
const SESSION_EXPIRY_DAYS = 30

export interface UseGuestSessionReturn {
  sessionId: string | null
  isLoading: boolean
  refreshSession: () => string
  clearSession: () => void
  setSessionEmail: (email: string) => void
  getSessionEmail: () => string | null
}

/**
 * Generate a unique session ID
 */
function generateSessionId(): string {
  const timestamp = Date.now().toString(36)
  const random = Math.random().toString(36).substring(2, 11)
  return `guest_${timestamp}_${random}`
}

/**
 * Hook for managing guest sessions
 * - Generates and persists session ID for guest users
 * - Syncs between localStorage and cookies
 * - Used for cart persistence without login
 */
export function useGuestSession(): UseGuestSessionReturn {
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const { getCookie, setCookie, removeCookie } = useCookies()

  // Initialize session from storage or create new
  const initializeSession = useCallback(() => {
    if (typeof window === 'undefined') return null

    try {
      // Try localStorage first
      let existingId = localStorage.getItem(GUEST_SESSION_KEY)
      
      // Fallback to cookie
      if (!existingId) {
        existingId = getCookie(GUEST_SESSION_COOKIE)
      }

      if (existingId) {
        // Validate format
        if (existingId.startsWith('guest_')) {
          setSessionId(existingId)
          // Ensure sync between storage mechanisms
          localStorage.setItem(GUEST_SESSION_KEY, existingId)
          setCookie(GUEST_SESSION_COOKIE, existingId, SESSION_EXPIRY_DAYS)
          return existingId
        }
      }

      // Create new session if none exists
      return createNewSession()
    } catch (error) {
      console.error('Error initializing guest session:', error)
      return createNewSession()
    } finally {
      setIsLoading(false)
    }
  }, [getCookie, setCookie])

  // Create a new session
  const createNewSession = useCallback(() => {
    const newId = generateSessionId()
    
    try {
      localStorage.setItem(GUEST_SESSION_KEY, newId)
      setCookie(GUEST_SESSION_COOKIE, newId, SESSION_EXPIRY_DAYS)
      setSessionId(newId)
      return newId
    } catch (error) {
      console.error('Error creating guest session:', error)
      return newId
    }
  }, [setCookie])

  // Refresh/regenerate session
  const refreshSession = useCallback(() => {
    return createNewSession()
  }, [createNewSession])

  // Clear session (on logout or checkout completion)
  const clearSession = useCallback(() => {
    try {
      localStorage.removeItem(GUEST_SESSION_KEY)
      removeCookie(GUEST_SESSION_COOKIE)
      setSessionId(null)
    } catch (error) {
      console.error('Error clearing guest session:', error)
    }
  }, [removeCookie])

  // Store session email for checkout
  const setSessionEmail = useCallback((email: string) => {
    try {
      localStorage.setItem(`${GUEST_SESSION_KEY}_email`, email)
    } catch (error) {
      console.error('Error storing session email:', error)
    }
  }, [])

  // Retrieve session email
  const getSessionEmail = useCallback(() => {
    try {
      return localStorage.getItem(`${GUEST_SESSION_KEY}_email`)
    } catch {
      return null
    }
  }, [])

  // Initialize on mount
  useEffect(() => {
    initializeSession()
  }, [initializeSession])

  return {
    sessionId,
    isLoading,
    refreshSession,
    clearSession,
    setSessionEmail,
    getSessionEmail,
  }
}
