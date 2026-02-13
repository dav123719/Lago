// ===================================
// Checkout Client Component
// ===================================

'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { CheckoutProgress } from '@/components/checkout/CheckoutProgress'
import { ShippingForm } from '@/components/checkout/ShippingForm'
import { ShippingMethodSelector } from '@/components/checkout/ShippingMethodSelector'
import { StripePaymentForm } from '@/components/checkout/StripePaymentForm'
import { useCartContext } from '@/contexts/CartContext'
import type { ShippingAddress, ShippingMethod, ShippingRate, ParcelLocker } from '@/types/checkout'
import type { CheckoutStep } from '@/types/checkout'
import type { Locale } from '@/lib/i18n/config'

interface CheckoutClientProps {
  locale: Locale
}

const translations = {
  emptyCart: {
    lv: 'Jūsu grozs ir tukšs',
    en: 'Your cart is empty',
    ru: 'Ваша корзина пуста',
  },
  emptyCartDescription: {
    lv: 'Lūdzu, pievienojiet produktus grozam pirms noformēšanas.',
    en: 'Please add products to your cart before checkout.',
    ru: 'Пожалуйста, добавьте товары в корзину перед оформлением.',
  },
  continueShopping: {
    lv: 'Turpināt iepirkties',
    en: 'Continue Shopping',
    ru: 'Продолжить покупки',
  },
  error: {
    lv: 'Kļūda',
    en: 'Error',
    ru: 'Ошибка',
  },
}

export function CheckoutClient({ locale }: CheckoutClientProps) {
  const router = useRouter()
  const { items, subtotal, isLoading } = useCartContext()
  
  const [currentStep, setCurrentStep] = useState<CheckoutStep>('shipping')
  const [shippingAddress, setShippingAddress] = useState<ShippingAddress | null>(null)
  const [shippingMethod, setShippingMethod] = useState<ShippingMethod | null>(null)
  const [shippingRate, setShippingRate] = useState<ShippingRate | null>(null)
  const [selectedLocker, setSelectedLocker] = useState<ParcelLocker | null>(null)
  const [error, setError] = useState<string | null>(null)

  const t = (key: keyof typeof translations) => translations[key][locale]

  // Redirect to cart if empty
  useEffect(() => {
    if (!isLoading && items.length === 0) {
      // Don't redirect immediately, show empty state
    }
  }, [items, isLoading])

  const handleShippingSubmit = (address: ShippingAddress) => {
    setShippingAddress(address)
    setCurrentStep('payment')
  }

  const handleMethodSelect = (
    method: ShippingMethod,
    rate: ShippingRate,
    locker?: ParcelLocker
  ) => {
    setShippingMethod(method)
    setShippingRate(rate)
    setSelectedLocker(locker || null)
  }

  const handlePaymentSuccess = (url: string) => {
    // Redirect to Stripe checkout
    window.location.href = url
  }

  const handlePaymentError = (errorMessage: string) => {
    setError(errorMessage)
  }

  if (isLoading) {
    return (
      <main className="min-h-screen bg-lago-black pt-24 pb-16">
        <div className="container-lg">
          <div className="flex items-center justify-center py-24">
            <div className="w-12 h-12 border-2 border-lago-gold/30 border-t-lago-gold rounded-full animate-spin" />
          </div>
        </div>
      </main>
    )
  }

  if (items.length === 0) {
    return (
      <main className="min-h-screen bg-lago-black pt-24 pb-16">
        <div className="container-lg">
          <div className="max-w-md mx-auto text-center py-24">
            <h1 className="text-2xl font-heading text-white mb-4">{t('emptyCart')}</h1>
            <p className="text-lago-muted mb-8">{t('emptyCartDescription')}</p>
            <a
              href={`/${locale}`}
              className="inline-flex items-center gap-2 px-6 py-3 bg-lago-gold text-lago-black rounded-xl font-medium hover:bg-lago-gold-light transition-colors"
            >
              {t('continueShopping')}
            </a>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-lago-black pt-24 pb-16">
      <div className="container-lg">
        {/* Header */}
        <h1 className="text-3xl md:text-4xl font-heading text-white mb-8 text-center">
          {locale === 'lv' ? 'Noformēt pasūtījumu' : 
           locale === 'ru' ? 'Оформление заказа' : 
           'Checkout'}
        </h1>

        {/* Progress */}
        <div className="max-w-3xl mx-auto mb-12">
          <CheckoutProgress currentStep={currentStep} locale={locale} />
        </div>

        {/* Error Message */}
        {error && (
          <div className="max-w-2xl mx-auto mb-8 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        {/* Step Content */}
        <div className="max-w-2xl mx-auto">
          {currentStep === 'shipping' && !shippingAddress && (
            <ShippingForm
              locale={locale}
              onSubmit={handleShippingSubmit}
            />
          )}

          {currentStep === 'shipping' && shippingAddress && !shippingMethod && (
            <ShippingMethodSelector
              locale={locale}
              country={shippingAddress.country}
              subtotal={subtotal}
              onSelect={handleMethodSelect}
              onBack={() => setShippingAddress(null)}
            />
          )}

          {currentStep === 'payment' && shippingAddress && shippingMethod && (
            <StripePaymentForm
              locale={locale}
              cartId={items[0]?.cart_id || ''}
              shippingAddress={shippingAddress}
              shippingMethod={shippingMethod}
              locker={selectedLocker || undefined}
              onSuccess={handlePaymentSuccess}
              onError={handlePaymentError}
            />
          )}
        </div>
      </div>
    </main>
  )
}
