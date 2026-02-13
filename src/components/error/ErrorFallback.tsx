// AGENT slave-8 v1.0.1 - Final optimization complete
'use client'

// ============================================
// Error Fallback Component
// ============================================
// Elegant error UI matching luxury theme

import { AlertTriangle, RefreshCw, Home, Mail, Phone } from 'lucide-react'
import Link from 'next/link'
import { Locale } from '@/lib/i18n/config'

interface ErrorFallbackProps {
  error?: Error
  reset?: () => void
  locale?: Locale
  className?: string
}

/**
 * ErrorFallback Component
 * 
 * Elegant error UI that maintains brand identity.
 * Provides helpful error information and recovery options.
 * 
 * @example
 * <ErrorFallback
 *   error={error}
 *   reset={reset}
 *   locale="lv"
 * />
 */
export function ErrorFallback({
  error,
  reset,
  locale = 'lv',
  className = '',
}: ErrorFallbackProps) {
  const translations = {
    lv: {
      title: 'Radās kļūda',
      description: 'Atvainojiet, radās neparedzēta kļūda. Mēs strādājam, lai to novērstu.',
      retry: 'Mēģināt vēlreiz',
      home: 'Uz sākumlapu',
      contact: 'Sazināties ar atbalstu',
      errorId: 'Kļūdas ID',
      support: 'Ja problēma atkārtojas, lūdzu, sazinieties ar mums:',
      phone: 'Tālrunis',
      email: 'E-pasts',
    },
    en: {
      title: 'An error occurred',
      description: 'Sorry, an unexpected error has occurred. We are working to resolve it.',
      retry: 'Try again',
      home: 'Go home',
      contact: 'Contact support',
      errorId: 'Error ID',
      support: 'If the problem persists, please contact us:',
      phone: 'Phone',
      email: 'Email',
    },
    ru: {
      title: 'Произошла ошибка',
      description: 'Извините, произошла непредвиденная ошибка. Мы работаем над её устранением.',
      retry: 'Попробовать снова',
      home: 'На главную',
      contact: 'Связаться с поддержкой',
      errorId: 'ID ошибки',
      support: 'Если проблема повторяется, пожалуйста, свяжитесь с нами:',
      phone: 'Телефон',
      email: 'Email',
    },
  }

  const t = translations[locale]
  const errorId = error?.message?.slice(0, 8) || 'UNKNOWN'

  return (
    <div className={`min-h-[60vh] flex items-center justify-center px-6 ${className}`}>
      <div className="max-w-lg w-full text-center space-y-8">
        {/* Error Icon */}
        <div className="relative inline-block">
          <div className="absolute inset-0 bg-lago-gold/20 blur-3xl rounded-full" />
          <div className="relative w-24 h-24 mx-auto bg-lago-charcoal rounded-full flex items-center justify-center border border-lago-gold/30">
            <AlertTriangle className="w-12 h-12 text-lago-gold" aria-hidden="true" />
          </div>
        </div>

        {/* Error Content */}
        <div className="space-y-4">
          <h1 className="text-3xl font-medium text-lago-white">
            {t.title}
          </h1>
          <p className="text-lago-muted text-lg leading-relaxed">
            {t.description}
          </p>
        </div>

        {/* Error Details (Development) */}
        {process.env.NODE_ENV === 'development' && error && (
          <div className="bg-lago-charcoal/50 rounded-lg p-4 text-left overflow-hidden">
            <p className="text-lago-muted text-xs uppercase tracking-wider mb-2">
              {t.errorId}: {errorId}
            </p>
            <pre className="text-lago-light text-sm overflow-x-auto whitespace-pre-wrap">
              {error.message}
            </pre>
            {error.stack && (
              <pre className="text-lago-stone text-xs mt-2 overflow-x-auto">
                {error.stack.split('\n').slice(1, 4).join('\n')}
              </pre>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          {reset && (
            <button
              onClick={reset}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-lago-gold text-lago-black font-medium rounded-full hover:bg-lago-gold-light transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lago-gold focus-visible:ring-offset-2 focus-visible:ring-offset-lago-black"
            >
              <RefreshCw className="w-5 h-5" />
              {t.retry}
            </button>
          )}
          <Link
            href={`/${locale}`}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-lago-charcoal text-lago-light font-medium rounded-full hover:bg-lago-gray transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lago-gold focus-visible:ring-offset-2 focus-visible:ring-offset-lago-black"
          >
            <Home className="w-5 h-5" />
            {t.home}
          </Link>
        </div>

        {/* Support Contact */}
        <div className="pt-8 border-t border-lago-charcoal">
          <p className="text-lago-muted text-sm mb-4">{t.support}</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center text-sm">
            <a
              href="tel:+37167555555"
              className="inline-flex items-center justify-center gap-2 text-lago-light hover:text-lago-gold transition-colors"
            >
              <Phone className="w-4 h-4" />
              {t.phone}: +371 67 555 555
            </a>
            <a
              href="mailto:info@lago.lv"
              className="inline-flex items-center justify-center gap-2 text-lago-light hover:text-lago-gold transition-colors"
            >
              <Mail className="w-4 h-4" />
              {t.email}: info@lago.lv
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

/**
 * NotFoundFallback Component
 * 404 error fallback
 */
interface NotFoundFallbackProps {
  locale?: Locale
  className?: string
}

export function NotFoundFallback({ locale = 'lv', className = '' }: NotFoundFallbackProps) {
  const translations = {
    lv: {
      title: '404',
      subtitle: 'Lapa nav atrasta',
      description: 'Atvainojiet, meklētā lapa neeksistē vai ir pārvietota.',
      home: 'Uz sākumlapu',
      store: 'Uz veikalu',
    },
    en: {
      title: '404',
      subtitle: 'Page not found',
      description: 'Sorry, the page you are looking for does not exist or has been moved.',
      home: 'Go home',
      store: 'Go to store',
    },
    ru: {
      title: '404',
      subtitle: 'Страница не найдена',
      description: 'Извините, запрашиваемая страница не существует или была перемещена.',
      home: 'На главную',
      store: 'В магазин',
    },
  }

  const t = translations[locale]

  return (
    <div className={`min-h-[60vh] flex items-center justify-center px-6 ${className}`}>
      <div className="max-w-lg w-full text-center space-y-8">
        {/* 404 Number */}
        <div className="relative">
          <span className="text-[12rem] font-bold text-lago-charcoal select-none leading-none">
            {t.title}
          </span>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-6xl font-medium text-lago-gold">{t.title}</span>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-4">
          <h1 className="text-2xl font-medium text-lago-white">
            {t.subtitle}
          </h1>
          <p className="text-lago-muted text-lg">
            {t.description}
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href={`/${locale}`}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-lago-gold text-lago-black font-medium rounded-full hover:bg-lago-gold-light transition-colors"
          >
            {t.home}
          </Link>
          <Link
            href={`/${locale}/store`}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-lago-charcoal text-lago-light font-medium rounded-full hover:bg-lago-gray transition-colors"
          >
            {t.store}
          </Link>
        </div>
      </div>
    </div>
  )
}

/**
 * CheckoutError Component
 * Error specific to checkout flow
 */
interface CheckoutErrorProps {
  error: Error
  onRetry: () => void
  locale?: Locale
  className?: string
}

export function CheckoutError({
  error,
  onRetry,
  locale = 'lv',
  className = '',
}: CheckoutErrorProps) {
  const translations = {
    lv: {
      title: 'Apmaksas kļūda',
      description: 'Radās problēma ar jūsu pasūtījuma apstrādi. Jūsu nauda netika noņemta.',
      retry: 'Mēģināt vēlreiz',
      contact: 'Ja problēma atkārtojas, lūdzu, sazinieties ar mums.',
    },
    en: {
      title: 'Checkout Error',
      description: 'There was a problem processing your order. Your money was not charged.',
      retry: 'Try again',
      contact: 'If the problem persists, please contact us.',
    },
    ru: {
      title: 'Ошибка оформления',
      description: 'Возникла проблема с обработкой вашего заказа. Средства не были списаны.',
      retry: 'Попробовать снова',
      contact: 'Если проблема повторяется, пожалуйста, свяжитесь с нами.',
    },
  }

  const t = translations[locale]

  return (
    <div className={`bg-red-500/10 border border-red-500/30 rounded-xl p-6 ${className}`}>
      <div className="flex items-start gap-4">
        <AlertTriangle className="w-6 h-6 text-red-400 flex-shrink-0 mt-0.5" />
        <div className="space-y-2">
          <h3 className="text-lago-white font-medium">{t.title}</h3>
          <p className="text-lago-muted text-sm">{t.description}</p>
          {process.env.NODE_ENV === 'development' && (
            <p className="text-red-400 text-xs">{error.message}</p>
          )}
          <button
            onClick={onRetry}
            className="text-lago-gold text-sm hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lago-gold rounded"
          >
            {t.retry}
          </button>
        </div>
      </div>
    </div>
  )
}

/**
 * NetworkError Component
 * Network-specific error
 */
interface NetworkErrorProps {
  onRetry: () => void
  locale?: Locale
  className?: string
}

export function NetworkError({ onRetry, locale = 'lv', className = '' }: NetworkErrorProps) {
  const translations = {
    lv: {
      title: 'Tīkla kļūda',
      description: 'Neizdevās izveidot savienojumu. Lūdzu, pārbaudiet savu interneta savienojumu.',
      retry: 'Mēģināt vēlreiz',
    },
    en: {
      title: 'Network Error',
      description: 'Failed to connect. Please check your internet connection.',
      retry: 'Try again',
    },
    ru: {
      title: 'Ошибка сети',
      description: 'Не удалось установить соединение. Пожалуйста, проверьте подключение к интернету.',
      retry: 'Попробовать снова',
    },
  }

  const t = translations[locale]

  return (
    <div className={`text-center py-12 ${className}`}>
      <p className="text-lago-muted">{t.description}</p>
      <button
        onClick={onRetry}
        className="mt-4 inline-flex items-center gap-2 text-lago-gold hover:underline"
      >
        <RefreshCw className="w-4 h-4" />
        {t.retry}
      </button>
    </div>
  )
}
