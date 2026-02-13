// ============================================
// Performance Hooks
// ============================================
// Hooks for monitoring and optimizing performance

import { useEffect, useState, useCallback, useRef } from 'react'

// ============================================
// TYPES
// ============================================

export interface WebVitalsMetrics {
  cls: number | null // Cumulative Layout Shift
  lcp: number | null // Largest Contentful Paint
  fid: number | null // First Input Delay
  fcp: number | null // First Contentful Paint
  ttfb: number | null // Time to First Byte
  inp: number | null // Interaction to Next Paint
}

export interface PerformanceEntry {
  name: string
  value: number
  rating: 'good' | 'needs-improvement' | 'poor'
}

// ============================================
// WEB VITALS HOOK
// ============================================

/**
 * useWebVitals Hook
 * 
 * Monitors Core Web Vitals metrics
 * 
 * @example
 * const { metrics, entries } = useWebVitals({
 *   onReport: (metric) => console.log(metric)
 * })
 */
interface UseWebVitalsOptions {
  onReport?: (metric: PerformanceEntry) => void
  reportAllChanges?: boolean
}

export function useWebVitals(options: UseWebVitalsOptions = {}) {
  const { onReport, reportAllChanges = false } = options
  const [metrics, setMetrics] = useState<WebVitalsMetrics>({
    cls: null,
    lcp: null,
    fid: null,
    fcp: null,
    ttfb: null,
    inp: null,
  })
  const [entries, setEntries] = useState<PerformanceEntry[]>([])

  useEffect(() => {
    if (typeof window === 'undefined') return

    // Check if PerformanceObserver is supported
    if (!('PerformanceObserver' in window)) return

    const ratings: Record<string, { good: number; poor: number }> = {
      CLS: { good: 0.1, poor: 0.25 },
      LCP: { good: 2500, poor: 4000 },
      FID: { good: 100, poor: 300 },
      FCP: { good: 1800, poor: 3000 },
      TTFB: { good: 800, poor: 1800 },
      INP: { good: 200, poor: 500 },
    }

    const getRating = (name: string, value: number): PerformanceEntry['rating'] => {
      const thresholds = ratings[name]
      if (!thresholds) return 'good'
      if (value <= thresholds.good) return 'good'
      if (value <= thresholds.poor) return 'needs-improvement'
      return 'poor'
    }

    const handleEntry = (name: string, value: number) => {
      const entry: PerformanceEntry = {
        name,
        value,
        rating: getRating(name, value),
      }

      setEntries((prev) => [...prev, entry])
      onReport?.(entry)

      setMetrics((prev) => ({
        ...prev,
        [name.toLowerCase()]: value,
      }))
    }

    // CLS Observer
    const clsObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (!(entry as any).hadRecentInput) {
          handleEntry('CLS', (entry as any).value)
        }
      }
    })
    clsObserver.observe({ entryTypes: ['layout-shift'] as any })

    // LCP Observer
    const lcpObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries()
      const lastEntry = entries[entries.length - 1]
      if (lastEntry) {
        handleEntry('LCP', lastEntry.startTime)
      }
    })
    lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] as any })

    // FID Observer
    const fidObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        const delay = (entry as any).processingStart - entry.startTime
        handleEntry('FID', delay)
      }
    })
    fidObserver.observe({ entryTypes: ['first-input'] as any })

    // FCP from paint timing
    const paintObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.name === 'first-contentful-paint') {
          handleEntry('FCP', entry.startTime)
        }
      }
    })
    paintObserver.observe({ entryTypes: ['paint'] as any })

    // TTFB from navigation timing
    const navEntries = performance.getEntriesByType('navigation')
    if (navEntries.length > 0) {
      const navEntry = navEntries[0] as PerformanceNavigationTiming
      handleEntry('TTFB', navEntry.responseStart)
    }

    return () => {
      clsObserver.disconnect()
      lcpObserver.disconnect()
      fidObserver.disconnect()
      paintObserver.disconnect()
    }
  }, [onReport, reportAllChanges])

  return { metrics, entries }
}

