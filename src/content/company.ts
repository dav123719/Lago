// ===================================
// Company Information
// ===================================
// Static company data

import { CompanyInfo } from './types'

export const companyInfo: CompanyInfo = {
  name: 'LAGO',
  address: 'Jaunciema gatve 231A',
  city: 'Rīga',
  country: 'Latvija',
  postalCode: 'LV-1023',
  phone: '(+371) 675 315 50',
  email: 'info@lago.lv',
  workingHours: {
    lv: 'P-Pk: 9:00 - 18:00, S: pēc iepriekšējas pieteikšanās',
    en: 'Mon-Fri: 9:00 - 18:00, Sat: by appointment',
    ru: 'Пн-Пт: 9:00 - 18:00, Сб: по предварительной записи',
  },
  // Google Maps embed URL (placeholder - replace with actual)
  mapEmbedUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2176.8900000000003!2d24.1500000!3d56.9200000!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNTbCsDU1JzEyLjAiTiAyNMKwMDknMDAuMCJF!5e0!3m2!1sen!2slv!4v1234567890',
}

// Full address formatted
export function getFullAddress(locale: 'lv' | 'en' | 'ru'): string {
  const countryNames = {
    lv: 'Latvija',
    en: 'Latvia',
    ru: 'Латвия',
  }
  
  return `${companyInfo.address}, ${companyInfo.city}, ${companyInfo.postalCode}, ${countryNames[locale]}`
}

