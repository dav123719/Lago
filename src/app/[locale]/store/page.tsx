// AGENT slave-8 v1.0.1 - Final optimization complete
// ============================================
// Store Page
// ============================================
// Refactored for static export compatibility

import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { locales, type Locale } from '@/lib/i18n/config'
import { createServerClient, isSupabaseConfigured } from '@/lib/supabase/client'
import { StoreContent } from './StoreContent'
import type { Category, ProductFilters, MaterialType, FinishType } from '@/types/store'

// ============================================
// METADATA
// ============================================

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params

  const titles: Record<Locale, string> = {
    lv: 'Veikals | LAGO',
    en: 'Store | LAGO',
    ru: 'Магазин | LAGO',
  }

  const descriptions: Record<Locale, string> = {
    lv: 'Izpētiet mūsu luksusa mēbeļu un akmens virsmu kolekciju. Silestone, Dekton, granīts un marmors virtuves un interjera projektiem.',
    en: 'Explore our luxury furniture and stone surfaces collection. Silestone, Dekton, granite and marble for kitchen and interior projects.',
    ru: 'Исследуйте нашу коллекцию мебели и каменных поверхностей премиум-класса. Silestone, Dekton, гранит и мрамор для кухонь и интерьерных проектов.',
  }

  return {
    title: titles[locale as Locale],
    description: descriptions[locale as Locale],
  }
}

// ============================================
// STATIC PARAMS
// ============================================

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }))
}

// ============================================
// FETCH DATA
// ============================================

async function fetchCategories(): Promise<Category[]> {
  // Return empty array if Supabase is not configured
  if (!isSupabaseConfigured()) {
    console.warn('Supabase not configured, returning empty categories')
    return []
  }

  try {
    const supabase = createServerClient()

    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true })

    if (error) {
      console.error('Error fetching categories:', error)
      return []
    }

    return (data || []).map((item: {
      id: string
      sanity_id: string | null
      slug: string
      name_lv: string
      name_en: string
      name_ru: string
      description_lv: string | null
      description_en: string | null
      description_ru: string | null
      parent_id: string | null
      sort_order: number
      is_active: boolean
      image_url: string | null
      created_at: string
      updated_at: string
    }) => ({
      id: item.id,
      sanityId: item.sanity_id || undefined,
      slug: item.slug,
      name: {
        lv: item.name_lv,
        en: item.name_en,
        ru: item.name_ru,
      },
      description: item.description_en
        ? {
            lv: item.description_lv || '',
            en: item.description_en,
            ru: item.description_ru || '',
          }
        : undefined,
      parentId: item.parent_id,
      sortOrder: item.sort_order,
      isActive: item.is_active,
      showInNavigation: true,
      imageUrl: item.image_url || undefined,
      createdAt: item.created_at,
      updatedAt: item.updated_at,
    }))
  } catch (error) {
    console.error('Exception fetching categories:', error)
    return []
  }
}

interface PriceData {
  price: number
}

interface ProductFilterData {
  material?: string | null
  finish?: string | null
}

