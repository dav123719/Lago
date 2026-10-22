// ============================================
// Product Grid Component with Infinite Scroll
// ============================================

'use client'

import { useEffect, useRef, useCallback, useState, useMemo } from 'react'
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
  const [error, setError] = useState<string | null>(null)
  const [total, setTotal] = useState(0)
  const observerRef = useRef<IntersectionObserver | null>(null)
  const loadMoreRef = useRef<HTMLDivElement>(null)
  const requestRef = useRef<AbortController | null>(null)
  const requestGeneration = useRef(0)
  const loadedPage = useRef(0)
  const requestPending = useRef(false)

  // A stable query key avoids fetching again when an equivalent filter object
  // is restored from the URL or updated by a control.
  const queryString = useMemo(() => {
    const params = new URLSearchParams({ limit: '12', sort })
    if (filters.search) params.set('search', filters.search)
    if (filters.material) params.set('material', filters.material)
    if (filters.finish) params.set('finish', filters.finish)
    if (filters.minPrice !== undefined) params.set('minPrice', String(filters.minPrice))
    if (filters.maxPrice !== undefined) params.set('maxPrice', String(filters.maxPrice))
    if (filters.inStock) params.set('inStock', 'true')
    if (categorySlug) params.set('category', categorySlug)
    return params.toString()
  }, [sort, filters.search, filters.material, filters.finish, filters.minPrice, filters.maxPrice, filters.inStock, categorySlug])

  // Fetch products
  const fetchProducts = useCallback(
    async (pageNum: number, isInitial: boolean = false) => {
      if (!isInitial && requestPending.current) return
      requestRef.current?.abort()
      const controller = new AbortController()
      requestRef.current = controller
      const generation = ++requestGeneration.current
      requestPending.current = true
      if (isInitial) {
        setIsLoading(true)
      } else {
        setIsLoadingMore(true)
      }
      setError(null)

      try {
        const response = await fetch(`/api/products?${queryString}&page=${pageNum}`, { signal: controller.signal })

        if (!response.ok) {
          throw new Error('Failed to fetch products')
        }

        const data: ProductResponse = await response.json()
        // Also guard when a mocked/proxied transport completes after abort.
        if (controller.signal.aborted || generation !== requestGeneration.current) return

        if (isInitial) {
          setProducts(data.products)
        } else {
          setProducts((prev) => {
            const existing = new Set(prev.map(product => product.id))
            return [...prev, ...data.products.filter(product => !existing.has(product.id))]
          })
        }

        loadedPage.current = pageNum
        setHasMore(data.hasMore)
        setTotal(data.total)
      } catch (err) {
        if (controller.signal.aborted || generation !== requestGeneration.current) return
        setError(err instanceof Error ? err.message : 'Failed to load products')
      } finally {
        if (!controller.signal.aborted && generation === requestGeneration.current) {
          requestPending.current = false
          setIsLoading(false)
          setIsLoadingMore(false)
        }
      }
    },
    [queryString]
  )

  // Initial fetch
  useEffect(() => {
    loadedPage.current = 0
    void fetchProducts(1, true)
    return () => {
      requestRef.current?.abort()
      requestPending.current = false
    }
  }, [fetchProducts])

  // Infinite scroll observer
  useEffect(() => {
    if (observerRef.current) {
      observerRef.current.disconnect()
    }

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !error && !requestPending.current && !isLoading) {
          void fetchProducts(loadedPage.current + 1, false)
        }
      },
      { threshold: 0.1, rootMargin: '100px' }
    )

    if (loadMoreRef.current) {
      observerRef.current.observe(loadMoreRef.current)
    }

    return () => observerRef.current?.disconnect()
  }, [hasMore, isLoadingMore, isLoading, error, fetchProducts])

  // Loading skeletons
  if (isLoading && products.length === 0) {
    return (
      <div aria-busy="true" aria-label={locale === 'lv' ? 'Ielādē produktus' : locale === 'ru' ? 'Загрузка продуктов' : 'Loading products'} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    )
  }

  // Error state
  if (error && products.length === 0) {
    return (
      <div className="text-center py-16">
        <p role="alert" className="text-red-400 mb-4">
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
    <div className="space-y-6" aria-busy={isLoading || isLoadingMore}>
      {isLoading && (
        <p role="status" className="text-sm text-lago-gold">
          {locale === 'lv' ? 'Atjaunina produktus…' : locale === 'ru' ? 'Обновление продуктов…' : 'Updating products…'}
        </p>
      )}
      {error && (
        <div role="alert" className="text-sm text-red-400">
          <p>{locale === 'lv' ? 'Neizdevās atjaunināt produktus.' : locale === 'ru' ? 'Не удалось обновить продукты.' : 'Could not update products.'}</p>
          <button
            onClick={() => void fetchProducts(loadedPage.current + 1, loadedPage.current === 0)}
            className="mt-2 px-4 py-2 bg-lago-gold text-lago-black rounded-lg"
          >
            {locale === 'lv' ? 'Mēģināt vēlreiz' : locale === 'ru' ? 'Попробовать снова' : 'Try Again'}
          </button>
        </div>
      )}
      {/* Results count */}
      <p className="text-sm text-lago-muted" aria-live="polite" aria-atomic="true">
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
        {isLoadingMore ? (
          <div role="status" className="flex items-center gap-3">
            <div className="w-6 h-6 border-2 border-lago-gold border-t-transparent rounded-full animate-spin" />
            <span className="text-lago-muted">
              {locale === 'lv'
                ? 'Ielādē vēl...'
                : locale === 'ru'
                ? 'Загрузка...'
                : 'Loading more...'}
            </span>
          </div>
        ) : hasMore && !error && (
          <button
            onClick={() => void fetchProducts(loadedPage.current + 1, false)}
            disabled={isLoading}
            className="px-4 py-2 rounded-lg border border-lago-gold text-lago-gold disabled:opacity-50"
          >
            {locale === 'lv' ? 'Ielādēt vēl' : locale === 'ru' ? 'Загрузить ещё' : 'Load more'}
          </button>
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
