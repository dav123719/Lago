// ============================================
// Analytics Hooks
// ============================================
// Hooks for tracking analytics events

import { useEffect, useCallback, useRef } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import { pageviewSPA } from '@/lib/analytics/gtag'
import { trackScrollDepth, trackTimeOnPage } from '@/lib/analytics/events'
import { useThrottledCallback } from './usePerformance'

// ============================================
// PAGE VIEW HOOK
// ============================================

/**
 * usePageView Hook
 * Tracks page views in SPAs
 */
export function usePageView() {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    const url = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : '')
    pageviewSPA(url, document.title)
  }, [pathname, searchParams])
}

// ============================================
// SCROLL TRACKING HOOK
// ============================================

/**
 * useScrollTracking Hook
 * Tracks scroll depth
 */
export function useScrollTracking() {
  const maxScrollRef = useRef(0)
  const pathname = usePathname()

  const trackScroll = useThrottledCallback(() => {
    const scrollTop = window.scrollY
    const docHeight = document.documentElement.scrollHeight - window.innerHeight
    const scrollPercent = Math.round((scrollTop / docHeight) * 100)

    // Track at 25%, 50%, 75%, 90%, and 100% thresholds
    const thresholds = [25, 50, 75, 90, 100]
    
    for (const threshold of thresholds) {
      if (scrollPercent >= threshold && maxScrollRef.current < threshold) {
        trackScrollDepth(threshold, pathname || '')
        maxScrollRef.current = threshold
      }
    }
  }, 500)

  useEffect(() => {
    window.addEventListener('scroll', trackScroll)
    return () => window.removeEventListener('scroll', trackScroll)
  }, [trackScroll])
}

// ============================================
// TIME ON PAGE HOOK
// ============================================

/**
 * useTimeOnPage Hook
 * Tracks time spent on page
 */
export function useTimeOnPage() {
  const startTimeRef = useRef(Date.now())
  const pathname = usePathname()

  useEffect(() => {
    startTimeRef.current = Date.now()

    return () => {
      const duration = Math.round((Date.now() - startTimeRef.current) / 1000)
      if (duration > 5) { // Only track if user stayed more than 5 seconds
        trackTimeOnPage(duration, pathname || '')
      }
    }
  }, [pathname])
}

// ============================================
// CLICK TRACKING HOOK
// ============================================

/**
 * useTrackClick Hook
 * Hook for tracking clicks
 */
export function useTrackClick() {
  const trackClick = useCallback((elementName: string, elementLocation: string) => {
    import('@/lib/analytics/gtag').then(({ trackClick }) => {
      trackClick(elementName, elementLocation)
    })
  }, [])

  return trackClick
}

// ============================================
// E-COMMERCE HOOKS
// ============================================

/**
 * useTrackProductView Hook
 * Track product detail view
 */
export function useTrackProductView() {
  return useCallback((product: import('@/types/store').Product, locale: import('@/lib/i18n/config').Locale) => {
    import('@/lib/analytics/events').then(({ trackProductView }) => {
      trackProductView(product, locale)
    })
  }, [])
}

/**
 * useTrackAddToCart Hook
 * Track add to cart
 */
export function useTrackAddToCart() {
  return useCallback((product: import('@/types/store').Product, quantity: number, locale: import('@/lib/i18n/config').Locale) => {
    import('@/lib/analytics/events').then(({ trackAddToCart }) => {
      trackAddToCart(product, quantity, locale)
    })
  }, [])
}

/**
 * useTrackCheckout Hook
 * Track checkout events
 */
export function useTrackCheckout() {
  const beginCheckout = useCallback((items: import('@/types/store').CartItem[], coupon?: string) => {
    import('@/lib/analytics/events').then(({ trackBeginCheckout }) => {
      trackBeginCheckout(items, coupon)
    })
  }, [])

  const addShippingInfo = useCallback((items: import('@/types/store').CartItem[], tier: string, coupon?: string) => {
    import('@/lib/analytics/events').then(({ trackAddShippingInfo }) => {
      trackAddShippingInfo(items, tier, coupon)
    })
  }, [])

  const addPaymentInfo = useCallback((items: import('@/types/store').CartItem[], type: string, coupon?: string) => {
    import('@/lib/analytics/events').then(({ trackAddPaymentInfo }) => {
      trackAddPaymentInfo(items, type, coupon)
    })
  }, [])

  const purchase = useCallback((
    transactionId: string,
    items: import('@/types/store').CartItem[],
    total: number,
    tax: number,
    shipping: number,
    coupon?: string
  ) => {
    import('@/lib/analytics/events').then(({ trackPurchase }) => {
      trackPurchase(transactionId, items, total, tax, shipping, coupon)
    })
  }, [])

  return { beginCheckout, addShippingInfo, addPaymentInfo, purchase }
}

// ============================================
// SEARCH TRACKING HOOK
// ============================================

/**
 * useTrackSearch Hook
 * Track search events
 */
export function useTrackSearch() {
  return useCallback((term: string, results: number, locale: import('@/lib/i18n/config').Locale) => {
    import('@/lib/analytics/events').then(({ trackSearch }) => {
      trackSearch(term, results, locale)
    })
  }, [])
}

// ============================================
// CONVERSION TRACKING HOOK
// ============================================

/**
 * useTrackConversion Hook
 * Track conversion events
 */
export function useTrackConversion() {
  return useCallback((goal: string, value?: number) => {
    import('@/lib/analytics/gtag').then(({ event }) => {
      event('conversion', {
        conversion_goal: goal,
        conversion_value: value,
      })
    })
  }, [])
}

// ============================================
// ANALYTICS INITIALIZATION HOOK
// ============================================

/**
 * useAnalytics Hook
 * Initialize and manage analytics
 */
export function useAnalytics() {
  usePageView()
  useScrollTracking()
  useTimeOnPage()
}

// ============================================
// CONSENT MANAGEMENT HOOK
// ============================================

import { useState } from 'react'
import { ConsentSettings, updateConsent } from '@/lib/analytics/gtag'

/**
 * useConsent Hook
 * Manage analytics consent
 */
export function useConsent() {
  const [consent, setConsent] = useState<ConsentSettings>({
    analytics_storage: 'denied',
    ad_storage: 'denied',
    functionality_storage: 'denied',
    personalization_storage: 'denied',
  })

  const grantConsent = useCallback(() => {
    const newConsent: ConsentSettings = {
      analytics_storage: 'granted',
      ad_storage: 'granted',
      functionality_storage: 'granted',
      personalization_storage: 'granted',
    }
    setConsent(newConsent)
    updateConsent(newConsent)
    localStorage.setItem('analytics-consent', JSON.stringify(newConsent))
  }, [])

  const denyConsent = useCallback(() => {
    const newConsent: ConsentSettings = {
      analytics_storage: 'denied',
      ad_storage: 'denied',
      functionality_storage: 'denied',
      personalization_storage: 'denied',
    }
    setConsent(newConsent)
    updateConsent(newConsent)
    localStorage.setItem('analytics-consent', JSON.stringify(newConsent))
  }, [])

  const loadSavedConsent = useCallback(() => {
    const saved = localStorage.getItem('analytics-consent')
    if (saved) {
      const parsed = JSON.parse(saved) as ConsentSettings
      setConsent(parsed)
      updateConsent(parsed)
    }
  }, [])

  return {
    consent,
    grantConsent,
    denyConsent,
    loadSavedConsent,
    hasConsent: consent.analytics_storage === 'granted',
  }
}
