'use client'

import { Locale } from '@/lib/i18n/config'

interface ScrollIndicatorProps {
  locale: Locale
}

export function ScrollIndicator({ locale }: ScrollIndicatorProps) {
  const l = locale

  const handleScroll = () => {
    const customFurnitureSection = document.getElementById('custom-furniture')
    if (customFurnitureSection) {
      customFurnitureSection.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  return (
    <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20">
      <button
        onClick={handleScroll}
        className="group relative flex items-center justify-center cursor-pointer focus:outline-none focus:ring-2 focus:ring-lago-gold/50 focus:ring-offset-2 focus:ring-offset-lago-dark rounded-full p-3 transition-all duration-300 hover:scale-110 active:scale-95"
        aria-label={l === 'lv' ? 'Ritināt uz leju' : l === 'en' ? 'Scroll down' : 'Прокрутить вниз'}
      >
        {/* Chevron down icon */}
        <svg 
          className="w-6 h-6 text-white/60 group-hover:text-lago-gold transition-all duration-300 group-hover:translate-y-1 group-hover:drop-shadow-[0_0_8px_rgba(212,175,55,0.6)]" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
        
        {/* Pulse ring animation */}
        <div className="absolute inset-0 rounded-full border-2 border-lago-gold/0 group-hover:border-lago-gold/30 animate-ping opacity-0 group-hover:opacity-100" style={{ animationDuration: '2s' }} />
      </button>
    </div>
  )
}

