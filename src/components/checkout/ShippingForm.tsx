// ===================================
// Shipping Form Component
// ===================================

'use client'

import { useState } from 'react'
import { NeonButton } from '@/components/ui/NeonButton'
import type { ShippingAddress } from '@/types/checkout'
import type { Locale } from '@/lib/i18n/config'

interface ShippingFormProps {
  locale: Locale
  initialAddress?: Partial<ShippingAddress>
  onSubmit: (address: ShippingAddress) => void
  isLoading?: boolean
}

const translations = {
  title: {
    lv: 'Piegādes informācija',
    en: 'Shipping Information',
    ru: 'Информация о доставке',
  },
  firstName: {
    lv: 'Vārds',
    en: 'First Name',
    ru: 'Имя',
  },
  lastName: {
    lv: 'Uzvārds',
    en: 'Last Name',
    ru: 'Фамилия',
  },
  email: {
    lv: 'E-pasts',
    en: 'Email',
    ru: 'Email',
  },
  phone: {
    lv: 'Telefons',
    en: 'Phone',
    ru: 'Телефон',
  },
  company: {
    lv: 'Uzņēmums (neobligāti)',
    en: 'Company (optional)',
    ru: 'Компания (необязательно)',
  },
  vatNumber: {
    lv: 'PVN numurs (neobligāti)',
    en: 'VAT Number (optional)',
    ru: 'Номер НДС (необязательно)',
  },
  country: {
    lv: 'Valsts',
    en: 'Country',
    ru: 'Страна',
  },
  city: {
    lv: 'Pilsēta',
    en: 'City',
    ru: 'Город',
  },
  postalCode: {
    lv: 'Pasta indekss',
    en: 'Postal Code',
    ru: 'Почтовый индекс',
  },
  address: {
    lv: 'Adrese',
    en: 'Address',
    ru: 'Адрес',
  },
  address2: {
    lv: 'Adrese 2 (neobligāti)',
    en: 'Address 2 (optional)',
    ru: 'Адрес 2 (необязательно)',
  },
  continue: {
    lv: 'Turpināt',
    en: 'Continue',
    ru: 'Продолжить',
  },
  errors: {
    required: {
      lv: 'Šis lauks ir obligāts',
      en: 'This field is required',
      ru: 'Это поле обязательно',
    },
    invalidEmail: {
      lv: 'Lūdzu, ievadiet derīgu e-pastu',
      en: 'Please enter a valid email',
      ru: 'Пожалуйста, введите действительный email',
    },
    invalidPhone: {
      lv: 'Lūdzu, ievadiet derīgu telefona numuru',
      en: 'Please enter a valid phone number',
      ru: 'Пожалуйста, введите действительный номер телефона',
    },
  },
}

const countries = [
  { code: 'LV', name: { lv: 'Latvija', en: 'Latvia', ru: 'Латвия' } },
  { code: 'LT', name: { lv: 'Lietuva', en: 'Lithuania', ru: 'Литва' } },
  { code: 'EE', name: { lv: 'Igaunija', en: 'Estonia', ru: 'Эстония' } },
  { code: 'FI', name: { lv: 'Somija', en: 'Finland', ru: 'Финляндия' } },
  { code: 'SE', name: { lv: 'Zviedrija', en: 'Sweden', ru: 'Швеция' } },
  { code: 'DE', name: { lv: 'Vācija', en: 'Germany', ru: 'Германия' } },
  { code: 'PL', name: { lv: 'Polija', en: 'Poland', ru: 'Польша' } },
]

