'use client'

// ============================================
// Breadcrumb Navigation Component with Schema
// ============================================
// Accessible breadcrumb navigation with structured data

import Link from 'next/link'
import { ChevronRight, Home } from 'lucide-react'
import { Locale } from '@/lib/i18n/config'
import { BreadcrumbJsonLd, type BreadcrumbItem } from './JsonLd'

interface Breadcrumb {
  label: string
  href: string
  isCurrent?: boolean
}

interface BreadcrumbsProps {
  items: Breadcrumb[]
  locale: Locale
  showHome?: boolean
  className?: string
}

/**
 * Breadcrumbs Component
 * 
 * Renders an accessible breadcrumb navigation with:
 * - Proper ARIA labels
 * - Visual separators
 * - Structured data for SEO
 * - Responsive design
 * 
 * @example
 * <Breadcrumbs
 *   items={[
 *     { label: 'Veikals', href: '/lv/store' },
 *     { label: 'Produkts', href: '/lv/store/product/abc', isCurrent: true }
 *   ]}
 *   locale="lv"
 * />
 */
export function Breadcrumbs({
  items,
  locale,
  showHome = true,
  className = '',
}: BreadcrumbsProps) {
  // Generate structured data items
  const schemaItems: BreadcrumbItem[] = items.map((item) => ({
    name: { lv: item.label, en: item.label, ru: item.label },
    url: item.href,
  }))

  const homeLabels: Record<Locale, string> = {
    lv: 'Sākums',
    en: 'Home',
    ru: 'Главная',
  }

  const allItems = showHome
    ? [{ label: homeLabels[locale], href: `/${locale}`, isCurrent: false }, ...items]
    : items

  return (
    <>
      {/* Structured Data */}
      <BreadcrumbJsonLd items={schemaItems} locale={locale} />

      {/* Visual Breadcrumbs */}
      <nav
        aria-label="Breadcrumbs"
        className={`py-4 ${className}`}
      >
        <ol
          className="flex flex-wrap items-center gap-2 text-sm"
          itemScope
          itemType="https://schema.org/BreadcrumbList"
        >
          {allItems.map((item, index) => {
            const isLast = index === allItems.length - 1
            const isFirst = index === 0

            return (
              <li
                key={item.href}
                className="flex items-center"
                itemProp="itemListElement"
                itemScope
                itemType="https://schema.org/ListItem"
              >
                {isFirst && showHome ? (
                  <Link
                    href={item.href}
                    className="flex items-center gap-1 text-lago-muted hover:text-lago-gold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lago-gold focus-visible:ring-offset-2 focus-visible:ring-offset-lago-black rounded"
                    itemProp="item"
                    aria-label={item.label}
                  >
                    <Home className="w-4 h-4" aria-hidden="true" />
                    <span itemProp="name" className="sr-only">
                      {item.label}
                    </span>
                  </Link>
                ) : isLast || item.isCurrent ? (
                  <span
                    className="text-lago-light font-medium"
                    itemProp="name"
                    aria-current="page"
                  >
                    {item.label}
                  </span>
                ) : (
                  <Link
                    href={item.href}
                    className="text-lago-muted hover:text-lago-gold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lago-gold focus-visible:ring-offset-2 focus-visible:ring-offset-lago-black rounded"
                    itemProp="item"
                  >
                    <span itemProp="name">{item.label}</span>
                  </Link>
                )}

                {/* Separator */}
                {!isLast && (
                  <ChevronRight
                    className="w-4 h-4 mx-2 text-lago-stone"
                    aria-hidden="true"
                  />
                )}

                <meta itemProp="position" content={(index + 1).toString()} />
              </li>
            )
          })}
        </ol>
      </nav>
    </>
  )
}

/**
 * Store Breadcrumbs
 * Pre-configured breadcrumbs for store pages
 */
interface StoreBreadcrumbsProps {
  locale: Locale
  categoryName?: string
  categorySlug?: string
  productName?: string
}

