// ============================================
// JSON-LD Structured Data Generators
// ============================================
// Generates Schema.org structured data for SEO
// Enhanced with Next.js 15 best practices and additional schemas

import { Product, Order, OrderItem } from '@/types/store'
import { SanityProject } from '@/lib/sanity/types'
import { Locale, locales } from '@/lib/i18n/config'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://lago.lv'

// ============================================
// BASE TYPES
// ============================================

export interface JsonLdScript {
  '@context': string
  '@type': string
  [key: string]: unknown
}

// ============================================
// ORGANIZATION SCHEMA
// ============================================

export interface OrganizationSchema extends JsonLdScript {
  '@type': 'Organization'
  name: string
  url: string
  logo: {
    '@type': 'ImageObject'
    url: string
    width: number
    height: number
  }
  description: Record<Locale, string>
  address: {
    '@type': 'PostalAddress'
    streetAddress: string
    addressLocality: string
    addressCountry: string
    postalCode: string
  }
  contactPoint: {
    '@type': 'ContactPoint'
    telephone: string
    email: string
    contactType: string
    availableLanguage: string[]
  }
  sameAs: string[]
  // Additional properties for enhanced SEO
  founder?: {
    '@type': 'Person'
    name: string
  }
  foundingDate?: string
  numberOfEmployees?: {
    '@type': 'QuantitativeValue'
    value: string
  }
  vatID?: string
  iso9001Certified?: boolean
}

export function generateOrganizationSchema(): OrganizationSchema {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'LAGO',
    url: SITE_URL,
    logo: {
      '@type': 'ImageObject',
      url: `${SITE_URL}/logo.png`,
      width: 512,
      height: 512,
    },
    description: {
      lv: 'Premium akmens virsmu un pēc pasūtījuma veidotas mēbeles. Silestone, Dekton, granīts, marmors.',
      en: 'Premium stone surfaces and custom furniture. Silestone, Dekton, granite, marble.',
      ru: 'Премиальные каменные поверхности и мебель на заказ. Silestone, Dekton, гранит, мрамор.',
    },
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Krasta iela 52',
      addressLocality: 'Riga',
      addressCountry: 'LV',
      postalCode: 'LV-1003',
    },
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+371-67-555-555',
      email: 'info@lago.lv',
      contactType: 'sales',
      availableLanguage: ['Latvian', 'English', 'Russian'],
    },
    sameAs: [
      'https://www.facebook.com/lago.lv',
      'https://www.instagram.com/lago.lv',
      'https://www.linkedin.com/company/lago-lv',
    ],
    // Enhanced properties
    foundingDate: '2010',
    vatID: 'LV40103000000',
  }
}

// ============================================
// LOCAL BUSINESS SCHEMA (Riga Showroom)
// ============================================

export interface LocalBusinessSchema extends JsonLdScript {
  '@type': 'HomeAndConstructionBusiness'
  name: string
  image: string[]
  '@id': string
  url: string
  telephone: string
  email: string
  priceRange: string
  address: {
    '@type': 'PostalAddress'
    streetAddress: string
    addressLocality: string
    addressCountry: string
    postalCode: string
  }
  geo: {
    '@type': 'GeoCoordinates'
    latitude: number
    longitude: number
  }
  openingHoursSpecification: Array<{
    '@type': 'OpeningHoursSpecification'
    dayOfWeek: string | string[]
    opens: string
    closes: string
  }>
  paymentAccepted: string[]
  currenciesAccepted: string
  // Enhanced properties
  aggregateRating?: {
    '@type': 'AggregateRating'
    ratingValue: string
    reviewCount: string
  }
  areaServed?: {
    '@type': 'GeoCircle'
    geoMidpoint: {
      '@type': 'GeoCoordinates'
      latitude: number
      longitude: number
    }
    geoRadius: string
  }
  hasMap?: string
}

