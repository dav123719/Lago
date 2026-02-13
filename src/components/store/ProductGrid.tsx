// ============================================
// Product Grid Component with Infinite Scroll
// ============================================

'use client'

import { useEffect, useRef, useCallback, useState } from 'react'
import { ProductCard, ProductCardSkeleton } from './ProductCard'
import { cn } from '@/lib/utils'
import type { Locale } from '@/lib/i18n/config'
import type { Product, ProductFilters, SortOption } from '@/types/store'

interface ProductGridProps {
  locale: Locale
  filters: ProductFilters
  sort: SortOption
  categorySlug?: string
}

interface ProductResponse {
  products: Product[]
  total: number
  hasMore: boolean
}

export function ProductGrid({ locale, filters, sort, categorySlug }: ProductGridProps) {
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [page, setPage] = useState(1)
  const [error, setError] = useState<string | null>(null)
  const [total, setTotal] = useState(0)
  const observerRef = useRef<IntersectionObserver | null>(null)
  const loadMoreRef = useRef<HTMLDivElement>(null)

  // Fetch products
  const fetchProducts = useCallback(
    async (pageNum: number, isInitial: boolean = false) => {
      if (isInitial) {
        setIsLoading(true)
      } else {
        setIsLoadingMore(true)
      }
      setError(null)

      try {
        const params = new URLSearchParams({
          page: pageNum.toString(),
          limit: '12',
          sort,
          ...(filters.search && { search: filters.search }),
          ...(filters.material && { material: filters.material }),
          ...(filters.finish && { finish: filters.finish }),
          ...(filters.minPrice !== undefined && { minPrice: filters.minPrice.toString() }),
          ...(filters.maxPrice !== undefined && { maxPrice: filters.maxPrice.toString() }),
          ...(filters.inStock && { inStock: 'true' }),
          ...(categorySlug && { category: categorySlug }),
        })

        const response = await fetch(`/api/products?${params}`)

        if (!response.ok) {
          throw new Error('Failed to fetch products')
        }

        const data: ProductResponse = await response.json()

        if (isInitial) {
          setProducts(data.products)
        } else {
          setProducts((prev) => [...prev, ...data.products])
        }

        setHasMore(data.hasMore)
        setTotal(data.total)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load products')
      } finally {
        setIsLoading(false)
        setIsLoadingMore(false)
      }
    },
    [filters, sort, categorySlug]
  )

  // Initial fetch
  useEffect(() => {
    setPage(1)
    fetchProducts(1, true)
  }, [fetchProducts])

  // Infinite scroll observer
  useEffect(() => {
    if (observerRef.current) {
      observerRef.current.disconnect()
    }

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoadingMore && !isLoading) {
          setPage((prev) => {
            const nextPage = prev + 1
            fetchProducts(nextPage, false)
            return nextPage
          })
        }
      },
      { threshold: 0.1, rootMargin: '100px' }
    )

    if (loadMoreRef.current) {
      observerRef.current.observe(loadMoreRef.current)
    }

    return () => observerRef.current?.disconnect()
  }, [hasMore, isLoadingMore, isLoading, fetchProducts])

  // Loading skeletons
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="text-center py-16">
        <p className="text-red-400 mb-4">
          {locale === 'lv'
            ? 'Kļūda ielādējot produktus'
            : locale === 'ru'
            ? 'Ошибка загрузки продуктов'
            : 'Error loading products'}
        </p>
        <button
          onClick={() => fetchProducts(1, true)}
          className="px-4 py-2 bg-lago-gold text-lago-black rounded-lg hover:bg-lago-gold-light transition-colors"
        >
          {locale === 'lv' ? 'Mēģināt vēlreiz' : locale === 'ru' ? 'Попробовать снова' : 'Try Again'}
        </button>
      </div>
    )
  }

  // Empty state
  if (products.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="w-24 h-24 mx-auto mb-6 bg-lago-charcoal rounded-full flex items-center justify-center">
          <svg
            className="w-12 h-12 text-lago-muted"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
            />
          </svg>
        </div>
        <h3 className="text-xl font-heading text-white mb-2">
          {locale === 'lv'
            ? 'Nav atrasts neviens produkts'
            : locale === 'ru'
            ? 'Продукты не найдены'
            : 'No Products Found'}
        </h3>
        <p className="text-lago-muted">
          {locale === 'lv'
            ? 'Mēģiniet mainīt filtrus vai meklēšanu'
            : locale === 'ru'
            ? 'Попробуйте изменить фильтры или поиск'
            : 'Try adjusting your filters or search'}
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Results count */}
      <p className="text-sm text-lago-muted">
        {locale === 'lv'
          ? `Rāda ${products.length} no ${total} produktiem`
          : locale === 'ru'
          ? `Показано ${products.length} из ${total} продуктов`
          : `Showing ${products.length} of ${total} products`}
      </p>

      {/* Product grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {products.map((product, index) => (
          <ProductCard
            key={product.id}
            product={product}
            locale={locale}
            priority={index < 4}
          />
        ))}
      </div>

      {/* Load more trigger */}
      <div
        ref={loadMoreRef}
        className={cn(
          'flex justify-center py-8',
          !isLoadingMore && !hasMore && 'hidden'
        )}
      >
        {isLoadingMore && (
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 border-2 border-lago-gold border-t-transparent rounded-full animate-spin" />
            <span className="text-lago-muted">
              {locale === 'lv'
                ? 'Ielādē vēl...'
                : locale === 'ru'
                ? 'Загрузка...'
                : 'Loading more...'}
            </span>
          </div>
        )}
      </div>

      {/* End of results */}
      {!hasMore && products.length > 0 && (
        <p className="text-center text-sm text-lago-muted py-4">
          {locale === 'lv'
            ? 'Vairāk produktu nav'
            : locale === 'ru'
            ? 'Больше продуктов нет'
            : 'No more products'}
        </p>
      )}
    </div>
  )
}
