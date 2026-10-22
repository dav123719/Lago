// AGENT slave-8 v1.0.1 - Final optimization complete
// ============================================
// Store Content (Client Component)
// ============================================

'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import { useSearchParams } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, Sparkles } from 'lucide-react'
import { ProductFilters, ProductSort, ProductGrid } from '@/components/store'
import type { Locale } from '@/lib/i18n/config'
import type { Category, ProductFilters as ProductFiltersType, SortOption, MaterialType, FinishType } from '@/types/store'

interface StoreContentProps {
  locale: Locale
  categories: Category[]
  filterOptions: {
    priceRange: { min: number; max: number }
    materials: string[]
    finishes: string[]
  }
  featuredProduct: {
    id: string
    slug: string
    name: { lv: string; en: string; ru: string }
    shortDescription?: { lv: string; en: string; ru: string }
    basePrice: number
    salePrice?: number
    featuredImage?: string
    category?: { slug: string; name: { lv: string; en: string; ru: string } }
  } | null
  initialFilters?: ProductFiltersType
}

const filterKeys = ['category', 'material', 'finish', 'minPrice', 'maxPrice', 'inStock', 'search'] as const
const sortOptions: SortOption[] = ['featured', 'newest', 'price_asc', 'price_desc', 'name_asc', 'name_desc']

function parsePrice(value: string | null): number | undefined {
  if (value === null || value === '') return undefined
  const price = Number(value)
  return Number.isFinite(price) && price >= 0 ? price : undefined
}

function parseFilters(params: URLSearchParams): ProductFiltersType {
  return {
    category: params.get('category') || undefined,
    material: (params.get('material') as MaterialType) || undefined,
    finish: (params.get('finish') as FinishType) || undefined,
    minPrice: parsePrice(params.get('minPrice')),
    maxPrice: parsePrice(params.get('maxPrice')),
    inStock: params.get('inStock') === 'true' || undefined,
    search: params.get('search') || undefined,
  }
}

function parseSort(params: URLSearchParams): SortOption {
  const value = params.get('sort') as SortOption
  return sortOptions.includes(value) ? value : 'featured'
}

