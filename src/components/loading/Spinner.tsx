'use client'

// ============================================
// Loading Spinner Components
// ============================================
// Elegant loading spinners matching luxury theme

import { useReducedMotion } from '@/hooks/useA11y'

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  variant?: 'gold' | 'light' | 'dark'
  className?: string
  ariaLabel?: string
}

/**
 * Spinner Component
 * 
 * Elegant loading spinner with luxury gold styling.
 * Respects reduced motion preferences.
 * 
 * @example
 * <Spinner size="md" variant="gold" />
 * <Spinner size="lg" ariaLabel="Loading products..." />
 */
export function Spinner({
  size = 'md',
  variant = 'gold',
  className = '',
  ariaLabel = 'Loading',
}: SpinnerProps) {
  const prefersReducedMotion = useReducedMotion()

  const sizeClasses = {
    sm: 'w-4 h-4 border-2',
    md: 'w-6 h-6 border-2',
    lg: 'w-10 h-10 border-[3px]',
    xl: 'w-16 h-16 border-4',
  }

  const variantClasses = {
    gold: 'border-lago-gold/20 border-t-lago-gold',
    light: 'border-lago-light/20 border-t-lago-light',
    dark: 'border-lago-dark/20 border-t-lago-dark',
  }

  return (
    <div
      role="status"
      aria-label={ariaLabel}
      className={`inline-block ${className}`}
    >
      <div
        className={`
          rounded-full
          ${sizeClasses[size]}
          ${variantClasses[variant]}
          ${prefersReducedMotion ? '' : 'animate-spin'}
        `}
        style={prefersReducedMotion ? { 
          borderStyle: 'solid',
          opacity: 0.5 
        } : {}}
      />
      <span className="sr-only">{ariaLabel}</span>
    </div>
  )
}

/**
 * DotsSpinner Component
 * Animated dots loader
 */
interface DotsSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  variant?: 'gold' | 'light' | 'dark'
  className?: string
  ariaLabel?: string
}

export function DotsSpinner({
  size = 'md',
  variant = 'gold',
  className = '',
  ariaLabel = 'Loading',
}: DotsSpinnerProps) {
  const prefersReducedMotion = useReducedMotion()

  const sizeClasses = {
    sm: 'w-1.5 h-1.5',
    md: 'w-2 h-2',
    lg: 'w-3 h-3',
  }

  const variantClasses = {
    gold: 'bg-lago-gold',
    light: 'bg-lago-light',
    dark: 'bg-lago-dark',
  }

  const delayClasses = [
    'animation-delay-0',
    'animation-delay-150',
    'animation-delay-300',
  ]

  return (
    <div
      role="status"
      aria-label={ariaLabel}
      className={`flex items-center gap-2 ${className}`}
    >
      {Array.from({ length: 3 }).map((_, i) => (
        <span
          key={i}
          className={`
            rounded-full
            ${sizeClasses[size]}
            ${variantClasses[variant]}
            ${prefersReducedMotion ? '' : `animate-bounce ${delayClasses[i]}`}
          `}
          style={prefersReducedMotion ? { opacity: 0.5 } : {}}
        />
      ))}
      <span className="sr-only">{ariaLabel}</span>
    </div>
  )
}

/**
 * PulseSpinner Component
 * Pulsing circle loader
 */
interface PulseSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  variant?: 'gold' | 'light' | 'dark'
  className?: string
  ariaLabel?: string
}

export function PulseSpinner({
  size = 'md',
  variant = 'gold',
  className = '',
  ariaLabel = 'Loading',
}: PulseSpinnerProps) {
  const prefersReducedMotion = useReducedMotion()

  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-10 h-10',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24',
  }

  const variantClasses = {
    gold: 'bg-lago-gold',
    light: 'bg-lago-light',
    dark: 'bg-lago-dark',
  }

  return (
    <div
      role="status"
      aria-label={ariaLabel}
      className={`inline-block ${className}`}
    >
      <div
        className={`
          rounded-full
          ${sizeClasses[size]}
          ${variantClasses[variant]}
          ${prefersReducedMotion ? 'opacity-50' : 'animate-ping'}
        `}
      />
      <span className="sr-only">{ariaLabel}</span>
    </div>
  )
}

/**
 * RingSpinner Component
 * Multiple ring spinner
 */
interface RingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  variant?: 'gold' | 'light' | 'dark'
  className?: string
  ariaLabel?: string
}

