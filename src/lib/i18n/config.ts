// ===================================
// i18n Configuration
// ===================================
// This file defines the localization settings for the LAGO website.
// Supported languages: Latvian (lv), English (en), Russian (ru)

export const locales = ['lv', 'en', 'ru'] as const
export type Locale = (typeof locales)[number]

export const defaultLocale: Locale = 'lv'

// Language display names (in their native language)
export const localeNames: Record<Locale, string> = {
  lv: 'Latviešu',
  en: 'English',
  ru: 'Русский',
}

// Language codes for HTML lang attribute
export const localeHtmlLang: Record<Locale, string> = {
  lv: 'lv',
  en: 'en',
  ru: 'ru',
}

// Check if a string is a valid locale
export function isValidLocale(locale: string): locale is Locale {
  return locales.includes(locale as Locale)
}

// Get locale from pathname
export function getLocaleFromPath(pathname: string): Locale {
  const segments = pathname.split('/').filter(Boolean)
  const firstSegment = segments[0]
  
  if (firstSegment && isValidLocale(firstSegment)) {
    return firstSegment
  }
  
  return defaultLocale
}

