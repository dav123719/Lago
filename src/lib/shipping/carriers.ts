// ===================================
// Shipping Carriers Configuration
// ===================================

import type { CarrierType, ShippingMethod, ParcelLocker } from '@/types/checkout'
import type { Locale } from '@/lib/i18n/config'

// ===================================
// Carrier Definitions
// ===================================

export interface CarrierConfig {
  id: CarrierType
  name: string
  nameLocalized: Record<Locale, string>
  logo: string
  website: string
  phone: string
  trackingUrl: string
  countries: string[]
  features: string[]
}

export const carriers: Record<CarrierType, CarrierConfig> = {
  omniva: {
    id: 'omniva',
    name: 'Omniva',
    nameLocalized: {
      lv: 'Omniva',
      en: 'Omniva',
      ru: 'Omniva',
    },
    logo: '/images/carriers/omniva.svg',
    website: 'https://www.omniva.lv',
    phone: '+371 28449988',
    trackingUrl: 'https://www.omniva.lv/privats/sutijuma_izsekosana?barcode={trackingNumber}',
    countries: ['LV', 'LT', 'EE', 'FI', 'SE', 'DE', 'PL'],
    features: ['Parcel lockers', 'Home delivery', 'Express delivery'],
  },
  dpd: {
    id: 'dpd',
    name: 'DPD',
    nameLocalized: {
      lv: 'DPD',
      en: 'DPD',
      ru: 'DPD',
    },
    logo: '/images/carriers/dpd.svg',
    website: 'https://www.dpd.com/lv/lv',
    phone: '+371 67747111',
    trackingUrl: 'https://tracking.dpd.de/status/lv_LV/parcel/{trackingNumber}',
    countries: ['LV', 'LT', 'EE', 'DE', 'PL', 'FI', 'SE', 'DK', 'NL', 'BE', 'AT'],
    features: ['Parcel lockers', 'Home delivery', 'Predict service', 'Express delivery'],
  },
  latvijas_pasts: {
    id: 'latvijas_pasts',
    name: 'Latvijas Pasts',
    nameLocalized: {
      lv: 'Latvijas Pasts',
      en: 'Latvian Post',
      ru: 'Латвийская Почта',
    },
    logo: '/images/carriers/latvijas-pasts.svg',
    website: 'https://www.pasts.lv',
    phone: '+371 67008001',
    trackingUrl: 'https://www.pasts.lv/lv/Category/Tranzita_Izsekosana/?id={trackingNumber}',
    countries: ['LV', 'LT', 'EE', 'US', 'CA', 'GB', 'DE', 'FR', 'IT', 'ES', 'PL'],
    features: ['Post offices', 'Home delivery', 'International delivery', 'Registered mail'],
  },
  pickup: {
    id: 'pickup',
    name: 'Local Pickup',
    nameLocalized: {
      lv: 'Pašizņemšana',
      en: 'Local Pickup',
      ru: 'Самовывоз',
    },
    logo: '/images/carriers/pickup.svg',
    website: 'https://lago.lv',
    phone: '+371 67531550',
    trackingUrl: '',
    countries: ['LV'],
    features: ['Free pickup', 'Same day available', 'Personal service'],
  },
}

// ===================================
// Shipping Methods
// ===================================

export interface ShippingMethodConfig {
  id: string
  carrier: CarrierType
  name: string
  nameLocalized: Record<Locale, string>
  description: Record<Locale, string>
  basePrice: number
  freeShippingThreshold: number
  estimatedDays: string
  estimatedDaysLocalized: Record<Locale, string>
  isExpress: boolean
  requiresLocker: boolean
  maxWeightKg: number
  availableCountries: string[]
}

