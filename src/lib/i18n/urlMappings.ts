// URL slug mappings between locales
// This maps slugs from one locale to another

import { Locale } from './config'

// Base route mappings
export const routeMappings: Record<string, Record<Locale, string>> = {
  // Stone surfaces
  'stone-surfaces': { lv: 'akmens-virsmas', en: 'stone-surfaces', ru: 'kamennye-poverhnosti' },
  'akmens-virsmas': { lv: 'akmens-virsmas', en: 'stone-surfaces', ru: 'kamennye-poverhnosti' },
  'kamennye-poverhnosti': { lv: 'akmens-virsmas', en: 'stone-surfaces', ru: 'kamennye-poverhnosti' },
  
  // Furniture
  'furniture': { lv: 'mebeles', en: 'furniture', ru: 'mebel' },
  'mebeles': { lv: 'mebeles', en: 'furniture', ru: 'mebel' },
  'mebel': { lv: 'mebeles', en: 'furniture', ru: 'mebel' },
  
  // Projects
  'projects': { lv: 'projekti', en: 'projects', ru: 'proekty' },
  'projekti': { lv: 'projekti', en: 'projects', ru: 'proekty' },
  'proekty': { lv: 'projekti', en: 'projects', ru: 'proekty' },
  
  // About
  'about-us': { lv: 'par-mums', en: 'about-us', ru: 'o-nas' },
  'par-mums': { lv: 'par-mums', en: 'about-us', ru: 'o-nas' },
  'o-nas': { lv: 'par-mums', en: 'about-us', ru: 'o-nas' },
  
  // Materials
  'silestone': { lv: 'silestone', en: 'silestone', ru: 'silestone' },
  'dekton': { lv: 'dekton', en: 'dekton', ru: 'dekton' },
  'granite': { lv: 'granits', en: 'granite', ru: 'granit' },
  'granits': { lv: 'granits', en: 'granite', ru: 'granit' },
  'granit': { lv: 'granits', en: 'granite', ru: 'granit' },
  'marble': { lv: 'marmors', en: 'marble', ru: 'mramor' },
  'marmors': { lv: 'marmors', en: 'marble', ru: 'mramor' },
  'mramor': { lv: 'marmors', en: 'marble', ru: 'mramor' },
  
  // Furniture categories
  'kitchens': { lv: 'virtuves', en: 'kitchens', ru: 'kuhni' },
  'virtuves': { lv: 'virtuves', en: 'kitchens', ru: 'kuhni' },
  'kuhni': { lv: 'virtuves', en: 'kitchens', ru: 'kuhni' },
  'built-in': { lv: 'iebuvetajas', en: 'built-in', ru: 'vstroennaya' },
  'iebuvetajas': { lv: 'iebuvetajas', en: 'built-in', ru: 'vstroennaya' },
  'vstroennaya': { lv: 'iebuvetajas', en: 'built-in', ru: 'vstroennaya' },
  'interior-projects': { lv: 'interjera-projekti', en: 'interior-projects', ru: 'interiernye-proekty' },
  'interjera-projekti': { lv: 'interjera-projekti', en: 'interior-projects', ru: 'interiernye-proekty' },
  'interiernye-proekty': { lv: 'interjera-projekti', en: 'interior-projects', ru: 'interiernye-proekty' },
}

/**
 * Translates a URL path from one locale to another
 */
export function translatePath(pathname: string, fromLocale: Locale, toLocale: Locale): string {
  // Split path into segments
  const segments = pathname.split('/').filter(Boolean)
  
  // If empty or just locale, return home page of target locale
  if (segments.length === 0) {
    return `/${toLocale}`
  }
  
  // First segment should be the locale
  if (segments[0] === fromLocale) {
    segments[0] = toLocale
  }
  
  // Translate remaining segments
  const translatedSegments = segments.map((segment, index) => {
    // Skip first segment (locale)
    if (index === 0) return segment
    
    // Check if we have a mapping for this segment
    const mapping = routeMappings[segment]
    if (mapping && mapping[toLocale]) {
      return mapping[toLocale]
    }
    
    // If no mapping found, keep the original segment
    // This handles dynamic slugs like project names that are the same across locales
    return segment
  })
  
  return `/${translatedSegments.join('/')}`
}

/**
 * Get all alternate URLs for a given path
 */
export function getAlternateUrls(pathname: string, currentLocale: Locale): Record<Locale, string> {
  return {
    lv: translatePath(pathname, currentLocale, 'lv'),
    en: translatePath(pathname, currentLocale, 'en'),
    ru: translatePath(pathname, currentLocale, 'ru'),
  }
}

