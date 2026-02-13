'use client'

// ============================================
// Analytics Provider Component
// ============================================
// Wraps the app with analytics functionality

import { useEffect } from 'react'
import Script from 'next/script'
import { useAnalytics, useConsent } from '@/hooks/useAnalytics'
import { initGA } from '@/lib/analytics/gtag'

interface AnalyticsProviderProps {
  children: React.ReactNode
  measurementId?: string
}

/**
 * AnalyticsProvider Component
 * 
 * Initializes analytics and tracks page views.
 * Wrap your app with this provider to enable analytics.
 * 
 * @example
 * <AnalyticsProvider measurementId="G-XXXXXXXXXX">
 *   <App />
 * </AnalyticsProvider>
 */
export function AnalyticsProvider({ 
  children, 
  measurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID 
}: AnalyticsProviderProps) {
  const { loadSavedConsent, hasConsent } = useConsent()

  // Load saved consent on mount
  useEffect(() => {
    loadSavedConsent()
  }, [loadSavedConsent])

  // Initialize analytics hooks
  useAnalytics()

  if (!measurementId) {
    return <>{children}</>
  }

  return (
    <>
      {/* Google Analytics Script */}
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`}
        strategy="afterInteractive"
        onLoad={() => initGA(measurementId)}
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${measurementId}', {
            send_page_view: false,
            cookie_flags: 'SameSite=None;Secure'
          });
        `}
      </Script>
      {children}
    </>
  )
}

/**
 * ConsentBanner Component
 * GDPR-compliant consent banner
 */
import { useState } from 'react'
import { X } from 'lucide-react'

interface ConsentBannerProps {
  locale?: 'lv' | 'en' | 'ru'
}

export function ConsentBanner({ locale = 'lv' }: ConsentBannerProps) {
  const [isVisible, setIsVisible] = useState(true)
  const { grantConsent, denyConsent } = useConsent()

  const handleAccept = () => {
    grantConsent()
    setIsVisible(false)
  }

  const handleDecline = () => {
    denyConsent()
    setIsVisible(false)
  }

  const handleClose = () => {
    setIsVisible(false)
  }

  const translations = {
    lv: {
      title: 'Sīkdatņu iestatījumi',
      description: 'Mēs izmantojam sīkdatnes, lai uzlabotu jūsu pieredzi mūsu vietnē. Dažas ir nepieciešamas vietnes darbībai, citas palīdz mums analizēt datplūsmu un personalizēt saturu.',
      accept: 'Pieņemt visus',
      decline: 'Noraidīt nebūtiskos',
      customize: 'Pielāgot',
    },
    en: {
      title: 'Cookie Settings',
      description: 'We use cookies to enhance your experience on our website. Some are essential for the site to function, others help us analyze traffic and personalize content.',
      accept: 'Accept All',
      decline: 'Decline Non-Essential',
      customize: 'Customize',
    },
    ru: {
      title: 'Настройки файлов cookie',
      description: 'Мы используем файлы cookie для улучшения вашего опыта на нашем сайте. Некоторые необходимы для работы сайта, другие помогают нам анализировать трафик и персонализировать контент.',
      accept: 'Принять все',
      decline: 'Отклонить необязательные',
      customize: 'Настроить',
    },
  }

  const t = translations[locale]

  if (!isVisible) return null

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-50 bg-lago-dark border-t border-lago-charcoal p-4 md:p-6"
      role="dialog"
      aria-label={t.title}
    >
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center gap-4">
        <div className="flex-1">
          <h3 className="text-lago-white font-medium mb-2">{t.title}</h3>
          <p className="text-lago-muted text-sm leading-relaxed">{t.description}</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleDecline}
            className="px-4 py-2 text-sm text-lago-muted hover:text-lago-white transition-colors"
          >
            {t.decline}
          </button>
          <button
            onClick={handleAccept}
            className="px-6 py-2 bg-lago-gold text-lago-black text-sm font-medium rounded-full hover:bg-lago-gold-light transition-colors"
          >
            {t.accept}
          </button>
          <button
            onClick={handleClose}
            className="p-2 text-lago-muted hover:text-lago-white transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  )
}

/**
 * NoScript Fallback Component
 * Fallback for users with JavaScript disabled
 */
export function NoScriptFallback() {
  return (
    <noscript>
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-lago-gold text-lago-black p-4 text-center text-sm">
        JavaScript is disabled. Some features may not work properly.
      </div>
    </noscript>
  )
}