export function StoreContent({
  locale,
  categories,
  filterOptions,
  featuredProduct,
  initialFilters,
}: StoreContentProps) {
  const searchParams = useSearchParams()
  const queryString = searchParams?.toString() || ''
  const lastQuery = useRef(queryString)
  const [filters, setFilters] = useState<ProductFiltersType>(() =>
    queryString ? parseFilters(new URLSearchParams(queryString)) : initialFilters || {}
  )
  const [sort, setSort] = useState<SortOption>(() => parseSort(new URLSearchParams(queryString)))

  // Native history updates are supported by Next's useSearchParams and avoid
  // requesting the server-rendered store shell again for client-side filters.
  const updateURL = useCallback((newFilters: ProductFiltersType, newSort: SortOption) => {
    const params = new URLSearchParams(window.location.search)
    for (const key of filterKeys) {
      const value = newFilters[key]
      if (value === undefined || value === false || value === '') params.delete(key)
      else params.set(key, String(value))
    }
    if (newSort === 'featured') params.delete('sort')
    else params.set('sort', newSort)
    const query = params.toString()
    const destination = `${window.location.pathname}${query ? `?${query}` : ''}${window.location.hash}`
    if (destination !== `${window.location.pathname}${window.location.search}${window.location.hash}`) {
      window.history.pushState(null, '', destination)
    }
  }, [])

  // Restore both filters and sorting after back/forward navigation.
  useEffect(() => {
    if (lastQuery.current === queryString) return
    lastQuery.current = queryString
    const params = new URLSearchParams(queryString)
    setFilters(parseFilters(params))
    setSort(parseSort(params))
  }, [queryString])

  const handleFiltersChange = useCallback((newFilters: ProductFiltersType) => {
    setFilters(newFilters)
    updateURL(newFilters, sort)
  }, [sort, updateURL])

  const handleSortChange = useCallback((newSort: SortOption) => {
    setSort(newSort)
    updateURL(filters, newSort)
  }, [filters, updateURL])

  // Translations
  const t = {
    title: locale === 'lv' ? 'Veikals' : locale === 'ru' ? 'Магазин' : 'Store',
    subtitle:
      locale === 'lv'
        ? 'Luksusa mēbeles un akmens virsmas'
        : locale === 'ru'
        ? 'Мебель и каменные поверхности премиум-класса'
        : 'Luxury Furniture & Stone Surfaces',
    featured:
      locale === 'lv' ? 'Mēneša piedāvājums' : locale === 'ru' ? 'Предложение месяца' : 'Featured',
    viewProduct:
      locale === 'lv' ? 'Skatīt produktu' : locale === 'ru' ? 'Смотреть продукт' : 'View Product',
    allProducts:
      locale === 'lv' ? 'Visi produkti' : locale === 'ru' ? 'Все продукты' : 'All Products',
  }

  // Format price
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat(
      locale === 'en' ? 'en-US' : locale === 'ru' ? 'ru-RU' : 'lv-LV',
      {
        style: 'currency',
        currency: 'EUR',
      }
    ).format(price)
  }
  const ListingHeading = featuredProduct ? 'h2' : 'h1'

  return (
    <div className="min-h-screen bg-lago-black">
      {/* Hero Section with Featured Product */}
      {featuredProduct && (
        <section className="relative min-h-[70vh] flex items-center">
          {/* Background Image */}
          <div className="absolute inset-0">
            {featuredProduct.featuredImage ? (
              <Image
                src={featuredProduct.featuredImage}
                alt={featuredProduct.name[locale]}
                fill
                className="object-cover"
                priority
              />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-lago-charcoal to-lago-gray" />
            )}
            <div className="absolute inset-0 bg-gradient-to-r from-lago-black via-lago-black/80 to-transparent" />
          </div>

          {/* Content */}
          <div className="relative container-lg py-24">
            <div className="max-w-xl">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-5 h-5 text-lago-gold" />
                <span className="text-lago-gold text-sm font-medium uppercase tracking-wider">
                  {t.featured}
                </span>
              </div>

              {featuredProduct.category && (
                <p className="text-lago-muted mb-2">
                  {featuredProduct.category.name[locale]}
                </p>
              )}

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-heading text-white mb-4">
                {featuredProduct.name[locale]}
              </h1>

              {featuredProduct.shortDescription && (
                <p className="text-lg text-lago-light mb-6">
                  {featuredProduct.shortDescription[locale]}
                </p>
              )}

              <div className="flex items-baseline gap-3 mb-8">
                <span className="text-3xl font-bold text-white">
                  {formatPrice(featuredProduct.salePrice || featuredProduct.basePrice)}
                </span>
                {featuredProduct.salePrice && (
                  <span className="text-xl text-lago-muted line-through">
                    {formatPrice(featuredProduct.basePrice)}
                  </span>
                )}
              </div>

              <Link
                href={`/${locale}/store/product/${featuredProduct.slug}`}
                className="inline-flex items-center gap-2 px-8 py-4 bg-lago-gold text-lago-black font-medium rounded-lg hover:bg-lago-gold-light transition-colors"
              >
                {t.viewProduct}
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Store Section */}
      <section className="py-16 md:py-24">
        <div className="container-lg">
          {/* Section Header */}
          <div className="text-center mb-12">
            <ListingHeading className="text-3xl md:text-4xl font-heading text-white mb-4">
              {t.allProducts}
            </ListingHeading>
            <p className="text-lago-muted max-w-2xl mx-auto">
              {locale === 'lv'
                ? 'Izpētiet mūsu kvalitatīvo akmens virsmu un luksusa mēbeļu klāstu. Katrs produkts ir rūpīgi atlasīts, lai nodrošinātu izcilu kvalitāti un dizainu.'
                : locale === 'ru'
                ? 'Исследуйте наш ассортимент каменных поверхностей и мебели премиум-класса. Каждый продукт тщательно отобран для обеспечения превосходного качества и дизайна.'
                : 'Explore our range of quality stone surfaces and luxury furniture. Each product is carefully selected to ensure exceptional quality and design.'}
            </p>
          </div>

          {/* Filters and Sort */}
          <div className="flex flex-col lg:flex-row gap-8 mb-12">
            {/* Sidebar Filters */}
            <aside className="lg:w-64 flex-shrink-0">
              <ProductFilters
                locale={locale}
                filters={filters}
                onFiltersChange={handleFiltersChange}
                availableMaterials={filterOptions.materials as ('silestone' | 'dekton' | 'granite' | 'marble' | 'other')[]}
                availableFinishes={filterOptions.finishes as ('polished' | 'matte' | 'honed' | 'leather')[]}
                priceRange={filterOptions.priceRange}
              />
            </aside>

            {/* Main Content */}
            <div className="flex-1">
              {/* Sort and Results Count */}
              <div className="flex items-center justify-between mb-6">
                <ProductSort locale={locale} value={sort} onChange={handleSortChange} />
              </div>

              {/* Product Grid */}
              <ProductGrid
                locale={locale}
                filters={filters}
                sort={sort}
                categorySlug={filters.category}
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
