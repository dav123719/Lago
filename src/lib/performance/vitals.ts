// ============================================
// Web Vitals Tracking
// ============================================
// CLS, LCP, FID, TTFB, FCP, INP tracking and reporting

import { WebVitalsMetrics, PerformanceEntry } from '@/hooks/usePerformance'

// ============================================
// CONFIGURATION
// ============================================

const VITALS_CONFIG = {
  // Thresholds according to Google's Core Web Vitals
  CLS: { good: 0.1, poor: 0.25 },
  LCP: { good: 2500, poor: 4000 },
  FID: { good: 100, poor: 300 },
  FCP: { good: 1800, poor: 3000 },
  TTFB: { good: 800, poor: 1800 },
  INP: { good: 200, poor: 500 },
}

// ============================================
// TYPES
// ============================================

export type WebVitalName = keyof typeof VITALS_CONFIG
export type WebVitalRating = 'good' | 'needs-improvement' | 'poor'

export interface WebVitalReport {
  name: WebVitalName
  value: number
  rating: WebVitalRating
  navigationType?: string
  delta?: number
  entries?: PerformanceEntry[]
}

export type VitalsReporter = (report: WebVitalReport) => void

// ============================================
// RATING CALCULATION
// ============================================

/**
 * Get rating for a web vital metric
 */
export function getVitalRating(name: WebVitalName, value: number): WebVitalRating {
  const config = VITALS_CONFIG[name]
  if (!config) return 'good'

  if (value <= config.good) return 'good'
  if (value <= config.poor) return 'needs-improvement'
  return 'poor'
}

/**
 * Check if metric passes Core Web Vitals
 */
export function passesCoreWebVitals(metrics: Partial<WebVitalsMetrics>): boolean {
  if (metrics.cls !== null && metrics.cls !== undefined) {
    if (getVitalRating('CLS', metrics.cls) !== 'good') return false
  }
  if (metrics.lcp !== null && metrics.lcp !== undefined) {
    if (getVitalRating('LCP', metrics.lcp) !== 'good') return false
  }
  if (metrics.fid !== null && metrics.fid !== undefined) {
    if (getVitalRating('FID', metrics.fid) !== 'good') return false
  }
  return true
}

// ============================================
// VITALS OBSERVERS
// ============================================

/**
 * Observe Cumulative Layout Shift (CLS)
 */
export function observeCLS(callback: VitalsReporter): () => void {
  if (typeof window === 'undefined' || !('PerformanceObserver' in window)) {
    return () => {}
  }

  let sessionValue = 0
  let sessionEntries: Array<{ value: number; hadRecentInput: boolean }> = []

  const observer = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      const layoutShift = entry as unknown as { value: number; hadRecentInput: boolean }
      
      // Only count layout shifts without recent user input
      if (!layoutShift.hadRecentInput) {
        sessionValue += layoutShift.value
        sessionEntries.push(layoutShift)
      }
    }

    callback({
      name: 'CLS',
      value: sessionValue,
      rating: getVitalRating('CLS', sessionValue),
      entries: sessionEntries as unknown as import('@/hooks/usePerformance').PerformanceEntry[],
    })
  })

  observer.observe({ entryTypes: ['layout-shift'] as any })

  return () => observer.disconnect()
}

/**
 * Observe Largest Contentful Paint (LCP)
 */
export function observeLCP(callback: VitalsReporter): () => void {
  if (typeof window === 'undefined' || !('PerformanceObserver' in window)) {
    return () => {}
  }

  let lastEntry: PerformanceEntry | null = null

  const observer = new PerformanceObserver((list) => {
    const entries = list.getEntries()
    const lastLcpEntry = entries[entries.length - 1] as unknown as PerformanceEntry
    lastEntry = lastLcpEntry

    callback({
      name: 'LCP',
      value: (lastLcpEntry as any).startTime,
      rating: getVitalRating('LCP', (lastLcpEntry as any).startTime),
      entries: [lastLcpEntry] as unknown as import('@/hooks/usePerformance').PerformanceEntry[],
    })
  })

  observer.observe({ entryTypes: ['largest-contentful-paint'] as any })

  // Report final LCP when page is hidden
  const onVisibilityChange = () => {
    if (document.visibilityState === 'hidden' && lastEntry) {
      callback({
        name: 'LCP',
        value: (lastEntry as any).startTime,
        rating: getVitalRating('LCP', (lastEntry as any).startTime),
        entries: [lastEntry],
        delta: performance.now() - (lastEntry as any).startTime,
      })
    }
  }

  document.addEventListener('visibilitychange', onVisibilityChange)

  return () => {
    observer.disconnect()
    document.removeEventListener('visibilitychange', onVisibilityChange)
  }
}

/**
 * Observe First Input Delay (FID)
 */
export function observeFID(callback: VitalsReporter): () => void {
  if (typeof window === 'undefined' || !('PerformanceObserver' in window)) {
    return () => {}
  }

  const observer = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      const firstInput = entry as globalThis.PerformanceEventTiming
      const delay = firstInput.processingStart - firstInput.startTime

      callback({
        name: 'FID',
        value: delay,
        rating: getVitalRating('FID', delay),
        entries: [firstInput as unknown as import('@/hooks/usePerformance').PerformanceEntry],
      })
    }
  })

  observer.observe({ entryTypes: ['first-input'] as any })

  return () => observer.disconnect()
}

/**
 * Observe First Contentful Paint (FCP)
 */