export function generateLocalBusinessSchema(): LocalBusinessSchema {
  return {
    '@context': 'https://schema.org',
    '@type': 'HomeAndConstructionBusiness',
    name: 'LAGO Showroom',
    image: [`${SITE_URL}/showroom.jpg`, `${SITE_URL}/logo.png`],
    '@id': `${SITE_URL}/#showroom`,
    url: `${SITE_URL}/contact`,
    telephone: '+371-67-555-555',
    email: 'info@lago.lv',
    priceRange: '€€€',
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Krasta iela 52',
      addressLocality: 'Riga',
      addressCountry: 'LV',
      postalCode: 'LV-1003',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: 56.9489,
      longitude: 24.1064,
    },
    hasMap: 'https://maps.google.com/?q=56.9489,24.1064',
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        opens: '09:00',
        closes: '18:00',
      },
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: 'Saturday',
        opens: '10:00',
        closes: '16:00',
      },
    ],
    paymentAccepted: ['Cash', 'Credit Card', 'Bank Transfer', 'Invoice'],
    currenciesAccepted: 'EUR',
    areaServed: {
      '@type': 'GeoCircle',
      geoMidpoint: {
        '@type': 'GeoCoordinates',
        latitude: 56.9489,
        longitude: 24.1064,
      },
      geoRadius: '100km',
    },
  }
}

// ============================================
// PRODUCT SCHEMA (Enhanced)
// ============================================

export interface ProductSchema extends JsonLdScript {
  '@type': 'Product'
  name: string
  description: string
  image: string[]
  sku: string
  brand: {
    '@type': 'Brand'
    name: string
    logo?: string
  }
  offers: {
    '@type': 'Offer'
    url: string
    priceCurrency: string
    price: string
    availability: string
    priceValidUntil?: string
    itemCondition: string
    shippingDetails?: {
      '@type': 'OfferShippingDetails'
      shippingRate: {
        '@type': 'MonetaryAmount'
        value: string
        currency: string
      }
      deliveryTime?: {
        '@type': 'ShippingDeliveryTime'
        handlingTime: {
          '@type': 'QuantitativeValue'
          minValue: number
          maxValue: number
          unitCode: string
        }
        transitTime: {
          '@type': 'QuantitativeValue'
          minValue: number
          maxValue: number
          unitCode: string
        }
      }
      shippingDestination?: {
        '@type': 'DefinedRegion'
        addressCountry: string
      }
    }
    hasMerchantReturnPolicy?: {
      '@type': 'MerchantReturnPolicy'
      returnPolicyCategory: string
      merchantReturnDays: number
      returnMethod: string
      returnFees: string
    }
    seller?: {
      '@type': 'Organization'
      name: string
    }
  }
  aggregateRating?: {
    '@type': 'AggregateRating'
    ratingValue: string
    reviewCount: string
    bestRating?: string
    worstRating?: string
  }
  review?: Array<{
    '@type': 'Review'
    author: {
      '@type': 'Person'
      name: string
    }
    datePublished: string
    reviewRating: {
      '@type': 'Rating'
      ratingValue: string
    }
    reviewBody: string
  }>
  material?: string
  depth?: {
    '@type': 'QuantitativeValue'
    value: number
    unitCode: string
  }
  width?: {
    '@type': 'QuantitativeValue'
    value: number
    unitCode: string
  }
  height?: {
    '@type': 'QuantitativeValue'
    value: number
    unitCode: string
  }
  weight?: {
    '@type': 'QuantitativeValue'
    value: number
    unitCode: string
  }
  color?: string[]
  category?: string
  additionalProperty?: Array<{
    '@type': 'PropertyValue'
    name: string
    value: string
  }>
}

