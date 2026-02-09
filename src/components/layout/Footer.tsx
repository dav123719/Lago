'use client'

import { useState, useRef } from 'react'
import Link from 'next/link'
import { MapPin, Phone, Mail, Clock, Instagram, Facebook, ArrowUpRight } from 'lucide-react'
import { Locale } from '@/lib/i18n/config'
import { translations } from '@/lib/i18n/translations'
import { companyInfo } from '@/content/company'
import { useScrollAnimation } from '@/hooks'
import { MapPopup } from '@/components/ui/MapPopup'

interface FooterProps {
  locale: Locale
}

interface SocialButtonProps {
  href: string
  icon: React.ComponentType<{ className?: string }>
  label: string
  gradientColors: [string, string, string]
  hoverColor: string
}

function SocialButton({ href, icon: Icon, label, gradientColors, hoverColor }: SocialButtonProps) {
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
    <a
      ref={linkRef}
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="group relative flex-1 min-w-[140px] max-w-[180px]"
      onMouseEnter={(e) => {
        setIsHovered(true)
        handleMouseMove(e)
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Animated gradient border */}
      <div 
        className="absolute -inset-0.5 rounded-xl opacity-50 group-hover:opacity-100 blur-sm transition-all duration-500 group-hover:blur-md animate-gradient-x pointer-events-none"
        style={{
          background: `linear-gradient(to right, ${gradientColors[0]}, ${gradientColors[1]}, ${gradientColors[2]})`,
          borderRadius: '0.75rem',
        }}
      />
      
      {/* Button content */}
      <div 
        className="relative flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-lago-dark border border-white/10 transition-all duration-300 group-hover:bg-lago-dark/80"
        style={{
          '--hover-color': hoverColor,
        } as React.CSSProperties & { '--hover-color': string }}
      >
        {/* Dynamic gloss/shine effect that follows mouse */}
        <div
          className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-250 pointer-events-none"
          style={{
            background: `radial-gradient(circle 120px at ${mousePosition.x}% ${mousePosition.y}%, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0.05) 40%, transparent 70%)`,
            transform: `translate(${(mousePosition.x - 50) * 0.1}px, ${(mousePosition.y - 50) * 0.1}px)`,
            transition: isHovered ? 'background 0.1s ease-out, transform 0.1s ease-out' : 'opacity 0.25s ease-out',
            willChange: 'background, transform',
          }}
        />
        
        {/* Subtle glow effect that follows mouse */}
        <div
          className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-50 transition-opacity duration-250 pointer-events-none blur-xl"
          style={{
            background: `radial-gradient(circle 80px at ${mousePosition.x}% ${mousePosition.y}%, ${hoverColor}66 0%, transparent 60%)`,
            transform: `translate(${(mousePosition.x - 50) * 0.15}px, ${(mousePosition.y - 50) * 0.15}px)`,
            transition: isHovered ? 'background 0.15s ease-out, transform 0.15s ease-out' : 'opacity 0.25s ease-out',
            willChange: 'background, transform',
          }}
        />
        
        {/* Icon container with glow */}
        <div className="relative z-10">
          <div 
            className="absolute inset-0 rounded-full blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            style={{
              background: hoverColor === '#1877F2' 
                ? 'rgba(24, 119, 242, 0.3)' 
                : `radial-gradient(circle, ${gradientColors[0]}, ${gradientColors[1]}, ${gradientColors[2]})`,
            }}
          />
          <span style={{ color: isHovered ? hoverColor : 'white' }}>
            <Icon 
              className="relative w-5 h-5 transition-colors duration-300 group-hover:scale-110 transform"
            />
          </span>
        </div>
        <span 
          className="text-xs font-medium transition-colors duration-300 whitespace-nowrap relative z-10"
          style={{
            color: isHovered ? hoverColor : 'white',
          }}
        >
          {label}
        </span>
        
        {/* Shimmer effect */}
        <div className="absolute inset-0 rounded-xl overflow-hidden pointer-events-none">
          <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        </div>
      </div>
    </a>
  )
}

