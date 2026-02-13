// ============================================
// Error Reporting Service
// ============================================
// Centralized error reporting and tracking

// ============================================
// CONFIGURATION
// ============================================

interface ErrorReportingConfig {
  endpoint?: string
  apiKey?: string
  environment?: string
  release?: string
  enabled?: boolean
  sampleRate?: number
  beforeSend?: (event: ErrorEvent) => ErrorEvent | null
}

let config: ErrorReportingConfig = {
  enabled: process.env.NODE_ENV === 'production',
  sampleRate: 1.0,
}

// ============================================
// TYPES
// ============================================

interface ErrorEvent {
  id: string
  timestamp: number
  message: string
  stack?: string
  url: string
  userAgent: string
  user?: {
    id?: string
    email?: string
  }
  tags?: Record<string, string>
  extra?: Record<string, unknown>
  level: 'error' | 'warning' | 'info'
}

interface ErrorContext {
  component?: string
  action?: string
  userId?: string
  tags?: Record<string, string>
  extra?: Record<string, unknown>
}

// ============================================
// INITIALIZATION
// ============================================

export function initErrorReporting(userConfig: ErrorReportingConfig) {
  config = { ...config, ...userConfig }

  // Setup global error handlers
  if (typeof window !== 'undefined') {
    window.onerror = handleGlobalError
    window.onunhandledrejection = handleUnhandledRejection
  }
}

// ============================================
// ERROR HANDLERS
// ============================================

function handleGlobalError(
  message: string | Event,
  source?: string,
  lineno?: number,
  colno?: number,
  error?: Error
) {
  if (!config.enabled) return

  const errorEvent: ErrorEvent = {
    id: generateErrorId(),
    timestamp: Date.now(),
    message: error?.message || String(message),
    stack: error?.stack,
    url: typeof window !== 'undefined' ? window.location.href : '',
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
    level: 'error',
    extra: {
      source,
      lineno,
      colno,
    },
  }

  sendError(errorEvent)
}

function handleUnhandledRejection(event: PromiseRejectionEvent) {
  if (!config.enabled) return

  const errorEvent: ErrorEvent = {
    id: generateErrorId(),
    timestamp: Date.now(),
    message: event.reason?.message || 'Unhandled Promise Rejection',
    stack: event.reason?.stack,
    url: typeof window !== 'undefined' ? window.location.href : '',
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
    level: 'error',
  }

  sendError(errorEvent)
}

// ============================================
// ERROR CAPTURE
// ============================================

let currentContext: ErrorContext = {}

export function setErrorContext(context: ErrorContext) {
  currentContext = { ...currentContext, ...context }
}

export function clearErrorContext() {
  currentContext = {}
}

export function captureError(error: Error, context?: ErrorContext) {
  if (!config.enabled) return

  // Sample rate check
  if (Math.random() > (config.sampleRate || 1)) return

  const mergedContext = { ...currentContext, ...context }

  const errorEvent: ErrorEvent = {
    id: generateErrorId(),
    timestamp: Date.now(),
    message: error.message,
    stack: error.stack,
    url: typeof window !== 'undefined' ? window.location.href : '',
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
    level: 'error',
    user: mergedContext.userId ? { id: mergedContext.userId } : undefined,
    tags: {
      component: mergedContext.component || 'unknown',
      action: mergedContext.action || 'unknown',
      ...mergedContext.tags,
    },
    extra: mergedContext.extra,
  }

  // Apply beforeSend hook
  const finalEvent = config.beforeSend ? config.beforeSend(errorEvent) : errorEvent
  if (finalEvent) {
    sendError(finalEvent)
  }
}

