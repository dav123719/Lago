'use client'

import { useState, useRef } from 'react'
import { MapPin, ArrowUpRight, Navigation, Copy, Check } from 'lucide-react'
import { Locale } from '@/lib/i18n/config'
import { companyInfo } from '@/content/company'

interface AddressCardProps {
  locale: Locale
  className?: string
  style?: React.CSSProperties
}

// Navigation Button Component with enhanced hover animations
function NavButton({ 
  href, 
  icon: Icon, 
  label, 
  iconColor, 
  bgColor, 
  hoverColor,
  gradientFrom,
  gradientTo
}: { 
  href: string
  icon: React.ComponentType<{ className?: string }>
  label: string
  iconColor: string
  bgColor: string
  hoverColor: string
  gradientFrom: string
  gradientTo: string
}) {
  const buttonRef = useRef<HTMLAnchorElement>(null)
  const [mousePosition, setMousePosition] = useState({ x: 50, y: 50 })
  const [isHovered, setIsHovered] = useState(false)

  const handleMouseMove = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (!buttonRef.current) return
    const rect = buttonRef.current.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100
    setMousePosition({ x, y })
  }

  return (
    <a
      ref={buttonRef}
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      onMouseEnter={(e) => {
        setIsHovered(true)
        handleMouseMove(e)
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setIsHovered(false)}
      className="group/btn relative flex-1 flex items-center justify-center gap-3 px-4 py-3.5 md:px-5 md:py-4 rounded-xl bg-lago-dark/60 hover:bg-lago-dark border border-white/10 hover:border-lago-gold/50 transition-all duration-300 transform hover:scale-[1.05] hover:-translate-y-0.5 overflow-hidden shadow-lg hover:shadow-2xl w-full sm:w-auto"
    >
      {/* Animated gradient background */}
      <div 
        className={`absolute inset-0 rounded-xl bg-gradient-to-br ${gradientFrom} ${gradientTo} transition-opacity duration-500 ${
          isHovered ? 'opacity-20' : 'opacity-0'
        }`}
      />
      
      {/* Glassmorphism hover effect */}
      <div className={`absolute inset-0 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 transition-all duration-300 ${
        isHovered
          ? 'opacity-100 -translate-y-0.5 scale-[1.02] shadow-xl shadow-black/30'
          : 'opacity-0'
      }`} />
      
      {/* Pulsing glow effect */}
      <div
        className={`absolute inset-0 rounded-xl transition-opacity duration-500 pointer-events-none blur-2xl ${
          isHovered ? 'opacity-40 animate-pulse' : 'opacity-0'
        }`}
        style={{
          background: `radial-gradient(circle at center, ${hoverColor}80 0%, transparent 70%)`,
        }}
      />
      
      {/* Dynamic gloss/shine effect that follows mouse */}
      <div
        className={`absolute inset-0 rounded-xl transition-opacity duration-300 pointer-events-none ${
          isHovered ? 'opacity-100' : 'opacity-0'
        }`}
        style={{
          background: `radial-gradient(circle 150px at ${mousePosition.x}% ${mousePosition.y}%, rgba(255, 255, 255, 0.25) 0%, rgba(255, 255, 255, 0.1) 30%, transparent 60%)`,
          transform: `translate(${(mousePosition.x - 50) * 0.15}px, ${(mousePosition.y - 50) * 0.15}px)`,
          transition: isHovered ? 'background 0.1s ease-out, transform 0.1s ease-out' : 'opacity 0.3s ease-out',
          willChange: 'background, transform',
        }}
      />
      
      {/* Enhanced glow effect that follows mouse */}
      <div
        className={`absolute inset-0 rounded-xl transition-opacity duration-300 pointer-events-none blur-xl ${
          isHovered ? 'opacity-70' : 'opacity-0'
        }`}
        style={{
          background: `radial-gradient(circle 120px at ${mousePosition.x}% ${mousePosition.y}%, ${hoverColor}99 0%, ${hoverColor}66 30%, transparent 70%)`,
          transform: `translate(${(mousePosition.x - 50) * 0.2}px, ${(mousePosition.y - 50) * 0.2}px)`,
          transition: isHovered ? 'background 0.15s ease-out, transform 0.15s ease-out' : 'opacity 0.3s ease-out',
          willChange: 'background, transform',
        }}
      />
      
      {/* Icon with enhanced styling */}
      <div className={`relative z-10 w-8 h-8 md:w-10 md:h-10 rounded-xl ${bgColor} flex items-center justify-center group-hover/btn:scale-110 group-hover/btn:rotate-3 transition-all duration-300 shadow-lg group-hover/btn:shadow-xl`}>
        {/* Icon glow */}
        <div 
          className={`absolute inset-0 rounded-xl blur-md transition-opacity duration-300 ${
            isHovered ? 'opacity-100' : 'opacity-0'
          }`}
          style={{
            background: `radial-gradient(circle, ${hoverColor}80, transparent)`,
          }}
        />
        <Icon className={`relative z-10 w-5 h-5 md:w-6 md:h-6 ${iconColor} transition-all duration-300 group-hover/btn:scale-110`} />
      </div>
      
      {/* Label with enhanced styling */}
      <span className="relative z-10 text-sm md:text-base font-semibold text-lago-light group-hover/btn:text-white transition-all duration-300 whitespace-nowrap group-hover/btn:tracking-wide flex-shrink-0">
        {label}
      </span>
      
      {/* Enhanced shimmer effect */}
      <div className="absolute inset-0 rounded-xl overflow-hidden pointer-events-none opacity-0 group-hover/btn:opacity-100 transition-opacity duration-500">
        <div className="absolute inset-0 -translate-x-full group-hover/btn:translate-x-full transition-transform duration-1000 ease-out bg-gradient-to-r from-transparent via-white/20 to-transparent" />
      </div>
      
      {/* Animated border glow */}
      <div 
        className={`absolute -inset-0.5 rounded-xl transition-opacity duration-500 pointer-events-none blur-sm ${
          isHovered ? 'opacity-100 animate-gradient-shift' : 'opacity-0'
        }`}
        style={{
          background: `linear-gradient(135deg, ${hoverColor}80, ${hoverColor}40, ${hoverColor}80)`,
          backgroundSize: '200% 200%',
        }}
      />
    </a>
  )
}

