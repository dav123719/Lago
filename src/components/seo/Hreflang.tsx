import { Locale, locales } from '@/lib/i18n/config'

interface HreflangProps {
  // Map of locale -> full URL for the current page
  alternateUrls: Record<Locale, string>
  currentLocale: Locale
}

/**
 * Hreflang Component
 * 
 * Generates hreflang alternate link tags for multilingual SEO.
 * Should be placed in the <head> section via Next.js metadata or a custom component.
 * 
 * This component renders link elements that tell search engines about the
 * alternate language versions of the current page.
 */
export function Hreflang({ alternateUrls, currentLocale }: HreflangProps) {
  return (
    <>
      {locales.map((locale) => (
        <link
          key={locale}
          rel="alternate"
          hrefLang={locale}
          href={alternateUrls[locale]}
        />
      ))}
      {/* x-default points to the default locale version */}
      <link
        rel="alternate"
        hrefLang="x-default"
        href={alternateUrls[currentLocale]}
      />
    </>
  )
}

/**
 * Generate hreflang metadata for Next.js generateMetadata
 * Returns an object that can be spread into the metadata alternates
 */
export function generateHreflangMetadata(
  baseUrl: string,
  currentLocale: Locale,
  slugs: Record<Locale, string>
) {
  const languages: Record<string, string> = {}
  
  locales.forEach((locale) => {
    languages[locale] = `${baseUrl}${slugs[locale]}`
  })
  
  // Add x-default
  languages['x-default'] = `${baseUrl}${slugs[currentLocale]}`
  
  return {
    canonical: `${baseUrl}${slugs[currentLocale]}`,
    languages,
  }
}

