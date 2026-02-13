// ============================================
// Product Card Component
// ============================================

'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ShoppingCart, Heart, Eye, AlertCircle, Check } from 'lucide-react'
import { useProductStock } from '@/hooks/useProductStock'
import { urlFor } from '@sanity/lib/image'
import type { Product } from '@/types/store'
import type { Locale } from '@/lib/i18n/config'
import { cn } from '@/lib/utils'

interface ProductCardProps {
  product: Product
  locale: Locale
  priority?: boolean
}

export function ProductCard({ product, locale, priority = false }: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)
  const [isAddingToCart, setIsAddingToCart] = useState(false)
  const [showAddedMessage, setShowAddedMessage] = useState(false)

  // Real-time stock updates
  const { stockQuantity, stockStatus, isLoading } = useProductStock({
    productId: product.id,
    initialStock: product.stockQuantity,
    initialStatus: product.stockStatus,
  })

  // Get localized name
  const name = product.name[locale]
  const originalName = product.name.en

  // Price formatting
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat(locale === 'en' ? 'en-US' : locale === 'ru' ? 'ru-RU' : 'lv-LV', {
      style: 'currency',
      currency: 'EUR',
    }).format(price)
  }

  const currentPrice = product.salePrice || product.basePrice
  const originalPrice = product.salePrice ? product.basePrice : null
  const discount = originalPrice
    ? Math.round(((originalPrice - currentPrice) / originalPrice) * 100)
    : null

  // Image URL
  const imageUrl = product.featuredImage || (product.images[0]?.url)
  const placeholderUrl = imageUrl ? urlFor(imageUrl)?.width(20).blur(10).url() : null

  // Stock status display
  const getStockDisplay = () => {
    if (isLoading) return { text: '...', color: 'text-lago-muted' }
    
    switch (stockStatus) {
      case 'out_of_stock':
        return {
          text: locale === 'lv' ? 'Nav noliktavā' : locale === 'ru' ? 'Нет в наличии' : 'Out of Stock',
          color: 'text-red-400',
        }
      case 'low_stock':
        return {
          text: locale === 'lv' ? 'Maz noliktavā' : locale === 'ru' ? 'Мало на складе' : 'Low Stock',
          color: 'text-amber-400',
        }
      default:
        return {
          text: locale === 'lv' ? 'Noliktavā' : locale === 'ru' ? 'В наличии' : 'In Stock',
          color: 'text-emerald-400',
        }
    }
  }

  const stockDisplay = getStockDisplay()
  const isOutOfStock = stockStatus === 'out_of_stock'

  // Add to cart handler
  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (isOutOfStock || isAddingToCart) return

    setIsAddingToCart(true)

    try {
      // Call your cart API
      const response = await fetch('/api/cart/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: product.id,
          quantity: 1,
        }),
      })

      if (response.ok) {
        setShowAddedMessage(true)
        setTimeout(() => setShowAddedMessage(false), 2000)
      }
    } catch (error) {
      console.error('Failed to add to cart:', error)
    } finally {
      setIsAddingToCart(false)
    }
  }

  return (
    <Link
      href={`/${locale}/store/product/${product.slug}`}
      className="group block"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative bg-lago-charcoal rounded-lg overflow-hidden transition-all duration-500 hover:shadow-2xl hover:shadow-black/30 hover:-translate-y-1">
        {/* Image Container */}
        <div className="relative aspect-[4/3] overflow-hidden bg-lago-gray">
          {/* Loading Skeleton */}
          {!imageLoaded && (
            <div className="absolute inset-0 animate-shimmer bg-gradient-to-r from-lago-gray via-lago-stone to-lago-gray" />
          )}

          {/* Product Image */}
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={product.images[0]?.alt?.[locale] || name || originalName}
              fill
              priority={priority}
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className={cn(
                'object-cover transition-transform duration-700',
                isHovered ? 'scale-110' : 'scale-100',
                imageLoaded ? 'opacity-100' : 'opacity-0'
              )}
              onLoad={() => setImageLoaded(true)}
              placeholder={placeholderUrl ? 'blur' : undefined}
              blurDataURL={placeholderUrl || undefined}
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-lago-gray">
              <span className="text-lago-muted text-sm">
                {locale === 'lv' ? 'Nav attēla' : locale === 'ru' ? 'Нет изображения' : 'No Image'}
              </span>
            </div>
          )}

          {/* Sale Badge */}
          {discount && (
            <div className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
              -{discount}%
            </div>
          )}

          {/* Featured Badge */}
          {product.isFeatured && !discount && (
            <div className="absolute top-3 left-3 bg-lago-gold text-lago-black text-xs font-bold px-2 py-1 rounded">
              {locale === 'lv' ? 'Ieteicams' : locale === 'ru' ? 'Рекомендуем' : 'Featured'}
            </div>
          )}

          {/* Hover Actions */}
          <div
            className={cn(
              'absolute inset-0 bg-black/40 flex items-center justify-center gap-3 transition-opacity duration-300',
              isHovered ? 'opacity-100' : 'opacity-0'
            )}
          >
            <button
              className="p-3 bg-white/10 backdrop-blur-sm rounded-full text-white hover:bg-lago-gold hover:text-lago-black transition-all duration-300 hover:scale-110"
              aria-label="Quick view"
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                // Open quick view modal
              }}
            >
              <Eye className="w-5 h-5" />
            </button>
            <button
              className="p-3 bg-white/10 backdrop-blur-sm rounded-full text-white hover:bg-lago-gold hover:text-lago-black transition-all duration-300 hover:scale-110"
              aria-label="Add to wishlist"
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
              }}
            >
              <Heart className="w-5 h-5" />
            </button>
          </div>

          {/* Stock Status Indicator */}
          <div className="absolute top-3 right-3">
            <div className={cn(
              'flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium bg-black/60 backdrop-blur-sm',
              stockDisplay.color
            )}>
              {stockStatus === 'low_stock' && <AlertCircle className="w-3 h-3" />}
              <span>{stockDisplay.text}</span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          {/* Category */}
          {product.category && (
            <p className="text-xs text-lago-gold mb-1.5 uppercase tracking-wider">
              {product.category.name[locale]}
            </p>
          )}

          {/* Name */}
          <h3 className="text-lg font-heading text-white mb-2 line-clamp-2 group-hover:text-lago-gold transition-colors duration-300">
            {name || originalName}
          </h3>

          {/* Material & Finish */}
          {(product.material || product.finish) && (
            <p className="text-sm text-lago-muted mb-3">
              {[product.material, product.finish]
                .filter(Boolean)
                .map((s) => s ? s.charAt(0).toUpperCase() + s.slice(1) : '')
                .join(' • ')}
            </p>
          )}

          {/* Price & Add to Cart */}
          <div className="flex items-center justify-between">
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-bold text-white">
                {formatPrice(currentPrice)}
              </span>
              {originalPrice && (
                <span className="text-sm text-lago-muted line-through">
                  {formatPrice(originalPrice)}
                </span>
              )}
            </div>

            <button
              onClick={handleAddToCart}
              disabled={isOutOfStock || isAddingToCart}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all duration-300',
                isOutOfStock
                  ? 'bg-lago-gray text-lago-muted cursor-not-allowed'
                  : showAddedMessage
                  ? 'bg-emerald-500 text-white'
                  : 'bg-lago-gold text-lago-black hover:bg-lago-gold-light'
              )}
            >
              {isAddingToCart ? (
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              ) : showAddedMessage ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>
                    {locale === 'lv' ? 'Pievienots' : locale === 'ru' ? 'Добавлено' : 'Added'}
                  </span>
                </>
              ) : (
                <>
                  <ShoppingCart className="w-4 h-4" />
                  <span className="hidden sm:inline">
                    {locale === 'lv' ? 'Grozs' : locale === 'ru' ? 'В корзину' : 'Cart'}
                  </span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </Link>
  )
}

// Skeleton loader for product card
export function ProductCardSkeleton() {
  return (
    <div className="bg-lago-charcoal rounded-lg overflow-hidden">
      <div className="aspect-[4/3] bg-lago-gray animate-shimmer" />
      <div className="p-4 space-y-3">
        <div className="h-3 w-16 bg-lago-gray rounded animate-shimmer" />
        <div className="h-6 w-3/4 bg-lago-gray rounded animate-shimmer" />
        <div className="h-4 w-1/2 bg-lago-gray rounded animate-shimmer" />
        <div className="flex items-center justify-between pt-2">
          <div className="h-6 w-20 bg-lago-gray rounded animate-shimmer" />
          <div className="h-9 w-24 bg-lago-gray rounded animate-shimmer" />
        </div>
      </div>
    </div>
  )
}