export const shippingMethods: ShippingMethodConfig[] = [
  // Omniva
  {
    id: 'omniva_locker',
    carrier: 'omniva',
    name: 'Omniva Parcel Locker',
    nameLocalized: {
      lv: 'Omniva Pakomāts',
      en: 'Omniva Parcel Locker',
      ru: 'Omniva Почтомат',
    },
    description: {
      lv: 'Saņemiet savā tuvākajā Omniva pakomātā',
      en: 'Pick up at your nearest Omniva locker',
      ru: 'Заберите в ближайшем почтомате Omniva',
    },
    basePrice: 2.99,
    freeShippingThreshold: 150,
    estimatedDays: '1-2',
    estimatedDaysLocalized: {
      lv: '1-2 darba dienas',
      en: '1-2 business days',
      ru: '1-2 рабочих дня',
    },
    isExpress: false,
    requiresLocker: true,
    maxWeightKg: 30,
    availableCountries: ['LV', 'LT', 'EE'],
  },
  {
    id: 'omniva_courier',
    carrier: 'omniva',
    name: 'Omniva Courier',
    nameLocalized: {
      lv: 'Omniva Kurjers',
      en: 'Omniva Courier',
      ru: 'Omniva Курьер',
    },
    description: {
      lv: 'Piegāde uz norādīto adresi',
      en: 'Delivery to your specified address',
      ru: 'Доставка по указанному адресу',
    },
    basePrice: 5.99,
    freeShippingThreshold: 250,
    estimatedDays: '1-2',
    estimatedDaysLocalized: {
      lv: '1-2 darba dienas',
      en: '1-2 business days',
      ru: '1-2 рабочих дня',
    },
    isExpress: false,
    requiresLocker: false,
    maxWeightKg: 50,
    availableCountries: ['LV', 'LT', 'EE', 'FI', 'SE'],
  },
  
  // DPD
  {
    id: 'dpd_locker',
    carrier: 'dpd',
    name: 'DPD Pickup Locker',
    nameLocalized: {
      lv: 'DPD Pickup Pakomāts',
      en: 'DPD Pickup Locker',
      ru: 'DPD Почтомат',
    },
    description: {
      lv: 'Saņemiet DPD Pickup pakomātā',
      en: 'Pick up at DPD Pickup locker',
      ru: 'Заберите в почтомате DPD',
    },
    basePrice: 2.99,
    freeShippingThreshold: 150,
    estimatedDays: '1-2',
    estimatedDaysLocalized: {
      lv: '1-2 darba dienas',
      en: '1-2 business days',
      ru: '1-2 рабочих дня',
    },
    isExpress: false,
    requiresLocker: true,
    maxWeightKg: 31.5,
    availableCountries: ['LV', 'LT', 'EE', 'PL'],
  },
  {
    id: 'dpd_home',
    carrier: 'dpd',
    name: 'DPD Home Delivery',
    nameLocalized: {
      lv: 'DPD Mājas Piegāde',
      en: 'DPD Home Delivery',
      ru: 'DPD Доставка на дом',
    },
    description: {
      lv: 'Piegāde uz mājas adresi ar sekojošanas pakalpojumu',
      en: 'Home delivery with Predict tracking',
      ru: 'Доставка на дом с сервисом Predict',
    },
    basePrice: 5.99,
    freeShippingThreshold: 250,
    estimatedDays: '1-2',
    estimatedDaysLocalized: {
      lv: '1-2 darba dienas',
      en: '1-2 business days',
      ru: '1-2 рабочих дня',
    },
    isExpress: false,
    requiresLocker: false,
    maxWeightKg: 31.5,
    availableCountries: ['LV', 'LT', 'EE', 'DE', 'PL', 'FI'],
  },
  
  // Latvijas Pasts
  {
    id: 'lp_standard',
    carrier: 'latvijas_pasts',
    name: 'Latvijas Pasts Standard',
    nameLocalized: {
      lv: 'Latvijas Pasts Standarta',
      en: 'Latvian Post Standard',
      ru: 'Латвийская Почта Стандарт',
    },
    description: {
      lv: 'Piegāde uz pasta nodaļu vai adresi',
      en: 'Delivery to post office or address',
      ru: 'Доставка в отделение или на адрес',
    },
    basePrice: 3.49,
    freeShippingThreshold: 150,
    estimatedDays: '2-4',
    estimatedDaysLocalized: {
      lv: '2-4 darba dienas',
      en: '2-4 business days',
      ru: '2-4 рабочих дня',
    },
    isExpress: false,
    requiresLocker: false,
    maxWeightKg: 30,
    availableCountries: ['LV', 'LT', 'EE'],
  },
  {
    id: 'lp_international',
    carrier: 'latvijas_pasts',
    name: 'International Delivery',
    nameLocalized: {
      lv: 'Starptautiskā Piegāde',
      en: 'International Delivery',
      ru: 'Международная Доставка',
    },
    description: {
      lv: 'Piegāde uz visu pasauli',
      en: 'Worldwide delivery',
      ru: 'Доставка по всему миру',
    },
    basePrice: 12.99,
    freeShippingThreshold: 500,
    estimatedDays: '5-14',
    estimatedDaysLocalized: {
      lv: '5-14 darba dienas',
      en: '5-14 business days',
      ru: '5-14 рабочих дней',
    },
    isExpress: false,
    requiresLocker: false,
    maxWeightKg: 30,
    availableCountries: ['US', 'CA', 'GB', 'DE', 'FR', 'IT', 'ES', 'PL', 'SE', 'FI', 'NO', 'DK'],
  },
  
  // Local Pickup
  {
    id: 'pickup_local',
    carrier: 'pickup',
    name: 'Pickup at LAGO Showroom',
    nameLocalized: {
      lv: 'Paņemšana LAGO Salonā',
      en: 'Pickup at LAGO Showroom',
      ru: 'Самовывоз в Шоуруме LAGO',
    },
    description: {
      lv: 'Bezmaksas paņemšana mūsu salonā Rīgā',
      en: 'Free pickup at our showroom in Riga',
      ru: 'Бесплатный самовывоз в нашем шоуруме в Риге',
    },
    basePrice: 0,
    freeShippingThreshold: 0,
    estimatedDays: 'Same day',
    estimatedDaysLocalized: {
      lv: 'Tajā pašā dienā',
      en: 'Same day',
      ru: 'В тот же день',
    },
    isExpress: false,
    requiresLocker: false,
    maxWeightKg: 1000,
    availableCountries: ['LV'],
  },
]