export function ShippingForm({ 
  locale, 
  initialAddress, 
  onSubmit, 
  isLoading 
}: ShippingFormProps) {
  const t = (key: Exclude<keyof typeof translations, 'errors'>) => translations[key][locale]
  const te = (key: keyof typeof translations.errors) => translations.errors[key][locale]

  const [formData, setFormData] = useState<ShippingAddress>({
    firstName: initialAddress?.firstName || '',
    lastName: initialAddress?.lastName || '',
    email: initialAddress?.email || '',
    phone: initialAddress?.phone || '',
    country: initialAddress?.country || 'LV',
    city: initialAddress?.city || '',
    postalCode: initialAddress?.postalCode || '',
    addressLine1: initialAddress?.addressLine1 || '',
    addressLine2: initialAddress?.addressLine2 || '',
    companyName: initialAddress?.companyName || '',
    vatNumber: initialAddress?.vatNumber || '',
  })

  const [errors, setErrors] = useState<Partial<Record<keyof ShippingAddress, string>>>({})

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof ShippingAddress, string>> = {}

    if (!formData.firstName.trim()) newErrors.firstName = te('required')
    if (!formData.lastName.trim()) newErrors.lastName = te('required')
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!formData.email.trim()) {
      newErrors.email = te('required')
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = te('invalidEmail')
    }

    const phoneRegex = /^[+]?[\d\s-]{8,}$/
    if (!formData.phone.trim()) {
      newErrors.phone = te('required')
    } else if (!phoneRegex.test(formData.phone)) {
      newErrors.phone = te('invalidPhone')
    }

    if (!formData.country) newErrors.country = te('required')
    if (!formData.city.trim()) newErrors.city = te('required')
    if (!formData.postalCode.trim()) newErrors.postalCode = te('required')
    if (!formData.addressLine1.trim()) newErrors.addressLine1 = te('required')

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (validate()) {
      onSubmit(formData)
    }
  }

  const handleChange = (field: keyof ShippingAddress, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when field is edited
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  const inputClass = (field: keyof ShippingAddress) => `
    w-full px-4 py-3 rounded-lg
    bg-lago-charcoal border
    ${errors[field] ? 'border-red-500' : 'border-lago-gray/50'}
    text-white placeholder-lago-muted
    focus:border-lago-gold focus:ring-1 focus:ring-lago-gold/50
    transition-colors
  `

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <h2 className="text-xl font-medium text-white">{t('title')}</h2>

      {/* Name Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-lago-light mb-2">
            {t('firstName')}
          </label>
          <input
            type="text"
            value={formData.firstName}
            onChange={(e) => handleChange('firstName', e.target.value)}
            className={inputClass('firstName')}
            placeholder="John"
          />
          {errors.firstName && (
            <p className="text-red-400 text-xs mt-1">{errors.firstName}</p>
          )}
        </div>
        <div>
          <label className="block text-sm text-lago-light mb-2">
            {t('lastName')}
          </label>
          <input
            type="text"
            value={formData.lastName}
            onChange={(e) => handleChange('lastName', e.target.value)}
            className={inputClass('lastName')}
            placeholder="Doe"
          />
          {errors.lastName && (
            <p className="text-red-400 text-xs mt-1">{errors.lastName}</p>
          )}
        </div>
      </div>

      {/* Contact Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-lago-light mb-2">
            {t('email')}
          </label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => handleChange('email', e.target.value)}
            className={inputClass('email')}
            placeholder="john@example.com"
          />
          {errors.email && (
            <p className="text-red-400 text-xs mt-1">{errors.email}</p>
          )}
        </div>
        <div>
          <label className="block text-sm text-lago-light mb-2">
            {t('phone')}
          </label>
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => handleChange('phone', e.target.value)}
            className={inputClass('phone')}
            placeholder="+371 20000000"
          />
          {errors.phone && (
            <p className="text-red-400 text-xs mt-1">{errors.phone}</p>
          )}
        </div>
      </div>

      {/* Company (Optional) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-lago-light mb-2">
            {t('company')}
          </label>
          <input
            type="text"
            value={formData.companyName}
            onChange={(e) => handleChange('companyName', e.target.value)}
            className={inputClass('companyName')}
          />
        </div>
        <div>
          <label className="block text-sm text-lago-light mb-2">
            {t('vatNumber')}
          </label>
          <input
            type="text"
            value={formData.vatNumber}
            onChange={(e) => handleChange('vatNumber', e.target.value)}
            className={inputClass('vatNumber')}
            placeholder="LV12345678901"
          />
        </div>
      </div>

      {/* Country */}
      <div>
        <label className="block text-sm text-lago-light mb-2">
          {t('country')}
        </label>
        <select
          value={formData.country}
          onChange={(e) => handleChange('country', e.target.value)}
          className={`${inputClass('country')} appearance-none cursor-pointer`}
        >
          {countries.map(country => (
            <option key={country.code} value={country.code}>
              {country.name[locale]}
            </option>
          ))}
        </select>
      </div>

      {/* City & Postal Code */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-lago-light mb-2">
            {t('city')}
          </label>
          <input
            type="text"
            value={formData.city}
            onChange={(e) => handleChange('city', e.target.value)}
            className={inputClass('city')}
            placeholder="Rīga"
          />
          {errors.city && (
            <p className="text-red-400 text-xs mt-1">{errors.city}</p>
          )}
        </div>
        <div>
          <label className="block text-sm text-lago-light mb-2">
            {t('postalCode')}
          </label>
          <input
            type="text"
            value={formData.postalCode}
            onChange={(e) => handleChange('postalCode', e.target.value)}
            className={inputClass('postalCode')}
            placeholder="LV-1001"
          />
          {errors.postalCode && (
            <p className="text-red-400 text-xs mt-1">{errors.postalCode}</p>
          )}
        </div>
      </div>

      {/* Address */}
      <div>
        <label className="block text-sm text-lago-light mb-2">
          {t('address')}
        </label>
        <input
          type="text"
          value={formData.addressLine1}
          onChange={(e) => handleChange('addressLine1', e.target.value)}
          className={inputClass('addressLine1')}
          placeholder="Brīvības iela 123, dz. 45"
        />
        {errors.addressLine1 && (
          <p className="text-red-400 text-xs mt-1">{errors.addressLine1}</p>
        )}
      </div>

      {/* Address 2 */}
      <div>
        <label className="block text-sm text-lago-light mb-2">
          {t('address2')}
        </label>
        <input
          type="text"
          value={formData.addressLine2}
          onChange={(e) => handleChange('addressLine2', e.target.value)}
          className={inputClass('addressLine2')}
        />
      </div>

      {/* Submit Button */}
      <NeonButton
        type="submit"
        variant="solid"
        size="lg"
        className="w-full"
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <div className="w-5 h-5 border-2 border-lago-black/30 border-t-lago-black rounded-full animate-spin" />
            Loading...
          </>
        ) : (
          <>
            {t('continue')}
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </>
        )}
      </NeonButton>
    </form>
  )
}
