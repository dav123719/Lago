// ===================================
// Cart Summary Component
// ===================================

'use client'

import { ArrowRight, ShoppingBag } from 'lucide-react'
import { NeonButton } from '@/components/ui/NeonButton'
import type { Locale } from '@/lib/i18n/config'

interface CartSummaryProps {
  subtotal: number
  itemCount: number
  locale: Locale
  onCheckout?: () => void
  onContinueShopping?: () => void
  isCompact?: boolean
}

const translations = {
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
  total: {
    lv: 'Kopā apmaksai',
    en: 'Total',
    ru: 'Итого к оплате',
  },
  checkout: {
    lv: 'Noformēt pasūtījumu',
    en: 'Proceed to Checkout',
    ru: 'Оформить заказ',
  },
  continueShopping: {
    lv: 'Turpināt iepirkties',
    en: 'Continue Shopping',
    ru: 'Продолжить покупки',
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

export function CartSummary({
  subtotal,
  itemCount,
  locale,
  onCheckout,
  onContinueShopping,
  isCompact = false,
}: CartSummaryProps) {
  const t = (key: keyof typeof translations) => translations[key][locale]

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat(locale === 'en' ? 'en-US' : locale === 'ru' ? 'ru-RU' : 'lv-LV', {
      style: 'currency',
      currency: 'EUR',
    }).format(amount)
  }

  const itemLabel = itemCount === 1 ? t('item') : t('items')

  if (isCompact) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <span className="text-lago-muted">
            {t('subtotal')} ({itemCount} {itemLabel})
          </span>
          <span className="text-lg font-medium text-white">
            {formatPrice(subtotal)}
          </span>
        </div>
        
        <NeonButton
          onClick={onCheckout}
          variant="solid"
          className="w-full"
        >
          {t('checkout')}
          <ArrowRight className="w-4 h-4" />
        </NeonButton>

        <button
          onClick={onContinueShopping}
          className="w-full text-center text-sm text-lago-muted hover:text-lago-gold transition-colors"
        >
          {t('continueShopping')}
        </button>
      </div>
    )
  }

  return (
    <div className="bg-lago-charcoal/50 rounded-xl p-6 border border-lago-gray/30">
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
            <span className="font-medium text-white">{t('total')}</span>
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
          onClick={onCheckout}
          variant="solid"
          size="lg"
          className="w-full"
        >
          {t('checkout')}
          <ArrowRight className="w-5 h-5" />
        </NeonButton>

        <NeonButton
          onClick={onContinueShopping}
          variant="outline"
          className="w-full"
        >
          <ShoppingBag className="w-4 h-4" />
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
  )
}
