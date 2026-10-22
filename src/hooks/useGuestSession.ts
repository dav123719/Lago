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
  return `guest_${crypto.randomUUID()}`
}

/**
 * Hook for managing guest sessions
 * - Generates and persists session ID for guest users
 * - Syncs between localStorage and cookies
 * - Used for cart persistence without login
 */
export function useGuestSession({ scope, enabled = true }: { scope?: string; enabled?: boolean } = {}): UseGuestSessionReturn {
  // Account-specific browser carts must never reuse another identity's guest key.
  // This partitions client state only; database RLS remains authoritative.
  const storageKey = scope ? `${GUEST_SESSION_KEY}:${scope}` : GUEST_SESSION_KEY
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const { getCookie, setCookie, removeCookie } = useCookies()

  // Create a new session
  const createNewSession = useCallback(() => {
    const newId = generateSessionId()

    try {
      localStorage.setItem(storageKey, newId)
      localStorage.setItem(`${GUEST_SESSION_KEY}:owner`, scope || '')
      setCookie(GUEST_SESSION_COOKIE, newId, SESSION_EXPIRY_DAYS)
      setSessionId(newId)
      return newId
    } catch (error) {
      console.error('Error creating guest session:', error)
      // Keep the current tab usable even when storage is unavailable.
      setSessionId(newId)
      return newId
    }
  }, [setCookie, storageKey, scope])

  // Initialize session from storage or create new
  const initializeSession = useCallback(() => {
    if (typeof window === 'undefined') return null

    try {
      // Try localStorage first
      let existingId = localStorage.getItem(storageKey)

      // Fallback to cookie
      if (!existingId && !scope && !localStorage.getItem(`${GUEST_SESSION_KEY}:owner`)) {
        existingId = getCookie(GUEST_SESSION_COOKIE)
      }

      if (existingId) {
        // Validate format
        if (existingId.startsWith('guest_')) {
          setSessionId(existingId)
          // Ensure sync between storage mechanisms
          localStorage.setItem(storageKey, existingId)
          localStorage.setItem(`${GUEST_SESSION_KEY}:owner`, scope || '')
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
  }, [getCookie, setCookie, storageKey, scope, createNewSession])

  // Refresh/regenerate session
  const refreshSession = useCallback(() => {
    return createNewSession()
  }, [createNewSession])

  // Clear session (on logout or checkout completion)
  const clearSession = useCallback(() => {
    try {
      localStorage.removeItem(storageKey)
      localStorage.removeItem(`${storageKey}_email`)
      removeCookie(GUEST_SESSION_COOKIE)
      setSessionId(null)
    } catch (error) {
      console.error('Error clearing guest session:', error)
    }
  }, [removeCookie, storageKey])

  // Store session email for checkout
  const setSessionEmail = useCallback((email: string) => {
    try {
      localStorage.setItem(`${storageKey}_email`, email)
    } catch (error) {
      console.error('Error storing session email:', error)
    }
  }, [storageKey])

  // Retrieve session email
  const getSessionEmail = useCallback(() => {
    try {
      return localStorage.getItem(`${storageKey}_email`)
    } catch {
      return null
    }
  }, [storageKey])

  // Initialize on mount
  useEffect(() => {
    if (enabled) initializeSession()
    else setIsLoading(false)
  }, [initializeSession, enabled])

  return {
    sessionId,
    isLoading,
    refreshSession,
    clearSession,
    setSessionEmail,
    getSessionEmail,
  }
}
