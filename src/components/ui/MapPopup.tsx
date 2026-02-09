'use client'

import { useState } from 'react'
import { X, MapPin, Navigation, Copy, Check } from 'lucide-react'
import { companyInfo } from '@/content/company'

interface MapPopupProps {
  isOpen: boolean
  onClose: () => void
  locale: 'lv' | 'en' | 'ru'
}

export function MapPopup({ isOpen, onClose, locale }: MapPopupProps) {
  const [copied, setCopied] = useState(false)

  if (!isOpen) return null

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

  const labels = {
    lv: {
      title: 'Atvērt kartē',
      google: 'Google Maps',
      waze: 'Waze',
      close: 'Aizvērt',
    },
    en: {
      title: 'Open in Maps',
      google: 'Google Maps',
      waze: 'Waze',
      close: 'Close',
    },
    ru: {
      title: 'Открыть на карте',
      google: 'Google Maps',
      waze: 'Waze',
      close: 'Закрыть',
    },
  }

  const t = labels[locale]

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      
      {/* Popup */}
      <div 
        className="relative bg-lago-charcoal rounded-2xl border border-white/20 shadow-2xl max-w-md w-full p-6 md:p-8 animate-fade-in-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-lg bg-lago-dark/50 hover:bg-lago-dark border border-white/10 hover:border-lago-gold/50 transition-all duration-300 text-lago-muted hover:text-white"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Title */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-xl bg-lago-gold/10 flex items-center justify-center">
            <MapPin className="w-6 h-6 text-lago-gold" />
          </div>
          <h3 className="text-xl font-heading text-white">
            {t.title}
          </h3>
        </div>

        {/* Address - Click to copy */}
        <button
          onClick={handleCopyAddress}
          className="group/address w-full text-left mb-6 p-3 rounded-lg bg-lago-dark/30 hover:bg-lago-dark/50 border border-transparent hover:border-lago-gold/30 transition-all duration-300 cursor-pointer"
        >
          <div className="flex items-center justify-between gap-3">
            <p className="text-lago-light text-sm flex-1">
              {fullAddress}
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
          </div>
        </button>

        {/* Buttons */}
        <div className="flex flex-col gap-3">
          <a
            href={googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center justify-between p-4 rounded-xl bg-lago-dark/50 hover:bg-lago-dark border border-white/10 hover:border-lago-gold/50 transition-all duration-300"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center group-hover:bg-blue-500/20 transition-colors">
                <MapPin className="w-5 h-5 text-blue-400" />
              </div>
              <span className="text-white font-medium">{t.google}</span>
            </div>
            <Navigation className="w-5 h-5 text-lago-muted group-hover:text-lago-gold transform group-hover:translate-x-1 transition-all" />
          </a>

          <a
            href={wazeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center justify-between p-4 rounded-xl bg-lago-dark/50 hover:bg-lago-dark border border-white/10 hover:border-lago-gold/50 transition-all duration-300"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center group-hover:bg-purple-500/20 transition-colors">
                <Navigation className="w-5 h-5 text-purple-400" />
              </div>
              <span className="text-white font-medium">{t.waze}</span>
            </div>
            <Navigation className="w-5 h-5 text-lago-muted group-hover:text-lago-gold transform group-hover:translate-x-1 transition-all" />
          </a>
        </div>
      </div>
    </div>
  )
}

