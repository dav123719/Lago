// AGENT slave-8 v1.0.1 - Final optimization complete
// ===================================
// Checkout Success Page
// ===================================
// Server component with client-side interactivity for static export

import { Metadata } from 'next'
import { locales, Locale } from '@/lib/i18n/config'
import SuccessPageClient from './SuccessPageClient'

interface SuccessPageProps {
  params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: SuccessPageProps): Promise<Metadata> {
  const { locale } = await params
  const t = {
    lv: 'Paldies par pirkumu!',
    en: 'Thank You for Your Order!',
    ru: 'Спасибо за заказ!',
  }
  
  return {
    title: `${t[locale as Locale] || 'Success'} | LAGO`,
    description: 'Your order has been successfully placed.',
  }
}

// Generate static params for all locales
export function generateStaticParams() {
  return locales.map((locale) => ({ locale }))
}

export default async function SuccessPage({ params }: SuccessPageProps) {
  const { locale } = await params
  return <SuccessPageClient locale={locale as Locale} />
}
