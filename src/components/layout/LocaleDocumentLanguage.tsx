'use client'

import { useLayoutEffect } from 'react'
import { localeHtmlLang, type Locale } from '@/lib/i18n/config'

// Localized content also declares its language in the server-rendered wrapper.
// Update the document before paint on locale navigation without making static
// pages depend on request headers or introducing a second root layout.
export function LocaleDocumentLanguage({ locale }: { locale: Locale }) {
  useLayoutEffect(() => {
    const language = localeHtmlLang[locale]
    // Even assigning the same language invalidates inherited :lang styles in
    // Chromium. Avoid a full-document style recalculation after hydration.
    if (document.documentElement.lang !== language) {
      document.documentElement.lang = language
    }
  }, [locale])
  return null
}
