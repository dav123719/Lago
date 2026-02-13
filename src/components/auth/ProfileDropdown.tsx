// ============================================
// Profile Dropdown Component (Authenticated User)
// ============================================
// AGENT slave-4 v1.0.1 - Auth system verified

'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { User, ShoppingBag, MapPin, LogOut, ChevronDown } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { Locale } from '@/lib/i18n/config'
import { Database } from '@/lib/supabase/database.types'

type Profile = Database['public']['Tables']['profiles']['Row']

interface ProfileDropdownProps {
  locale: Locale
  mobile?: boolean
  profile: Profile | null
}

const labels = {
  lv: {
    profile: 'Profils',
    orders: 'Mani pasūtījumi',
    addresses: 'Adreses',
    logout: 'Iziet',
    greeting: 'Sveiki',
  },
  en: {
    profile: 'Profile',
    orders: 'My Orders',
    addresses: 'Addresses',
    logout: 'Logout',
    greeting: 'Hello',
  },
  ru: {
    profile: 'Профиль',
    orders: 'Мои заказы',
    addresses: 'Адреса',
    logout: 'Выйти',
    greeting: 'Здравствуйте',
  },
}

// Get account paths based on locale
const getAccountPaths = (locale: Locale) => ({
  account: `/${locale}/account`,
  orders: `/${locale}/account/orders`,
  addresses: `/${locale}/account/addresses`,
})

export function ProfileDropdown({ locale, mobile, profile }: ProfileDropdownProps) {
  const { signOut, user } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const t = labels[locale]
  const paths = getAccountPaths(locale)

  // Get user's display name
  const displayName = profile?.first_name && profile?.last_name
    ? `${profile.first_name} ${profile.last_name}`
    : profile?.first_name
      ? profile.first_name
      : user?.email?.split('@')[0] || t.greeting

  // Get avatar URL or use placeholder
  const avatarUrl = profile?.avatar_url

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen])

  const handleLogout = async () => {
    await signOut()
    setIsOpen(false)
  }

  if (mobile) {
    return (
      <div className="space-y-3">
        {/* User info */}
        <div className="flex items-center gap-3 py-4 border-b border-white/10">
          <div className="w-12 h-12 rounded-full bg-lago-gold/10 border border-lago-gold/30 flex items-center justify-center overflow-hidden">
            {avatarUrl ? (
              <Image
                src={avatarUrl}
                alt={displayName}
                width={48}
                height={48}
                className="w-full h-full object-cover"
              />
            ) : (
              <User className="w-6 h-6 text-lago-gold" />
            )}
          </div>
          <div>
            <p className="text-white font-medium">{displayName}</p>
            <p className="text-lago-muted text-sm">{user?.email}</p>
          </div>
        </div>

        {/* Menu items */}
        <div className="space-y-1 pl-4">
          <Link
            href={paths.account}
            className="flex items-center gap-3 py-3 text-lago-light hover:text-lago-gold transition-colors font-button"
            onClick={() => setIsOpen(false)}
          >
            <User className="w-5 h-5" />
            {t.profile}
          </Link>
          <Link
            href={paths.orders}
            className="flex items-center gap-3 py-3 text-lago-light hover:text-lago-gold transition-colors font-button"
            onClick={() => setIsOpen(false)}
          >
            <ShoppingBag className="w-5 h-5" />
            {t.orders}
          </Link>
          <Link
            href={paths.addresses}
            className="flex items-center gap-3 py-3 text-lago-light hover:text-lago-gold transition-colors font-button"
            onClick={() => setIsOpen(false)}
          >
            <MapPin className="w-5 h-5" />
            {t.addresses}
          </Link>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 py-3 text-lago-light hover:text-lago-gold transition-colors font-button w-full text-left"
          >
            <LogOut className="w-5 h-5" />
            {t.logout}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 p-2 rounded-lg hover:bg-white/5 transition-all duration-300"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <div className="w-8 h-8 rounded-full bg-lago-gold/10 border border-lago-gold/30 flex items-center justify-center overflow-hidden">
          {avatarUrl ? (
            <Image
              src={avatarUrl}
              alt={displayName}
              width={32}
              height={32}
              className="w-full h-full object-cover"
            />
          ) : (
            <User className="w-4 h-4 text-lago-gold" />
          )}
        </div>
        <span className="hidden xl:block text-sm font-button font-medium text-white/90 hover:text-white max-w-[120px] truncate">
          {displayName}
        </span>
        <ChevronDown className={`w-4 h-4 text-white/60 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div
          className="absolute top-full right-0 mt-4 w-64 animate-fade-in-down z-50"
          onMouseLeave={() => setIsOpen(false)}
        >
          <div
            className="rounded-xl py-3 border border-lago-gold/20"
            style={{
              backgroundColor: '#0a0a0a',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.9), 0 0 0 1px rgba(255, 255, 255, 0.05)',
            }}
          >
            {/* User info header */}
            <div className="px-4 py-3 border-b border-white/10">
              <p className="text-white font-medium truncate">{displayName}</p>
              <p className="text-lago-muted text-sm truncate">{user?.email}</p>
            </div>

            {/* Menu items */}
            <div className="py-2">
              <Link
                href={paths.account}
                className="flex items-center gap-3 px-4 py-2.5 text-lago-light hover:text-lago-gold hover:bg-white/5 transition-all duration-200"
                onClick={() => setIsOpen(false)}
              >
                <User className="w-4 h-4" />
                <span className="text-sm font-button">{t.profile}</span>
              </Link>
              <Link
                href={paths.orders}
                className="flex items-center gap-3 px-4 py-2.5 text-lago-light hover:text-lago-gold hover:bg-white/5 transition-all duration-200"
                onClick={() => setIsOpen(false)}
              >
                <ShoppingBag className="w-4 h-4" />
                <span className="text-sm font-button">{t.orders}</span>
              </Link>
              <Link
                href={paths.addresses}
                className="flex items-center gap-3 px-4 py-2.5 text-lago-light hover:text-lago-gold hover:bg-white/5 transition-all duration-200"
                onClick={() => setIsOpen(false)}
              >
                <MapPin className="w-4 h-4" />
                <span className="text-sm font-button">{t.addresses}</span>
              </Link>
            </div>

            {/* Logout */}
            <div className="border-t border-white/10 pt-2">
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 px-4 py-2.5 text-lago-light hover:text-lago-gold hover:bg-white/5 transition-all duration-200 w-full text-left"
              >
                <LogOut className="w-4 h-4" />
                <span className="text-sm font-button">{t.logout}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
