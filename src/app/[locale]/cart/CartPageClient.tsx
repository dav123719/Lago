// ===================================
// Cart Page Client Component
// ===================================

'use client'

import Link from 'next/link'
import { ShoppingBag, ArrowRight, Trash2, Minus, Plus } from 'lucide-react'
import Image from 'next/image'
import { useCartContext } from '@/contexts/CartContext'
import { NeonButton } from '@/components/ui/NeonButton'
import type { Locale } from '@/lib/i18n/config'

interface CartPageClientProps {
  locale: Locale
}

const translations = {
  title: {
    lv: 'Iepirkumu grozs',
    en: 'Shopping Cart',
    ru: 'Корзина',
  },
  empty: {
    lv: 'Jūsu grozs ir tukšs',
    en: 'Your cart is empty',
    ru: 'Ваша корзина пуста',
  },
  emptyDescription: {
    lv: 'Izskatās, ka vēl neesat pievienojis nevienu produktu.',
    en: 'Looks like you haven\'t added any products yet.',
    ru: 'Похоже, вы еще не добавили ни одного товара.',
  },
  continueShopping: {
    lv: 'Turpināt iepirkties',
    en: 'Continue Shopping',
    ru: 'Продолжить покупки',
  },
  product: {
    lv: 'Produkts',
    en: 'Product',
    ru: 'Товар',
  },
  quantity: {
    lv: 'Daudzums',
    en: 'Quantity',
    ru: 'Количество',
  },
  total: {
    lv: 'Kopā',
    en: 'Total',
    ru: 'Итого',
  },
  subtotal: {
    lv: 'Kopā',
    en: 'Subtotal',
    ru: 'Итого',
  },
  shipping: {
    lv: 'Piegāde',
    en: 'Shipping',
    ru: 'Доставка',
  },
  shippingNote: {
    lv: 'Aprēķināta nākamajā solī',
    en: 'Calculated at next step',
    ru: 'Рассчитывается на следующем шаге',
  },
  totalToPay: {
    lv: 'Kopā apmaksai',
    en: 'Total',
    ru: 'Итого к оплате',
  },
  checkout: {
    lv: 'Noformēt pasūtījumu',
    en: 'Proceed to Checkout',
    ru: 'Оформить заказ',
  },
  clearCart: {
    lv: 'Iztīrīt grozu',
    en: 'Clear Cart',
    ru: 'Очистить корзину',
  },
  items: {
    lv: 'preces',
    en: 'items',
    ru: 'товаров',
  },
  item: {
    lv: 'prece',
    en: 'item',
    ru: 'товар',
  },
}