export function generateProductSchema(
  product: Product,
  locale: Locale,
  images: string[] = [],
  options?: {
    reviews?: Array<{
      author: string
      date: string
      rating: number
      body: string
    }>
    aggregateRating?: {
      rating: number
      count: number
    }
  }
): ProductSchema {
  const stockStatus =
    product.stockStatus === 'in_stock'
      ? 'https://schema.org/InStock'
      : product.stockStatus === 'pre_order'
        ? 'https://schema.org/PreOrder'
        : 'https://schema.org/OutOfStock'

  const price = product.salePrice || product.basePrice
  const hasSale = product.salePrice && product.salePrice < product.basePrice

  const schema: ProductSchema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name[locale],
    description:
      product.shortDescription?.[locale] ||
      product.description?.[locale] ||
      product.name[locale],
    image: images.length > 0 ? images : [product.featuredImage || ''],
    sku: product.sku,
    brand: {
      '@type': 'Brand',
      name: 'LAGO',
      logo: `${SITE_URL}/logo.png`,
    },
    offers: {
      '@type': 'Offer',
      url: `${SITE_URL}/${locale}/store/product/${product.slug}`,
      priceCurrency: 'EUR',
      price: price.toFixed(2),
      availability: stockStatus,
      itemCondition: 'https://schema.org/NewCondition',
      ...(hasSale && {
        priceValidUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split('T')[0],
      }),
      shippingDetails: {
        '@type': 'OfferShippingDetails',
        shippingRate: {
          '@type': 'MonetaryAmount',
          value: '0',
          currency: 'EUR',
        },
        deliveryTime: {
          '@type': 'ShippingDeliveryTime',
          handlingTime: {
            '@type': 'QuantitativeValue',
            minValue: 1,
            maxValue: 3,
            unitCode: 'DAY',
          },
          transitTime: {
            '@type': 'QuantitativeValue',
            minValue: 1,
            maxValue: 5,
            unitCode: 'DAY',
          },
        },
        shippingDestination: {
          '@type': 'DefinedRegion',
          addressCountry: 'LV',
        },
      },
      hasMerchantReturnPolicy: {
        '@type': 'MerchantReturnPolicy',
        returnPolicyCategory:
          'https://schema.org/MerchantReturnFiniteReturnWindow',
        merchantReturnDays: 14,
        returnMethod: 'https://schema.org/ReturnByMail',
        returnFees: 'https://schema.org/FreeReturn',
      },
      seller: {
        '@type': 'Organization',
        name: 'LAGO',
      },
    },
  }

  // Add reviews if provided
  if (options?.reviews && options.reviews.length > 0) {
    schema.review = options.reviews.map((review) => ({
      '@type': 'Review',
      author: {
        '@type': 'Person',
        name: review.author,
      },
      datePublished: review.date,
      reviewRating: {
        '@type': 'Rating',
        ratingValue: review.rating.toString(),
      },
      reviewBody: review.body,
    }))
  }

  // Add aggregate rating if provided
  if (options?.aggregateRating) {
    schema.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: options.aggregateRating.rating.toFixed(1),
      reviewCount: options.aggregateRating.count.toString(),
      bestRating: '5',
      worstRating: '1',
    }
  }

  // Add material if available
  if (product.material) {
    schema.material = product.material
  }

  // Add category
  if (product.category?.name?.[locale]) {
    schema.category = product.category.name[locale]
  }

  // Add dimensions if available
  if (product.dimensionsCm) {
    if (product.dimensionsCm.length) {
      schema.depth = {
        '@type': 'QuantitativeValue',
        value: product.dimensionsCm.length,
        unitCode: 'CMT',
      }
    }
    if (product.dimensionsCm.width) {
      schema.width = {
        '@type': 'QuantitativeValue',
        value: product.dimensionsCm.width,
        unitCode: 'CMT',
      }
    }
    if (product.dimensionsCm.height) {
      schema.height = {
        '@type': 'QuantitativeValue',
        value: product.dimensionsCm.height,
        unitCode: 'CMT',
      }
    }
  }

  // Add weight if available
  if (product.weightKg) {
    schema.weight = {
      '@type': 'QuantitativeValue',
      value: product.weightKg,
      unitCode: 'KGM',
    }
  }

  // Add additional properties
  const additionalProperties: Array<{ '@type': 'PropertyValue'; name: string; value: string }> =
    []

  if (product.finish) {
    additionalProperties.push({
      '@type': 'PropertyValue',
      name: 'Finish',
      value: product.finish,
    })
  }

  if (additionalProperties.length > 0) {
    schema.additionalProperty = additionalProperties
  }

  return schema
}

// ============================================
// PRODUCT LIST SCHEMA (Enhanced)
// ============================================

export interface ItemListSchema extends JsonLdScript {
  '@type': 'ItemList'
  itemListElement: Array<{
    '@type': 'ListItem'
    position: number
    url: string
    name: string
    image?: string
    offers?: {
      '@type': 'Offer'
      price: string
      priceCurrency: string
      availability?: string
    }
  }>
  numberOfItems: number
}

