'use client'

// ============================================
// Skeleton Loader Components
// ============================================
// Elegant skeleton loaders matching luxury theme

import { useReducedMotion } from '@/hooks/useA11y'

interface SkeletonProps {
  className?: string
  width?: string | number
  height?: string | number
  borderRadius?: string
  variant?: 'text' | 'rect' | 'circle' | 'card'
  animation?: 'pulse' | 'shimmer' | 'none'
  ariaLabel?: string
}

/**
 * Skeleton Component
 * 
 * Elegant skeleton loader with luxury styling.
 * Respects reduced motion preferences.
 * 
 * @example
 * <Skeleton variant="card" width={300} height={200} />
 * <Skeleton variant="text" width="100%" />
 * <Skeleton variant="circle" width={64} height={64} />
 */
export function Skeleton({
  className = '',
  width = '100%',
  height = '1rem',
  borderRadius,
  variant = 'rect',
  animation = 'shimmer',
  ariaLabel = 'Loading...',
}: SkeletonProps) {
  const prefersReducedMotion = useReducedMotion()

  const variantStyles = {
    text: 'rounded',
    rect: 'rounded-lg',
    circle: 'rounded-full',
    card: 'rounded-xl',
  }

  const animationClass = prefersReducedMotion || animation === 'none'
    ? ''
    : animation === 'pulse'
    ? 'animate-pulse'
    : 'animate-shimmer'

  const computedBorderRadius = borderRadius || variantStyles[variant]

  const computedWidth = typeof width === 'number' ? `${width}px` : width
  const computedHeight = typeof height === 'number' ? `${height}px` : height

  return (
    <div
      role="status"
      aria-label={ariaLabel}
      className={`
        bg-lago-charcoal/50
        ${animationClass}
        ${computedBorderRadius}
        ${className}
      `}
      style={{
        width: computedWidth,
        height: computedHeight,
      }}
    >
      <span className="sr-only">{ariaLabel}</span>
    </div>
  )
}

/**
 * TextSkeleton Component
 * Skeleton for text content
 */
interface TextSkeletonProps {
  lines?: number
  className?: string
  lineHeight?: string
  gap?: string
}

export function TextSkeleton({
  lines = 3,
  className = '',
  lineHeight = '1rem',
  gap = '0.75rem',
}: TextSkeletonProps) {
  return (
    <div className={`flex flex-col ${className}`} style={{ gap }}>
      {Array.from({ length: lines }).map((_, index) => (
        <Skeleton
          key={index}
          variant="text"
          height={lineHeight}
          width={index === lines - 1 ? '75%' : '100%'}
        />
      ))}
    </div>
  )
}

/**
 * CardSkeleton Component
 * Skeleton for cards with image and content
 */
interface CardSkeletonProps {
  className?: string
  hasImage?: boolean
  imageHeight?: number
  contentLines?: number
}

export function CardSkeleton({
  className = '',
  hasImage = true,
  imageHeight = 200,
  contentLines = 3,
}: CardSkeletonProps) {
  return (
    <div className={`bg-lago-dark rounded-xl overflow-hidden ${className}`}>
      {hasImage && (
        <Skeleton variant="rect" height={imageHeight} borderRadius="0" />
      )}
      <div className="p-6 space-y-4">
        <Skeleton variant="text" width="60%" height="1.5rem" />
        <TextSkeleton lines={contentLines} />
      </div>
    </div>
  )
}

/**
 * ProductCardSkeleton Component
 * Skeleton for product cards
 */
interface ProductCardSkeletonProps {
  className?: string
}

export function ProductCardSkeleton({ className = '' }: ProductCardSkeletonProps) {
  return (
    <div className={`bg-lago-dark rounded-xl overflow-hidden ${className}`}>
      {/* Image */}
      <div className="aspect-square relative">
        <Skeleton variant="rect" height="100%" borderRadius="0" />
        {/* Price badge placeholder */}
        <div className="absolute bottom-3 right-3">
          <Skeleton variant="rect" width={80} height={28} borderRadius="rounded-full" />
        </div>
      </div>
      
      {/* Content */}
      <div className="p-4 space-y-3">
        <Skeleton variant="text" width="80%" height="1.25rem" />
        <div className="flex items-center justify-between">
          <Skeleton variant="text" width="40%" height="1rem" />
          <Skeleton variant="rect" width={32} height={32} borderRadius="rounded-full" />
        </div>
      </div>
    </div>
  )
}

/**
 * ProjectCardSkeleton Component
 * Skeleton for project cards
 */
interface ProjectCardSkeletonProps {
  className?: string
}

export function ProjectCardSkeleton({ className = '' }: ProjectCardSkeletonProps) {
  return (
    <div className={`group relative overflow-hidden rounded-xl ${className}`}>
      {/* Image */}
      <div className="aspect-[4/3] relative">
        <Skeleton variant="rect" height="100%" borderRadius="rounded-xl" />
      </div>
      
      {/* Overlay content */}
      <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-lago-black/80 to-transparent">
        <Skeleton variant="text" width="70%" height="1.5rem" className="bg-lago-charcoal/70" />
        <Skeleton variant="text" width="40%" height="1rem" className="mt-2 bg-lago-charcoal/50" />
      </div>
    </div>
  )
}

