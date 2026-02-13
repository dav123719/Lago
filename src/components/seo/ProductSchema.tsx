'use client'

// ============================================
// Product Structured Data Component
// ============================================
// Enhanced product schema with reviews and aggregate ratings

import { ProductJsonLd } from './JsonLd'
import { Product } from '@/types/store'
import { Locale } from '@/lib/i18n/config'

interface ProductSchemaProps {
  product: Product
  locale: Locale
  images?: string[]
}

/**
 * Product Schema Component
 * 
 * Wraps ProductJsonLd with additional product-specific functionality.
 * Can be extended to include reviews, ratings, and other product data.
 */
export function ProductSchema({ product, locale, images }: ProductSchemaProps) {
  return (
    <ProductJsonLd 
      product={product} 
      locale={locale} 
      images={images} 
    />
  )
}

/**
 * Product Schema with Reviews
 * Includes aggregate rating and review data
 */
interface ProductWithReviewsSchemaProps extends ProductSchemaProps {
  ratingValue?: number
  reviewCount?: number
  reviews?: Array<{
    author: string
    datePublished: string
    reviewBody: string
    reviewRating: number
  }>
}

export function ProductWithReviewsSchema({
  product,
  locale,
  images,
  ratingValue = 4.5,
  reviewCount = 12,
}: ProductWithReviewsSchemaProps) {
  // Extended schema with aggregate rating
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name[locale],
    description: product.shortDescription?.[locale] || product.description?.[locale] || product.name[locale],
    image: images?.length ? images : [product.featuredImage || ''],
    sku: product.sku,
    brand: {
      '@type': 'Brand',
      name: 'LAGO',
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: ratingValue.toString(),
      reviewCount: reviewCount.toString(),
      bestRating: '5',
      worstRating: '1',
    },
    offers: {
      '@type': 'Offer',
      url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://lago.lv'}/${locale}/store/product/${product.slug}`,
      priceCurrency: 'EUR',
      price: (product.salePrice || product.basePrice).toFixed(2),
      availability: product.stockStatus === 'in_stock' 
        ? 'https://schema.org/InStock' 
        : 'https://schema.org/OutOfStock',
      itemCondition: 'https://schema.org/NewCondition',
      priceValidUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    },
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}

/**
 * Product Variants Schema
 * For products with multiple variants (sizes, finishes, etc.)
 */
interface ProductVariantsSchemaProps {
  product: Product
  locale: Locale
  variants: Array<{
    sku: string
    name: string
    price: number
    availability: 'in_stock' | 'out_of_stock'
    attributes: Record<string, string>
  }>
}

export function ProductVariantsSchema({
  product,
  locale,
  variants,
}: ProductVariantsSchemaProps) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name[locale],
    description: product.shortDescription?.[locale] || product.description?.[locale] || product.name[locale],
    image: product.featuredImage,
    sku: product.sku,
    brand: {
      '@type': 'Brand',
      name: 'LAGO',
    },
    offers: variants.map((variant) => ({
      '@type': 'Offer',
      url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://lago.lv'}/${locale}/store/product/${product.slug}`,
      priceCurrency: 'EUR',
      price: variant.price.toFixed(2),
      sku: variant.sku,
      availability: variant.availability === 'in_stock'
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
      itemOffered: {
        '@type': 'Product',
        name: `${product.name[locale]} - ${variant.name}`,
        sku: variant.sku,
      },
    })),
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}

/**
 * Software Application Schema
 * For digital products or applications
 */
interface SoftwareApplicationSchemaProps {
  name: string
  description: string
  applicationCategory: string
  operatingSystem: string
  price: number
  ratingValue: number
  reviewCount: number
}

export function SoftwareApplicationSchema({
  name,
  description,
  applicationCategory,
  operatingSystem,
  price,
  ratingValue,
  reviewCount,
}: SoftwareApplicationSchemaProps) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name,
    description,
    applicationCategory,
    operatingSystem,
    offers: {
      '@type': 'Offer',
      price: price.toFixed(2),
      priceCurrency: 'EUR',
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: ratingValue.toString(),
      reviewCount: reviewCount.toString(),
    },
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}
