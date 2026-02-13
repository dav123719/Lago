// ============================================
// Sanity Image URL Builder
// ============================================

import createImageUrlBuilder from '@sanity/image-url'
import { client } from './client'

const imageBuilder = createImageUrlBuilder(client)

// Build image URL from Sanity image reference
export function urlFor(source: unknown) {
  if (!source) return null
  return imageBuilder.image(source)
}

// Get optimized image URL with options
export function getOptimizedImageUrl(
  source: unknown,
  options: {
    width?: number
    height?: number
    quality?: number
    format?: 'jpg' | 'webp' | 'png'
    fit?: 'clip' | 'crop' | 'fill' | 'fillmax' | 'max' | 'scale' | 'min'
    hotspot?: boolean
  } = {}
) {
  const builder = urlFor(source)
  if (!builder) return ''

  const {
    width = 800,
    height,
    quality = 80,
    format = 'webp',
    fit = 'crop',
  } = options

  let urlBuilder = builder
    .width(width)
    .quality(quality)
    .format(format)
    .fit(fit)

  if (height) {
    urlBuilder = urlBuilder.height(height)
  }

  return urlBuilder.url()
}

// Get responsive image srcset
export function getResponsiveImageSrcSet(
  source: unknown,
  sizes: number[] = [400, 600, 800, 1200, 1600]
) {
  const builder = urlFor(source)
  if (!builder) return []

  return sizes.map((width) => ({
    width,
    url: builder.width(width).quality(80).format('webp').url(),
  }))
}

// Generate srcSet string for img tag
export function generateSrcSet(source: unknown, sizes: number[] = [400, 600, 800, 1200]) {
  const srcSet = getResponsiveImageSrcSet(source, sizes)
  return srcSet.map((item) => `${item.url} ${item.width}w`).join(', ')
}

// Get placeholder image (LQIP - Low Quality Image Placeholder)
export function getPlaceholderUrl(source: unknown) {
  const builder = urlFor(source)
  if (!builder) return ''

  return builder.width(20).quality(20).blur(10).format('webp').url()
}