export function AddressCard({ locale, className, style }: AddressCardProps) {
  const [copied, setCopied] = useState(false)
  const fullAddress = `${companyInfo.address}, ${companyInfo.city}, ${companyInfo.postalCode}`
  const encodedAddress = encodeURIComponent(fullAddress)
  
  // Use the specific Google Maps location link
  const googleMapsUrl = `https://maps.app.goo.gl/sYyH6k8miycuYuEXA`
  const wazeUrl = `https://waze.com/ul?q=${encodedAddress}&navigate=yes`

  const handleCopyAddress = async () => {
    try {
      await navigator.clipboard.writeText(fullAddress)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy address:', err)
    }
  }

  return (
    <div 
      className={className}
      style={style}
    >
      <div className="group relative p-6 md:p-8 rounded-2xl bg-lago-charcoal/50 backdrop-blur-sm border border-white/10 hover:border-lago-gold/50 transition-all duration-500 hover:shadow-2xl hover:shadow-lago-gold/20 hover:-translate-y-2 w-full overflow-hidden">
        {/* Animated background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        
        {/* Icon */}
        <div className="relative w-12 h-12 md:w-16 md:h-16 rounded-xl bg-blue-500/10 flex items-center justify-center mb-4 md:mb-6 transform transition-all duration-300 group-hover:scale-110 group-hover:rotate-3">
          <MapPin className="w-6 h-6 md:w-8 md:h-8 text-blue-400" />
          {/* Glow effect */}
          <div className="absolute inset-0 rounded-xl bg-blue-500/10 blur-xl opacity-0 group-hover:opacity-50 transition-opacity duration-300" />
        </div>
        
        {/* Content */}
        <div className="relative mb-4 md:mb-6">
          <h3 className="text-lg md:text-xl font-heading text-white mb-2 group-hover:text-lago-gold transition-colors duration-300">
            {locale === 'lv' ? 'Adrese' : locale === 'en' ? 'Address' : 'Адрес'}
          </h3>
          <p className="text-lago-muted text-xs md:text-sm mb-2 md:mb-3 opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300">
            {locale === 'lv' ? 'Apmeklējiet mūsu showroom' : locale === 'en' ? 'Visit our showroom' : 'Посетите наш шоурум'}
          </p>
          <button
            onClick={handleCopyAddress}
            className="group/address w-full text-left p-3 rounded-lg bg-lago-dark/30 hover:bg-lago-dark/50 border border-transparent hover:border-lago-gold/30 transition-all duration-300 cursor-pointer flex items-center justify-between gap-3"
          >
            <p className="text-lago-light text-base md:text-lg font-medium flex-1">
              {`${companyInfo.address}, ${companyInfo.city}`}
            </p>
            <div className="flex-shrink-0">
              {copied ? (
                <div className="flex items-center gap-2 text-lago-gold">
                  <Check className="w-4 h-4" />
                  <span className="text-xs font-medium">
                    {locale === 'lv' ? 'Kopēts!' : locale === 'en' ? 'Copied!' : 'Скопировано!'}
                  </span>
                </div>
              ) : (
                <Copy className="w-4 h-4 text-lago-muted group-hover/address:text-lago-gold transition-colors" />
              )}
            </div>
          </button>
        </div>
        
        {/* Navigation Buttons - Stack vertically on small/medium screens to prevent text cutoff */}
        <div className="relative flex flex-col md:flex-row gap-3 md:gap-4">
          <NavButton
            href={googleMapsUrl}
            icon={MapPin}
            label={locale === 'lv' ? 'Google Maps' : locale === 'en' ? 'Google Maps' : 'Google Maps'}
            iconColor="text-blue-400"
            bgColor="bg-blue-500/20"
            hoverColor="#3b82f6"
            gradientFrom="from-blue-500/30"
            gradientTo="to-cyan-500/30"
          />
          <NavButton
            href={wazeUrl}
            icon={Navigation}
            label={locale === 'lv' ? 'Waze' : locale === 'en' ? 'Waze' : 'Waze'}
            iconColor="text-purple-400"
            bgColor="bg-purple-500/20"
            hoverColor="#a855f7"
            gradientFrom="from-purple-500/30"
            gradientTo="to-pink-500/30"
          />
        </div>
        
        {/* Corner accents */}
        <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-lago-gold/0 group-hover:border-lago-gold/50 transition-colors duration-300 rounded-tl-2xl" />
        <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-lago-gold/0 group-hover:border-lago-gold/50 transition-colors duration-300 rounded-br-2xl" />
        
        {/* Shimmer effect */}
        <div className="absolute inset-0 overflow-hidden rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
          <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        </div>
      </div>
    </div>
  )
}

