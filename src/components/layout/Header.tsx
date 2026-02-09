'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Menu, X, ChevronDown, Phone, Facebook, Instagram } from 'lucide-react'
import { Locale } from '@/lib/i18n/config'
import { translations } from '@/lib/i18n/translations'
import { LanguageSwitcher } from './LanguageSwitcher'
import { NeonButton } from '@/components/ui/NeonButton'

interface HeaderProps {
  locale: Locale
  alternateUrls?: Record<Locale, string>
}

// Simplified navigation - Stone surfaces now links to homepage materials section
const getNavigation = (locale: Locale) => {
  const stoneBase = locale === 'lv' ? 'akmens-virsmas' : locale === 'ru' ? 'kamennye-poverhnosti' : 'stone-surfaces'
  return [
  {
    label: translations.nav.furniture[locale],
    href: `/${locale}/${locale === 'lv' ? 'mebeles' : locale === 'ru' ? 'mebel' : 'furniture'}`,
  },
  {
    label: translations.nav.stoneSurfaces[locale],
    href: `/${locale}#materials`, // Links to materials section on homepage
    children: [
      {
        label: 'Silestone',
        href: `/${locale}/${stoneBase}/silestone`,
      },
      {
        label: 'Dekton',
        href: `/${locale}/${stoneBase}/dekton`,
      },
      {
        label: translations.materials.granite[locale],
        href: `/${locale}/${stoneBase}/${locale === 'lv' ? 'granits' : locale === 'ru' ? 'granit' : 'granite'}`,
      },
      {
        label: translations.materials.marble[locale],
        href: `/${locale}/${stoneBase}/${locale === 'lv' ? 'marmors' : locale === 'ru' ? 'mramor' : 'marble'}`,
      },
    ],
  },
  {
    label: translations.nav.projects[locale],
    href: `/${locale}/${locale === 'lv' ? 'projekti' : locale === 'ru' ? 'proekty' : 'projects'}`,
  },
  {
    label: translations.nav.about[locale],
    href: `/${locale}/${locale === 'lv' ? 'par-mums' : locale === 'ru' ? 'o-nas' : 'about-us'}`,
  },
  {
    label: locale === 'lv' ? 'Kontakti' : locale === 'en' ? 'Contacts' : 'Контакты',
    href: `/${locale}/${locale === 'lv' ? 'par-mums' : locale === 'ru' ? 'o-nas' : 'about-us'}#contact`,
  },
]}

interface NavLinkProps {
  item: {
    label: string
    href: string
    children?: Array<{ label: string; href: string }>
  }
  scrolled: boolean
  mobileMenuOpen: boolean
  openDropdown: string | null
  setOpenDropdown: (href: string | null) => void
}

