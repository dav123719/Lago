'use client'

import { useState, useRef } from 'react'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { Locale } from '@/lib/i18n/config'

interface CTALinkProps {
  href: string
  locale: Locale
}

export function CTALink({ href, locale }: CTALinkProps) {
  const linkRef = useRef<HTMLAnchorElement>(null)
  const [mousePosition, setMousePosition] = useState({ x: 50, y: 50 })
  const [isHovered, setIsHovered] = useState(false)

  const handleMouseMove = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (!linkRef.current) return
    const rect = linkRef.current.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100
    setMousePosition({ x, y })
  }

  return (
    <Link
      ref={linkRef}
      href={href}
      className="group relative block"
      onMouseEnter={(e) => {
        setIsHovered(true)
        handleMouseMove(e)
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setIsHovered(false)}
    >
      <button className="w-full bg-lago-charcoal/90 hover:bg-lago-charcoal text-white font-button font-semibold py-5 px-10 md:py-6 md:px-12 rounded-xl border-2 border-lago-gold/60 hover:border-lago-gold transition-all duration-300 transform hover:scale-[1.02] hover:shadow-xl hover:shadow-lago-gold/30 flex items-center justify-center gap-3 relative backdrop-blur-sm">
        {/* Dynamic gloss/shine effect that follows mouse */}
        <div
          className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-250 pointer-events-none"
          style={{
            background: `radial-gradient(circle 150px at ${mousePosition.x}% ${mousePosition.y}%, rgba(255, 255, 255, 0.25) 0%, rgba(255, 255, 255, 0.1) 40%, transparent 70%)`,
            transform: `translate(${(mousePosition.x - 50) * 0.1}px, ${(mousePosition.y - 50) * 0.1}px)`,
            transition: isHovered ? 'background 0.1s ease-out, transform 0.1s ease-out' : 'opacity 0.25s ease-out',
            willChange: 'background, transform',
          }}
        />
        
        {/* Subtle glow effect that follows mouse */}
        <div
          className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-70 transition-opacity duration-250 pointer-events-none blur-xl"
          style={{
            background: `radial-gradient(circle 100px at ${mousePosition.x}% ${mousePosition.y}%, rgba(201, 169, 98, 0.5) 0%, transparent 60%)`,
            transform: `translate(${(mousePosition.x - 50) * 0.15}px, ${(mousePosition.y - 50) * 0.15}px)`,
            transition: isHovered ? 'background 0.15s ease-out, transform 0.15s ease-out' : 'opacity 0.25s ease-out',
            willChange: 'background, transform',
          }}
        />
        
        <span className="relative z-10 text-lg md:text-xl text-shadow-none">
          {locale === 'lv' 
            ? 'Kontakti'
            : locale === 'en'
            ? 'Contacts'
            : 'Контакты'}
        </span>
        <ArrowRight className="w-6 h-6 transform group-hover:translate-x-2 transition-transform relative z-10 text-shadow-none" />
      </button>
    </Link>
  )
}

