// ============================================
// Product Filters Component
// ============================================

'use client'

import { useState, useEffect, useRef, useId } from 'react'
import { Search, SlidersHorizontal, X, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Locale } from '@/lib/i18n/config'
import type { ProductFilters as ProductFiltersType, MaterialType, FinishType } from '@/types/store'

interface ProductFiltersProps {
  locale: Locale
  filters: ProductFiltersType
  onFiltersChange: (filters: ProductFiltersType) => void
  availableMaterials: MaterialType[]
  availableFinishes: FinishType[]
  priceRange: { min: number; max: number }
}

export function ProductFilters({
  locale,
  filters,
  onFiltersChange,
  availableMaterials,
  availableFinishes,
  priceRange,
}: ProductFiltersProps) {
  const [isOpen, setIsOpen] = useState(false)
  const minPrice = filters.minPrice ?? priceRange.min
  const maxPrice = filters.maxPrice ?? priceRange.max
  const priceKey = `${minPrice}:${maxPrice}`
  const [priceDraft, setPriceDraft] = useState<{ source: string; value: [number, number] }>({
    source: priceKey, value: [minPrice, maxPrice],
  })
  const localPriceRange: [number, number] = priceDraft.source === priceKey ? priceDraft.value : [minPrice, maxPrice]
  const setLocalPriceRange = (value: [number, number]) => setPriceDraft({ source: priceKey, value })
  const [searchDraft, setSearchDraft] = useState({ source: filters.search || '', value: filters.search || '' })
  const searchQuery = searchDraft.source === (filters.search || '') ? searchDraft.value : filters.search || ''
  const setSearchQuery = (value: string) => setSearchDraft({ source: filters.search || '', value })
  // Reset drafts during render when their external source changes, avoiding
  // an effect-driven extra paint and stale drafts on A -> B -> A navigation.
  if (searchDraft.source !== (filters.search || '')) {
    setSearchDraft({ source: filters.search || '', value: filters.search || '' })
  }
  if (priceDraft.source !== priceKey) {
    setPriceDraft({ source: priceKey, value: [minPrice, maxPrice] })
  }
  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)
  const latestFilters = useRef(filters)
  const latestOnChange = useRef(onFiltersChange)
  const filtersId = useId()

  useEffect(() => {
    latestFilters.current = filters
    latestOnChange.current = onFiltersChange
  }, [filters, onFiltersChange])

  // Browser history and deep links must update the visible controls too.
  useEffect(() => {
    if (searchTimeout.current) clearTimeout(searchTimeout.current)
  }, [filters.search])

  useEffect(() => () => {
    if (searchTimeout.current) clearTimeout(searchTimeout.current)
  }, [])

  // Translations
  const t = {
    filters: locale === 'lv' ? 'Filtri' : locale === 'ru' ? 'Фильтры' : 'Filters',
    search: locale === 'lv' ? 'Meklēt...' : locale === 'ru' ? 'Поиск...' : 'Search...',
    material: locale === 'lv' ? 'Materiāls' : locale === 'ru' ? 'Материал' : 'Material',
    finish: locale === 'lv' ? 'Apdare' : locale === 'ru' ? 'Отделка' : 'Finish',
    price: locale === 'lv' ? 'Cena' : locale === 'ru' ? 'Цена' : 'Price',
    inStock: locale === 'lv' ? 'Tikai noliktavā' : locale === 'ru' ? 'Только в наличии' : 'In Stock Only',
    clear: locale === 'lv' ? 'Notīrīt' : locale === 'ru' ? 'Очистить' : 'Clear',
    clearSearch: locale === 'lv' ? 'Notīrīt meklēšanu' : locale === 'ru' ? 'Очистить поиск' : 'Clear search',
    apply: locale === 'lv' ? 'Lietot' : locale === 'ru' ? 'Применить' : 'Apply',
    minPrice: locale === 'lv' ? 'Minimālā cena' : locale === 'ru' ? 'Минимальная цена' : 'Minimum price',
    maxPrice: locale === 'lv' ? 'Maksimālā cena' : locale === 'ru' ? 'Максимальная цена' : 'Maximum price',
  }

  // Material display names
  const materialNames: Record<MaterialType, string> = {
    silestone: 'Silestone',
    dekton: 'Dekton',
    granite: locale === 'lv' ? 'Granīts' : locale === 'ru' ? 'Гранит' : 'Granite',
    marble: locale === 'lv' ? 'Marmors' : locale === 'ru' ? 'Мрамор' : 'Marble',
    other: locale === 'lv' ? 'Cits' : locale === 'ru' ? 'Другое' : 'Other',
  }

  // Finish display names
  const finishNames: Record<FinishType, string> = {
    polished: locale === 'lv' ? 'Pulēts' : locale === 'ru' ? 'Полированный' : 'Polished',
    matte: locale === 'lv' ? 'Matēts' : locale === 'ru' ? 'Матовый' : 'Matte',
    honed: locale === 'lv' ? 'Slīpēts' : locale === 'ru' ? 'Точеный' : 'Honed',
    leather: locale === 'lv' ? 'Ādas' : locale === 'ru' ? 'Кожаный' : 'Leather',
  }

  // Only user input starts a search. Read the latest filters when the debounce
  // completes so a checkbox changed while typing cannot be overwritten.
  const handleSearchChange = (value: string) => {
    setSearchQuery(value)
    if (searchTimeout.current) clearTimeout(searchTimeout.current)
    searchTimeout.current = setTimeout(() => {
      latestOnChange.current({ ...latestFilters.current, search: value.trim() || undefined })
    }, 300)
  }

  // Apply price filter
  const handlePriceChange = () => {
    onFiltersChange({
      ...filters,
      minPrice: localPriceRange[0],
      maxPrice: localPriceRange[1],
    })
  }

  // Toggle material filter
  const toggleMaterial = (material: MaterialType) => {
    const currentMaterials = filters.material
      ? filters.material.split(',') as MaterialType[]
      : []
    
    const newMaterials = currentMaterials.includes(material)
      ? currentMaterials.filter((m) => m !== material)
      : [...currentMaterials, material]

    onFiltersChange({
      ...filters,
      material: newMaterials.length > 0 ? (newMaterials.join(',') as MaterialType) : undefined,
    })
  }

  // Toggle finish filter
  const toggleFinish = (finish: FinishType) => {
    const currentFinishes = filters.finish
      ? filters.finish.split(',') as FinishType[]
      : []
    
    const newFinishes = currentFinishes.includes(finish)
      ? currentFinishes.filter((f) => f !== finish)
      : [...currentFinishes, finish]

    onFiltersChange({
      ...filters,
      finish: newFinishes.length > 0 ? (newFinishes.join(',') as FinishType) : undefined,
    })
  }

  // Clear all filters
  const clearFilters = () => {
    if (searchTimeout.current) clearTimeout(searchTimeout.current)
    setSearchQuery('')
    setLocalPriceRange([priceRange.min, priceRange.max])
    onFiltersChange({})
  }

  const hasActiveFilters =
    filters.material ||
    filters.finish ||
    filters.minPrice !== undefined ||
    filters.maxPrice !== undefined ||
    filters.inStock ||
    filters.search

  const currentMaterials = filters.material
    ? filters.material.split(',') as MaterialType[]
    : []
  const currentFinishes = filters.finish
    ? filters.finish.split(',') as FinishType[]
    : []

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-lago-muted" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => handleSearchChange(e.target.value)}
          placeholder={t.search}
          aria-label={t.search}
          className="w-full pl-10 pr-4 py-3 bg-lago-charcoal border border-lago-gray rounded-lg text-white placeholder-lago-muted focus:outline-none focus:border-lago-gold transition-colors"
        />
        {searchQuery && (
          <button
            onClick={() => handleSearchChange('')}
            aria-label={t.clearSearch}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-lago-muted hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Mobile Filter Toggle */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-controls={filtersId}
        className="lg:hidden flex items-center gap-2 w-full px-4 py-3 bg-lago-charcoal border border-lago-gray rounded-lg text-white hover:border-lago-gold transition-colors"
      >
        <SlidersHorizontal className="w-5 h-5" />
        <span>{t.filters}</span>
        {hasActiveFilters && (
          <span className="ml-auto w-2 h-2 bg-lago-gold rounded-full" />
        )}
        <ChevronDown
          className={cn(
            'w-5 h-5 ml-auto transition-transform',
            isOpen ? 'rotate-180' : ''
          )}
        />
      </button>

      {/* Filters Content */}
      <div
        id={filtersId}
        className={cn(
          'space-y-6 bg-lago-charcoal rounded-lg p-4',
          !isOpen && 'hidden lg:block'
        )}
      >
        {/* Material Filter */}
        {availableMaterials.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-lago-light mb-3">{t.material}</h4>
            <div className="space-y-2">
              {availableMaterials.map((material) => (
                <label
                  key={material}
                  className="flex items-center gap-3 cursor-pointer group"
                >
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={currentMaterials.includes(material)}
                      onChange={() => toggleMaterial(material)}
                      className="peer sr-only"
                    />
                    <div className="w-5 h-5 border-2 border-lago-stone rounded peer-checked:bg-lago-gold peer-checked:border-lago-gold peer-focus-visible:ring-2 peer-focus-visible:ring-lago-gold peer-focus-visible:ring-offset-2 transition-colors" />
                    <svg
                      className="absolute inset-0 w-5 h-5 text-lago-black opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <span className="text-sm text-lago-light group-hover:text-white transition-colors">
                    {materialNames[material]}
                  </span>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Finish Filter */}
        {availableFinishes.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-lago-light mb-3">{t.finish}</h4>
            <div className="space-y-2">
              {availableFinishes.map((finish) => (
                <label
                  key={finish}
                  className="flex items-center gap-3 cursor-pointer group"
                >
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={currentFinishes.includes(finish)}
                      onChange={() => toggleFinish(finish)}
                      className="peer sr-only"
                    />
                    <div className="w-5 h-5 border-2 border-lago-stone rounded peer-checked:bg-lago-gold peer-checked:border-lago-gold peer-focus-visible:ring-2 peer-focus-visible:ring-lago-gold peer-focus-visible:ring-offset-2 transition-colors" />
                    <svg
                      className="absolute inset-0 w-5 h-5 text-lago-black opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <span className="text-sm text-lago-light group-hover:text-white transition-colors">
                    {finishNames[finish]}
                  </span>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Price Range */}
        <div>
          <h4 className="text-sm font-medium text-lago-light mb-3">{t.price}</h4>
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <input
                type="number"
                aria-label={t.minPrice}
                min={priceRange.min}
                max={priceRange.max}
                value={localPriceRange[0]}
                onChange={(e) =>
                  setLocalPriceRange([Number(e.target.value), localPriceRange[1]])
                }
                onBlur={handlePriceChange}
                className="w-24 px-3 py-2 bg-lago-dark border border-lago-gray rounded text-sm text-white focus:outline-none focus:border-lago-gold"
                placeholder="Min"
              />
              <span className="text-lago-muted">-</span>
              <input
                type="number"
                aria-label={t.maxPrice}
                min={priceRange.min}
                max={priceRange.max}
                value={localPriceRange[1]}
                onChange={(e) =>
                  setLocalPriceRange([localPriceRange[0], Number(e.target.value)])
                }
                onBlur={handlePriceChange}
                className="w-24 px-3 py-2 bg-lago-dark border border-lago-gray rounded text-sm text-white focus:outline-none focus:border-lago-gold"
                placeholder="Max"
              />
              <span className="text-lago-muted text-sm">€</span>
            </div>
            <input
              type="range"
              aria-label={t.maxPrice}
              min={priceRange.min}
              max={priceRange.max}
              value={localPriceRange[1]}
              onChange={(e) =>
                setLocalPriceRange([localPriceRange[0], Number(e.target.value)])
              }
              onMouseUp={handlePriceChange}
              onTouchEnd={handlePriceChange}
              onKeyUp={handlePriceChange}
              className="w-full accent-lago-gold"
            />
          </div>
        </div>

        {/* In Stock Toggle */}
        <label className="flex items-center gap-3 cursor-pointer group">
          <div className="relative">
            <input
              type="checkbox"
              checked={filters.inStock || false}
              onChange={(e) =>
                onFiltersChange({ ...filters, inStock: e.target.checked || undefined })
              }
              className="peer sr-only"
            />
            <div className="w-11 h-6 bg-lago-gray rounded-full peer-checked:bg-lago-gold peer-focus-visible:ring-2 peer-focus-visible:ring-lago-gold peer-focus-visible:ring-offset-2 transition-colors" />
            <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-5" />
          </div>
          <span className="text-sm text-lago-light group-hover:text-white transition-colors">
            {t.inStock}
          </span>
        </label>

        {/* Clear Filters */}
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="flex items-center gap-2 text-sm text-lago-muted hover:text-lago-gold transition-colors"
          >
            <X className="w-4 h-4" />
            {t.clear}
          </button>
        )}
      </div>
    </div>
  )
}