function NavLink({ item, scrolled, mobileMenuOpen, openDropdown, setOpenDropdown }: NavLinkProps) {
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

  const isDropdownOpen = openDropdown === item.href
  const isActive = isHovered || isDropdownOpen

  return (
    <div
      className="relative group"
      onMouseEnter={() => item.children && setOpenDropdown(item.href)}
      onMouseLeave={() => setOpenDropdown(null)}
    >
      <Link
        ref={linkRef}
        href={item.href}
        className={`flex items-center justify-center gap-1 text-sm font-button font-medium transition-all duration-250 py-2 px-3 rounded-lg relative group/link overflow-hidden ${
          isActive ? 'text-white' : 'text-white/90 hover:text-white'
        }`}
        style={{ 
          textShadow: !scrolled && !mobileMenuOpen ? '0 2px 8px rgba(0,0,0,0.8)' : 'none' 
        }}
        onMouseEnter={(e) => {
          setIsHovered(true)
          handleMouseMove(e)
        }}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Glassmorphism hover effect - active on hover or when dropdown is open */}
        <div className={`absolute inset-0 rounded-lg bg-white/5 backdrop-blur-sm border border-white/10 transition-all duration-250 ${
          isActive ? 'opacity-100 -translate-y-0.5 scale-[1.02] shadow-lg shadow-black/20' : 'opacity-0 group-hover/link:opacity-100 group-hover/link:-translate-y-0.5 group-hover/link:scale-[1.02] group-hover/link:shadow-lg group-hover/link:shadow-black/20'
        }`} />
        
        {/* Dynamic gloss/shine effect that follows mouse - active on hover or when dropdown is open */}
        <div
          className={`absolute inset-0 rounded-lg transition-opacity duration-250 pointer-events-none ${
            isActive ? 'opacity-100' : 'opacity-0 group-hover/link:opacity-100'
          }`}
          style={{
            background: `radial-gradient(circle 150px at ${mousePosition.x}% ${mousePosition.y}%, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0.05) 40%, transparent 70%)`,
            transform: `translate(${(mousePosition.x - 50) * 0.1}px, ${(mousePosition.y - 50) * 0.1}px)`,
            transition: isActive ? 'background 0.1s ease-out, transform 0.1s ease-out' : 'opacity 0.25s ease-out',
            willChange: 'background, transform',
          }}
        />
        
        {/* Subtle glow effect that follows mouse - active on hover or when dropdown is open */}
        <div
          className={`absolute inset-0 rounded-lg transition-opacity duration-250 pointer-events-none blur-xl ${
            isActive ? 'opacity-60' : 'opacity-0 group-hover/link:opacity-60'
          }`}
          style={{
            background: `radial-gradient(circle 100px at ${mousePosition.x}% ${mousePosition.y}%, rgba(201, 169, 98, 0.3) 0%, transparent 60%)`,
            transform: `translate(${(mousePosition.x - 50) * 0.15}px, ${(mousePosition.y - 50) * 0.15}px)`,
            transition: isActive ? 'background 0.15s ease-out, transform 0.15s ease-out' : 'opacity 0.25s ease-out',
            willChange: 'background, transform',
          }}
        />
        
        <span className="relative z-10">{item.label}</span>
        {item.children && (
          <ChevronDown className={`w-4 h-4 transition-transform duration-300 relative z-10 ${
            isDropdownOpen ? 'rotate-180' : 'group-hover:rotate-180'
          }`} />
        )}
      </Link>
      
      {/* Dropdown menu - fully opaque solid background for readability */}
      {item.children && openDropdown === item.href && (
        <div className="absolute top-full left-0 pt-4 animate-fade-in-down">
          <div 
            className="rounded-lg py-3 min-w-[220px] border border-lago-gold/20"
            style={{ 
              backgroundColor: '#0a0a0a',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.9), 0 0 0 1px rgba(255, 255, 255, 0.05)'
            }}
          >
            {item.children.map((child) => (
              <Link
                key={child.href}
                href={child.href}
                className="block px-5 py-3 text-sm font-button text-lago-light hover:text-lago-gold hover:bg-white/5 transition-all duration-200 hover:pl-7"
              >
                {child.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export function Header({ locale, alternateUrls }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)
  const [scrolled, setScrolled] = useState(false)
  
  const navigation = getNavigation(locale)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [mobileMenuOpen])

  return (
    <>
      {/* Header - Transparent initially, opaque on scroll */}
      <header 
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled || mobileMenuOpen
            ? 'bg-lago-black/95 backdrop-blur-md py-3 shadow-xl shadow-black/50' 
            : 'bg-transparent py-5'
        }`}
      >
        <nav className="container-lg">
          <div className="flex items-center justify-between gap-4 lg:gap-8 lg:flex-nowrap">
            {/* Logo */}
            <Link
              href={`/${locale}`}
              className="relative group flex items-center -ml-4 md:-ml-6 flex-shrink-0"
            >
              <div className="relative h-16 w-[140px] px-1.5 py-1 transition-transform duration-300 group-hover:scale-[1.02] flex items-center justify-center">
                {/* PERFORMANCE: Using next/image with PNG for better optimization (SVGs not optimized by Next.js) */}
                <Image
                  src="/images/logo/lago-logo.png"
                  alt="LAGO Logo"
                  width={140}
                  height={90}
                  className="object-contain w-full h-full"
                  style={{
                    filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.5)) drop-shadow(0 4px 8px rgba(0,0,0,0.3))'
                  }}
                  priority // Header logo is above fold - prioritize for LCP
                  quality={85} // Optimized quality for faster load
                  sizes="(max-width: 768px) 140px, 140px"
                  fetchPriority="high" // Explicit high priority for LCP
                  unoptimized={false} // Ensure Next.js optimization is enabled
                />
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex lg:items-center lg:gap-8 lg:flex-1 lg:justify-center lg:min-w-0 whitespace-nowrap">
              {navigation.map((item, index) => (
                <NavLink
                  key={item.href}
                  item={item}
                  scrolled={scrolled}
                  mobileMenuOpen={mobileMenuOpen}
                  openDropdown={openDropdown}
                  setOpenDropdown={setOpenDropdown}
                />
              ))}
            </div>

            {/* Right side: Language switcher + Social */}
            <div 
              className="hidden lg:flex items-center gap-4 lg:gap-6 flex-shrink-0"
              style={{ 
                textShadow: !scrolled && !mobileMenuOpen ? '0 2px 8px rgba(0,0,0,0.8)' : 'none' 
              }}
            >
              <LanguageSwitcher 
                currentLocale={locale} 
                alternateUrls={alternateUrls}
              />
              <div className="flex items-center gap-3">
                <a
                  href="https://www.facebook.com/LAGO.lv/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 text-white/80 hover:text-lago-gold transition-colors duration-300 hover:scale-110"
                  aria-label="Facebook"
                >
                  <Facebook className="w-5 h-5" />
                </a>
                <a
                  href="https://www.instagram.com/lago_stone/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 text-white/80 hover:text-lago-gold transition-colors duration-300 hover:scale-110"
                  aria-label="Instagram"
                >
                  <Instagram className="w-5 h-5" />
                </a>
              </div>
            </div>
            
            {/* Mobile menu button */}
            <button
              type="button"
              className="lg:hidden p-2 text-white hover:text-lago-gold transition-all duration-300"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-expanded={mobileMenuOpen}
              aria-label="Toggle menu"
              style={{ 
                filter: !scrolled && !mobileMenuOpen ? 'drop-shadow(0 2px 4px rgba(0,0,0,0.8))' : 'none' 
              }}
            >
              <div className="relative w-6 h-6">
                <span className={`absolute left-0 w-6 h-0.5 bg-current transform transition-all duration-300 ${mobileMenuOpen ? 'top-3 rotate-45' : 'top-1'}`} />
                <span className={`absolute left-0 top-3 w-6 h-0.5 bg-current transition-all duration-300 ${mobileMenuOpen ? 'opacity-0 scale-0' : 'opacity-100 scale-100'}`} />
                <span className={`absolute left-0 w-6 h-0.5 bg-current transform transition-all duration-300 ${mobileMenuOpen ? 'top-3 -rotate-45' : 'top-5'}`} />
              </div>
            </button>
          </div>
        </nav>
      </header>

      {/* Mobile Navigation - Full screen overlay with solid opaque background */}
      <div 
        className={`lg:hidden fixed inset-0 z-40 transition-all duration-500 ${
          mobileMenuOpen 
            ? 'opacity-100 pointer-events-auto' 
            : 'opacity-0 pointer-events-none'
        }`}
      >
        {/* Fully opaque solid backdrop */}
        <div 
          className="absolute inset-0"
          style={{ backgroundColor: '#0a0a0a' }}
          onClick={() => setMobileMenuOpen(false)}
        />
        
        {/* Menu content with solid opaque background */}
        <div 
          className={`relative h-full pt-20 overflow-y-auto transition-transform duration-500 ${
            mobileMenuOpen ? 'translate-y-0' : '-translate-y-10'
          }`}
          style={{ backgroundColor: '#0a0a0a' }}
        >
          <div className="container-lg py-8">
            {/* Decorative line at top */}
            <div className="w-16 h-[2px] bg-gradient-to-r from-lago-gold to-transparent mb-8" />
            
            <div className="space-y-1">
              {navigation.map((item, index) => (
                <div 
                  key={item.href}
                  className={`transform transition-all duration-500 ${
                    mobileMenuOpen 
                      ? 'translate-x-0 opacity-100' 
                      : '-translate-x-10 opacity-0'
                  }`}
                  style={{ transitionDelay: mobileMenuOpen ? `${index * 100}ms` : '0ms' }}
                >
                  <Link
                    href={item.href}
                    className="block py-4 text-2xl text-white hover:text-lago-gold transition-colors font-button"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {item.label}
                  </Link>
                  {item.children && (
                    <div className="pl-6 space-y-2 pb-4 border-l-2 border-lago-gold/30 ml-2">
                      {item.children.map((child, childIndex) => (
                        <Link
                          key={child.href}
                          href={child.href}
                          className={`block py-2 text-base font-button text-lago-light hover:text-lago-gold transition-all duration-300 ${
                            mobileMenuOpen 
                              ? 'translate-x-0 opacity-100' 
                              : '-translate-x-5 opacity-0'
                          }`}
                          style={{ transitionDelay: mobileMenuOpen ? `${(index * 100) + (childIndex * 50) + 100}ms` : '0ms' }}
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
            
            {/* Mobile language switcher */}
            <div 
              className={`pt-8 mt-6 border-t border-white/10 transform transition-all duration-500 ${
                mobileMenuOpen 
                  ? 'translate-y-0 opacity-100' 
                  : 'translate-y-5 opacity-0'
              }`}
              style={{ transitionDelay: mobileMenuOpen ? '400ms' : '0ms' }}
            >
              <p className="text-lago-muted text-sm mb-4">
                {locale === 'lv' ? 'Valoda' : locale === 'en' ? 'Language' : 'Язык'}
              </p>
              <LanguageSwitcher 
                currentLocale={locale} 
                alternateUrls={alternateUrls}
              />
            </div>

            {/* Contact CTA */}
            <div 
              className={`mt-8 pt-8 border-t border-white/10 transform transition-all duration-500 ${
                mobileMenuOpen 
                  ? 'translate-y-0 opacity-100' 
                  : 'translate-y-5 opacity-0'
              }`}
              style={{ transitionDelay: mobileMenuOpen ? '500ms' : '0ms' }}
            >
              <NeonButton
                href="tel:+37167531550"
                variant="solid"
                size="lg"
                className="w-full"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Phone className="w-5 h-5" />
                (+371) 675 315 50
              </NeonButton>
            </div>

            {/* Social Media Links - Mobile */}
            <div 
              className={`mt-8 pt-8 border-t border-white/10 transform transition-all duration-500 ${
                mobileMenuOpen 
                  ? 'translate-y-0 opacity-100' 
                  : 'translate-y-5 opacity-0'
              }`}
              style={{ transitionDelay: mobileMenuOpen ? '600ms' : '0ms' }}
            >
              <p className="text-lago-muted text-sm mb-4">
                {locale === 'lv' ? 'Sekojiet mums' : locale === 'en' ? 'Follow us' : 'Подписывайтесь'}
              </p>
              <div className="flex gap-4">
                {/* Facebook Button */}
                <a
                  href="https://www.facebook.com/LAGO.lv/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`group relative flex-1 transform transition-all duration-500 ${
                    mobileMenuOpen 
                      ? 'translate-x-0 opacity-100 scale-100' 
                      : '-translate-x-8 opacity-0 scale-95'
                  }`}
                  style={{ transitionDelay: mobileMenuOpen ? '650ms' : '0ms' }}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {/* Animated gradient border */}
                  <div className="absolute -inset-0.5 rounded-xl bg-gradient-to-r from-[#1877F2] via-[#4267B2] to-[#1877F2] opacity-50 group-hover:opacity-100 blur-sm transition-all duration-500 group-hover:blur-md animate-gradient-x" />
                  
                  {/* Button content */}
                  <div className="relative flex items-center justify-center gap-3 px-6 py-4 rounded-xl bg-lago-dark border border-white/10 group-hover:border-[#1877F2]/50 transition-all duration-300 group-hover:bg-lago-dark/80">
                    {/* Icon container with glow */}
                    <div className="relative">
                      <div className="absolute inset-0 rounded-full bg-[#1877F2]/30 blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      <Facebook className="relative w-6 h-6 text-white group-hover:text-[#1877F2] transition-colors duration-300 group-hover:scale-110 transform" />
                    </div>
                    <span className="text-sm font-medium text-white group-hover:text-[#1877F2] transition-colors duration-300">
                      Lago Stone
                    </span>
                    
                    {/* Shimmer effect */}
                    <div className="absolute inset-0 rounded-xl overflow-hidden">
                      <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                    </div>
                  </div>
                </a>

                {/* Instagram Button */}
                <a
                  href="https://www.instagram.com/lago_stone/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`group relative flex-1 transform transition-all duration-500 ${
                    mobileMenuOpen 
                      ? 'translate-x-0 opacity-100 scale-100' 
                      : 'translate-x-8 opacity-0 scale-95'
                  }`}
                  style={{ transitionDelay: mobileMenuOpen ? '700ms' : '0ms' }}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {/* Animated gradient border - Instagram colors */}
                  <div className="absolute -inset-0.5 rounded-xl bg-gradient-to-r from-[#833AB4] via-[#FD1D1D] to-[#F77737] opacity-50 group-hover:opacity-100 blur-sm transition-all duration-500 group-hover:blur-md animate-gradient-x" />
                  
                  {/* Button content */}
                  <div className="relative flex items-center justify-center gap-3 px-6 py-4 rounded-xl bg-lago-dark border border-white/10 group-hover:border-[#E1306C]/50 transition-all duration-300 group-hover:bg-lago-dark/80">
                    {/* Icon container with glow */}
                    <div className="relative">
                      <div className="absolute inset-0 rounded-full bg-gradient-to-r from-[#833AB4] via-[#FD1D1D] to-[#F77737] blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      <Instagram className="relative w-6 h-6 text-white group-hover:text-[#E1306C] transition-colors duration-300 group-hover:scale-110 transform" />
                    </div>
                    <span className="text-sm font-medium text-white group-hover:text-[#E1306C] transition-colors duration-300">
                      @lago_stone
                    </span>
                    
                    {/* Shimmer effect */}
                    <div className="absolute inset-0 rounded-xl overflow-hidden">
                      <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                    </div>
                  </div>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

