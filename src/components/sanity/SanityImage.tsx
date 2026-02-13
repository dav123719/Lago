// ============================================
// SanityImage Component
// ============================================
// Optimized image component with WebP/AVIF auto format,
// responsive srcset, lazy loading, blur placeholder, LQIP

'use client'

import Image from 'next/image'
import { useState } from 'react'
import { SanityImage as SanityImageType } from '@/lib/sanity/types'
import { Locale } from '@/lib/i18n/config'

interface SanityImageProps {
  image: SanityImageType & { asset?: { url?: string; metadata?: { lqip?: string; dimensions?: { width: number; height: number } } } }
  locale?: Locale
  alt?: string
  fill?: boolean
  width?: number
  height?: number
  priority?: boolean
  className?: string
  sizes?: string
  quality?: number
  objectFit?: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down'
  onLoad?: () => void
}

// Build Sanity image URL with transformations
function buildSanityImageUrl(
  imageRef: string,
  options: {
    width?: number
    height?: number
    quality?: number
    format?: 'webp' | 'avif' | 'jpg' | 'png' | 'auto'
    fit?: 'clip' | 'crop' | 'fill' | 'fillmax' | 'max' | 'scale' | 'min'
  } = {}
): string {
  // Extract image ID from reference (e.g., "image-abc123-800x600-jpg")
  const ref = imageRef.replace('image-', '').replace('-jpg', '.jpg').replace('-png', '.png').replace('-webp', '.webp')
  const [id, dimensions, ext] = ref.split('-')
  
  if (!id) return ''

  const { width, height, quality = 80, format = 'auto', fit = 'clip' } = options

  // Build transformation params
  const params = new URLSearchParams()
  
  if (width) params.set('w', width.toString())
  if (height) params.set('h', height.toString())
  if (quality) params.set('q', quality.toString())
  if (fit) params.set('fit', fit)
  
  // Auto format: use AVIF if supported, fallback to WebP
  if (format === 'auto') {
    params.set('fm', 'webp')
    params.set('auto', 'format')
  } else {
    params.set('fm', format)
  }

  const paramsString = params.toString()
  const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID
  const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production'

  return `https://cdn.sanity.io/images/${projectId}/${dataset}/${id}-${dimensions || '800x600'}.${ext}${paramsString ? `?${paramsString}` : ''}`
}

// Generate srcset for responsive images
function generateSrcSet(imageRef: string, widths: number[]): string {
  return widths
    .map(width => `${buildSanityImageUrl(imageRef, { width, quality: 80 })} ${width}w`)
    .join(', ')
}

export function SanityImage({
  image,
  locale = 'lv',
  alt: customAlt,
  fill = false,
  width,
  height,
  priority = false,
  className = '',
  sizes = '(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw',
  quality = 80,
  objectFit = 'cover',
  onLoad,
}: SanityImageProps) {
  const [isLoaded, setIsLoaded] = useState(false)
  
  // Get image URL
  const imageUrl = image.asset?.url || ''
  const imageRef = image.asset?._ref || ''
  
  // Get LQIP (Low Quality Image Placeholder)
  const lqip = image.asset?.metadata?.lqip
  
  // Get dimensions
  const dimensions = (image.asset as { metadata?: { dimensions?: { width: number; height: number } } } | undefined)?.metadata?.dimensions
  const aspectRatio = dimensions ? dimensions.width / dimensions.height : 16 / 9
  
  // Get alt text
  const altText = customAlt || image.alt?.[locale] || ''
  
  // Generate srcset for responsive images
  const srcSet = imageRef ? generateSrcSet(imageRef, [320, 640, 960, 1280, 1920]) : undefined
  
  // Handle image load
  const handleLoad = () => {
    setIsLoaded(true)
    onLoad?.()
  }

  // If no image URL, return placeholder
  if (!imageUrl) {
    return (
      <div 
        className={`bg-lago-charcoal animate-pulse ${className}`}
        style={!fill ? { aspectRatio } : undefined}
      />
    )
  }

  // For external URLs (already resolved), use Next.js Image directly
  if (imageUrl.startsWith('http')) {
    return (
      <div className={`relative ${className}`} style={!fill ? { aspectRatio } : undefined}>
        {/* LQIP placeholder */}
        {lqip && !isLoaded && (
          <div 
            className="absolute inset-0 bg-cover bg-center blur-sm transition-opacity duration-500"
            style={{ 
              backgroundImage: `url(${lqip})`,
              opacity: isLoaded ? 0 : 1 
            }}
          />
        )}
        <Image
          src={imageUrl}
          alt={altText}
          fill={fill}
          width={!fill ? width || dimensions?.width : undefined}
          height={!fill ? height || dimensions?.height : undefined}
          priority={priority}
          quality={quality}
          sizes={sizes}
          className={`${objectFit === 'cover' ? 'object-cover' : `object-${objectFit}`} transition-opacity duration-500 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
          onLoad={handleLoad}
          loading={priority ? 'eager' : 'lazy'}
        />
      </div>
    )
  }

  return (
    <div className={`relative overflow-hidden ${className}`} style={!fill ? { aspectRatio } : undefined}>
      {/* Blur placeholder */}
      {lqip && !isLoaded && (
        <div 
          className="absolute inset-0 bg-cover bg-center blur-md transition-opacity duration-700"
          style={{ 
            backgroundImage: `url(${lqip})`,
            opacity: isLoaded ? 0 : 1,
            transform: 'scale(1.1)' // Slight scale to avoid blur edges
          }}
        />
      )}
      
      {/* Main image */}
      <picture>
        {/* AVIF format */}
        <source
          srcSet={imageRef ? generateSrcSet(imageRef, [320, 640, 960, 1280, 1920]).replace(/\.[^.]*\?/g, '.avif?') : undefined}
          type="image/avif"
          sizes={sizes}
        />
        {/* WebP format */}
        <source
          srcSet={srcSet}
          type="image/webp"
          sizes={sizes}
        />
        {/* Fallback */}
        <img
          src={imageUrl}
          alt={altText}
          loading={priority ? 'eager' : 'lazy'}
          className={`w-full h-full ${objectFit === 'cover' ? 'object-cover' : `object-${objectFit}`} transition-all duration-700 ${isLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-105'}`}
          onLoad={handleLoad}
          style={!fill ? { aspectRatio } : undefined}
        />
      </picture>
    </div>
  )
}

// Hook for responsive image URLs
export function useSanityImageUrl(imageRef: string, options: { width?: number; height?: number; quality?: number } = {}) {
  return buildSanityImageUrl(imageRef, options)
}

// Utility to get image dimensions
export function getSanityImageDimensions(image: SanityImageType): { width: number; height: number; aspectRatio: number } {
  const dimensions = (image.asset as { metadata?: { dimensions?: { width: number; height: number } } } | undefined)?.metadata?.dimensions
  if (dimensions) {
    return {
      width: dimensions.width,
      height: dimensions.height,
      aspectRatio: dimensions.width / dimensions.height,
    }
  }
  // Default fallback
  return { width: 800, height: 600, aspectRatio: 4 / 3 }
}
