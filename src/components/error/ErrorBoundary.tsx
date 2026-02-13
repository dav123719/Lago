// AGENT slave-8 v1.0.1 - Final optimization complete
'use client'

// ============================================
// Error Boundary Component
// ============================================
// React error boundary for catching component errors

import { Component, ReactNode, ErrorInfo } from 'react'
import { captureError, setErrorContext } from '@/lib/error/reporting'

interface ErrorBoundaryProps {
  children?: ReactNode
  fallback?: ReactNode
  fallbackRender?: (props: { error: Error; reset: () => void }) => ReactNode
  onError?: (error: Error, errorInfo: ErrorInfo) => void
  onReset?: () => void
  resetKeys?: Array<string | number>
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

/**
 * ErrorBoundary Component
 * 
 * Catches JavaScript errors in child components and displays a fallback UI.
 * Prevents the entire app from crashing due to a single component error.
 * 
 * @example
 * <ErrorBoundary fallback={<ErrorFallback />}>
 *   <MyComponent />
 * </ErrorBoundary>
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  private resetTimeoutId: NodeJS.Timeout | null = null

  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Report to error tracking service
    captureError(error, {
      component: 'ErrorBoundary',
      extra: { 
        componentStack: errorInfo.componentStack,
        digest: (error as any).digest,
      },
    })

    // Call optional error handler
    this.props.onError?.(error, errorInfo)
  }

  componentDidUpdate(prevProps: ErrorBoundaryProps) {
    const { hasError } = this.state
    const { resetKeys } = this.props

    // Reset error state when resetKeys change
    if (hasError && resetKeys && prevProps.resetKeys) {
      const hasResetKeyChanged = resetKeys.some(
        (key, index) => key !== prevProps.resetKeys![index]
      )

      if (hasResetKeyChanged) {
        this.reset()
      }
    }
  }

  componentWillUnmount() {
    if (this.resetTimeoutId) {
      clearTimeout(this.resetTimeoutId)
    }
  }

  reset = () => {
    this.props.onReset?.()
    this.setState({ hasError: false, error: null })
  }

  render() {
    const { hasError, error } = this.state
    const { children, fallback, fallbackRender } = this.props

    if (hasError && error) {
      // Priority: fallbackRender > fallback > null
      if (fallbackRender) {
        return fallbackRender({ error, reset: this.reset })
      }

      if (fallback) {
        return fallback
      }

      return null
    }

    return children
  }
}

/**
 * AsyncErrorBoundary
 * Error boundary for async components with retry support
 */
interface AsyncErrorBoundaryProps {
  children: ReactNode
  maxRetries?: number
  retryDelay?: number
  onRetry?: (attempt: number) => void
  fallback?: ReactNode
}

interface AsyncErrorBoundaryState {
  hasError: boolean
  error: Error | null
  retryCount: number
}

export class AsyncErrorBoundary extends Component<AsyncErrorBoundaryProps, AsyncErrorBoundaryState> {
  constructor(props: AsyncErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null, retryCount: 0 }
  }

  static getDerivedStateFromError(error: Error): AsyncErrorBoundaryState {
    return { hasError: true, error, retryCount: 0 }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    captureError(error, {
      component: 'AsyncErrorBoundary',
      extra: { componentStack: errorInfo.componentStack },
    })
  }

  handleRetry = () => {
    const { maxRetries = 3, retryDelay = 1000, onRetry } = this.props
    const { retryCount } = this.state

    if (retryCount < maxRetries) {
      onRetry?.(retryCount + 1)
      
      setTimeout(() => {
        this.setState((prev) => ({
          hasError: false,
          error: null,
          retryCount: prev.retryCount + 1,
        }))
      }, retryDelay * (retryCount + 1))
    }
  }

  render() {
    const { hasError, error, retryCount } = this.state
    const { children, maxRetries = 3, fallback } = this.props

    if (hasError && error) {
      if (fallback) return fallback

      // Default retry UI
      return (
        <div className="p-6 bg-lago-dark rounded-xl text-center">
          <p className="text-lago-muted mb-4">Something went wrong</p>
          {retryCount < maxRetries ? (
            <button
              onClick={this.handleRetry}
              className="px-4 py-2 bg-lago-gold text-lago-black rounded-full hover:bg-lago-gold-light transition-colors"
            >
              Retry ({retryCount}/{maxRetries})
            </button>
          ) : (
            <p className="text-lago-muted text-sm">Maximum retries exceeded</p>
          )}
        </div>
      )
    }

    return children
  }
}

/**
 * RouteErrorBoundary
 * Error boundary specifically for route components
 */
interface RouteErrorBoundaryProps {
  children: ReactNode
  segment: string
}

export class RouteErrorBoundary extends Component<RouteErrorBoundaryProps> {
  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    setErrorContext({ 
      component: `Route:${this.props.segment}`,
      extra: { componentStack: errorInfo.componentStack },
    })
    captureError(error)
  }

  render() {
    return this.props.children
  }
}

/**
 * withErrorBoundary HOC
 * Wraps a component with an error boundary
 */
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps: Omit<ErrorBoundaryProps, 'children'>
) {
  return function WithErrorBoundary(props: P) {
    return (
      <ErrorBoundary {...errorBoundaryProps}>
        <Component {...props} />
      </ErrorBoundary>
    )
  }
}

/**
 * useErrorHandler Hook
 * Hook for manual error handling
 */
export function useErrorHandler() {
  const handleError = (error: Error, context?: Record<string, unknown>) => {
    captureError(error, { extra: context })
  }

  return { handleError }
}
