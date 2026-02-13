// ===================================
// Cart Button Component
// ===================================
// Cart icon with badge for header

'use client'

import { ShoppingBag } from 'lucide-react'
import { useCartContext } from '@/contexts/CartContext'
import type { Locale } from '@/lib/i18n/config'

interface CartButtonProps {
  locale: Locale
  className?: string
}

export function CartButton({ locale, className = '' }: CartButtonProps) {
  const { itemCount, openCart } = useCartContext()

  return (
    <button
      onClick={openCart}
      className={`
        relative p-2 rounded-lg 
        text-white/80 hover:text-white 
        hover:bg-white/5 
        transition-all duration-300
        group
        ${className}
      `}
      aria-label="Open cart"
    >
      <ShoppingBag className="w-5 h-5 transition-transform group-hover:scale-110" />
      
      {/* Badge */}
      {itemCount > 0 && (
        <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 flex items-center justify-center text-[10px] font-medium bg-lago-gold text-lago-black rounded-full">
          {itemCount > 99 ? '99+' : itemCount}
        </span>
      )}

      {/* Glow effect on hover */}
      <span className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
        <span className="absolute inset-0 rounded-lg bg-lago-gold/5" />
        <span className="absolute -inset-0.5 rounded-lg bg-lago-gold/20 blur-sm opacity-0 group-hover:opacity-100 transition-opacity" />
      </span>
    </button>
  )
}