export function generateProductListSchema(
  products: Product[],
  locale: Locale
): ItemListSchema {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: products.map((product, index) => {
      const stockStatus =
        product.stockStatus === 'in_stock'
          ? 'https://schema.org/InStock'
          : product.stockStatus === 'pre_order'
            ? 'https://schema.org/PreOrder'
            : 'https://schema.org/OutOfStock'

      return {
        '@type': 'ListItem',
        position: index + 1,
        url: `${SITE_URL}/${locale}/store/product/${product.slug}`,
        name: product.name[locale],
        image: product.featuredImage,
        offers: {
          '@type': 'Offer',
          price: (product.salePrice || product.basePrice).toFixed(2),
          priceCurrency: 'EUR',
          availability: stockStatus,
        },
      }
    }),
    numberOfItems: products.length,
  }
}

// ============================================
// BREADCRUMB LIST SCHEMA
// ============================================

export interface BreadcrumbItem {
  name: Record<Locale, string>
  url: string
}

export interface BreadcrumbListSchema extends JsonLdScript {
  '@type': 'BreadcrumbList'
  itemListElement: Array<{
    '@type': 'ListItem'
    position: number
    name: string
    item: string
  }>
}

export function generateBreadcrumbSchema(
  items: BreadcrumbItem[],
  locale: Locale
): BreadcrumbListSchema {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name[locale],
      item: `${SITE_URL}${item.url}`,
    })),
  }
}

// Predefined breadcrumbs for common pages
export const BREADCRUMBS = {
  home: (locale: Locale): BreadcrumbItem[] => [],

  store: (locale: Locale): BreadcrumbItem[] => [
    {
      name: { lv: 'Veikals', en: 'Store', ru: 'Магазин' },
      url: `/${locale}/store`,
    },
  ],

  product: (
    locale: Locale,
    productName: Record<Locale, string>,
    slug: string
  ): BreadcrumbItem[] => [
    {
      name: { lv: 'Veikals', en: 'Store', ru: 'Магазин' },
      url: `/${locale}/store`,
    },
    { name: productName, url: `/${locale}/store/product/${slug}` },
  ],

  projects: (locale: Locale): BreadcrumbItem[] => [
    {
      name: { lv: 'Projekti', en: 'Projects', ru: 'Проекты' },
      url: `/${locale}/projects`,
    },
  ],

  projectDetail: (
    locale: Locale,
    projectName: Record<Locale, string>,
    slug: string
  ): BreadcrumbItem[] => [
    {
      name: { lv: 'Projekti', en: 'Projects', ru: 'Проекты' },
      url: `/${locale}/projects`,
    },
    { name: projectName, url: `/${locale}/projects/${slug}` },
  ],

  cart: (locale: Locale): BreadcrumbItem[] => [
    {
      name: { lv: 'Grozs', en: 'Cart', ru: 'Корзина' },
      url: `/${locale}/cart`,
    },
  ],

  checkout: (locale: Locale): BreadcrumbItem[] => [
    {
      name: { lv: 'Grozs', en: 'Cart', ru: 'Корзина' },
      url: `/${locale}/cart`,
    },
    {
      name: { lv: 'Noformēt', en: 'Checkout', ru: 'Оформление' },
      url: `/${locale}/checkout`,
    },
  ],

  account: (locale: Locale): BreadcrumbItem[] => [
    {
      name: { lv: 'Mans Konts', en: 'My Account', ru: 'Мой Аккаунт' },
      url: `/${locale}/account`,
    },
  ],

  orders: (locale: Locale): BreadcrumbItem[] => [
    {
      name: { lv: 'Mans Konts', en: 'My Account', ru: 'Мой Аккаунт' },
      url: `/${locale}/account`,
    },
    {
      name: { lv: 'Pasūtījumi', en: 'Orders', ru: 'Заказы' },
      url: `/${locale}/account/orders`,
    },
  ],
}

// ============================================
// ORDER SCHEMA
// ============================================

export interface OrderSchema extends JsonLdScript {
  '@type': 'Order'
  orderNumber: string
  orderStatus: string
  merchant: {
    '@type': 'Organization'
    name: string
  }
  customer?: {
    '@type': 'Person'
    email?: string
  }
  price: string
  priceCurrency: string
  acceptedOffer: Array<{
    '@type': 'Offer'
    itemOffered: {
      '@type': 'Product'
      name: string
      sku: string
    }
    price: string
    priceCurrency: string
    eligibleQuantity: {
      '@type': 'QuantitativeValue'
      value: number
    }
  }>
  url?: string
  potentialAction?: {
    '@type': 'ViewAction'
    target: string
  }
  orderDate?: string
  paymentMethod?: string
}