// ===================================
// Helper Functions
// ===================================

/**
 * Get shipping methods available for a country
 */
export function getMethodsForCountry(countryCode: string): ShippingMethodConfig[] {
  return shippingMethods.filter(method => 
    method.availableCountries.includes(countryCode.toUpperCase())
  )
}

/**
 * Get carrier configuration
 */
export function getCarrier(carrierId: CarrierType): CarrierConfig {
  return carriers[carrierId]
}

/**
 * Calculate shipping price with free shipping threshold
 */
export function calculateShippingPrice(
  method: ShippingMethodConfig,
  subtotal: number,
  weightKg: number = 0
): number {
  // Check weight limit
  if (weightKg > method.maxWeightKg) {
    throw new Error(`Package weight exceeds maximum of ${method.maxWeightKg}kg for this method`)
  }

  // Free shipping check
  if (method.freeShippingThreshold > 0 && subtotal >= method.freeShippingThreshold) {
    return 0
  }

  return method.basePrice
}

/**
 * Get all available carriers for a country
 */
export function getCarriersForCountry(countryCode: string): CarrierConfig[] {
  return Object.values(carriers).filter(carrier =>
    carrier.countries.includes(countryCode.toUpperCase())
  )
}

// ===================================
// Default Address for Latvia
// ===================================

export const defaultAddress = {
  country: 'LV',
  city: '',
  postalCode: '',
  addressLine1: '',
}

// Showroom address for pickup
export const showroomAddress = {
  name: 'LAGO Showroom',
  address: 'Dzelzavas iela 120',
  city: 'Rīga',
  postalCode: 'LV-1021',
  country: 'Latvia',
  phone: '+371 67531550',
  hours: 'Mon-Fri: 9:00-18:00, Sat: 10:00-14:00',
}
