// ===================================
// Cookies Hook
// ===================================
// Simple cookie management for client-side

'use client'

import { useCallback } from 'react'

export interface UseCookiesReturn {
  getCookie: (name: string) => string | null
  setCookie: (name: string, value: string, days?: number) => void
  removeCookie: (name: string) => void
}

/**
 * Hook for managing cookies on the client side
 */
export function useCookies(): UseCookiesReturn {
  const getCookie = useCallback((name: string): string | null => {
    if (typeof document === 'undefined') return null
    
    const cookies = document.cookie.split(';')
    for (const cookie of cookies) {
      const [cookieName, cookieValue] = cookie.trim().split('=')
      if (cookieName === name) {
        return decodeURIComponent(cookieValue)
      }
    }
    return null
  }, [])

  const setCookie = useCallback((name: string, value: string, days: number = 30) => {
    if (typeof document === 'undefined') return
    
    const date = new Date()
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000)
    const expires = `expires=${date.toUTCString()}`
    
    // Secure cookie settings
    const secure = process.env.NODE_ENV === 'production' ? '; Secure' : ''
    const sameSite = '; SameSite=Lax'
    
    document.cookie = `${name}=${encodeURIComponent(value)}; ${expires}; path=/${secure}${sameSite}`
  }, [])

  const removeCookie = useCallback((name: string) => {
    if (typeof document === 'undefined') return
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`
  }, [])

  return {
    getCookie,
    setCookie,
    removeCookie,
  }
}