async function fetchFilterOptions() {
  // Return default values if Supabase is not configured
  if (!isSupabaseConfigured()) {
    console.warn('Supabase not configured, returning default filter options')
    return {
      priceRange: { min: 0, max: 10000 },
      materials: [],
      finishes: [],
    }
  }

  try {
    const supabase = createServerClient()

    // Get price range
    const { data: priceData, error: priceError } = await supabase
      .from('products')
      .select('price')
      .eq('status', 'active')
      .order('price', { ascending: true })
      .limit(1)
      .single() as { data: PriceData | null; error: { code?: string; message: string } | null }

    if (priceError && priceError.code !== 'PGRST116') {
      console.error('Error fetching min price:', priceError)
    }

    const { data: maxPriceData, error: maxPriceError } = await supabase
      .from('products')
      .select('price')
      .eq('status', 'active')
      .order('price', { ascending: false })
      .limit(1)
      .single() as { data: PriceData | null; error: { code?: string; message: string } | null }

    if (maxPriceError && maxPriceError.code !== 'PGRST116') {
      console.error('Error fetching max price:', maxPriceError)
    }

    // Get unique materials and finishes
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('material, finish')
      .eq('status', 'active')

    if (productsError) {
      console.error('Error fetching products for filters:', productsError)
    }

    const materials = [
      ...new Set((products || []).map((p: ProductFilterData) => p.material).filter((m): m is string => Boolean(m))),
    ]
    const finishes = [
      ...new Set((products || []).map((p: ProductFilterData) => p.finish).filter((f): f is string => Boolean(f))),
    ]

    return {
      priceRange: {
        min: Math.floor(priceData?.price || 0),
        max: Math.ceil(maxPriceData?.price || 10000),
      },
      materials,
      finishes,
    }
  } catch (error) {
    console.error('Exception fetching filter options:', error)
    return {
      priceRange: { min: 0, max: 10000 },
      materials: [],
      finishes: [],
    }
  }
}

interface FeaturedProductData {
  id: string
  slug: string
  name_lv: string
  name_en: string
  name_ru: string
  short_description_lv?: string
  short_description_en?: string
  short_description_ru?: string
  price: number
  sale_price?: number
  featured_image?: string
  category?: {
    slug: string
    name_lv: string
    name_en: string
    name_ru: string
  }
}

async function fetchFeaturedProduct() {
  // Return null if Supabase is not configured
  if (!isSupabaseConfigured()) {
    console.warn('Supabase not configured, no featured product')
    return null
  }

  try {
    const supabase = createServerClient()

    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        category:categories(*)
      `)
      .eq('status', 'active')
      .eq('is_featured', true)
      .order('created_at', { ascending: false })
      .limit(1)
      .single() as { data: FeaturedProductData | null; error: { code?: string; message: string } | null }

    if (error) {
      if (error.code === 'PGRST116') {
        // No featured product found
        return null
      }
      console.error('Error fetching featured product:', error)
      return null
    }

    if (!data) return null

    return {
      id: data.id,
      slug: data.slug,
      name: {
        lv: data.name_lv,
        en: data.name_en,
        ru: data.name_ru,
      },
      shortDescription: data.short_description_en
        ? {
            lv: data.short_description_lv || '',
            en: data.short_description_en,
            ru: data.short_description_ru || '',
          }
        : undefined,
      basePrice: data.price,
      salePrice: data.sale_price,
      featuredImage: data.featured_image,
      category: data.category
        ? {
            slug: data.category.slug,
            name: {
              lv: data.category.name_lv,
              en: data.category.name_en,
              ru: data.category.name_ru,
            },
          }
        : undefined,
    }
  } catch (error) {
    console.error('Exception fetching featured product:', error)
    return null
  }
}

// ============================================
// PAGE COMPONENT
// ============================================

interface StorePageProps {
  params: Promise<{ locale: string }>
}

export default async function StorePage({ params }: StorePageProps) {
  const { locale } = await params

  // Validate locale
  if (!locales.includes(locale as Locale)) {
    notFound()
  }

  const validLocale = locale as Locale

  // Fetch data with error handling
  let categories: Category[] = []
  let filterOptions = { priceRange: { min: 0, max: 10000 }, materials: [] as string[], finishes: [] as string[] }
  let featuredProduct = null

  try {
    categories = await fetchCategories()
  } catch (error) {
    console.error('Error in fetchCategories:', error)
  }

  try {
    filterOptions = await fetchFilterOptions()
  } catch (error) {
    console.error('Error in fetchFilterOptions:', error)
  }

  try {
    featuredProduct = await fetchFeaturedProduct()
  } catch (error) {
    console.error('Error in fetchFeaturedProduct:', error)
  }

  return (
    <StoreContent
      locale={validLocale}
      categories={categories}
      filterOptions={filterOptions}
      featuredProduct={featuredProduct}
    />
  )
}