export function generateOrderSchema(order: Order): OrderSchema {
  const statusMap: Record<string, string> = {
    pending: 'https://schema.org/OrderPaymentDue',
    paid: 'https://schema.org/OrderPaymentDue',
    processing: 'https://schema.org/OrderProcessing',
    shipped: 'https://schema.org/OrderInTransit',
    delivered: 'https://schema.org/OrderDelivered',
    cancelled: 'https://schema.org/OrderCancelled',
    refunded: 'https://schema.org/OrderReturned',
    ready_for_pickup: 'https://schema.org/OrderPickupAvailable',
  }

  return {
    '@context': 'https://schema.org',
    '@type': 'Order',
    orderNumber: order.orderNumber,
    orderStatus: statusMap[order.status] || 'https://schema.org/OrderStatus',
    orderDate: order.createdAt,
    merchant: {
      '@type': 'Organization',
      name: 'LAGO',
    },
    ...(order.guestEmail && {
      customer: {
        '@type': 'Person',
        email: order.guestEmail,
      },
    }),
    price: order.total.toFixed(2),
    priceCurrency: order.currency || 'EUR',
    acceptedOffer:
      order.items?.map((item) => ({
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Product',
          name: typeof item.name === 'string' ? item.name : item.name.lv,
          sku: item.sku,
        },
        price: item.unitPrice.toFixed(2),
        priceCurrency: order.currency || 'EUR',
        eligibleQuantity: {
          '@type': 'QuantitativeValue',
          value: item.quantity,
        },
      })) || [],
    url: `${SITE_URL}/account/orders/${order.id}`,
    potentialAction: {
      '@type': 'ViewAction',
      target: `${SITE_URL}/account/orders/${order.id}`,
    },
  }
}

// ============================================
// WEB SITE SCHEMA (Enhanced with i18n)
// ============================================

export interface WebSiteSchema extends JsonLdScript {
  '@type': 'WebSite'
  name: string
  url: string
  inLanguage?: string
  potentialAction: {
    '@type': 'SearchAction'
    target: string
    'query-input': string
  }
  // Additional properties for multi-language sites
  translationOfWork?: Array<{
    '@type': 'WebSite'
    url: string
    inLanguage: string
  }>
}

export function generateWebSiteSchema(locale?: Locale): WebSiteSchema {
  const translations = locales
    .filter((l) => l !== locale)
    .map((l) => ({
      '@type': 'WebSite' as const,
      url: `${SITE_URL}/${l}`,
      inLanguage: l,
    }))

  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'LAGO',
    url: locale ? `${SITE_URL}/${locale}` : SITE_URL,
    inLanguage: locale || defaultLocale,
    potentialAction: {
      '@type': 'SearchAction',
      target: `${SITE_URL}/${locale || defaultLocale}/store?search={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
    ...(translations.length > 0 && { translationOfWork: translations }),
  }
}

// ============================================
// WEB PAGE SCHEMA (Enhanced)
// ============================================

export interface WebPageSchema extends JsonLdScript {
  '@type': 'WebPage'
  name: string
  description: string
  url: string
  inLanguage?: string
  breadcrumb?: {
    '@id': string
  }
  isPartOf?: {
    '@type': 'WebSite'
    '@id': string
  }
  primaryImageOfPage?: {
    '@type': 'ImageObject'
    url: string
    width?: number
    height?: number
  }
  datePublished?: string
  dateModified?: string
  author?: {
    '@type': 'Organization'
    name: string
  }
  publisher?: {
    '@type': 'Organization'
    name: string
    logo?: {
      '@type': 'ImageObject'
      url: string
    }
  }
}

export function generateWebPageSchema(
  name: Record<Locale, string>,
  description: Record<Locale, string>,
  url: string,
  locale: Locale,
  options?: {
    imageUrl?: string
    imageWidth?: number
    imageHeight?: number
    datePublished?: string
    dateModified?: string
  }
): WebPageSchema {
  const schema: WebPageSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: name[locale],
    description: description[locale],
    url: `${SITE_URL}${url}`,
    inLanguage: locale,
    isPartOf: {
      '@type': 'WebSite',
      '@id': `${SITE_URL}/#website`,
    },
    author: {
      '@type': 'Organization',
      name: 'LAGO',
    },
    publisher: {
      '@type': 'Organization',
      name: 'LAGO',
      logo: {
        '@type': 'ImageObject',
        url: `${SITE_URL}/logo.png`,
      },
    },
  }

  if (options?.imageUrl) {
    schema.primaryImageOfPage = {
      '@type': 'ImageObject',
      url: options.imageUrl,
      ...(options.imageWidth && { width: options.imageWidth }),
      ...(options.imageHeight && { height: options.imageHeight }),
    }
  }

  if (options?.datePublished) {
    schema.datePublished = options.datePublished
  }

  if (options?.dateModified) {
    schema.dateModified = options.dateModified
  }

  return schema
}

