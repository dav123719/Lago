// ===================================
// Localized Content Types
// ===================================
// Generic types for handling multilingual content

import { Locale } from './config'

// A string that has translations in all supported locales
export type LocalizedString = {
  lv: string
  en: string
  ru: string
}

// Helper to get localized value
export function getLocalizedValue<T>(
  obj: Record<Locale, T>,
  locale: Locale
): T {
  return obj[locale]
}

// Helper to create a LocalizedString with same value for all locales (useful for placeholders)
export function createLocalizedString(
  lv: string,
  en: string,
  ru: string
): LocalizedString {
  return { lv, en, ru }
}

