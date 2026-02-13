// ===================================
// Checkout Page (Main Checkout Entry)
// ===================================

import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { locales, Locale } from '@/lib/i18n/config'
import { CheckoutClient } from './CheckoutClient'

interface CheckoutPageProps {
  params: Promise<{ locale: string }>
}

const translations = {
  title: {
    lv: 'Noformēt pasūtījumu',
    en: 'Checkout',
    ru: 'Оформление заказа',
  },
}

export async function generateMetadata({ params }: CheckoutPageProps): Promise<Metadata> {
  const { locale } = await params
  const t = translations.title[locale as Locale]
  
  return {
    title: `${t} | LAGO`,
    description: 'Complete your purchase securely with our streamlined checkout process.',
  }
}

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }))
}

export default async function CheckoutPage({ params }: CheckoutPageProps) {
  const { locale } = await params
  
  if (!locales.includes(locale as Locale)) {
    notFound()
  }

  return <CheckoutClient locale={locale as Locale} />
}