// ============================================
// CREATIVE WORK SCHEMA (For Projects)
// ============================================

export interface CreativeWorkSchema extends JsonLdScript {
  '@type': 'CreativeWork'
  name: string
  description: string
  url: string
  image: string[]
  creator: {
    '@type': 'Organization'
    name: string
  }
  dateCreated?: string
  locationCreated?: {
    '@type': 'Place'
    name: string
  }
  material?: string
  keywords?: string[]
  inLanguage?: string
  // Enhanced properties
  genre?: string
  about?: string
  award?: string[]
}

export function generateProjectSchema(
  project: SanityProject,
  locale: Locale,
  images: string[] = []
): CreativeWorkSchema {
  const location = project.location?.[locale]

  const schema: CreativeWorkSchema = {
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    name: project.title[locale],
    description: project.summary?.[locale] || project.title[locale],
    url: `${SITE_URL}/${locale}/projects/${project.slug[locale].current}`,
    image: images,
    creator: {
      '@type': 'Organization',
      name: 'LAGO',
    },
    keywords: project.tags,
    inLanguage: locale,
    genre: project.category,
  }

  if (project.year) {
    schema.dateCreated = `${project.year}`
  }

  if (location) {
    schema.locationCreated = {
      '@type': 'Place',
      name: location,
    }
  }

  if (project.material) {
    schema.material = project.material
    schema.about = project.material
  }

  return schema
}

// ============================================
// FAQ SCHEMA
// ============================================

export interface FAQPageSchema extends JsonLdScript {
  '@type': 'FAQPage'
  mainEntity: Array<{
    '@type': 'Question'
    name: string
    acceptedAnswer: {
      '@type': 'Answer'
      text: string
    }
  }>
}

export function generateFAQSchema(
  faqs: Array<{ question: Record<Locale, string>; answer: Record<Locale, string> }>,
  locale: Locale
): FAQPageSchema {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question[locale],
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer[locale],
      },
    })),
  }
}

// ============================================
// HOWTO SCHEMA
// ============================================

export interface HowToSchema extends JsonLdScript {
  '@type': 'HowTo'
  name: string
  description: string
  totalTime: string
  estimatedCost?: {
    '@type': 'MonetaryAmount'
    currency: string
    value: string
  }
  supply?: Array<{
    '@type': 'HowToSupply'
    name: string
  }>
  tool?: Array<{
    '@type': 'HowToTool'
    name: string
  }>
  step: Array<{
    '@type': 'HowToStep'
    name: string
    text: string
    url?: string
    image?: string
  }>
}

export function generateHowToSchema(
  name: Record<Locale, string>,
  description: Record<Locale, string>,
  steps: Array<{ name: Record<Locale, string>; text: Record<Locale, string> }>,
  locale: Locale,
  totalTime: string = 'P1D'
): HowToSchema {
  return {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: name[locale],
    description: description[locale],
    totalTime,
    step: steps.map((step) => ({
      '@type': 'HowToStep',
      name: step.name[locale],
      text: step.text[locale],
    })),
  }
}

// ============================================
// ARTICLE SCHEMA (For Blog/News)
// ============================================

export interface ArticleSchema extends JsonLdScript {
  '@type': 'Article'
  headline: string
  description: string
  image: string[]
  datePublished: string
  dateModified?: string
  author: {
    '@type': 'Organization' | 'Person'
    name: string
    url?: string
  }
  publisher: {
    '@type': 'Organization'
    name: string
    logo: {
      '@type': 'ImageObject'
      url: string
    }
  }
  mainEntityOfPage?: {
    '@type': 'WebPage'
    '@id': string
  }
  articleSection?: string
  keywords?: string[]
  inLanguage?: string
}

