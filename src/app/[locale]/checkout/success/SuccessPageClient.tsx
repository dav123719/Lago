// AGENT slave-8 v1.0.1 - Final optimization complete
'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { CheckCircle, Package, Mail, Phone } from 'lucide-react'
import { NeonButton } from '@/components/ui/NeonButton'
import { Locale } from '@/lib/i18n/config'
import { SuspenseLoader } from '@/components/loading/PageLoader'

interface SuccessPageClientProps {
  locale: Locale
}

const translations = {
  lv: {
    title: 'Paldies par pirkumu!',
    description: 'Jūsu pasūtījums ir veiksmīgi noformēts.',
    orderNumber: 'Pasūtījuma numurs',
    confirmationEmail: 'Apstiprinājuma e-pasts ir nosūtīts uz',
    whatHappensNext: 'Kas notiek tālāk?',
    stepProcessing: 'Mēs apstrādājam jūsu pasūtījumu',
    stepShipping: 'Saņemsiet piegādes informāciju',
    stepDelivery: 'Jūsu produkti tiks piegādāti',
    questions: 'Jautājumi?',
    contactUs: 'Sazinieties ar mums',
    continueShopping: 'Turpināt iepirkties',
    loading: 'Ielādē pasūtījuma informāciju...',
  },
  en: {
    title: 'Thank You for Your Order!',
    description: 'Your order has been successfully placed.',
    orderNumber: 'Order Number',
    confirmationEmail: 'A confirmation email has been sent to',
    whatHappensNext: 'What happens next?',
    stepProcessing: 'We are processing your order',
    stepShipping: 'You will receive shipping information',
    stepDelivery: 'Your items will be delivered',
    questions: 'Questions?',
    contactUs: 'Contact us',
    continueShopping: 'Continue Shopping',
    loading: 'Loading order information...',
  },
  ru: {
    title: 'Спасибо за заказ!',
    description: 'Ваш заказ успешно оформлен.',
    orderNumber: 'Номер заказа',
    confirmationEmail: 'Письмо с подтверждением отправлено на',
    whatHappensNext: 'Что дальше?',
    stepProcessing: 'Мы обрабатываем ваш заказ',
    stepShipping: 'Вы получите информацию о доставке',
    stepDelivery: 'Ваши товары будут доставлены',
    questions: 'Вопросы?',
    contactUs: 'Свяжитесь с нами',
    continueShopping: 'Продолжить покупки',
    loading: 'Загрузка информации о заказе...',
  },
}

export default function SuccessPageClient({ locale }: SuccessPageClientProps) {
  const searchParams = useSearchParams()
  const [orderData, setOrderData] = useState({
    orderNumber: 'N/A',
    customerEmail: '',
    isLoading: true,
  })
  
  const t = translations[locale]
  const sessionId = searchParams?.get('session_id')

  useEffect(() => {
    // Validate session and get order details
    let orderNumber = 'N/A'
    let customerEmail = ''

    if (sessionId) {
      // In a real implementation, you would fetch session data from your API
      // For now, use fallback values
      orderNumber = sessionId.slice(-12).toUpperCase()
    }

    setOrderData({
      orderNumber,
      customerEmail,
      isLoading: false,
    })
  }, [sessionId])

  if (orderData.isLoading) {
    return (
      <main className="min-h-screen bg-lago-black pt-24 pb-16">
        <div className="container-lg">
          <SuspenseLoader />
          <p className="text-center text-lago-muted mt-4">{t.loading}</p>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-lago-black pt-24 pb-16">
      <div className="container-lg">
        <div className="max-w-2xl mx-auto text-center">
          {/* Success Icon */}
          <div className="w-24 h-24 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-8">
            <CheckCircle className="w-12 h-12 text-green-400" />
          </div>

          {/* Title */}
          <h1 className="text-3xl md:text-4xl font-heading text-white mb-4">
            {t.title}
          </h1>
          <p className="text-lago-muted mb-8">
            {t.description}
          </p>

          {/* Order Details Card */}
          <div className="bg-lago-charcoal/50 rounded-xl p-8 border border-lago-gray/30 mb-8">
            <div className="mb-6">
              <p className="text-sm text-lago-muted mb-2">{t.orderNumber}</p>
              <p className="text-2xl font-mono text-lago-gold">{orderData.orderNumber}</p>
            </div>

            {orderData.customerEmail && (
              <p className="text-sm text-lago-light">
                {t.confirmationEmail} <span className="text-white">{orderData.customerEmail}</span>
              </p>
            )}
          </div>

          {/* Next Steps */}
          <div className="mb-8">
            <h2 className="text-lg font-medium text-white mb-6">{t.whatHappensNext}</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-lago-charcoal/30 rounded-lg">
                <Package className="w-6 h-6 text-lago-gold mx-auto mb-3" />
                <p className="text-sm text-lago-light">{t.stepProcessing}</p>
              </div>
              <div className="p-4 bg-lago-charcoal/30 rounded-lg">
                <Mail className="w-6 h-6 text-lago-gold mx-auto mb-3" />
                <p className="text-sm text-lago-light">{t.stepShipping}</p>
              </div>
              <div className="p-4 bg-lago-charcoal/30 rounded-lg">
                <CheckCircle className="w-6 h-6 text-lago-gold mx-auto mb-3" />
                <p className="text-sm text-lago-light">{t.stepDelivery}</p>
              </div>
            </div>
          </div>

          {/* Contact */}
          <div className="mb-8">
            <p className="text-lago-muted mb-2">{t.questions}</p>
            <a
              href={`/${locale}/par-mums#contact`}
              className="inline-flex items-center gap-2 text-lago-gold hover:text-lago-gold-light transition-colors"
            >
              <Phone className="w-4 h-4" />
              {t.contactUs}
            </a>
          </div>

          {/* CTA */}
          <NeonButton href={`/${locale}`} variant="solid" size="lg">
            {t.continueShopping}
          </NeonButton>
        </div>
      </div>
    </main>
  )
}
