// ===================================
// Cart Drawer Component
// ===================================

'use client'

import { useEffect, useCallback } from 'react'
import Link from 'next/link'
import { X, ShoppingBag } from 'lucide-react'
import { CartItem } from './CartItem'
import { CartSummary } from './CartSummary'
import { useCartContext } from '@/contexts/CartContext'
import type { Locale } from '@/lib/i18n/config'

interface CartDrawerProps {
  locale: Locale
}

const translations = {
  cart: {
    lv: 'Grozs',
    en: 'Shopping Cart',
    ru: 'Корзина',
  },
  empty: {
    lv: 'Jūsu grozs ir tukšs',
    en: 'Your cart is empty',
    ru: 'Ваша корзина пуста',
  },
  emptyDescription: {
    lv: 'Pievienojiet produktus grozam, lai turpinātu',
    en: 'Add some products to get started',
    ru: 'Добавьте товары, чтобы начать',
  },
  continueShopping: {
    lv: 'Turpināt iepirkties',
    en: 'Continue Shopping',
    ru: 'Продолжить покупки',
  },
}

export function CartDrawer({ locale }: CartDrawerProps) {
  const { 
    items, 
    itemCount, 
    subtotal, 
    isLoading,
    isSyncing,
    isCartOpen, 
    closeCart, 
    updateQuantity, 
    removeItem 
  } = useCartContext()

  const t = (key: keyof typeof translations) => translations[key][locale]

  // Close on escape key
  const handleEscape = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      closeCart()
    }
  }, [closeCart])

  useEffect(() => {
    if (isCartOpen) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = ''
    }
  }, [isCartOpen, handleEscape])

  // Handle checkout navigation
  const handleCheckout = () => {
    closeCart()
    // Navigation will be handled by the Link component or router
    window.location.href = `/${locale}/checkout`
  }

  if (!isCartOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 animate-fade-in"
        onClick={closeCart}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-lago-black border-l border-lago-gray/30 z-50 animate-slide-in-right flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 md:p-6 border-b border-lago-gray/30">
          <div className="flex items-center gap-3">
            <ShoppingBag className="w-5 h-5 text-lago-gold" />
            <h2 className="text-lg font-medium text-white">
              {t('cart')}
            </h2>
            {itemCount > 0 && (
              <span className="px-2 py-0.5 text-xs bg-lago-gold/20 text-lago-gold rounded-full">
                {itemCount}
              </span>
            )}
          </div>
          <button
            onClick={closeCart}
            className="p-2 text-lago-muted hover:text-white transition-colors"
            aria-label="Close cart"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            // Loading state
            <div className="flex flex-col items-center justify-center h-64 space-y-4">
              <div className="w-8 h-8 border-2 border-lago-gold/30 border-t-lago-gold rounded-full animate-spin" />
              <p className="text-sm text-lago-muted">Loading cart...</p>
            </div>
          ) : items.length === 0 ? (
            // Empty state
            <div className="flex flex-col items-center justify-center h-64 px-6 text-center">
              <div className="w-16 h-16 rounded-full bg-lago-charcoal flex items-center justify-center mb-4">
                <ShoppingBag className="w-8 h-8 text-lago-muted" />
              </div>
              <h3 className="text-white font-medium mb-2">{t('empty')}</h3>
              <p className="text-sm text-lago-muted mb-6">{t('emptyDescription')}</p>
              <Link
                href={`/${locale}`}
                onClick={closeCart}
                className="text-lago-gold hover:text-lago-gold-light transition-colors text-sm"
              >
                {t('continueShopping')} →
              </Link>
            </div>
          ) : (
            // Cart items
            <div className="p-4 md:p-6">
              {items.map((item) => (
                <CartItem
                  key={item.id}
                  item={item}
                  locale={locale}
                  onUpdateQuantity={updateQuantity}
                  onRemove={removeItem}
                  isUpdating={isSyncing}
                />
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-lago-gray/30 p-4 md:p-6 bg-lago-charcoal/30">
            <CartSummary
              subtotal={subtotal}
              itemCount={itemCount}
              locale={locale}
              onCheckout={handleCheckout}
              onContinueShopping={closeCart}
              isCompact
            />
          </div>
        )}
      </div>

      {/* Animation Styles */}
      <style jsx>{`
        @keyframes slide-in-right {
          from {
            transform: translateX(100%);
          }
          to {
            transform: translateX(0);
          }
        }
        .animate-slide-in-right {
          animation: slide-in-right 0.3s ease-out;
        }
      `}</style>
    </>
  )
}
