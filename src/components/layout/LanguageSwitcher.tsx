'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Globe } from 'lucide-react'
import { Locale, locales, localeNames } from '@/lib/i18n/config'
import { translatePath } from '@/lib/i18n/urlMappings'

interface LanguageSwitcherProps {
  currentLocale: Locale
  alternateUrls?: Record<Locale, string>
  className?: string
}

export function LanguageSwitcher({ currentLocale, alternateUrls, className = '' }: LanguageSwitcherProps) {
  const pathname = usePathname()

  const getLocalizedUrl = (targetLocale: Locale): string => {
    // If alternate URLs are provided, use them
    if (alternateUrls && alternateUrls[targetLocale]) {
      return alternateUrls[targetLocale]
    }

    // Use the translation function to properly translate the path
    return translatePath(pathname, currentLocale, targetLocale)
  }

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      <Globe className="w-4 h-4 text-lago-muted mr-1" />
      {locales.map((locale, index) => (
        <span key={locale} className="flex items-center">
          {index > 0 && <span className="text-lago-stone mx-1.5">·</span>}
          <Link
            href={getLocalizedUrl(locale)}
            className={`
              text-xs font-medium uppercase tracking-wider transition-colors
              ${locale === currentLocale 
                ? 'text-lago-gold' 
                : 'text-lago-muted hover:text-white'
              }
            `}
            aria-current={locale === currentLocale ? 'page' : undefined}
            aria-label={`Switch to ${localeNames[locale]}`}
          >
            {locale}
          </Link>
        </span>
      ))}
    </div>
  )
}

export function LanguageSwitcherMobile({ currentLocale, alternateUrls, className = '' }: LanguageSwitcherProps) {
  const pathname = usePathname()

  const getLocalizedUrl = (targetLocale: Locale): string => {
    // If alternate URLs are provided, use them
    if (alternateUrls && alternateUrls[targetLocale]) {
      return alternateUrls[targetLocale]
    }

    // Use the translation function to properly translate the path
    return translatePath(pathname, currentLocale, targetLocale)
  }

  return (
    <div className={`flex items-center gap-4 ${className}`}>
      {locales.map((locale) => (
        <Link
          key={locale}
          href={getLocalizedUrl(locale)}
          className={`
            text-sm transition-colors
            ${locale === currentLocale 
              ? 'text-lago-gold font-medium' 
              : 'text-lago-muted hover:text-white'
            }
          `}
          aria-current={locale === currentLocale ? 'page' : undefined}
        >
          {localeNames[locale]}
        </Link>
      ))}
    </div>
  )
}
