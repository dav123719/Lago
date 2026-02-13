// ===================================
// Cart Page
// ===================================

import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { locales, Locale } from '@/lib/i18n/config'
import { CartPageClient } from './CartPageClient'

interface CartPageProps {
  params: Promise<{ locale: string }>
}

const translations = {
  title: {
    lv: 'Iepirkumu grozs',
    en: 'Shopping Cart',
    ru: 'Корзина',
  },
}

export async function generateMetadata({ params }: CartPageProps): Promise<Metadata> {
  const { locale } = await params
  const t = translations.title[locale as Locale]
  
  return {
    title: `${t} | LAGO`,
    description: 'Review your selected luxury furniture and stone surfaces before checkout.',
  }
}

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }))
}

export default async function CartPage({ params }: CartPageProps) {
  const { locale } = await params
  
  if (!locales.includes(locale as Locale)) {
    notFound()
  }

  return <CartPageClient locale={locale as Locale} />
}
