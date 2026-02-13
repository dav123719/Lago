// ============================================
// Product Filters Component
// ============================================

'use client'

import { useState, useCallback, useEffect } from 'react'
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
  const [localPriceRange, setLocalPriceRange] = useState<[number, number]>([
    filters.minPrice || priceRange.min,
    filters.maxPrice || priceRange.max,
  ])
  const [searchQuery, setSearchQuery] = useState(filters.search || '')

  // Translations
  const t = {
    filters: locale === 'lv' ? 'Filtri' : locale === 'ru' ? 'Фильтры' : 'Filters',
    search: locale === 'lv' ? 'Meklēt...' : locale === 'ru' ? 'Поиск...' : 'Search...',
    material: locale === 'lv' ? 'Materiāls' : locale === 'ru' ? 'Материал' : 'Material',
    finish: locale === 'lv' ? 'Apdare' : locale === 'ru' ? 'Отделка' : 'Finish',
    price: locale === 'lv' ? 'Cena' : locale === 'ru' ? 'Цена' : 'Price',
    inStock: locale === 'lv' ? 'Tikai noliktavā' : locale === 'ru' ? 'Только в наличии' : 'In Stock Only',
    clear: locale === 'lv' ? 'Notīrīt' : locale === 'ru' ? 'Очистить' : 'Clear',
    apply: locale === 'lv' ? 'Lietot' : locale === 'ru' ? 'Применить' : 'Apply',
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

  // Debounced search
  useEffect(() => {
    const timeout = setTimeout(() => {
      onFiltersChange({ ...filters, search: searchQuery || undefined })
    }, 300)

    return () => clearTimeout(timeout)
  }, [searchQuery])

  // Apply price filter
  const handlePriceChange = useCallback(() => {
    onFiltersChange({
      ...filters,
      minPrice: localPriceRange[0],
      maxPrice: localPriceRange[1],
    })
  }, [localPriceRange, filters, onFiltersChange])

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
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={t.search}
          className="w-full pl-10 pr-4 py-3 bg-lago-charcoal border border-lago-gray rounded-lg text-white placeholder-lago-muted focus:outline-none focus:border-lago-gold transition-colors"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-lago-muted hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Mobile Filter Toggle */}
      <button
        onClick={() => setIsOpen(!isOpen)}
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
                    <div className="w-5 h-5 border-2 border-lago-stone rounded peer-checked:bg-lago-gold peer-checked:border-lago-gold transition-colors" />
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
                    <div className="w-5 h-5 border-2 border-lago-stone rounded peer-checked:bg-lago-gold peer-checked:border-lago-gold transition-colors" />
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
              min={priceRange.min}
              max={priceRange.max}
              value={localPriceRange[1]}
              onChange={(e) =>
                setLocalPriceRange([localPriceRange[0], Number(e.target.value)])
              }
              onMouseUp={handlePriceChange}
              onTouchEnd={handlePriceChange}
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
            <div className="w-11 h-6 bg-lago-gray rounded-full peer-checked:bg-lago-gold transition-colors" />
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
