'use client'

import Link from 'next/link'
import Image from 'next/image'
import { ArrowUpRight } from 'lucide-react'
import { useMouseGlow } from '@/hooks/useMouseGlow'

interface MaterialCardRefactoredProps {
  image: string
  title: string
  description: string
  badge: string
  badgeStyle: 'popular' | 'outdoor' | 'natural' | 'premium'
  rating: string
  features: string[]
  useCases: string
  href: string
}

const badgeStyles = {
  popular: 'bg-lago-gold text-lago-black animate-pulse-glow',
  outdoor: 'bg-white/20 backdrop-blur text-white border border-white/30',
  natural: 'bg-white/20 backdrop-blur text-white border border-white/30',
  premium: 'bg-gradient-to-r from-lago-gold to-lago-gold-light text-lago-black',
}

export function MaterialCardRefactored({
  image,
  title,
  description,
  badge,
  badgeStyle,
  rating,
  features,
  useCases,
  href,
}: MaterialCardRefactoredProps) {
  const { elementRef, mousePosition, isHovered, handleMouseEnter, handleMouseMove, handleMouseLeave } = useMouseGlow({ enabled: true, throttleMs: 16 })

  return (
    <div className="relative">
      {/* Mouse-reactive glow effects */}
      <div
        className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-250 pointer-events-none z-0"
        style={{
          background: `radial-gradient(circle 150px at ${mousePosition.x}% ${mousePosition.y}%, rgba(255, 255, 255, 0.12) 0%, rgba(255, 255, 255, 0.04) 40%, transparent 70%)`,
          transform: `translate(${(mousePosition.x - 50) * 0.1}px, ${(mousePosition.y - 50) * 0.1}px)`,
          transition: isHovered ? 'background 0.1s ease-out, transform 0.1s ease-out' : 'opacity 0.25s ease-out',
          willChange: isHovered ? 'background, transform' : 'opacity',
        }}
      />
      <div
        className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-50 transition-opacity duration-250 pointer-events-none blur-xl z-0"
        style={{
          background: `radial-gradient(circle 100px at ${mousePosition.x}% ${mousePosition.y}%, rgba(201, 169, 98, 0.3) 0%, transparent 60%)`,
          transform: `translate(${(mousePosition.x - 50) * 0.15}px, ${(mousePosition.y - 50) * 0.15}px)`,
          transition: isHovered ? 'background 0.15s ease-out, transform 0.15s ease-out' : 'opacity 0.25s ease-out',
          willChange: isHovered ? 'background, transform' : 'opacity',
        }}
      />
      
      <Link
        ref={elementRef as React.Ref<HTMLAnchorElement>}
        href={href}
        className="group relative bg-lago-dark/50 backdrop-blur-sm rounded-xl overflow-hidden border border-white/5 hover:border-lago-gold/50 transition-all duration-300 hover:shadow-xl hover:shadow-lago-gold/10 block h-full flex flex-col"
        onMouseEnter={handleMouseEnter}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        {/* Image Section */}
        <div className="relative h-32 md:h-40 lg:h-36 overflow-hidden">
          <Image
            src={image}
            alt={title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-110"
            // PERFORMANCE: Responsive sizes for material cards in grid layout
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
            // PERFORMANCE: Material cards are below fold - lazy load to reduce initial payload
            loading="lazy"
            quality={75} // PERFORMANCE: Reduced quality to save bandwidth
          />
          <div className="absolute inset-0 bg-gradient-to-t from-lago-dark via-lago-dark/30 to-transparent" />
          
          {/* Badge */}
          <div className={`absolute top-2 right-2 px-2 py-1 text-[10px] md:text-xs font-bold rounded-full ${badgeStyles[badgeStyle]}`}>
            {badge}
          </div>
          
          {/* Rating Stars */}
          <div className="absolute bottom-2 left-2 flex items-center gap-1">
            <div className="flex text-lago-gold text-xs">{rating}</div>
          </div>
        </div>
        
        {/* Content Section */}
        <div className="p-4 md:p-5 flex-1 flex flex-col">
          <div className="flex items-start justify-between mb-2">
            <h3 className="text-xl md:text-2xl font-heading text-white group-hover:text-lago-gold transition-colors duration-300">
              {title}
            </h3>
            <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-lago-gold/10 flex items-center justify-center group-hover:bg-lago-gold group-hover:text-lago-black transition-all duration-300 flex-shrink-0 ml-2">
              <ArrowUpRight className="w-4 h-4 md:w-5 md:h-5 text-lago-gold group-hover:text-lago-black" />
            </div>
          </div>
          
          <p className="text-lago-light/70 text-xs md:text-sm mb-3 md:mb-4 leading-snug line-clamp-2">
            {description}
          </p>
          
          {/* Key Features */}
          <div className="mt-auto space-y-2">
            <div className="flex flex-wrap gap-1.5">
              {features.map((feature, index) => (
                <span key={index} className="px-2 py-0.5 bg-lago-gold/10 text-lago-gold text-[10px] md:text-xs rounded-full font-medium">
                  {feature}
                </span>
              ))}
            </div>
            <div className="text-[10px] md:text-xs text-lago-muted">
              {useCases}
            </div>
          </div>
        </div>
      </Link>
    </div>
  )
}

