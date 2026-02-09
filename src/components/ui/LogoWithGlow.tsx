'use client'

import Image from 'next/image'

interface LogoWithGlowProps {
  width?: number
  height?: number
  className?: string
  padding?: 'sm' | 'md'
  priority?: boolean
}

export function LogoWithGlow({ 
  width = 300, 
  height = 120, 
  className = 'relative h-auto w-56 lg:w-64 transition-transform duration-500 group-hover/logo:scale-105',
  padding = 'md',
  priority = false
}: LogoWithGlowProps) {
  const paddingClass = padding === 'sm' ? 'p-5' : 'p-6'
  
  return (
    <div className="relative">
      <div className="relative inline-block group/logo">
        {/* Animated outer border */}
        <div className="absolute -inset-2 bg-white/25 backdrop-blur-md rounded-xl border-[0.5px] border-lago-gold/30 transition-all duration-500 group-hover/logo:border-lago-gold/60 group-hover/logo:bg-white/30 group-hover/logo:shadow-lg group-hover/logo:shadow-lago-gold/20" />
        {/* Back shadow for depth */}
        <div className="absolute inset-0 bg-black/40 blur-xl rounded-lg transform translate-y-2 scale-105 -z-10" />
        <div className={`relative bg-white/25 backdrop-blur-sm rounded-lg ${paddingClass} border-[0.5px] border-lago-gold/30 transition-all duration-500 group-hover/logo:border-lago-gold/50 group-hover/logo:bg-white/30`}>
          <Image
            src="/images/logo/lago-logo.png"
            alt="LAGO Logo"
            width={width}
            height={height}
            className={className}
            style={{ 
              filter: 'drop-shadow(0 4px 12px rgba(0, 0, 0, 0.5)) drop-shadow(0 0 20px rgba(212, 175, 55, 0.3))',
            }}
            // PERFORMANCE: Only prioritize logo if explicitly requested (desktop CTA section)
            // Mobile logo is below fold and should lazy load
            priority={priority}
            loading={priority ? undefined : 'lazy'}
            quality={priority ? 85 : 75} // Consistent quality with header logo
            fetchPriority={priority ? 'high' : 'low'} // Explicit fetch priority
          />
        </div>
      </div>
    </div>
  )
}