// ============================================
// INTERSECTION OBSERVER HOOK
// ============================================

/**
 * useIntersectionObserver Hook
 * 
 * Observes when an element enters the viewport
 * 
 * @example
 * const { ref, isIntersecting, entry } = useIntersectionObserver({
 *   threshold: 0.5,
 *   rootMargin: '100px'
 * })
 */
interface UseIntersectionObserverOptions {
  threshold?: number | number[]
  rootMargin?: string
  root?: Element | null
  triggerOnce?: boolean
}

export function useIntersectionObserver(options: UseIntersectionObserverOptions = {}) {
  const { threshold = 0, rootMargin = '0px', root = null, triggerOnce = false } = options
  const [isIntersecting, setIsIntersecting] = useState(false)
  const [entry, setEntry] = useState<IntersectionObserverEntry | null>(null)
  const ref = useRef<Element>(null)
  const hasTriggered = useRef(false)

  useEffect(() => {
    const element = ref.current
    if (!element) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        setEntry(entry)
        
        if (triggerOnce && hasTriggered.current) return
        
        setIsIntersecting(entry.isIntersecting)
        
        if (entry.isIntersecting && triggerOnce) {
          hasTriggered.current = true
        }
      },
      { threshold, rootMargin, root }
    )

    observer.observe(element)

    return () => {
      observer.disconnect()
    }
  }, [threshold, rootMargin, root, triggerOnce])

  return { ref, isIntersecting, entry }
}

// ============================================
// LAZY LOADING HOOK
// ============================================

/**
 * useLazyLoad Hook
 * 
 * Lazy loads content when element enters viewport
 * 
 * @example
 * const { ref, shouldLoad } = useLazyLoad({ rootMargin: '200px' })
 * return <div ref={ref}>{shouldLoad && <HeavyComponent />}</div>
 */
interface UseLazyLoadOptions {
  rootMargin?: string
  threshold?: number
}

export function useLazyLoad(options: UseLazyLoadOptions = {}) {
  const { rootMargin = '50px', threshold = 0 } = options
  const [shouldLoad, setShouldLoad] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const element = ref.current
    if (!element) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShouldLoad(true)
          observer.disconnect()
        }
      },
      { rootMargin, threshold }
    )

    observer.observe(element)

    return () => {
      observer.disconnect()
    }
  }, [rootMargin, threshold])

  return { ref, shouldLoad }
}

// ============================================
// RESOURCE LOADING HOOK
// ============================================

/**
 * useResourceLoad Hook
 * 
 * Monitors loading of external resources
 * 
 * @example
 * const { loaded, error, progress } = useResourceLoad('/api/data')
 */
interface UseResourceLoadResult {
  loaded: boolean
  error: Error | null
  progress: number
  data: unknown | null
}

export function useResourceLoad(url: string): UseResourceLoadResult {
  const [state, setState] = useState<UseResourceLoadResult>({
    loaded: false,
    error: null,
    progress: 0,
    data: null,
  })

  useEffect(() => {
    if (!url) return

    const xhr = new XMLHttpRequest()

    xhr.addEventListener('progress', (event) => {
      if (event.lengthComputable) {
        const progress = (event.loaded / event.total) * 100
        setState((prev) => ({ ...prev, progress }))
      }
    })

    xhr.addEventListener('load', () => {
      if (xhr.status === 200) {
        try {
          const data = JSON.parse(xhr.responseText)
          setState({ loaded: true, error: null, progress: 100, data })
        } catch {
          setState({ loaded: true, error: null, progress: 100, data: xhr.responseText })
        }
      } else {
        setState((prev) => ({ ...prev, error: new Error(`HTTP ${xhr.status}`) }))
      }
    })

    xhr.addEventListener('error', () => {
      setState((prev) => ({ ...prev, error: new Error('Network error') }))
    })

    xhr.open('GET', url)
    xhr.send()

    return () => {
      xhr.abort()
    }
  }, [url])

  return state
}

