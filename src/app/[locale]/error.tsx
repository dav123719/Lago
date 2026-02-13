// AGENT slave-8 v1.0.1 - Final optimization complete
'use client'

// ============================================
// Locale Error Boundary
// ============================================
// Catches errors within locale-specific routes

import { useEffect } from 'react'
import { ErrorFallback } from '@/components/error/ErrorFallback'
import { captureError } from '@/lib/error/reporting'
import { useParams } from 'next/navigation'
import { isValidLocale } from '@/lib/i18n/config'

interface LocaleErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

/**
 * Locale Error Component
 * 
 * Catches errors within the locale layout.
 * Provides localized error messages.
 */
export default function LocaleError({ error, reset }: LocaleErrorProps) {
  const params = useParams()
  const localeParam = params?.locale as string
  const locale = isValidLocale(localeParam) ? localeParam : 'lv'

  useEffect(() => {
    // Report error to monitoring service
    captureError(error, {
      component: 'LocaleLayout',
      tags: { locale, digest: error.digest || 'unknown' },
    })
  }, [error, locale])

  return (
    <div className="min-h-screen bg-lago-black flex flex-col">
      <main className="flex-1 flex items-center justify-center">
        <ErrorFallback error={error} reset={reset} locale={locale} />
      </main>
    </div>
  )
}