export function Footer({ locale }: FooterProps) {
  const currentYear = new Date().getFullYear()
  const { ref, isInView } = useScrollAnimation({ threshold: 0.1 })
  const [isMapPopupOpen, setIsMapPopupOpen] = useState(false)
  
  // Simplified footer navigation - removed Kontakti and Pilns Serviss
  const stoneLinks = [
    { label: 'Silestone', href: `/${locale}/${locale === 'lv' ? 'akmens-virsmas' : locale === 'ru' ? 'kamennye-poverhnosti' : 'stone-surfaces'}/silestone` },
    { label: 'Dekton', href: `/${locale}/${locale === 'lv' ? 'akmens-virsmas' : locale === 'ru' ? 'kamennye-poverhnosti' : 'stone-surfaces'}/dekton` },
    { label: translations.materials.granite[locale], href: `/${locale}/${locale === 'lv' ? 'akmens-virsmas' : locale === 'ru' ? 'kamennye-poverhnosti' : 'stone-surfaces'}/${locale === 'lv' ? 'granits' : locale === 'ru' ? 'granit' : 'granite'}` },
    { label: translations.materials.marble[locale], href: `/${locale}/${locale === 'lv' ? 'akmens-virsmas' : locale === 'ru' ? 'kamennye-poverhnosti' : 'stone-surfaces'}/${locale === 'lv' ? 'marmors' : locale === 'ru' ? 'mramor' : 'marble'}` },
  ]

  const companyLinks = [
    { label: translations.nav.about[locale], href: `/${locale}/${locale === 'lv' ? 'par-mums' : locale === 'ru' ? 'o-nas' : 'about-us'}` },
    { label: translations.nav.projects[locale], href: `/${locale}/${locale === 'lv' ? 'projekti' : locale === 'ru' ? 'proekty' : 'projects'}` },
    { label: translations.nav.furniture[locale], href: `/${locale}/${locale === 'lv' ? 'mebeles' : locale === 'ru' ? 'mebel' : 'furniture'}` },
  ]

  return (
    <footer className="bg-lago-dark border-t border-white/5 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-64 h-64 bg-lago-gold/5 rounded-full blur-3xl animate-breathe" />
        <div className="absolute bottom-0 right-1/4 w-48 h-48 bg-lago-gold/5 rounded-full blur-3xl animate-breathe" style={{ animationDelay: '2s' }} />
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 bg-grid opacity-5" />
      </div>

      {/* Main Footer */}
      <div ref={ref} className="container-lg py-16 md:py-20 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">
          
          {/* Brand Column */}
          <div 
            className={`lg:col-span-1 transition-all duration-700 ${isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
          >
            <div className="mb-6">
              <Link href={`/${locale}`} className="group inline-block">
                <h2 className="text-white font-medium group-hover:text-lago-gold transition-colors duration-300 mb-2">
                  Lago Stone & Furniture
                </h2>
                {/* Decorative underline that expands on hover */}
                <div className="h-0.5 w-0 group-hover:w-full bg-gradient-to-r from-lago-gold via-lago-gold-light to-lago-gold transition-all duration-500 rounded-full" />
              </Link>
              <p className="text-lago-muted text-sm leading-relaxed mt-2">
              {locale === 'lv' 
                ? 'Premium akmens virsmu un individuālo mēbeļu ražotājs kopš 2003. gada.'
                : locale === 'en'
                ? 'Premium stone surface and custom furniture manufacturer since 2003.'
                : 'Производитель премиальных каменных поверхностей и мебели с 2003 года.'
              }
              </p>
            </div>
            
            {/* Social Links - Same style as Header */}
            <div className="flex gap-3 flex-wrap">
              {/* Facebook Button */}
              <SocialButton
                href="https://www.facebook.com/LAGO.lv/"
                icon={Facebook}
                label="Lago Stone"
                gradientColors={['#1877F2', '#4267B2', '#1877F2']}
                hoverColor="#1877F2"
              />

              {/* Instagram Button */}
              <SocialButton
                href="https://www.instagram.com/lago_stone/"
                icon={Instagram}
                label="@lago_stone"
                gradientColors={['#833AB4', '#FD1D1D', '#F77737']}
                hoverColor="#E1306C"
              />
            </div>
          </div>

          {/* Stone Products */}
          <div 
            className={`transition-all duration-700 ${isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
            style={{ transitionDelay: '100ms' }}
          >
            <h3 className="text-white font-medium mb-6 relative inline-block">
              {translations.footer.stoneProducts[locale]}
              <div className="absolute -bottom-1 left-0 w-8 h-0.5 bg-lago-gold/50 rounded-full" />
            </h3>
            <ul className="space-y-3">
              {stoneLinks.map((link, index) => (
                <li 
                  key={link.href}
                  className={`transition-all duration-500 ${isInView ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'}`}
                  style={{ transitionDelay: `${200 + index * 50}ms` }}
                >
                  <Link
                    href={link.href}
                    className="group flex items-center gap-1 text-lago-muted text-sm hover:text-lago-gold transition-colors"
                  >
                    <span className="relative">
                      {link.label}
                      <span className="absolute bottom-0 left-0 w-0 h-px bg-lago-gold group-hover:w-full transition-all duration-300" />
                    </span>
                    <ArrowUpRight className="w-3 h-3 opacity-0 -translate-y-1 translate-x-1 group-hover:opacity-100 group-hover:translate-y-0 group-hover:translate-x-0 transition-all duration-300" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div 
            className={`transition-all duration-700 ${isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
            style={{ transitionDelay: '200ms' }}
          >
            <h3 className="text-white font-medium mb-6 relative inline-block">
              {locale === 'lv' ? 'Uzņēmums' : locale === 'en' ? 'Company' : 'Компания'}
              <div className="absolute -bottom-1 left-0 w-8 h-0.5 bg-lago-gold/50 rounded-full" />
            </h3>
            <ul className="space-y-3">
              {companyLinks.map((link, index) => (
                <li 
                  key={link.href}
                  className={`transition-all duration-500 ${isInView ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'}`}
                  style={{ transitionDelay: `${300 + index * 50}ms` }}
                >
                  <Link
                    href={link.href}
                    className="group flex items-center gap-1 text-lago-muted text-sm hover:text-lago-gold transition-colors"
                  >
                    <span className="relative">
                      {link.label}
                      <span className="absolute bottom-0 left-0 w-0 h-px bg-lago-gold group-hover:w-full transition-all duration-300" />
                    </span>
                    <ArrowUpRight className="w-3 h-3 opacity-0 -translate-y-1 translate-x-1 group-hover:opacity-100 group-hover:translate-y-0 group-hover:translate-x-0 transition-all duration-300" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div 
            className={`transition-all duration-700 ${isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
            style={{ transitionDelay: '300ms' }}
          >
            <h3 className="text-white font-medium mb-6 relative inline-block">
              {locale === 'lv' ? 'Kontaktinformācija' : locale === 'en' ? 'Contact Info' : 'Контакты'}
              <div className="absolute -bottom-1 left-0 w-8 h-0.5 bg-lago-gold/50 rounded-full" />
            </h3>
            <ul className="space-y-4">
              <li 
                className={`flex gap-3 text-sm group transition-all duration-500 ${isInView ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'}`}
                style={{ transitionDelay: '400ms' }}
              >
                <div className="w-8 h-8 rounded-lg bg-lago-gold/10 flex items-center justify-center flex-shrink-0 group-hover:bg-lago-gold/20 transition-colors">
                  <MapPin className="w-4 h-4 text-lago-gold" />
                </div>
                <button
                  onClick={() => setIsMapPopupOpen(true)}
                  className="group/btn flex items-center gap-1 text-lago-muted hover:text-lago-gold transition-colors pt-1 text-left cursor-pointer"
                >
                  <span className="relative">
                    {companyInfo.address}, {companyInfo.city}, {companyInfo.postalCode}
                    <span className="absolute bottom-0 left-0 w-0 h-px bg-lago-gold group-hover/btn:w-full transition-all duration-300" />
                  </span>
                  <ArrowUpRight className="w-3 h-3 opacity-0 -translate-y-1 translate-x-1 group-hover/btn:opacity-100 group-hover/btn:translate-y-0 group-hover/btn:translate-x-0 transition-all duration-300" />
                </button>
              </li>
              <li 
                className={`flex gap-3 text-sm group transition-all duration-500 ${isInView ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'}`}
                style={{ transitionDelay: '450ms' }}
              >
                <div className="w-8 h-8 rounded-lg bg-lago-gold/10 flex items-center justify-center flex-shrink-0 group-hover:bg-lago-gold/20 transition-colors">
                  <Phone className="w-4 h-4 text-lago-gold" />
                </div>
                <a href={`tel:${companyInfo.phone.replace(/\s/g, '')}`} className="group/link flex items-center gap-1 text-lago-muted hover:text-lago-gold transition-colors pt-1">
                  <span className="relative">
                    {companyInfo.phone}
                    <span className="absolute bottom-0 left-0 w-0 h-px bg-lago-gold group-hover/link:w-full transition-all duration-300" />
                  </span>
                  <ArrowUpRight className="w-3 h-3 opacity-0 -translate-y-1 translate-x-1 group-hover/link:opacity-100 group-hover/link:translate-y-0 group-hover/link:translate-x-0 transition-all duration-300" />
                </a>
              </li>
              <li 
                className={`flex gap-3 text-sm group transition-all duration-500 ${isInView ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'}`}
                style={{ transitionDelay: '500ms' }}
              >
                <div className="w-8 h-8 rounded-lg bg-lago-gold/10 flex items-center justify-center flex-shrink-0 group-hover:bg-lago-gold/20 transition-colors">
                  <Mail className="w-4 h-4 text-lago-gold" />
                </div>
                <a href={`mailto:${companyInfo.email}`} className="group/link flex items-center gap-1 text-lago-muted hover:text-lago-gold transition-colors pt-1">
                  <span className="relative">
                    {companyInfo.email}
                    <span className="absolute bottom-0 left-0 w-0 h-px bg-lago-gold group-hover/link:w-full transition-all duration-300" />
                  </span>
                  <ArrowUpRight className="w-3 h-3 opacity-0 -translate-y-1 translate-x-1 group-hover/link:opacity-100 group-hover/link:translate-y-0 group-hover/link:translate-x-0 transition-all duration-300" />
                </a>
              </li>
              <li 
                className={`flex gap-3 text-sm group transition-all duration-500 ${isInView ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'}`}
                style={{ transitionDelay: '550ms' }}
              >
                <div className="w-8 h-8 rounded-lg bg-lago-gold/10 flex items-center justify-center flex-shrink-0 group-hover:bg-lago-gold/20 transition-colors">
                  <Clock className="w-4 h-4 text-lago-gold" />
                </div>
                <span className="text-lago-muted pt-1">
                  {companyInfo.workingHours[locale]}
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/5 relative z-10">
        <div className="container-lg py-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-lago-muted text-xs">
            © {currentYear} {companyInfo.name}. {translations.footer.rights[locale]}
          </p>
          <p className="text-lago-stone text-xs flex items-center gap-1">
            {locale === 'lv' ? 'Izstrādāts ar' : locale === 'en' ? 'Made with' : 'Сделано с'}{' '}
            <span className="text-red-500 animate-pulse">❤️</span>{' '}
            {locale === 'lv' ? 'Latvijā' : locale === 'en' ? 'in Latvia' : 'в Латвии'}
          </p>
        </div>
      </div>

      {/* Map Popup */}
      <MapPopup 
        isOpen={isMapPopupOpen} 
        onClose={() => setIsMapPopupOpen(false)} 
        locale={locale}
      />
    </footer>
  )
}
