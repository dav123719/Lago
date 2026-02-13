'use client'

// ============================================
// Optimized Image Component
// ============================================
// Performance-optimized image wrapper with lazy loading and priority hints

import Image from 'next/image'
import { useState, useCallback } from 'react'

interface OptimizedImageProps {
  src: string
  alt: string
  width?: number
  height?: number
  fill?: boolean
  priority?: boolean
  quality?: number
  sizes?: string
  className?: string
  containerClassName?: string
  objectFit?: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down'
  placeholder?: 'blur' | 'empty'
  blurDataURL?: string
  onLoad?: () => void
  onError?: () => void
}

/**
 * OptimizedImage Component
 * 
 * A performance-optimized image wrapper that:
 * - Uses Next.js Image for automatic optimization
 * - Implements lazy loading for below-fold images
 * - Supports priority loading for LCP images
 * - Provides blur placeholder for better UX
 * - Includes loading skeleton
 * 
 * @example
 * // Hero image (above fold)
 * <OptimizedImage
 *   src="/hero.jpg"
 *   alt="Hero image"
 *   fill
 *   priority
 *   sizes="100vw"
 * />
 * 
 * @example
 * // Product image (lazy loaded)
 * <OptimizedImage
 *   src="/product.jpg"
 *   alt="Product"
 *   width={400}
 *   height={300}
 *   loading="lazy"
 *   sizes="(max-width: 768px) 100vw, 400px"
 * />
 */
export function OptimizedImage({
  src,
  alt,
  width,
  height,
  fill = false,
  priority = false,
  quality = 80,
  sizes = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
  className = '',
  containerClassName = '',
  objectFit = 'cover',
  placeholder = 'empty',
  blurDataURL,
  onLoad,
  onError,
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)

  const handleLoad = useCallback(() => {
    setIsLoading(false)
    onLoad?.()
  }, [onLoad])

  const handleError = useCallback(() => {
    setIsLoading(false)
    setHasError(true)
    onError?.()
  }, [onError])

  // Generate blur placeholder for images
  const defaultBlurDataURL = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAAEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/2wBDAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/wAARCAAEAAQDAREAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBEQCEAwEPwAB//9k='

  return (
    <div className={`relative ${containerClassName}`}>
      {/* Loading Skeleton */}
      {isLoading && (
        <div 
          className="absolute inset-0 bg-lago-charcoal animate-pulse"
          aria-hidden="true"
        />
      )}

      {/* Error State */}
      {hasError ? (
        <div 
          className="absolute inset-0 flex items-center justify-center bg-lago-charcoal text-lago-muted"
          role="img"
          aria-label={alt}
        >
          <svg
            className="w-12 h-12"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
        </div>
      ) : (
        <Image
          src={src}
          alt={alt}
          width={fill ? undefined : width}
          height={fill ? undefined : height}
          fill={fill}
          priority={priority}
          quality={quality}
          sizes={sizes}
          className={`
            transition-opacity duration-300
            ${isLoading ? 'opacity-0' : 'opacity-100'}
            ${objectFit === 'cover' ? 'object-cover' : ''}
            ${objectFit === 'contain' ? 'object-contain' : ''}
            ${objectFit === 'fill' ? 'object-fill' : ''}
            ${objectFit === 'none' ? 'object-none' : ''}
            ${objectFit === 'scale-down' ? 'object-scale-down' : ''}
            ${className}
          `}
          placeholder={placeholder}
          blurDataURL={blurDataURL || defaultBlurDataURL}
          onLoad={handleLoad}
          onError={handleError}
        />
      )}
    </div>
  )
}

/**
 * ResponsiveImage Component
 * Pre-configured responsive image with srcset
 */
interface ResponsiveImageProps extends Omit<OptimizedImageProps, 'sizes'> {
  mobileSrc?: string
  tabletSrc?: string
  desktopSrc?: string
}

export function ResponsiveImage({
  src,
  mobileSrc,
  tabletSrc,
  desktopSrc,
  alt,
  priority = false,
  ...props
}: ResponsiveImageProps) {
  // Use art direction with srcset
  const imageSrc = mobileSrc || tabletSrc || desktopSrc || src

  return (
    <OptimizedImage
      src={imageSrc}
      alt={alt}
      priority={priority}
      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
      {...props}
    />
  )
}

/**
 * LazyImage Component
 * Always lazy-loaded image for below-fold content
 */
interface LazyImageProps extends Omit<OptimizedImageProps, 'priority'> {
  rootMargin?: string
  threshold?: number
}

export function LazyImage({
  rootMargin = '50px',
  threshold = 0,
  ...props
}: LazyImageProps) {
  return (
    <OptimizedImage
      {...props}
      priority={false}
    />
  )
}

/**
 * HeroImage Component
 * Optimized for hero/LCP images
 */
interface HeroImageProps extends Omit<OptimizedImageProps, 'priority' | 'sizes'> {
  preload?: boolean
}

export function HeroImage({
  preload = true,
  quality = 90,
  ...props
}: HeroImageProps) {
  return (
    <OptimizedImage
      {...props}
      priority={true}
      quality={quality}
      sizes="100vw"
      containerClassName={`${props.containerClassName}`.trim()}
    />
  )
}

/**
 * ProductImage Component
 * Optimized for product thumbnails and gallery
 */
interface ProductImageProps extends Omit<OptimizedImageProps, 'sizes'> {
  aspectRatio?: 'square' | 'portrait' | 'landscape' | 'video'
}

export function ProductImage({
  aspectRatio = 'square',
  ...props
}: ProductImageProps) {
  const aspectClasses = {
    square: 'aspect-square',
    portrait: 'aspect-[3/4]',
    landscape: 'aspect-[4/3]',
    video: 'aspect-video',
  }

  return (
    <OptimizedImage
      {...props}
      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
      containerClassName={`${aspectClasses[aspectRatio]} ${props.containerClassName || ''}`}
      objectFit="cover"
    />
  )
}

/**
 * AvatarImage Component
 * Optimized for user avatars and profile pictures
 */
interface AvatarImageProps extends Omit<OptimizedImageProps, 'sizes' | 'objectFit'> {
  size?: 'sm' | 'md' | 'lg' | 'xl'
}

export function AvatarImage({
  size = 'md',
  ...props
}: AvatarImageProps) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24',
  }

  return (
    <OptimizedImage
      {...props}
      sizes={size === 'sm' ? '32px' : size === 'md' ? '48px' : size === 'lg' ? '64px' : '96px'}
      containerClassName={`${sizeClasses[size]} rounded-full overflow-hidden ${props.containerClassName || ''}`}
      objectFit="cover"
    />
  )
}

/**
 * BackgroundImage Component
 * Optimized for background images
 */
interface BackgroundImageProps extends Omit<OptimizedImageProps, 'fill' | 'sizes'> {
  overlay?: boolean
  overlayOpacity?: number
}

export function BackgroundImage({
  overlay = false,
  overlayOpacity = 0.5,
  ...props
}: BackgroundImageProps) {
  return (
    <div className="absolute inset-0">
      <OptimizedImage
        {...props}
        fill
        sizes="100vw"
        objectFit="cover"
        priority={props.priority}
      />
      {overlay && (
        <div 
          className="absolute inset-0 bg-black"
          style={{ opacity: overlayOpacity }}
          aria-hidden="true"
        />
      )}
    </div>
  )
}