export function StoreBreadcrumbs({
  locale,
  categoryName,
  categorySlug,
  productName,
}: StoreBreadcrumbsProps) {
  const storeLabels: Record<Locale, string> = {
    lv: 'Veikals',
    en: 'Store',
    ru: 'Магазин',
  }

  const items: Breadcrumb[] = [{ label: storeLabels[locale], href: `/${locale}/store` }]

  if (categoryName) {
    items.push({
      label: categoryName,
      href: `/${locale}/store${categorySlug ? `?category=${categorySlug}` : ''}`,
      isCurrent: !productName,
    })
  }

  if (productName) {
    items.push({
      label: productName,
      href: '#',
      isCurrent: true,
    })
  }

  return <Breadcrumbs items={items} locale={locale} />
}

/**
 * Projects Breadcrumbs
 * Pre-configured breadcrumbs for project pages
 */
interface ProjectsBreadcrumbsProps {
  locale: Locale
  projectName?: string
}

export function ProjectsBreadcrumbs({ locale, projectName }: ProjectsBreadcrumbsProps) {
  const projectsLabels: Record<Locale, string> = {
    lv: 'Projekti',
    en: 'Projects',
    ru: 'Проекты',
  }

  const items: Breadcrumb[] = [
    { label: projectsLabels[locale], href: `/${locale}/projects` },
  ]

  if (projectName) {
    items.push({
      label: projectName,
      href: '#',
      isCurrent: true,
    })
  }

  return <Breadcrumbs items={items} locale={locale} />
}

/**
 * Account Breadcrumbs
 * Pre-configured breadcrumbs for account pages
 */
interface AccountBreadcrumbsProps {
  locale: Locale
  page: 'profile' | 'orders' | 'addresses' | 'order-detail'
  orderNumber?: string
}

export function AccountBreadcrumbs({ locale, page, orderNumber }: AccountBreadcrumbsProps) {
  const labels: Record<string, Record<Locale, string>> = {
    account: { lv: 'Mans Konts', en: 'My Account', ru: 'Мой Аккаунт' },
    profile: { lv: 'Profils', en: 'Profile', ru: 'Профиль' },
    orders: { lv: 'Pasūtījumi', en: 'Orders', ru: 'Заказы' },
    addresses: { lv: 'Adreses', en: 'Addresses', ru: 'Адреса' },
    'order-detail': { lv: `Pasūtījums ${orderNumber || ''}`, en: `Order ${orderNumber || ''}`, ru: `Заказ ${orderNumber || ''}` },
  }

  const items: Breadcrumb[] = [
    { label: labels.account[locale], href: `/${locale}/account` },
  ]

  if (page === 'orders') {
    items.push({ label: labels.orders[locale], href: `/${locale}/account/orders`, isCurrent: true })
  } else if (page === 'addresses') {
    items.push({ label: labels.addresses[locale], href: `/${locale}/account/addresses`, isCurrent: true })
  } else if (page === 'order-detail' && orderNumber) {
    items.push(
      { label: labels.orders[locale], href: `/${locale}/account/orders` },
      { label: labels['order-detail'][locale], href: '#', isCurrent: true }
    )
  }

  return <Breadcrumbs items={items} locale={locale} />
}

/**
 * Checkout Breadcrumbs
 * Pre-configured breadcrumbs for checkout flow
 */
interface CheckoutBreadcrumbsProps {
  locale: Locale
  step: 'cart' | 'shipping' | 'payment' | 'confirmation'
}

export function CheckoutBreadcrumbs({ locale, step }: CheckoutBreadcrumbsProps) {
  const labels: Record<string, Record<Locale, string>> = {
    cart: { lv: 'Grozs', en: 'Cart', ru: 'Корзина' },
    shipping: { lv: 'Piegāde', en: 'Shipping', ru: 'Доставка' },
    payment: { lv: 'Apmaksa', en: 'Payment', ru: 'Оплата' },
    confirmation: { lv: 'Apstiprinājums', en: 'Confirmation', ru: 'Подтверждение' },
  }

  const items: Breadcrumb[] = [
    { label: labels.cart[locale], href: `/${locale}/cart`, isCurrent: step === 'cart' },
    { label: labels.shipping[locale], href: `/${locale}/checkout/shipping`, isCurrent: step === 'shipping' },
    { label: labels.payment[locale], href: `/${locale}/checkout/payment`, isCurrent: step === 'payment' },
    { label: labels.confirmation[locale], href: '#', isCurrent: step === 'confirmation' },
  ]

  // Only show up to current step
  const visibleItems = items.slice(0, items.findIndex((i) => i.isCurrent) + 1)

  return <Breadcrumbs items={visibleItems} locale={locale} />
}