export function RingSpinner({
  size = 'md',
  variant = 'gold',
  className = '',
  ariaLabel = 'Loading',
}: RingSpinnerProps) {
  const prefersReducedMotion = useReducedMotion()

  const sizeClasses = {
    sm: 'w-6 h-6 border-2',
    md: 'w-10 h-10 border-[3px]',
    lg: 'w-16 h-16 border-4',
    xl: 'w-24 h-24 border-[5px]',
  }

  const variantClasses = {
    gold: 'border-lago-gold',
    light: 'border-lago-light',
    dark: 'border-lago-dark',
  }

  return (
    <div
      role="status"
      aria-label={ariaLabel}
      className={`inline-block relative ${className}`}
    >
      <div
        className={`
          rounded-full
          ${sizeClasses[size]}
          ${variantClasses[variant]}
          border-t-transparent
          ${prefersReducedMotion ? '' : 'animate-spin'}
        `}
      />
      <div
        className={`
          absolute inset-0 rounded-full
          ${sizeClasses[size]}
          ${variantClasses[variant]}
          border-b-transparent
          ${prefersReducedMotion ? 'opacity-50' : 'animate-spin'}
        `}
        style={prefersReducedMotion ? {} : { animationDirection: 'reverse', animationDuration: '1.5s' }}
      />
      <span className="sr-only">{ariaLabel}</span>
    </div>
  )
}

/**
 * LogoSpinner Component
 * LAGO logo-based spinner
 */
interface LogoSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
  ariaLabel?: string
}

export function LogoSpinner({
  size = 'md',
  className = '',
  ariaLabel = 'Loading',
}: LogoSpinnerProps) {
  const prefersReducedMotion = useReducedMotion()

  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-20 h-20',
    xl: 'w-32 h-32',
  }

  return (
    <div
      role="status"
      aria-label={ariaLabel}
      className={`inline-flex items-center justify-center ${className}`}
    >
      <svg
        viewBox="0 0 100 100"
        className={`
          ${sizeClasses[size]}
          ${prefersReducedMotion ? '' : 'animate-pulse'}
        `}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* L shape */}
        <path
          d="M20 20 H40 V70 H80 V90 H20 V20Z"
          fill="#c9a962"
          className={prefersReducedMotion ? '' : 'animate-pulse'}
        />
      </svg>
      <span className="sr-only">{ariaLabel}</span>
    </div>
  )
}

/**
 * LoadingButton Component
 * Button with integrated loading state
 */
interface LoadingButtonProps {
  isLoading: boolean
  children: React.ReactNode
  loadingText?: string
  spinnerSize?: 'sm' | 'md' | 'lg'
  className?: string
  disabled?: boolean
  onClick?: () => void
  type?: 'button' | 'submit' | 'reset'
}

export function LoadingButton({
  isLoading,
  children,
  loadingText = 'Loading...',
  spinnerSize = 'sm',
  className = '',
  disabled = false,
  onClick,
  type = 'button',
}: LoadingButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || isLoading}
      className={`
        inline-flex items-center justify-center gap-2
        disabled:opacity-50 disabled:cursor-not-allowed
        ${className}
      `}
    >
      {isLoading && (
        <Spinner size={spinnerSize} variant="light" ariaLabel="" />
      )}
      <span className={isLoading ? 'sr-only' : ''}>
        {isLoading ? loadingText : children}
      </span>
    </button>
  )
}

/**
 * LoadingOverlay Component
 * Full-screen loading overlay
 */
interface LoadingOverlayProps {
  isLoading: boolean
  variant?: 'gold' | 'light'
  className?: string
  children?: React.ReactNode
}

export function LoadingOverlay({
  isLoading,
  variant = 'gold',
  className = '',
  children,
}: LoadingOverlayProps) {
  if (!isLoading) return <>{children}</>

  return (
    <div className={`relative ${className}`}>
      {children}
      <div className="absolute inset-0 bg-lago-black/80 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="text-center space-y-4">
          <LogoSpinner size="lg" />
          <p className="text-lago-light text-sm animate-pulse">Loading...</p>
        </div>
      </div>
    </div>
  )
}

/**
 * LoadingBar Component
 * Progress bar loader
 */
interface LoadingBarProps {
  progress?: number
  indeterminate?: boolean
  className?: string
}

export function LoadingBar({
  progress = 0,
  indeterminate = false,
  className = '',
}: LoadingBarProps) {
  return (
    <div className={`w-full h-1 bg-lago-charcoal rounded-full overflow-hidden ${className}`}>
      <div
        className={`
          h-full bg-lago-gold rounded-full
          transition-all duration-300 ease-out
          ${indeterminate ? 'animate-progress w-1/3' : ''}
        `}
        style={indeterminate ? {} : { width: `${Math.min(100, Math.max(0, progress))}%` }}
      />
    </div>
  )
}
