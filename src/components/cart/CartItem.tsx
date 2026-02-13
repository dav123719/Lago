// ===================================
// Cart Item Component
// ===================================

'use client'

import Image from 'next/image'
import { Minus, Plus, Trash2 } from 'lucide-react'
import type { CartItem as CartItemType } from '@/types/checkout'
import type { Locale } from '@/lib/i18n/config'

interface CartItemProps {
  item: CartItemType
  locale: Locale
  onUpdateQuantity: (itemId: string, quantity: number) => void
  onRemove: (itemId: string) => void
  isUpdating?: boolean
}

export function CartItem({ 
  item, 
  locale, 
  onUpdateQuantity, 
  onRemove,
  isUpdating = false 
}: CartItemProps) {
  const product = item.product
  const price = item.price_at_time || product?.price || 0
  const total = price * item.quantity
  
  // Get localized product name
  const productName = locale === 'en' && product?.name_en
    ? product.name_en
    : locale === 'ru' && product?.name_ru
    ? product.name_ru
    : product?.name || 'Unknown Product'

  const handleDecrease = () => {
    if (item.quantity > 1) {
      onUpdateQuantity(item.id, item.quantity - 1)
    }
  }

  const handleIncrease = () => {
    onUpdateQuantity(item.id, item.quantity + 1)
  }

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat(locale === 'en' ? 'en-US' : locale === 'ru' ? 'ru-RU' : 'lv-LV', {
      style: 'currency',
      currency: 'EUR',
    }).format(amount)
  }

  return (
    <div className="flex gap-4 py-4 border-b border-lago-gray/30 last:border-0">
      {/* Product Image */}
      <div className="relative w-20 h-20 md:w-24 md:h-24 flex-shrink-0 rounded-lg overflow-hidden bg-lago-charcoal">
        {product?.image ? (
          <Image
            src={product.image}
            alt={productName}
            fill
            className="object-cover"
            sizes="96px"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-lago-muted">
            <span className="text-xs">No image</span>
          </div>
        )}
      </div>

      {/* Product Details */}
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-start gap-2">
          <div>
            <h4 className="font-medium text-white text-sm md:text-base line-clamp-2">
              {productName}
            </h4>
            {product?.sku && (
              <p className="text-xs text-lago-muted mt-0.5">
                SKU: {product.sku}
              </p>
            )}
          </div>
          <button
            onClick={() => onRemove(item.id)}
            disabled={isUpdating}
            className="p-1.5 text-lago-muted hover:text-red-400 transition-colors"
            aria-label="Remove item"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>

        {/* Price */}
        <div className="mt-2">
          <span className="text-lago-gold font-medium">
            {formatPrice(price)}
          </span>
          {item.quantity > 1 && (
            <span className="text-xs text-lago-muted ml-2">
              × {item.quantity}
            </span>
          )}
        </div>

        {/* Quantity Controls & Total */}
        <div className="flex items-center justify-between mt-3">
          {/* Quantity */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleDecrease}
              disabled={isUpdating || item.quantity <= 1}
              className="w-8 h-8 flex items-center justify-center rounded-md bg-lago-charcoal border border-lago-gray/50 text-lago-light hover:border-lago-gold/50 transition-colors disabled:opacity-50"
              aria-label="Decrease quantity"
            >
              <Minus className="w-3 h-3" />
            </button>
            <span className="w-8 text-center text-sm font-medium">
              {item.quantity}
            </span>
            <button
              onClick={handleIncrease}
              disabled={isUpdating}
              className="w-8 h-8 flex items-center justify-center rounded-md bg-lago-charcoal border border-lago-gray/50 text-lago-light hover:border-lago-gold/50 transition-colors disabled:opacity-50"
              aria-label="Increase quantity"
            >
              <Plus className="w-3 h-3" />
            </button>
          </div>

          {/* Total */}
          <span className="font-medium text-white">
            {formatPrice(total)}
          </span>
        </div>
      </div>
    </div>
  )
}
