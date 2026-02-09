'use client'

import Link from 'next/link'
import { ArrowRight, Sparkles } from 'lucide-react'
import { Locale } from '@/lib/i18n/config'
import { useMouseGlow } from '@/hooks/useMouseGlow'

interface ViewAllProjectsLinkProps {
  href: string
  locale: Locale
}

export function ViewAllProjectsLink({ href, locale }: ViewAllProjectsLinkProps) {
  const { elementRef, mousePosition, isHovered, handleMouseEnter, handleMouseMove, handleMouseLeave } = useMouseGlow({ enabled: true, throttleMs: 16 })

  return (
    <Link
      ref={elementRef as React.Ref<HTMLAnchorElement>}
      href={href}
      className="group relative inline-flex items-center gap-3 px-8 py-4 bg-lago-gold/10 hover:bg-lago-gold/20 border border-lago-gold/30 hover:border-lago-gold/60 rounded-xl text-lago-gold hover:text-lago-gold-light transition-all duration-500 hover:shadow-2xl hover:shadow-lago-gold/30 hover:-translate-y-1"
      onMouseEnter={handleMouseEnter}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {/* Mouse-reactive glow effects */}
      <div
        className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-250 pointer-events-none z-0"
        style={{
          background: `radial-gradient(circle 150px at ${mousePosition.x}% ${mousePosition.y}%, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0.05) 40%, transparent 70%)`,
          transform: `translate(${(mousePosition.x - 50) * 0.1}px, ${(mousePosition.y - 50) * 0.1}px)`,
          transition: isHovered ? 'background 0.1s ease-out, transform 0.1s ease-out' : 'opacity 0.25s ease-out',
          willChange: isHovered ? 'background, transform' : 'opacity',
        }}
      />
      
      <div
        className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-60 transition-opacity duration-250 pointer-events-none blur-xl z-0"
        style={{
          background: `radial-gradient(circle 100px at ${mousePosition.x}% ${mousePosition.y}%, rgba(201, 169, 98, 0.4) 0%, transparent 60%)`,
          transform: `translate(${(mousePosition.x - 50) * 0.15}px, ${(mousePosition.y - 50) * 0.15}px)`,
          transition: isHovered ? 'background 0.15s ease-out, transform 0.15s ease-out' : 'opacity 0.25s ease-out',
          willChange: isHovered ? 'background, transform' : 'opacity',
        }}
      />
      
      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-lago-gold/0 via-lago-gold/10 to-lago-gold/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 -translate-x-full group-hover:translate-x-full z-0" style={{ transitionDuration: '1s' }} />
      
      {/* Glow effect */}
      <div className="absolute inset-0 rounded-xl bg-lago-gold/0 group-hover:bg-lago-gold/5 blur-xl transition-all duration-500 z-0" />
      
      {/* Text and icon */}
      <span className="relative z-10 font-medium text-base md:text-lg">
        {locale === 'lv'
          ? 'Skatīt visus projektus'
          : locale === 'en'
          ? 'View all projects'
          : 'Посмотреть все проекты'}
      </span>
      <ArrowRight className="relative z-10 w-5 h-5 transform group-hover:translate-x-2 group-hover:-translate-y-1 transition-all duration-300" />
      
      {/* Animated sparkles */}
      <div className="absolute inset-0 overflow-hidden rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none z-0">
        {[...Array(4)].map((_, i) => (
          <Sparkles
            key={i}
            className="absolute w-3 h-3 text-lago-gold animate-pulse"
            style={{
              left: `${15 + i * 25}%`,
              top: `${20 + (i % 2) * 60}%`,
              animationDelay: `${i * 0.2}s`,
            }}
          />
        ))}
      </div>
    </Link>
  )
}

