'use client'

// ============================================
// Page Loader Components
// ============================================
// Full-page loading states

import { useEffect, useState } from 'react'
import { LogoSpinner } from './Spinner'
import { useReducedMotion } from '@/hooks/useA11y'

interface PageLoaderProps {
  isLoading: boolean
  children?: React.ReactNode
  minDisplayTime?: number
  className?: string
}

/**
 * PageLoader Component
 * 
 * Full-page loading screen with minimum display time.
 * Ensures loading screen doesn't flash too quickly.
 * 
 * @example
 * <PageLoader isLoading={isLoading} minDisplayTime={800}>
 *   <YourPageContent />
 * </PageLoader>
 */
export function PageLoader({
  isLoading,
  children,
  minDisplayTime = 500,
  className = '',
}: PageLoaderProps) {
  const [shouldShow, setShouldShow] = useState(isLoading)
  const [startTime, setStartTime] = useState<number>(0)
  const prefersReducedMotion = useReducedMotion()

  useEffect(() => {
    if (isLoading) {
      setShouldShow(true)
      setStartTime(Date.now())
    } else {
      const elapsed = Date.now() - startTime
      const remaining = Math.max(0, minDisplayTime - elapsed)

      const timer = setTimeout(() => {
        setShouldShow(false)
      }, remaining)

      return () => clearTimeout(timer)
    }
  }, [isLoading, minDisplayTime, startTime])

  if (!shouldShow) {
    return <>{children}</>
  }

  return (
    <div className={`relative ${className}`}>
      {/* Content is hidden but present for SEO */}
      <div className="invisible" aria-hidden="true">
        {children}
      </div>

      {/* Loading overlay */}
      <div
        className={`
          fixed inset-0 z-50
          bg-lago-black
          flex flex-col items-center justify-center
          ${prefersReducedMotion ? '' : 'transition-opacity duration-300'}
        `}
        role="alert"
        aria-busy="true"
        aria-label="Loading page"
      >
        <LogoSpinner size="xl" />
        
        <div className="mt-8 space-y-2 text-center">
          <p className="text-lago-light text-lg font-medium animate-pulse">
            LAGO
          </p>
          <p className="text-lago-muted text-sm">
            Loading...
          </p>
        </div>

        {/* Progress bar */}
        <div className="mt-8 w-48 h-0.5 bg-lago-charcoal rounded-full overflow-hidden">
          <div 
            className={`
              h-full bg-lago-gold rounded-full
              ${prefersReducedMotion ? 'w-1/2' : 'animate-progress-indeterminate w-1/3'}
            `}
          />
        </div>
      </div>
    </div>
  )
}

/**
 * SectionLoader Component
 * Section-level loading state
 */
interface SectionLoaderProps {
  isLoading: boolean
  children: React.ReactNode
  height?: string
  className?: string
}

export function SectionLoader({
  isLoading,
  children,
  height = '400px',
  className = '',
}: SectionLoaderProps) {
  const prefersReducedMotion = useReducedMotion()

  if (!isLoading) {
    return <>{children}</>
  }

  return (
    <div
      className={`
        relative bg-lago-dark rounded-xl
        flex items-center justify-center
        ${className}
      `}
      style={{ minHeight: height }}
      role="alert"
      aria-busy="true"
      aria-label="Loading content"
    >
      <LogoSpinner size="lg" />
    </div>
  )
}

/**
 * SuspenseLoader Component
 * React Suspense fallback
 */
interface SuspenseLoaderProps {
  className?: string
}

export function SuspenseLoader({ className = '' }: SuspenseLoaderProps) {
  return (
    <div
      className={`
        min-h-[300px]
        flex items-center justify-center
        ${className}
      `}
      role="alert"
      aria-busy="true"
      aria-label="Loading"
    >
      <LogoSpinner size="lg" />
    </div>
  )
}

/**
 * InitialLoader Component
 * Loader shown on initial page load
 */
interface InitialLoaderProps {
  onComplete?: () => void
  minimumTime?: number
}

export function InitialLoader({ onComplete, minimumTime = 1500 }: InitialLoaderProps) {
  const [progress, setProgress] = useState(0)
  const [isComplete, setIsComplete] = useState(false)
  const prefersReducedMotion = useReducedMotion()

  useEffect(() => {
    if (prefersReducedMotion) {
      setProgress(100)
      setTimeout(() => {
        setIsComplete(true)
        onComplete?.()
      }, 100)
      return
    }

    const startTime = Date.now()
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime
      const newProgress = Math.min(100, (elapsed / minimumTime) * 100)
      setProgress(newProgress)

      if (newProgress >= 100) {
        clearInterval(interval)
        setTimeout(() => {
          setIsComplete(true)
          onComplete?.()
        }, 300)
      }
    }, 50)

    return () => clearInterval(interval)
  }, [minimumTime, onComplete, prefersReducedMotion])

  if (isComplete) return null

  return (
    <div
      className={`
        fixed inset-0 z-[100]
        bg-lago-black
        flex flex-col items-center justify-center
        transition-opacity duration-500
        ${progress >= 100 ? 'opacity-0' : 'opacity-100'}
      `}
      role="alert"
      aria-busy="true"
    >
      <LogoSpinner size="xl" />
      
      <div className="mt-8 w-64 space-y-4">
        {/* Brand name */}
        <div className="text-center">
          <span className="text-lago-gold text-2xl font-medium tracking-wider">
            LAGO
          </span>
        </div>

        {/* Progress bar */}
        <div className="h-0.5 bg-lago-charcoal rounded-full overflow-hidden">
          <div
            className="h-full bg-lago-gold rounded-full transition-all duration-100 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Loading text */}
        <p className="text-lago-muted text-xs text-center uppercase tracking-widest">
          Loading Experience
        </p>
      </div>
    </div>
  )
}

/**
 * LazyRouteLoader Component
 * Loader for lazy-loaded routes
 */
interface LazyRouteLoaderProps {
  className?: string
}

export function LazyRouteLoader({ className = '' }: LazyRouteLoaderProps) {
  return (
    <div
      className={`
        min-h-screen
        flex items-center justify-center
        bg-lago-black
        ${className}
      `}
      role="alert"
      aria-busy="true"
      aria-label="Loading page"
    >
      <div className="text-center space-y-6">
        <LogoSpinner size="xl" />
        
        <div className="space-y-2">
          <p className="text-lago-light font-medium">Loading...</p>
          <p className="text-lago-muted text-sm">Please wait</p>
        </div>
      </div>
    </div>
  )
}
