// ===================================
// Stripe Payment Form Component
// ===================================
// AGENT slave-5 v1.0.1 - Checkout flow verified

'use client'

import { useState, useEffect } from 'react'
import { Loader2, CreditCard, Shield } from 'lucide-react'
import { NeonButton } from '@/components/ui/NeonButton'
import type { Locale } from '@/lib/i18n/config'
import type { ShippingAddress, ShippingMethod, ParcelLocker } from '@/types/checkout'

interface StripePaymentFormProps {
  locale: Locale
  cartId: string
  shippingAddress: ShippingAddress
  shippingMethod: ShippingMethod
  locker?: ParcelLocker
  onSuccess: (sessionId: string) => void
  onError: (error: string) => void
}

const translations = {
  title: {
    lv: 'Maksājuma informācija',
    en: 'Payment Information',
    ru: 'Платежная информация',
  },
  description: {
    lv: 'Jūs tiksiet novirzīts uz drošu Stripe maksājuma lapu, lai pabeigtu pirkumu.',
    en: 'You will be redirected to a secure Stripe checkout page to complete your purchase.',
    ru: 'Вы будете перенаправлены на безопасную страницу оплаты Stripe для завершения покупки.',
  },
  summary: {
    lv: 'Pasūtījuma kopsavilkums',
    en: 'Order Summary',
    ru: 'Сводка заказа',
  },
  shippingTo: {
    lv: 'Piegādes adrese',
    en: 'Shipping to',
    ru: 'Доставка по адресу',
  },
  shippingMethod: {
    lv: 'Piegādes veids',
    en: 'Shipping method',
    ru: 'Способ доставки',
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
  total: {
    lv: 'Kopā apmaksai',
    en: 'Total',
    ru: 'Итого к оплате',
  },
  payButton: {
    lv: 'Doties uz maksājumu',
    en: 'Proceed to Payment',
    ru: 'Перейти к оплате',
  },
  processing: {
    lv: 'Apstrādā...',
    en: 'Processing...',
    ru: 'Обработка...',
  },
  secure: {
    lv: 'Drošs SSL šifrējums',
    en: 'Secure SSL Encryption',
    ru: 'Безопасное SSL-шифрование',
  },
  back: {
    lv: 'Atpakaļ',
    en: 'Back',
    ru: 'Назад',
  },
}

export function StripePaymentForm({
  locale,
  cartId,
  shippingAddress,
  shippingMethod,
  locker,
  onSuccess,
  onError,
}: StripePaymentFormProps) {
  const t = (key: keyof typeof translations) => translations[key][locale]
  const [isLoading, setIsLoading] = useState(false)
  const [subtotal, setSubtotal] = useState(0)

  // Fetch cart total on mount
  useEffect(() => {
    const fetchCartTotal = async () => {
      try {
        const response = await fetch(`/_api/cart/total?cart_id=${cartId}`)
        const data = await response.json()
        setSubtotal(data.subtotal || 0)
      } catch (error) {
        console.error('Error fetching cart total:', error)
      }
    }
    if (cartId) {
      fetchCartTotal()
    }
  }, [cartId])

  const handleSubmit = async () => {
    setIsLoading(true)

    try {
      const response = await fetch('/api/checkout/create-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cartId,
          shippingAddress,
          shippingMethodId: shippingMethod.id,
          lockerId: locker?.id,
          locale,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || data.message || 'Failed to create checkout session')
      }

      onSuccess(data.url)
    } catch (error) {
      console.error('Error creating checkout session:', error)
      onError(error instanceof Error ? error.message : 'Failed to create checkout session')
    } finally {
      setIsLoading(false)
    }
  }

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat(
      locale === 'en' ? 'en-US' : locale === 'ru' ? 'ru-RU' : 'lv-LV',
      { style: 'currency', currency: 'EUR' }
    ).format(amount)
  }

  const total = subtotal + shippingMethod.price

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-medium text-white mb-2">{t('title')}</h2>
        <p className="text-sm text-lago-muted">{t('description')}</p>
      </div>

      {/* Order Summary */}
      <div className="bg-lago-charcoal/50 rounded-xl p-6 border border-lago-gray/30">
        <h3 className="text-sm font-medium text-lago-muted uppercase tracking-wide mb-4">
          {t('summary')}
        </h3>

        {/* Shipping Address */}
        <div className="mb-4 pb-4 border-b border-lago-gray/30">
          <p className="text-sm text-lago-muted mb-1">{t('shippingTo')}</p>
          <p className="text-white">
            {shippingAddress.firstName} {shippingAddress.lastName}
          </p>
          <p className="text-lago-light">{shippingAddress.addressLine1}</p>
          {shippingAddress.addressLine2 && (
            <p className="text-lago-light">{shippingAddress.addressLine2}</p>
          )}
          <p className="text-lago-light">
            {shippingAddress.postalCode} {shippingAddress.city}
          </p>
          <p className="text-lago-light">{shippingAddress.country}</p>
        </div>

        {/* Shipping Method */}
        <div className="mb-4 pb-4 border-b border-lago-gray/30">
          <p className="text-sm text-lago-muted mb-1">{t('shippingMethod')}</p>
          <p className="text-white">{shippingMethod.name}</p>
          {locker && (
            <p className="text-sm text-lago-muted mt-1">
              {locker.name}, {locker.address}
            </p>
          )}
        </div>

        {/* Totals */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-lago-muted">{t('subtotal')}</span>
            <span className="text-white">{formatPrice(subtotal)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-lago-muted">{t('shipping')}</span>
            <span className="text-white">
              {shippingMethod.price === 0 ? 'Free' : formatPrice(shippingMethod.price)}
            </span>
          </div>
          <div className="flex justify-between pt-2 border-t border-lago-gray/30">
            <span className="font-medium text-white">{t('total')}</span>
            <span className="text-xl font-medium text-lago-gold">
              {formatPrice(total)}
            </span>
          </div>
        </div>
      </div>

      {/* Payment Button */}
      <div className="space-y-4">
        <NeonButton
          onClick={handleSubmit}
          variant="solid"
          size="lg"
          className="w-full"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              {t('processing')}
            </>
          ) : (
            <>
              <CreditCard className="w-5 h-5" />
              {t('payButton')}
            </>
          )}
        </NeonButton>

        {/* Security Badge */}
        <div className="flex items-center justify-center gap-2 text-xs text-lago-muted">
          <Shield className="w-4 h-4" />
          <span>{t('secure')}</span>
        </div>
      </div>
    </div>
  )
}