export function observeFCP(callback: VitalsReporter): () => void {
  if (typeof window === 'undefined' || !('PerformanceObserver' in window)) {
    return () => {}
  }

  const observer = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      if (entry.name === 'first-contentful-paint') {
        callback({
          name: 'FCP',
          value: (entry as any).startTime,
          rating: getVitalRating('FCP', (entry as any).startTime),
          entries: [entry as unknown as import('@/hooks/usePerformance').PerformanceEntry],
        })
      }
    }
  })

  observer.observe({ entryTypes: ['paint'] as any })

  return () => observer.disconnect()
}

/**
 * Measure Time to First Byte (TTFB)
 */
export function measureTTFB(callback: VitalsReporter): void {
  if (typeof window === 'undefined') return

  const navigationEntries = performance.getEntriesByType('navigation')
  if (navigationEntries.length === 0) return

  const navEntry = navigationEntries[0] as globalThis.PerformanceNavigationTiming
  const ttfb = navEntry.responseStart

  callback({
    name: 'TTFB',
    value: ttfb,
    rating: getVitalRating('TTFB', ttfb),
    entries: [navEntry as unknown as import('@/hooks/usePerformance').PerformanceEntry],
    navigationType: navEntry.type,
  })
}

/**
 * Observe Interaction to Next Paint (INP)
 * Experimental metric replacing FID
 */
export function observeINP(callback: VitalsReporter): () => void {
  if (typeof window === 'undefined' || !('PerformanceObserver' in window)) {
    return () => {}
  }

  let maxDuration = 0
  const entries: PerformanceEntry[] = []

  const observer = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      const eventEntry = entry as globalThis.PerformanceEventTiming
      const duration = eventEntry.duration

      if (duration > maxDuration) {
        maxDuration = duration
        entries.push(eventEntry as unknown as import('@/hooks/usePerformance').PerformanceEntry)

        callback({
          name: 'INP',
          value: duration,
          rating: getVitalRating('INP', duration),
          entries: [eventEntry as unknown as import('@/hooks/usePerformance').PerformanceEntry],
        })
      }
    }
  })

  observer.observe({ entryTypes: ['event'] as any, buffered: true })

  return () => observer.disconnect()
}

// ============================================
// BUNDLE ALL VITALS
// ============================================

/**
 * Observe all Core Web Vitals
 */
export function observeAllVitals(callback: VitalsReporter): () => void {
  const disconnectFns: (() => void)[] = []

  disconnectFns.push(observeCLS(callback))
  disconnectFns.push(observeLCP(callback))
  disconnectFns.push(observeFID(callback))
  disconnectFns.push(observeFCP(callback))
  measureTTFB(callback)

  // INP is experimental, wrap in try-catch
  try {
    disconnectFns.push(observeINP(callback))
  } catch {
    // INP not supported
  }

  return () => {
    disconnectFns.forEach((fn) => fn())
  }
}

// ============================================
// REPORTING UTILITIES
// ============================================

/**
 * Send metrics to analytics endpoint
 */
export function sendToAnalytics(report: WebVitalReport, endpoint: string): void {
  if (typeof navigator === 'undefined') return

  // Use sendBeacon for reliable delivery
  const body = JSON.stringify({
    ...report,
    url: window.location.href,
    userAgent: navigator.userAgent,
    timestamp: Date.now(),
  })

  if (navigator.sendBeacon) {
    navigator.sendBeacon(endpoint, body)
  } else {
    fetch(endpoint, {
      method: 'POST',
      body,
      keepalive: true,
    }).catch(() => {
      // Silent fail for analytics
    })
  }
}

/**
 * Log vitals to console (development only)
 */
export function logVitals(report: WebVitalReport): void {
  if (process.env.NODE_ENV !== 'development') return

  const styles = {
    good: 'color: green; font-weight: bold',
    'needs-improvement': 'color: orange; font-weight: bold',
    poor: 'color: red; font-weight: bold',
  }

  // eslint-disable-next-line no-console
  console.log(
    `%c[Web Vitals] ${report.name}: ${report.value.toFixed(2)}`,
    styles[report.rating]
  )
}

/**
 * Create performance mark
 */
export function mark(name: string): void {
  if (typeof performance !== 'undefined') {
    performance.mark(name)
  }
}

/**
 * Measure between marks
 */
export function measure(name: string, startMark: string, endMark?: string): number | undefined {
  if (typeof performance === 'undefined') return undefined

  try {
    performance.measure(name, startMark, endMark)
    const entries = performance.getEntriesByName(name, 'measure')
    return entries[entries.length - 1]?.duration
  } catch {
    return undefined
  }
}

// ============================================
// LUXURY-SPECIFIC METRICS
// ============================================

/**
 * Measure time to hero image visible
 */
export function measureHeroImageTime(): number | undefined {
  if (typeof performance === 'undefined') return undefined

  const paintEntries = performance.getEntriesByType('paint')
  const fcp = paintEntries.find((e) => e.name === 'first-contentful-paint')
  
  return fcp?.startTime
}

/**
 * Measure time to interactive elements ready
 */
export function measureInteractiveTime(): number | undefined {
  if (typeof performance === 'undefined') return undefined

  // Measure from navigation start to when main thread is idle
  const navEntries = performance.getEntriesByType('navigation')
  if (navEntries.length === 0) return undefined

  const navEntry = navEntries[0] as PerformanceNavigationTiming
  return navEntry.domInteractive
}

/**
 * Check if page has good perceived performance
 */
export function hasGoodPerceivedPerformance(): boolean {
  const heroTime = measureHeroImageTime()
  const interactiveTime = measureInteractiveTime()

  if (!heroTime || !interactiveTime) return true

  // Hero should be visible within 2 seconds
  // Page should be interactive within 3.5 seconds
  return heroTime < 2000 && interactiveTime < 3500
}