export function generateArticleSchema(
  headline: Record<Locale, string>,
  description: Record<Locale, string>,
  locale: Locale,
  options: {
    image: string[]
    datePublished: string
    dateModified?: string
    author?: string
    articleSection?: string
    keywords?: string[]
    url: string
  }
): ArticleSchema {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: headline[locale],
    description: description[locale],
    image: options.image,
    datePublished: options.datePublished,
    ...(options.dateModified && { dateModified: options.dateModified }),
    author: {
      '@type': options.author ? 'Person' : 'Organization',
      name: options.author || 'LAGO',
    },
    publisher: {
      '@type': 'Organization',
      name: 'LAGO',
      logo: {
        '@type': 'ImageObject',
        url: `${SITE_URL}/logo.png`,
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${SITE_URL}${options.url}`,
    },
    ...(options.articleSection && { articleSection: options.articleSection }),
    ...(options.keywords && { keywords: options.keywords }),
    inLanguage: locale,
  }
}

// ============================================
// SERVICE SCHEMA (For Full Service)
// ============================================

export interface ServiceSchema extends JsonLdScript {
  '@type': 'Service'
  name: string
  description: string
  provider: {
    '@type': 'Organization'
    name: string
    url: string
  }
  areaServed?: {
    '@type': 'Place'
    name: string
  }
  hasOfferCatalog?: {
    '@type': 'OfferCatalog'
    name: string
    itemListElement: Array<{
      '@type': 'Offer'
      itemOffered: {
        '@type': 'Service'
        name: string
        description: string
      }
    }>
  }
}

export function generateServiceSchema(
  name: Record<Locale, string>,
  description: Record<Locale, string>,
  locale: Locale,
  services?: Array<{ name: Record<Locale, string>; description: Record<Locale, string> }>
): ServiceSchema {
  const schema: ServiceSchema = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: name[locale],
    description: description[locale],
    provider: {
      '@type': 'Organization',
      name: 'LAGO',
      url: SITE_URL,
    },
    areaServed: {
      '@type': 'Place',
      name: 'Latvia',
    },
  }

  if (services && services.length > 0) {
    schema.hasOfferCatalog = {
      '@type': 'OfferCatalog',
      name: locale === 'lv' ? 'Pakalpojumi' : locale === 'en' ? 'Services' : 'Услуги',
      itemListElement: services.map((service) => ({
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Service',
          name: service.name[locale],
          description: service.description[locale],
        },
      })),
    }
  }

  return schema
}

// ============================================
// UTILITIES
// ============================================

export function toJsonLd<T extends JsonLdScript>(schema: T): string {
  return JSON.stringify(schema)
}

export function combineSchemas(...schemas: JsonLdScript[]): string {
  return JSON.stringify(schemas)
}

/**
 * Generate complete SEO script tag content with multiple schemas
 * This is useful for pages that need multiple structured data types
 */
export function generateCompletePageSchema(options: {
  locale: Locale
  pageType: 'home' | 'store' | 'product' | 'project' | 'contact' | 'about' | 'service'
  pageData?: {
    name?: Record<Locale, string>
    description?: Record<Locale, string>
    url?: string
    image?: string
  }
  breadcrumbs?: BreadcrumbItem[]
}): string {
  const schemas: JsonLdScript[] = []

  // Always include WebSite schema
  schemas.push(generateWebSiteSchema(options.locale))

  // Always include Organization schema
  schemas.push(generateOrganizationSchema())

  // Add WebPage schema if page data is provided
  if (options.pageData) {
    schemas.push(
      generateWebPageSchema(
        options.pageData.name || { lv: 'LAGO', en: 'LAGO', ru: 'LAGO' },
        options.pageData.description || {
          lv: 'Premium akmens virsmas un mēbeles',
          en: 'Premium stone surfaces and furniture',
          ru: 'Премиальные каменные поверхности и мебель',
        },
        options.pageData.url || '',
        options.locale,
        options.pageData.image
          ? { imageUrl: options.pageData.image }
          : undefined
      )
    )
  }

  // Add breadcrumb schema if breadcrumbs provided
  if (options.breadcrumbs && options.breadcrumbs.length > 0) {
    schemas.push(generateBreadcrumbSchema(options.breadcrumbs, options.locale))
  }

  return combineSchemas(...schemas)
}
