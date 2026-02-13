// ===================================
// Checkout Progress Component
// ===================================

'use client'

import { Check } from 'lucide-react'
import type { CheckoutStep } from '@/types/checkout'
import type { Locale } from '@/lib/i18n/config'

interface CheckoutProgressProps {
  currentStep: CheckoutStep
  locale: Locale
}

const translations = {
  cart: {
    lv: 'Grozs',
    en: 'Cart',
    ru: 'Корзина',
  },
  shipping: {
    lv: 'Piegāde',
    en: 'Shipping',
    ru: 'Доставка',
  },
  payment: {
    lv: 'Maksājums',
    en: 'Payment',
    ru: 'Оплата',
  },
  confirmation: {
    lv: 'Apstiprinājums',
    en: 'Confirmation',
    ru: 'Подтверждение',
  },
}

const steps: CheckoutStep[] = ['cart', 'shipping', 'payment', 'confirmation']

export function CheckoutProgress({ currentStep, locale }: CheckoutProgressProps) {
  const t = (key: CheckoutStep) => translations[key][locale]
  
  const currentStepIndex = steps.indexOf(currentStep)

  return (
    <div className="w-full">
      {/* Desktop */}
      <div className="hidden md:flex items-center justify-between">
        {steps.map((step, index) => {
          const isCompleted = index < currentStepIndex
          const isCurrent = index === currentStepIndex
          const isLast = index === steps.length - 1

          return (
            <div key={step} className="flex items-center flex-1">
              {/* Step indicator */}
              <div className="flex flex-col items-center">
                <div
                  className={`
                    w-10 h-10 rounded-full flex items-center justify-center
                    border-2 transition-all duration-300
                    ${isCompleted
                      ? 'bg-lago-gold border-lago-gold text-lago-black'
                      : isCurrent
                      ? 'border-lago-gold text-lago-gold'
                      : 'border-lago-gray text-lago-muted'
                    }
                  `}
                >
                  {isCompleted ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    <span className="text-sm font-medium">{index + 1}</span>
                  )}
                </div>
                <span
                  className={`
                    mt-2 text-sm font-medium
                    ${isCompleted || isCurrent ? 'text-white' : 'text-lago-muted'}
                  `}
                >
                  {t(step)}
                </span>
              </div>

              {/* Connector line */}
              {!isLast && (
                <div
                  className={`
                    flex-1 h-0.5 mx-4 transition-all duration-300
                    ${index < currentStepIndex ? 'bg-lago-gold' : 'bg-lago-gray/30'}
                  `}
                />
              )}
            </div>
          )
        })}
      </div>

      {/* Mobile */}
      <div className="md:hidden">
        <div className="flex items-center justify-between mb-2">
          {steps.map((step, index) => {
            const isCompleted = index < currentStepIndex
            const isCurrent = index === currentStepIndex

            return (
              <div
                key={step}
                className={`
                  w-8 h-8 rounded-full flex items-center justify-center text-sm
                  border-2 transition-all duration-300
                  ${isCompleted
                    ? 'bg-lago-gold border-lago-gold text-lago-black'
                    : isCurrent
                    ? 'border-lago-gold text-lago-gold'
                    : 'border-lago-gray text-lago-muted'
                  }
                `}
              >
                {isCompleted ? <Check className="w-4 h-4" /> : index + 1}
              </div>
            )
          })}
        </div>
        <div className="text-center">
          <span className="text-sm font-medium text-lago-gold">
            {t(currentStep)}
          </span>
        </div>
      </div>
    </div>
  )
}