/**
 * HeroSkeleton Component
 * Skeleton for hero section
 */
interface HeroSkeletonProps {
  className?: string
}

export function HeroSkeleton({ className = '' }: HeroSkeletonProps) {
  return (
    <div className={`relative min-h-[60vh] flex items-center ${className}`}>
      {/* Background */}
      <Skeleton variant="rect" height="100%" borderRadius="0" className="absolute inset-0" />
      
      {/* Content */}
      <div className="relative z-10 container mx-auto px-6 py-20">
        <div className="max-w-2xl space-y-6">
          <Skeleton variant="text" width="30%" height="1rem" />
          <Skeleton variant="text" width="100%" height="3rem" />
          <Skeleton variant="text" width="100%" height="3rem" />
          <TextSkeleton lines={3} />
          <div className="pt-4">
            <Skeleton variant="rect" width={160} height={48} borderRadius="rounded-full" />
          </div>
        </div>
      </div>
    </div>
  )
}

/**
 * TableSkeleton Component
 * Skeleton for tables
 */
interface TableSkeletonProps {
  rows?: number
  columns?: number
  className?: string
}

export function TableSkeleton({ rows = 5, columns = 4, className = '' }: TableSkeletonProps) {
  return (
    <div className={`w-full ${className}`}>
      {/* Header */}
      <div className="flex gap-4 pb-4 border-b border-lago-gray/30">
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={i} variant="text" width={`${100 / columns}%`} height="1.25rem" />
        ))}
      </div>
      
      {/* Rows */}
      <div className="space-y-4 pt-4">
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div key={rowIndex} className="flex gap-4">
            {Array.from({ length: columns }).map((_, colIndex) => (
              <Skeleton
                key={colIndex}
                variant="text"
                width={`${100 / columns}%`}
                height="1rem"
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

/**
 * CartSkeleton Component
 * Skeleton for cart page
 */
interface CartSkeletonProps {
  className?: string
}

export function CartSkeleton({ className = '' }: CartSkeletonProps) {
  return (
    <div className={`grid lg:grid-cols-3 gap-8 ${className}`}>
      {/* Cart items */}
      <div className="lg:col-span-2 space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex gap-4 p-4 bg-lago-dark rounded-lg">
            <Skeleton variant="rect" width={120} height={120} borderRadius="rounded-lg" />
            <div className="flex-1 space-y-3">
              <Skeleton variant="text" width="60%" height="1.25rem" />
              <Skeleton variant="text" width="40%" height="1rem" />
              <div className="flex items-center gap-4 pt-2">
                <Skeleton variant="rect" width={100} height={36} borderRadius="rounded-lg" />
                <Skeleton variant="text" width={80} height="1.25rem" />
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Summary */}
      <div className="bg-lago-dark rounded-xl p-6 space-y-4 h-fit">
        <Skeleton variant="text" width="50%" height="1.5rem" />
        <div className="space-y-3 pt-4">
          <div className="flex justify-between">
            <Skeleton variant="text" width={80} height="1rem" />
            <Skeleton variant="text" width={60} height="1rem" />
          </div>
          <div className="flex justify-between">
            <Skeleton variant="text" width={80} height="1rem" />
            <Skeleton variant="text" width={60} height="1rem" />
          </div>
        </div>
        <Skeleton variant="rect" width="100%" height={48} borderRadius="rounded-full" />
      </div>
    </div>
  )
}

/**
 * CheckoutSkeleton Component
 * Skeleton for checkout form
 */
interface CheckoutSkeletonProps {
  className?: string
}

export function CheckoutSkeleton({ className = '' }: CheckoutSkeletonProps) {
  return (
    <div className={`max-w-2xl mx-auto space-y-8 ${className}`}>
      {/* Progress */}
      <div className="flex justify-between">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} variant="circle" width={40} height={40} />
        ))}
      </div>
      
      {/* Form sections */}
      {Array.from({ length: 3 }).map((_, sectionIndex) => (
        <div key={sectionIndex} className="bg-lago-dark rounded-xl p-6 space-y-4">
          <Skeleton variant="text" width="40%" height="1.25rem" />
          <div className="grid grid-cols-2 gap-4">
            <Skeleton variant="rect" height={48} borderRadius="rounded-lg" />
            <Skeleton variant="rect" height={48} borderRadius="rounded-lg" />
          </div>
          <Skeleton variant="rect" height={48} borderRadius="rounded-lg" />
        </div>
      ))}
      
      {/* Submit */}
      <Skeleton variant="rect" width="100%" height={56} borderRadius="rounded-full" />
    </div>
  )
}

/**
 * SkeletonGrid Component
 * Grid of skeleton items
 */
interface SkeletonGridProps {
  count?: number
  className?: string
  children?: React.ReactNode
}

export function SkeletonGrid({ count = 6, className = '', children }: SkeletonGridProps) {
  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 ${className}`}>
      {children
        ? Array.from({ length: count }).map((_, i) => (
            <div key={i}>{children}</div>
          ))
        : Array.from({ length: count }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
    </div>
  )
}