export function CartPageClient({ locale }: CartPageClientProps) {
  const { 
    items, 
    itemCount, 
    subtotal, 
    isLoading, 
    isSyncing,
    updateQuantity, 
    removeItem, 
    clearCart 
  } = useCartContext()
  
  const t = (key: keyof typeof translations) => translations[key][locale]

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat(locale === 'en' ? 'en-US' : locale === 'ru' ? 'ru-RU' : 'lv-LV', {
      style: 'currency',
      currency: 'EUR',
    }).format(amount)
  }

  const getProductName = (item: typeof items[0]) => {
    const product = item.product
    if (!product) return 'Unknown Product'
    
    return locale === 'en' && product.name_en
      ? product.name_en
      : locale === 'ru' && product.name_ru
      ? product.name_ru
      : product.name
  }

  if (isLoading) {
    return (
      <main className="min-h-screen bg-lago-black pt-24 pb-16">
        <div className="container-lg">
          <div className="flex items-center justify-center py-24">
            <div className="text-center">
              <div className="w-12 h-12 border-2 border-lago-gold/30 border-t-lago-gold rounded-full animate-spin mx-auto mb-4" />
              <p className="text-lago-muted">Loading your cart...</p>
            </div>
          </div>
        </div>
      </main>
    )
  }

  if (items.length === 0) {
    return (
      <main className="min-h-screen bg-lago-black pt-24 pb-16">
        <div className="container-lg">
          <div className="text-center py-24">
            <div className="w-24 h-24 rounded-full bg-lago-charcoal flex items-center justify-center mx-auto mb-6">
              <ShoppingBag className="w-12 h-12 text-lago-muted" />
            </div>
            <h1 className="text-3xl font-heading text-white mb-2">{t('empty')}</h1>
            <p className="text-lago-muted mb-8">{t('emptyDescription')}</p>
            <NeonButton href={`/${locale}`} variant="solid">
              {t('continueShopping')}
              <ArrowRight className="w-5 h-5" />
            </NeonButton>
          </div>
        </div>
      </main>
    )
  }

  const itemLabel = itemCount === 1 ? t('item') : t('items')

  return (
    <main className="min-h-screen bg-lago-black pt-24 pb-16">
      <div className="container-lg">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl md:text-4xl font-heading text-white">
            {t('title')}
            <span className="ml-3 text-lg font-normal text-lago-muted">
              ({itemCount} {itemLabel})
            </span>
          </h1>
          <Link
            href={`/${locale}`}
            className="text-sm text-lago-muted hover:text-lago-gold transition-colors hidden sm:block"
          >
            {t('continueShopping')} →
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            {/* Table Header - Desktop */}
            <div className="hidden md:grid grid-cols-12 gap-4 pb-4 border-b border-lago-gray/30 text-sm text-lago-muted">
              <div className="col-span-6">{t('product')}</div>
              <div className="col-span-3 text-center">{t('quantity')}</div>
              <div className="col-span-3 text-right">{t('total')}</div>
            </div>

            {/* Cart Items */}
            <div className="divide-y divide-lago-gray/30">
              {items.map((item) => (
                <div key={item.id} className="py-6">
                  <div className="flex flex-col md:grid md:grid-cols-12 md:gap-4">
                    {/* Product */}
                    <div className="md:col-span-6 flex gap-4">
                      <div className="relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden bg-lago-charcoal">
                        {item.product?.image ? (
                          <Image
                            src={item.product.image}
                            alt={getProductName(item)}
                            fill
                            className="object-cover"
                            sizes="80px"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-lago-muted">
                            <ShoppingBag className="w-6 h-6" />
                          </div>
                        )}
                      </div>
                      <div>
                        <h3 className="font-medium text-white">
                          {getProductName(item)}
                        </h3>
                        {item.product?.sku && (
                          <p className="text-xs text-lago-muted mt-1">
                            SKU: {item.product.sku}
                          </p>
                        )}
                        <p className="text-sm text-lago-gold mt-1 md:hidden">
                          {formatPrice(item.price_at_time || item.product?.price || 0)}
                        </p>
                      </div>
                    </div>

                    {/* Quantity */}
                    <div className="md:col-span-3 flex items-center justify-between md:justify-center mt-4 md:mt-0">
                      <span className="text-sm text-lago-muted md:hidden">{t('quantity')}</span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          disabled={isSyncing || item.quantity <= 1}
                          className="w-8 h-8 flex items-center justify-center rounded-md bg-lago-charcoal border border-lago-gray/50 text-lago-light hover:border-lago-gold/50 transition-colors disabled:opacity-50"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-8 text-center text-sm font-medium">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          disabled={isSyncing}
                          className="w-8 h-8 flex items-center justify-center rounded-md bg-lago-charcoal border border-lago-gray/50 text-lago-light hover:border-lago-gold/50 transition-colors disabled:opacity-50"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>

                    {/* Total & Remove */}
                    <div className="md:col-span-3 flex items-center justify-between md:justify-end mt-4 md:mt-0">
                      <span className="text-sm text-lago-muted md:hidden">{t('total')}</span>
                      <div className="flex items-center gap-4">
                        <span className="font-medium text-white">
                          {formatPrice((item.price_at_time || item.product?.price || 0) * item.quantity)}
                        </span>
                        <button
                          onClick={() => removeItem(item.id)}
                          disabled={isSyncing}
                          className="p-2 text-lago-muted hover:text-red-400 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Clear Cart Button */}
            <div className="mt-6 pt-6 border-t border-lago-gray/30">
              <button
                onClick={clearCart}
                disabled={isSyncing}
                className="flex items-center gap-2 text-sm text-lago-muted hover:text-red-400 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                {t('clearCart')}
              </button>
            </div>
          </div>

          {/* Cart Summary */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 bg-lago-charcoal/50 rounded-xl p-6 border border-lago-gray/30">
              <h3 className="text-lg font-medium text-white mb-6">
                {t('subtotal')}
              </h3>

              {/* Summary Rows */}
              <div className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-lago-muted">
                    {t('subtotal')} ({itemCount} {itemLabel})
                  </span>
                  <span className="text-white">{formatPrice(subtotal)}</span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-lago-muted">{t('shipping')}</span>
                  <span className="text-lago-muted text-xs">
                    {t('shippingNote')}
                  </span>
                </div>

                <div className="border-t border-lago-gray/30 pt-4">
                  <div className="flex justify-between">
                    <span className="font-medium text-white">{t('totalToPay')}</span>
                    <span className="text-xl font-medium text-lago-gold">
                      {formatPrice(subtotal)}
                    </span>
                  </div>
                  <p className="text-xs text-lago-muted mt-1 text-right">
                    VAT included
                  </p>
                </div>
              </div>

              {/* Checkout Button */}
              <div className="mt-6 space-y-3">
                <NeonButton
                  href={`/${locale}/checkout`}
                  variant="solid"
                  size="lg"
                  className="w-full"
                >
                  {t('checkout')}
                  <ArrowRight className="w-5 h-5" />
                </NeonButton>

                <NeonButton
                  href={`/${locale}`}
                  variant="outline"
                  className="w-full"
                >
                  {t('continueShopping')}
                </NeonButton>
              </div>

              {/* Trust Badges */}
              <div className="mt-6 pt-6 border-t border-lago-gray/30">
                <div className="flex items-center justify-center gap-4 text-xs text-lago-muted">
                  <span className="flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                    Secure Checkout
                  </span>
                  <span>•</span>
                  <span>SSL Encrypted</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
