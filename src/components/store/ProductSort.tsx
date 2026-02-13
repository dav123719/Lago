// ============================================
// Product Sort Component
// ============================================

'use client'

import { useState, useRef, useEffect } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Locale } from '@/lib/i18n/config'
import type { SortOption } from '@/types/store'

interface ProductSortProps {
  locale: Locale
  value: SortOption
  onChange: (sort: SortOption) => void
}

const sortOptions: SortOption[] = [
  'featured',
  'newest',
  'price_asc',
  'price_desc',
  'name_asc',
  'name_desc',
]

export function ProductSort({ locale, value, onChange }: ProductSortProps) {
  const [isOpen, setIsOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  // Translations
  const labels: Record<SortOption, string> = {
    featured: locale === 'lv' ? 'Ieteicamie' : locale === 'ru' ? 'Рекомендуемые' : 'Featured',
    newest: locale === 'lv' ? 'Jaunākie' : locale === 'ru' ? 'Новейшие' : 'Newest',
    price_asc: locale === 'lv' ? 'Cena: no zemākās' : locale === 'ru' ? 'Цена: по возрастанию' : 'Price: Low to High',
    price_desc: locale === 'lv' ? 'Cena: no augstākās' : locale === 'ru' ? 'Цена: по убыванию' : 'Price: High to Low',
    name_asc: locale === 'lv' ? 'Nosaukums: A-Z' : locale === 'ru' ? 'Название: А-Я' : 'Name: A-Z',
    name_desc: locale === 'lv' ? 'Nosaukums: Z-A' : locale === 'ru' ? 'Название: Я-А' : 'Name: Z-A',
  }

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2.5 bg-lago-charcoal border border-lago-gray rounded-lg text-white hover:border-lago-gold transition-colors"
      >
        <span className="text-sm">{labels[value]}</span>
        <ChevronDown
          className={cn(
            'w-4 h-4 text-lago-muted transition-transform duration-200',
            isOpen && 'rotate-180'
          )}
        />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-56 bg-lago-charcoal border border-lago-gray rounded-lg shadow-xl shadow-black/20 z-20">
          {sortOptions.map((option) => (
            <button
              key={option}
              onClick={() => {
                onChange(option)
                setIsOpen(false)
              }}
              className={cn(
                'w-full px-4 py-3 text-left text-sm transition-colors first:rounded-t-lg last:rounded-b-lg',
                value === option
                  ? 'bg-lago-gold/10 text-lago-gold'
                  : 'text-lago-light hover:bg-white/5 hover:text-white'
              )}
            >
              {labels[option]}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
