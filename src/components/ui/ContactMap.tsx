'use client'

import { useState, useRef } from 'react'
import { Locale } from '@/lib/i18n/config'

interface ContactMapProps {
  locale: Locale
}

export function ContactMap({ locale }: ContactMapProps) {
  const [mousePosition, setMousePosition] = useState({ x: 50, y: 50 })
  const [isHovered, setIsHovered] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  // Google Maps Locator Plus iframe URL
  const mapEmbedUrl = `https://storage.googleapis.com/maps-solutions-vf2164uzww/locator-plus/yumb/locator-plus.html`

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100
    setMousePosition({ x, y })
  }

  return (
    <div 
      ref={containerRef}
      onMouseEnter={() => setIsHovered(true)}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setIsHovered(false)}
      className="relative w-full h-[500px] md:h-[600px] lg:h-[700px] rounded-2xl overflow-hidden border-2 border-white/10 bg-lago-charcoal/50 group/map opacity-0 animate-fade-in-up"
      style={{ animationDelay: '100ms', animationFillMode: 'forwards' }}
    >
      {/* Animated border gradient that follows mouse */}
      <div 
        className="absolute -inset-[2px] rounded-2xl opacity-0 group-hover/map:opacity-100 transition-opacity duration-500 blur-md pointer-events-none z-0"
        style={{
          background: `radial-gradient(circle 200px at ${mousePosition.x}% ${mousePosition.y}%, rgba(212, 175, 55, 0.4) 0%, rgba(212, 175, 55, 0.2) 30%, transparent 60%)`,
          transition: isHovered ? 'background 0.1s ease-out' : 'opacity 0.5s ease-out',
        }}
      />
      
      {/* Pulsing border glow */}
      <div className="absolute -inset-[2px] rounded-2xl border-2 border-lago-gold/0 group-hover/map:border-lago-gold/30 transition-all duration-500 pointer-events-none z-0 animate-pulse-glow" />
      
      {/* Animated gradient border ring */}
      <div 
        className="absolute -inset-[3px] rounded-2xl opacity-0 group-hover/map:opacity-100 transition-opacity duration-500 pointer-events-none z-0"
        style={{
          background: `conic-gradient(from ${mousePosition.x * 3.6}deg, transparent, rgba(212, 175, 55, 0.3), transparent, rgba(212, 175, 55, 0.3), transparent)`,
          transition: isHovered ? 'background 0.15s ease-out' : 'opacity 0.5s ease-out',
        }}
      />
      
      {/* Decorative corner elements - top left */}
      <div className="absolute top-0 left-0 w-16 h-16 pointer-events-none z-20">
        <div className="absolute top-0 left-0 w-12 h-12 border-t-2 border-l-2 border-lago-gold/0 group-hover/map:border-lago-gold/60 transition-all duration-500 rounded-tl-2xl" />
        <div className="absolute top-2 left-2 w-2 h-2 bg-lago-gold/0 group-hover/map:bg-lago-gold/80 rounded-full transition-all duration-500 animate-pulse" />
      </div>
      
      {/* Decorative corner elements - top right */}
      <div className="absolute top-0 right-0 w-16 h-16 pointer-events-none z-20">
        <div className="absolute top-0 right-0 w-12 h-12 border-t-2 border-r-2 border-lago-gold/0 group-hover/map:border-lago-gold/60 transition-all duration-500 rounded-tr-2xl" />
        <div className="absolute top-2 right-2 w-2 h-2 bg-lago-gold/0 group-hover/map:bg-lago-gold/80 rounded-full transition-all duration-500 animate-pulse" />
      </div>
      
      {/* Decorative corner elements - bottom left */}
      <div className="absolute bottom-0 left-0 w-16 h-16 pointer-events-none z-20">
        <div className="absolute bottom-0 left-0 w-12 h-12 border-b-2 border-l-2 border-lago-gold/0 group-hover/map:border-lago-gold/60 transition-all duration-500 rounded-bl-2xl" />
        <div className="absolute bottom-2 left-2 w-2 h-2 bg-lago-gold/0 group-hover/map:bg-lago-gold/80 rounded-full transition-all duration-500 animate-pulse" />
      </div>
      
      {/* Decorative corner elements - bottom right */}
      <div className="absolute bottom-0 right-0 w-16 h-16 pointer-events-none z-20">
        <div className="absolute bottom-0 right-0 w-12 h-12 border-b-2 border-r-2 border-lago-gold/0 group-hover/map:border-lago-gold/60 transition-all duration-500 rounded-br-2xl" />
        <div className="absolute bottom-2 right-2 w-2 h-2 bg-lago-gold/0 group-hover/map:bg-lago-gold/80 rounded-full transition-all duration-500 animate-pulse" />
      </div>
      
      {/* Decorative dots around border */}
      <div className="absolute inset-0 pointer-events-none z-20">
        {/* Top border dots */}
        {[...Array(8)].map((_, i) => (
          <div
            key={`top-${i}`}
            className="absolute top-0 w-1.5 h-1.5 bg-lago-gold/0 group-hover/map:bg-lago-gold/60 rounded-full transition-all duration-500"
            style={{
              left: `${(i + 1) * 12.5}%`,
              transform: 'translateY(-50%)',
              transitionDelay: `${i * 50}ms`,
            }}
          />
        ))}
        {/* Bottom border dots */}
        {[...Array(8)].map((_, i) => (
          <div
            key={`bottom-${i}`}
            className="absolute bottom-0 w-1.5 h-1.5 bg-lago-gold/0 group-hover/map:bg-lago-gold/60 rounded-full transition-all duration-500"
            style={{
              left: `${(i + 1) * 12.5}%`,
              transform: 'translateY(50%)',
              transitionDelay: `${i * 50}ms`,
            }}
          />
        ))}
        {/* Left border dots */}
        {[...Array(6)].map((_, i) => (
          <div
            key={`left-${i}`}
            className="absolute left-0 w-1.5 h-1.5 bg-lago-gold/0 group-hover/map:bg-lago-gold/60 rounded-full transition-all duration-500"
            style={{
              top: `${(i + 1) * 16.67}%`,
              transform: 'translateX(-50%)',
              transitionDelay: `${i * 50}ms`,
            }}
          />
        ))}
        {/* Right border dots */}
        {[...Array(6)].map((_, i) => (
          <div
            key={`right-${i}`}
            className="absolute right-0 w-1.5 h-1.5 bg-lago-gold/0 group-hover/map:bg-lago-gold/60 rounded-full transition-all duration-500"
            style={{
              top: `${(i + 1) * 16.67}%`,
              transform: 'translateX(50%)',
              transitionDelay: `${i * 50}ms`,
            }}
          />
        ))}
      </div>
      
      {/* Mouse-following glow effect (behind map, doesn't cover it) */}
      <div
        className="absolute inset-0 rounded-2xl opacity-0 group-hover/map:opacity-30 transition-opacity duration-300 pointer-events-none z-0"
        style={{
          background: `radial-gradient(circle 300px at ${mousePosition.x}% ${mousePosition.y}%, rgba(212, 175, 55, 0.2) 0%, transparent 70%)`,
          transition: isHovered ? 'background 0.1s ease-out, opacity 0.3s ease-out' : 'opacity 0.3s ease-out',
        }}
      />
      
      {/* Google Maps Locator Plus Embed */}
      <iframe
        src={mapEmbedUrl}
        width="100%"
        height="100%"
        style={{ border: 0 }}
        allowFullScreen
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        className="w-full h-full relative z-10 transform transition-transform duration-500 group-hover/map:scale-[1.005]"
      />
      
      {/* Shimmer effect on hover */}
      <div className="absolute inset-0 overflow-hidden rounded-2xl opacity-0 group-hover/map:opacity-100 transition-opacity duration-500 pointer-events-none z-30">
        <div className="absolute inset-0 -translate-x-full group-hover/map:translate-x-full transition-transform duration-1000 ease-out bg-gradient-to-r from-transparent via-white/5 to-transparent" />
      </div>
      
      {/* Animated background particles (subtle) */}
      <div className="absolute inset-0 overflow-hidden rounded-2xl pointer-events-none z-0">
        {[...Array(12)].map((_, i) => {
          const randomLeft = 10 + Math.random() * 80
          const randomTop = 10 + Math.random() * 80
          const randomDuration = 3 + Math.random() * 2
          const randomDelay = Math.random() * 2
          
          return (
            <div
              key={`particle-${i}`}
              className="absolute w-1 h-1 bg-lago-gold/0 group-hover/map:bg-lago-gold/40 rounded-full transition-all duration-1000 animate-float"
              style={{
                left: `${randomLeft}%`,
                top: `${randomTop}%`,
                animationDuration: `${randomDuration}s`,
                animationDelay: `${randomDelay}s`,
                transitionDelay: `${i * 100}ms`,
              }}
            />
          )
        })}
      </div>
    </div>
  )
}