// ============================================
// PERFORMANCE MARK HOOK
// ============================================

/**
 * usePerformanceMark Hook
 * 
 * Creates performance marks for measuring
 * 
 * @example
 * usePerformanceMark('component-mounted')
 */
export function usePerformanceMark(markName: string, deps: React.DependencyList = []) {
  useEffect(() => {
    if (typeof performance === 'undefined') return

    performance.mark(`${markName}-start`)

    return () => {
      performance.mark(`${markName}-end`)
      performance.measure(markName, `${markName}-start`, `${markName}-end`)
    }
  }, deps)
}

// ============================================
// IDLE CALLBACK HOOK
// ============================================

/**
 * useIdleCallback Hook
 * 
 * Executes callback during browser idle time
 * 
 * @example
 * useIdleCallback(() => {
 *   // Non-critical work
 * })
 */
export function useIdleCallback(callback: () => void, timeout = 2000) {
  useEffect(() => {
    if (typeof window === 'undefined') return

    let id: number

    if ('requestIdleCallback' in window) {
      id = requestIdleCallback(callback, { timeout })
    } else {
      // Fallback for browsers without requestIdleCallback
      id = (window as { setTimeout: typeof globalThis.setTimeout }).setTimeout(callback, 1) as unknown as number
    }

    return () => {
      if ('cancelIdleCallback' in window) {
        cancelIdleCallback(id)
      } else {
        clearTimeout(id)
      }
    }
  }, [callback, timeout])
}

// ============================================
// NETWORK STATUS HOOK
// ============================================

/**
 * useNetworkStatus Hook
 * 
 * Monitors network connection status
 */
export function useNetworkStatus() {
  const [online, setOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true)
  const [connectionType, setConnectionType] = useState<string>('unknown')
  const [effectiveType, setEffectiveType] = useState<string>('4g')

  useEffect(() => {
    const handleOnline = () => setOnline(true)
    const handleOffline = () => setOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    // Connection API (Chrome only)
    const conn = (navigator as any).connection
    if (conn) {
      const updateConnection = () => {
        setConnectionType(conn.type || 'unknown')
        setEffectiveType(conn.effectiveType || '4g')
      }
      conn.addEventListener('change', updateConnection)
      updateConnection()

      return () => {
        window.removeEventListener('online', handleOnline)
        window.removeEventListener('offline', handleOffline)
        conn.removeEventListener('change', updateConnection)
      }
    }

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  return { online, connectionType, effectiveType, isSlowConnection: effectiveType === '2g' || effectiveType === 'slow-2g' }
}

// ============================================
// DEBOUNCED CALLBACK HOOK
// ============================================

/**
 * useDebouncedCallback Hook
 * 
 * Creates a debounced version of a callback
 * 
 * @example
 * const debouncedSearch = useDebouncedCallback((query) => {
 *   performSearch(query)
 * }, 300)
 */
export function useDebouncedCallback<T extends (...args: unknown[]) => unknown>(
  callback: T,
  delay: number
): T {
  const timeoutRef = useRef<NodeJS.Timeout>()

  return useCallback(
    (...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
      timeoutRef.current = setTimeout(() => callback(...args), delay)
    },
    [callback, delay]
  ) as T
}

// ============================================
// THROTTLED CALLBACK HOOK
// ============================================

/**
 * useThrottledCallback Hook
 * 
 * Creates a throttled version of a callback
 * 
 * @example
 * const throttledScroll = useThrottledCallback(() => {
 *   handleScroll()
 * }, 100)
 */
export function useThrottledCallback<T extends (...args: unknown[]) => unknown>(
  callback: T,
  limit: number
): T {
  const inThrottle = useRef(false)

  return useCallback(
    (...args: Parameters<T>) => {
      if (!inThrottle.current) {
        callback(...args)
        inThrottle.current = true
        setTimeout(() => {
          inThrottle.current = false
        }, limit)
      }
    },
    [callback, limit]
  ) as T
}
