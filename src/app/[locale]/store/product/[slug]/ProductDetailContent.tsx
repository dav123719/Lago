// ============================================
// Product Detail Content (Client Component)
// ============================================

'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import {
  ShoppingCart,
  Heart,
  Share2,
  Check,
  AlertCircle,
  ArrowLeft,
  Minus,
  Plus,
  Ruler,
  Package,
  Tag,
} from 'lucide-react'
import { useProductStock } from '@/hooks/useProductStock'
import { ProductCard } from '@/components/store'
import type { Locale } from '@/lib/i18n/config'
import type { Product, StockStatus } from '@/types/store'
import { cn } from '@/lib/utils'

interface ProductDetailContentProps {
  product: Product
  relatedProducts: Product[]
  locale: Locale
}

export function ProductDetailContent({
  product,
  relatedProducts,
  locale,
}: ProductDetailContentProps) {
  const [selectedImage, setSelectedImage] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [isAddingToCart, setIsAddingToCart] = useState(false)
  const [addedToCart, setAddedToCart] = useState(false)
  const [isZoomed, setIsZoomed] = useState(false)
  const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 })

  // Real-time stock updates
  const { stockQuantity, stockStatus, isLoading } = useProductStock({
    productId: product.id,
    initialStock: product.stockQuantity,
    initialStatus: product.stockStatus,
  })

  // Translations
  const t = {
    addToCart:
      locale === 'lv' ? 'Pievienot grozam' : locale === 'ru' ? 'В корзину' : 'Add to Cart',
    outOfStock:
      locale === 'lv'
        ? 'Nav noliktavā'
        : locale === 'ru'
        ? 'Нет в наличии'
        : 'Out of Stock',
    lowStock:
      locale === 'lv'
        ? 'Maz noliktavā'
        : locale === 'ru'
        ? 'Мало на складе'
        : 'Low Stock',
    inStock:
      locale === 'lv' ? 'Noliktavā' : locale === 'ru' ? 'В наличии' : 'In Stock',
    quantity: locale === 'lv' ? 'Daudzums' : locale === 'ru' ? 'Количество' : 'Quantity',
    description:
      locale === 'lv' ? 'Apraksts' : locale === 'ru' ? 'Описание' : 'Description',
    details: locale === 'lv' ? 'Detaļas' : locale === 'ru' ? 'Детали' : 'Details',
    relatedProducts:
      locale === 'lv'
        ? 'Saistītie produkti'
        : locale === 'ru'
        ? 'Связанные продукты'
        : 'Related Products',
    backToStore:
      locale === 'lv' ? 'Atpakaļ uz veikalu' : locale === 'ru' ? 'Назад в магазин' : 'Back to Store',
    sku: locale === 'lv' ? 'Artikuls' : locale === 'ru' ? 'Артикул' : 'SKU',
    material:
      locale === 'lv' ? 'Materiāls' : locale === 'ru' ? 'Материал' : 'Material',
    finish: locale === 'lv' ? 'Apdare' : locale === 'ru' ? 'Отделка' : 'Finish',
    dimensions:
      locale === 'lv' ? 'Izmēri' : locale === 'ru' ? 'Размеры' : 'Dimensions',
    weight: locale === 'lv' ? 'Svars' : locale === 'ru' ? 'Вес' : 'Weight',
    category:
      locale === 'lv' ? 'Kategorija' : locale === 'ru' ? 'Категория' : 'Category',
  }

  // Format price
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat(
      locale === 'en' ? 'en-US' : locale === 'ru' ? 'ru-RU' : 'lv-LV',
      { style: 'currency', currency: 'EUR' }
    ).format(price)
  }

  const currentPrice = product.salePrice || product.basePrice
  const hasDiscount = product.salePrice && product.salePrice < product.basePrice

  // Stock status display
  const getStockDisplay = () => {
    if (isLoading) return { text: '...', color: 'text-lago-muted', bgColor: 'bg-lago-gray' }

    switch (stockStatus) {
      case 'out_of_stock':
        return {
          text: t.outOfStock,
          color: 'text-red-400',
          bgColor: 'bg-red-500/10',
        }
      case 'low_stock':
        return {
          text: `${t.lowStock} (${stockQuantity})`,
          color: 'text-amber-400',
          bgColor: 'bg-amber-500/10',
        }
      default:
        return {
          text: t.inStock,
          color: 'text-emerald-400',
          bgColor: 'bg-emerald-500/10',
        }
    }
  }

  const stockDisplay = getStockDisplay()
  const isOutOfStock = stockStatus === 'out_of_stock'

  // Add to cart handler
  const handleAddToCart = async () => {
    if (isOutOfStock || isAddingToCart) return

    setIsAddingToCart(true)

    try {
      const response = await fetch('/api/cart/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: product.id,
          quantity,
        }),
      })

      if (response.ok) {
        setAddedToCart(true)
        setTimeout(() => setAddedToCart(false), 3000)
      }
    } catch (error) {
      console.error('Failed to add to cart:', error)
    } finally {
      setIsAddingToCart(false)
    }
  }

  // Image zoom handler
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isZoomed) return
    const rect = e.currentTarget.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100
    setZoomPosition({ x, y })
  }

  // Get localized content
  const name = product.name[locale]
  const description = product.description?.[locale]
  const shortDescription = product.shortDescription?.[locale]

  return (
    <div className="min-h-screen bg-lago-black">
      {/* Breadcrumb */}
      <div className="container-lg pt-24 pb-6">
        <Link
          href={`/${locale}/store`}
          className="inline-flex items-center gap-2 text-sm text-lago-muted hover:text-lago-gold transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          {t.backToStore}
        </Link>
      </div>

      {/* Product Detail */}
      <section className="container-lg pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Image Gallery */}
          <div className="space-y-4">
            {/* Main Image */}
            <div
              className="relative aspect-square bg-lago-charcoal rounded-lg overflow-hidden cursor-zoom-in"
              onClick={() => setIsZoomed(!isZoomed)}
              onMouseMove={handleMouseMove}
              onMouseLeave={() => setIsZoomed(false)}
            >
              {product.images[selectedImage]?.url ? (
                <Image
                  src={product.images[selectedImage].url}
                  alt={product.images[selectedImage].alt?.[locale] || name}
                  fill
                  className={cn(
                    'object-cover transition-transform duration-300',
                    isZoomed && 'scale-150'
                  )}
                  style={
                    isZoomed
                      ? {
                          transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%`,
                        }
                      : undefined
                  }
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  priority
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-lago-muted">
                    {locale === 'lv' ? 'Nav attēla' : locale === 'ru' ? 'Нет изображения' : 'No Image'}
                  </span>
                </div>
              )}

              {/* Zoom hint */}
              {!isZoomed && (
                <div className="absolute bottom-4 right-4 px-3 py-1.5 bg-black/60 backdrop-blur-sm rounded-full text-xs text-white/80">
                  {locale === 'lv' ? 'Klikšķiniet, lai tuvinātu' : locale === 'ru' ? 'Нажмите для увеличения' : 'Click to zoom'}
                </div>
              )}
            </div>

            {/* Thumbnail Navigation */}
            {product.images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-2">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={cn(
                      'relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden border-2 transition-colors',
                      selectedImage === index
                        ? 'border-lago-gold'
                        : 'border-transparent hover:border-lago-gray'
                    )}
                  >
                    <Image
                      src={image.url}
                      alt={image.alt?.[locale] || ''}
                      fill
                      className="object-cover"
                      sizes="80px"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            {/* Category */}
            {product.category && (
              <Link
                href={`/${locale}/store?category=${product.category.slug}`}
                className="text-sm text-lago-gold uppercase tracking-wider hover:underline"
              >
                {product.category.name[locale]}
              </Link>
            )}

            {/* Name */}
            <h1 className="text-3xl md:text-4xl font-heading text-white">{name}</h1>

            {/* Short Description */}
            {shortDescription && (
              <p className="text-lg text-lago-light">{shortDescription}</p>
            )}

            {/* Price */}
            <div className="flex items-baseline gap-4">
              <span className="text-3xl font-bold text-white">
                {formatPrice(currentPrice)}
              </span>
              {hasDiscount && (
                <>
                  <span className="text-xl text-lago-muted line-through">
                    {formatPrice(product.basePrice)}
                  </span>
                  <span className="px-2 py-1 bg-red-500 text-white text-sm rounded">
                    -
                    {Math.round(
                      ((product.basePrice - product.salePrice!) / product.basePrice) * 100
                    )}
                    %
                  </span>
                </>
              )}
            </div>

            {/* Stock Status */}
            <div
              className={cn(
                'inline-flex items-center gap-2 px-4 py-2 rounded-lg',
                stockDisplay.bgColor
              )}
            >
              {stockStatus === 'low_stock' && (
                <AlertCircle className={cn('w-4 h-4', stockDisplay.color)} />
              )}
              {stockStatus === 'in_stock' && (
                <Check className={cn('w-4 h-4', stockDisplay.color)} />
              )}
              <span className={cn('text-sm font-medium', stockDisplay.color)}>
                {stockDisplay.text}
              </span>
            </div>

            {/* SKU */}
            <p className="text-sm text-lago-muted">
              {t.sku}: <span className="text-white">{product.sku}</span>
            </p>

            {/* Quantity Selector */}
            {!isOutOfStock && (
              <div className="flex items-center gap-4">
                <span className="text-sm text-lago-light">{t.quantity}</span>
                <div className="flex items-center border border-lago-gray rounded-lg">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-3 text-white hover:bg-lago-charcoal transition-colors"
                    disabled={quantity <= 1}
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-12 text-center text-white font-medium">{quantity}</span>
                  <button
                    onClick={() => setQuantity(Math.min(stockQuantity, quantity + 1))}
                    className="p-3 text-white hover:bg-lago-charcoal transition-colors"
                    disabled={quantity >= stockQuantity}
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Add to Cart Button */}
            <button
              onClick={handleAddToCart}
              disabled={isOutOfStock || isAddingToCart}
              className={cn(
                'w-full flex items-center justify-center gap-3 px-8 py-4 rounded-lg font-medium transition-all',
                isOutOfStock
                  ? 'bg-lago-gray text-lago-muted cursor-not-allowed'
                  : addedToCart
                  ? 'bg-emerald-500 text-white'
                  : 'bg-lago-gold text-lago-black hover:bg-lago-gold-light'
              )}
            >
              {isAddingToCart ? (
                <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
              ) : addedToCart ? (
                <>
                  <Check className="w-5 h-5" />
                  {locale === 'lv' ? 'Pievienots grozam' : locale === 'ru' ? 'Добавлено в корзину' : 'Added to Cart'}
                </>
              ) : (
                <>
                  <ShoppingCart className="w-5 h-5" />
                  {isOutOfStock ? t.outOfStock : t.addToCart}
                </>
              )}
            </button>

            {/* Action Buttons */}
            <div className="flex items-center gap-4">
              <button className="flex items-center gap-2 px-4 py-2 text-sm text-lago-light hover:text-lago-gold transition-colors">
                <Heart className="w-4 h-4" />
                {locale === 'lv' ? 'Saglabāt' : locale === 'ru' ? 'Сохранить' : 'Save'}
              </button>
              <button className="flex items-center gap-2 px-4 py-2 text-sm text-lago-light hover:text-lago-gold transition-colors">
                <Share2 className="w-4 h-4" />
                {locale === 'lv' ? 'Dalīties' : locale === 'ru' ? 'Поделиться' : 'Share'}
              </button>
            </div>

            {/* Product Details */}
            <div className="border-t border-lago-gray pt-6 space-y-4">
              <h3 className="text-lg font-medium text-white">{t.details}</h3>

              <div className="grid grid-cols-2 gap-4">
                {product.material && (
                  <div className="flex items-center gap-3 text-sm">
                    <Tag className="w-4 h-4 text-lago-gold" />
                    <span className="text-lago-muted">{t.material}:</span>
                    <span className="text-white capitalize">{product.material}</span>
                  </div>
                )}

                {product.finish && (
                  <div className="flex items-center gap-3 text-sm">
                    <Package className="w-4 h-4 text-lago-gold" />
                    <span className="text-lago-muted">{t.finish}:</span>
                    <span className="text-white capitalize">{product.finish}</span>
                  </div>
                )}

                {product.weightKg && (
                  <div className="flex items-center gap-3 text-sm">
                    <Package className="w-4 h-4 text-lago-gold" />
                    <span className="text-lago-muted">{t.weight}:</span>
                    <span className="text-white">{product.weightKg} kg</span>
                  </div>
                )}

                {product.dimensionsCm && (
                  <div className="flex items-center gap-3 text-sm">
                    <Ruler className="w-4 h-4 text-lago-gold" />
                    <span className="text-lago-muted">{t.dimensions}:</span>
                    <span className="text-white">
                      {product.dimensionsCm.length}×{product.dimensionsCm.width}
                      {product.dimensionsCm.height && `×${product.dimensionsCm.height}`} cm
                    </span>
                  </div>
                )}

                {product.category && (
                  <div className="flex items-center gap-3 text-sm">
                    <Tag className="w-4 h-4 text-lago-gold" />
                    <span className="text-lago-muted">{t.category}:</span>
                    <span className="text-white">{product.category.name[locale]}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Description */}
            {description && (
              <div className="border-t border-lago-gray pt-6">
                <h3 className="text-lg font-medium text-white mb-4">{t.description}</h3>
                <div className="prose prose-invert max-w-none">
                  <p className="text-lago-light whitespace-pre-wrap">{description}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section className="border-t border-lago-gray py-16">
          <div className="container-lg">
            <h2 className="text-2xl font-heading text-white mb-8">{t.relatedProducts}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((relatedProduct) => (
                <ProductCard
                  key={relatedProduct.id}
                  product={relatedProduct}
                  locale={locale}
                />
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  )
}
