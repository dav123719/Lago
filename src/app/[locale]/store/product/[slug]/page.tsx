import { createServerClient } from '@/lib/supabase/client'
import { locales } from '@/lib/i18n/config'

// AGENT slave-1 v1.0.1 - Dynamic routes fixed

// Common product slugs as fallback
const commonProductSlugs = [
  'kitchen-countertop',
  'bathroom-vanity',
  'dining-table',
  'office-desk',
  'stone-sink',
  'wall-cladding',
  'fireplace-surround',
  'bar-counter',
  'coffee-table',
  'shower-tray',
]

export async function generateStaticParams() {
  const params: { locale: string; slug: string }[] = []
  
  try {
    // Try to fetch product slugs from Supabase
    const supabase = createServerClient()
    const { data: products, error } = await supabase
      .from('products')
      .select('slug')
      .eq('is_available', true)
    
    if (error) {
      console.warn('Failed to fetch product slugs from Supabase:', error.message)
    }
    
    // Use fetched slugs or fallback to common slugs
    const slugs = (products && products.length > 0) 
      ? (products as { slug: string }[]).map(p => p.slug).filter(Boolean)
      : commonProductSlugs
    
    // Generate params for all locale/slug combinations
    for (const locale of locales) {
      for (const slug of slugs) {
        params.push({ locale, slug })
      }
    }
  } catch (error) {
    // Supabase not configured or other error - use fallback slugs
    console.warn('Supabase not available, using fallback product slugs')
    
    for (const locale of locales) {
      for (const slug of commonProductSlugs) {
        params.push({ locale, slug })
      }
    }
  }
  
  return params
}

export default function ProductPage() {
  return <div>Product Page</div>
}