export function captureMessage(message: string, level: ErrorEvent['level'] = 'info', context?: ErrorContext) {
  if (!config.enabled) return

  const mergedContext = { ...currentContext, ...context }

  const errorEvent: ErrorEvent = {
    id: generateErrorId(),
    timestamp: Date.now(),
    message,
    url: typeof window !== 'undefined' ? window.location.href : '',
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
    level,
    user: mergedContext.userId ? { id: mergedContext.userId } : undefined,
    tags: mergedContext.tags,
    extra: mergedContext.extra,
  }

  const finalEvent = config.beforeSend ? config.beforeSend(errorEvent) : errorEvent
  if (finalEvent) {
    sendError(finalEvent)
  }
}

export function captureException(error: unknown, context?: ErrorContext) {
  if (error instanceof Error) {
    captureError(error, context)
  } else {
    captureMessage(String(error), 'error', context)
  }
}

// ============================================
// ERROR SENDING
// ============================================

function sendError(event: ErrorEvent) {
  // Log to console in development
  if (process.env.NODE_ENV === 'development') {
    // eslint-disable-next-line no-console
    console.error('[Error Reporting]', event)
    return
  }

  // Send to endpoint
  if (config.endpoint) {
    const payload = {
      ...event,
      apiKey: config.apiKey,
      environment: config.environment,
      release: config.release,
    }

    // Use sendBeacon for reliability
    if (navigator.sendBeacon) {
      navigator.sendBeacon(config.endpoint, JSON.stringify(payload))
    } else {
      fetch(config.endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        keepalive: true,
      }).catch(() => {
        // Silent fail
      })
    }
  }
}

// ============================================
// UTILITIES
// ============================================

function generateErrorId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

// ============================================
// REACT ERROR BOUNDARY HELPERS
// ============================================

export function withErrorReporting<P extends object>(
  Component: React.ComponentType<P>,
  componentName: string
) {
  return function WithErrorReporting(props: P) {
    setErrorContext({ component: componentName })
    
    try {
      return <Component {...props} />
    } catch (error) {
      captureException(error, { component: componentName })
      throw error
    }
  }
}

// ============================================
// BREADCRUMBS
// ============================================

interface Breadcrumb {
  message: string
  category?: string
  level?: ErrorEvent['level']
  timestamp?: number
  data?: Record<string, unknown>
}

const breadcrumbs: Breadcrumb[] = []
const MAX_BREADCRUMBS = 100

export function addBreadcrumb(breadcrumb: Breadcrumb) {
  breadcrumbs.push({
    ...breadcrumb,
    timestamp: breadcrumb.timestamp || Date.now(),
  })

  // Keep only recent breadcrumbs
  if (breadcrumbs.length > MAX_BREADCRUMBS) {
    breadcrumbs.shift()
  }
}

export function getBreadcrumbs(): Breadcrumb[] {
  return [...breadcrumbs]
}

export function clearBreadcrumbs() {
  breadcrumbs.length = 0
}

// ============================================
// PERFORMANCE MONITORING
// ============================================

export function capturePerformanceMetrics() {
  if (typeof window === 'undefined' || !('performance' in window)) return

  const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
  if (!navigation) return

  const metrics = {
    dns: navigation.domainLookupEnd - navigation.domainLookupStart,
    tcp: navigation.connectEnd - navigation.connectStart,
    ttfb: navigation.responseStart - navigation.startTime,
    download: navigation.responseEnd - navigation.responseStart,
    domInteractive: navigation.domInteractive - navigation.startTime,
    domComplete: navigation.domComplete - navigation.startTime,
    loadComplete: navigation.loadEventEnd - navigation.startTime,
  }

  captureMessage('Performance Metrics', 'info', {
    extra: { metrics },
  })
}

// ============================================
// USER FEEDBACK
// ============================================

interface UserFeedback {
  name?: string
  email?: string
  comment: string
  eventId?: string
}

export function captureUserFeedback(feedback: UserFeedback) {
  if (!config.enabled || !config.endpoint) return

  fetch(`${config.endpoint}/feedback`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      ...feedback,
      timestamp: Date.now(),
      url: window.location.href,
    }),
  }).catch(() => {
    // Silent fail
  })
}
