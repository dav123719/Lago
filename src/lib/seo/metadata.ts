// ============================================
// SEO Metadata Generation
// ============================================
// Generates metadata for all page types following Next.js 14+ patterns

import { Metadata } from 'next'
import { Locale, locales, defaultLocale } from '@/lib/i18n/config'
import { Product, Category } from '@/types/store'
import { SanityProject } from '@/lib/sanity/types'

// Site configuration
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://lago.lv'
const SITE_NAME = 'LAGO'
const BRAND_TAGLINE = 'Premium Stone Surfaces & Custom Furniture'

// Default metadata values
const DEFAULT_KEYWORDS = [
  'stone surfaces',
  'kitchen countertops',
  'Silestone',
  'Dekton',
  'granite',
  'marble',
  'custom furniture',
  'Latvia',
  'Riga',
  'luxury furniture',
  'stone fabrication',
  'countertop installation',
  'bespoke furniture',
]

// Localized site descriptions
const SITE_DESCRIPTIONS: Record<Locale, string> = {
  lv: 'LAGO - Premium akmens virsmas un pēc pasūtījuma veidotas mēbeles Latvijā. Silestone, Dekton, granīta un marmora virtuves virsmas, kā arī individuāli izgatavotas mēbeles.',
  en: 'LAGO - Premium stone surfaces and custom furniture in Latvia. Silestone, Dekton, granite and marble kitchen countertops, plus bespoke furniture solutions.',
  ru: 'LAGO - Премиальные каменные поверхности и мебель на заказ в Латвии. Столешницы Silestone, Dekton, гранит и мрамор, а также индивидуальная мебель.',
}

// Helper: Build alternate language URLs
function buildAlternateUrls(path: string): Record<string, string> {
  const alternates: Record<string, string> = {}
  locales.forEach((locale) => {
    alternates[locale] = `${SITE_URL}/${locale}${path}`
  })
  alternates['x-default'] = `${SITE_URL}/${defaultLocale}${path}`
  return alternates
}

// ============================================
// PAGE-SPECIFIC METADATA GENERATORS
// ============================================

interface HomeMetadataParams {
  locale: Locale
}

export function generateHomeMetadata({ locale }: HomeMetadataParams): Metadata {
  const title = locale === 'lv' 
    ? 'Premium Akmens Virsmas & Mēbeles'
    : locale === 'en'
    ? 'Premium Stone Surfaces & Furniture'
    : 'Премиальные Каменные Поверхности и Мебель'

  return {
    title: `${SITE_NAME} - ${title}`,
    description: SITE_DESCRIPTIONS[locale],
    keywords: DEFAULT_KEYWORDS,
    alternates: {
      canonical: `${SITE_URL}/${locale}`,
      languages: buildAlternateUrls(''),
    },
    openGraph: {
      type: 'website',
      locale: locale === 'lv' ? 'lv_LV' : locale === 'en' ? 'en_US' : 'ru_RU',
      siteName: SITE_NAME,
      title: `${SITE_NAME} - ${title}`,
      description: SITE_DESCRIPTIONS[locale],
      url: `${SITE_URL}/${locale}`,
    },
  }
}

// Store page metadata
interface StoreMetadataParams {
  locale: Locale
  category?: Category
  searchQuery?: string
}

export function generateStoreMetadata({ locale, category, searchQuery }: StoreMetadataParams): Metadata {
  let title: string
  let description: string

  if (searchQuery) {
    title = locale === 'lv'
      ? `Meklēšanas rezultāti: "${searchQuery}"`
      : locale === 'en'
      ? `Search Results: "${searchQuery}"`
      : `Результаты поиска: "${searchQuery}"`
    description = locale === 'lv'
      ? `Atrasti produkti atbilstoši meklējumam "${searchQuery}" - premium akmens virsmas un mēbeles.`
      : locale === 'en'
      ? `Products matching "${searchQuery}" - premium stone surfaces and furniture.`
      : `Товары, соответствующие "${searchQuery}" - премиальные каменные поверхности и мебель.`
  } else if (category) {
    const categoryName = category.name[locale]
    title = locale === 'lv'
      ? `${categoryName} - Veikals`
      : locale === 'en'
      ? `${categoryName} - Store`
      : `${categoryName} - Магазин`
    description = locale === 'lv'
      ? `Iepazīstieties ar mūsu ${categoryName.toLowerCase()} kolekciju. Premium kvalitātes produkti no LAGO.`
      : locale === 'en'
      ? `Explore our ${categoryName} collection. Premium quality products from LAGO.`
      : `Изучите нашу коллекцию ${categoryName}. Премиальная продукция от LAGO.`
  } else {
    title = locale === 'lv'
      ? 'Veikals - Akmens Virsmas & Mēbeles'
      : locale === 'en'
      ? 'Store - Stone Surfaces & Furniture'
      : 'Магазин - Каменные Поверхности и Мебель'
    description = locale === 'lv'
      ? 'Iepērcieties premium akmens virsmas un mēbeles. Silestone, Dekton, granīts, marmors un individuāli izgatavotas mēbeles.'
      : locale === 'en'
      ? 'Shop premium stone surfaces and furniture. Silestone, Dekton, granite, marble and custom furniture solutions.'
      : 'Магазин премиальных каменных поверхностей и мебели. Silestone, Dekton, гранит, мрамор и мебель на заказ.'
  }

  return {
    title: `${title} | ${SITE_NAME}`,
    description,
    keywords: [...DEFAULT_KEYWORDS, 'store', 'shop', 'buy', 'online store'],
    alternates: {
      canonical: `${SITE_URL}/${locale}/store`,
      languages: buildAlternateUrls('/store'),
    },
    openGraph: {
      type: 'website',
      title: `${title} | ${SITE_NAME}`,
      description,
      url: `${SITE_URL}/${locale}/store`,
    },
  }
}

// Product detail metadata
interface ProductMetadataParams {
  locale: Locale
  product: Product
}

export function generateProductMetadata({ locale, product }: ProductMetadataParams): Metadata {
  const productName = product.name[locale]
  const productDescription = product.shortDescription?.[locale] || product.description?.[locale] || ''
  const truncatedDesc = productDescription.length > 160 
    ? productDescription.substring(0, 157) + '...'
    : productDescription

  const materialKeywords = product.material ? [product.material] : []
  const finishKeywords = product.finish ? [product.finish] : []

  return {
    title: `${productName} | ${SITE_NAME}`,
    description: truncatedDesc || SITE_DESCRIPTIONS[locale],
    keywords: [
      ...DEFAULT_KEYWORDS,
      productName,
      product.sku,
      ...materialKeywords,
      ...finishKeywords,
    ],
    alternates: {
      canonical: `${SITE_URL}/${locale}/store/product/${product.slug}`,
      languages: buildAlternateUrls(`/store/product/${product.slug}`),
    },
    openGraph: {
      type: 'website' as const,
      title: productName,
      description: truncatedDesc,
      url: `${SITE_URL}/${locale}/store/product/${product.slug}`,
      images: product.featuredImage
        ? [
            {
              url: product.featuredImage,
              width: 1200,
              height: 630,
              alt: productName,
            },
          ]
        : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: productName,
      description: truncatedDesc,
      images: product.featuredImage ? [product.featuredImage] : undefined,
    },
    robots: {
      index: product.status === 'active',
      follow: product.status === 'active',
    },
  }
}

// Projects page metadata
interface ProjectsMetadataParams {
  locale: Locale
  category?: 'stone' | 'furniture'
}

export function generateProjectsMetadata({ locale, category }: ProjectsMetadataParams): Metadata {
  let title: string
  let description: string

  if (category === 'stone') {
    title = locale === 'lv' 
      ? 'Akmens Virsmu Projekti'
      : locale === 'en'
      ? 'Stone Surface Projects'
      : 'Проекты Каменных Поверхностей'
    description = locale === 'lv'
      ? 'Apskati mūsu realizētos akmens virsmu projektus - virtuves virsmas, vannas istabas, interjera elementi no Silestone, Dekton, granīta un marmora.'
      : locale === 'en'
      ? 'View our completed stone surface projects - kitchen countertops, bathrooms, interior elements from Silestone, Dekton, granite and marble.'
      : 'Посмотрите наши реализованные проекты каменных поверхностей - кухонные столешницы, ванные комнаты, интерьерные элементы из Silestone, Dekton, гранита и мрамора.'
  } else if (category === 'furniture') {
    title = locale === 'lv'
      ? 'Mēbeļu Projekti'
      : locale === 'en'
      ? 'Furniture Projects'
      : 'Проекты Мебели'
    description = locale === 'lv'
      ? 'Iepazīsties ar mūsu izgatavotajām individuālajām mēbelēm - virtuves, skapji, interjera risinājumi pēc pasūtījuma.'
      : locale === 'en'
      ? 'Explore our custom furniture creations - kitchens, cabinets, bespoke interior solutions.'
      : 'Ознакомьтесь с нашей индивидуальной мебелью - кухни, шкафы, мебель на заказ.'
  } else {
    title = locale === 'lv'
      ? 'Projekti'
      : locale === 'en'
      ? 'Projects'
      : 'Проекты'
    description = locale === 'lv'
      ? 'Mūsu realizētie projekti - akmens virsmas un individuālas mēbeles. Iedvesmojies no mūsu darbiem Latvijā un ārpus tās.'
      : locale === 'en'
      ? 'Our completed projects - stone surfaces and custom furniture. Get inspired by our work in Latvia and beyond.'
      : 'Наши реализованные проекты - каменные поверхности и мебель на заказ. Вдохновляйтесь нашими работами в Латвии и за рубежом.'
  }

  return {
    title: `${title} | ${SITE_NAME}`,
    description,
    keywords: [...DEFAULT_KEYWORDS, 'portfolio', 'projects', 'gallery', 'work'],
    alternates: {
      canonical: `${SITE_URL}/${locale}/projects`,
      languages: buildAlternateUrls('/projects'),
    },
    openGraph: {
      type: 'website',
      title: `${title} | ${SITE_NAME}`,
      description,
      url: `${SITE_URL}/${locale}/projects`,
    },
  }
}

// Project detail metadata
interface ProjectDetailMetadataParams {
  locale: Locale
  project: SanityProject
}

export function generateProjectDetailMetadata({ locale, project }: ProjectDetailMetadataParams): Metadata {
  const projectTitle = project.title[locale]
  const projectLocation = project.location?.[locale]
  const projectSummary = project.summary?.[locale] || ''
  const truncatedSummary = projectSummary.length > 160
    ? projectSummary.substring(0, 157) + '...'
    : projectSummary

  const locationSuffix = projectLocation ? `, ${projectLocation}` : ''

  return {
    title: `${projectTitle}${locationSuffix} | ${SITE_NAME} Projekts`,
    description: truncatedSummary || SITE_DESCRIPTIONS[locale],
    keywords: [
      ...DEFAULT_KEYWORDS,
      projectTitle,
      project.material || '',
      ...(project.tags || []),
    ],
    alternates: {
      canonical: `${SITE_URL}/${locale}/projects/${project.slug[locale].current}`,
      languages: buildAlternateUrls(`/projects/${project.slug[locale].current}`),
    },
    openGraph: {
      type: 'article',
      title: projectTitle,
      description: truncatedSummary,
      url: `${SITE_URL}/${locale}/projects/${project.slug[locale].current}`,
      images: project.heroImage
        ? [
            {
              url: '', // Will be resolved by component
              width: 1200,
              height: 630,
              alt: projectTitle,
            },
          ]
        : undefined,
    },
  }
}

// Checkout metadata (noindex)
interface CheckoutMetadataParams {
  locale: Locale
  step?: 'shipping' | 'payment' | 'success'
}

export function generateCheckoutMetadata({ locale, step }: CheckoutMetadataParams): Metadata {
  let title: string

  switch (step) {
    case 'shipping':
      title = locale === 'lv' ? 'Piegāde' : locale === 'en' ? 'Shipping' : 'Доставка'
      break
    case 'payment':
      title = locale === 'lv' ? 'Apmaksa' : locale === 'en' ? 'Payment' : 'Оплата'
      break
    case 'success':
      title = locale === 'lv' ? 'Pasūtījums Apstiprināts' : locale === 'en' ? 'Order Confirmed' : 'Заказ Подтверждён'
      break
    default:
      title = locale === 'lv' ? 'Noformēt Pasūtījumu' : locale === 'en' ? 'Checkout' : 'Оформление Заказа'
  }

  return {
    title: `${title} | ${SITE_NAME}`,
    description: locale === 'lv'
      ? 'Drošs pasūtījuma noformēšanas process. Sūtījums uz Omniva/DPD pakomātiem vai kurjers.'
      : locale === 'en'
      ? 'Secure checkout process. Delivery to Omniva/DPD parcel lockers or courier service.'
      : 'Безопасный процесс оформления заказа. Доставка в почтоматы Omniva/DPD или курьером.',
    robots: {
      index: false,
      follow: false,
    },
  }
}

// Account pages metadata (noindex)
interface AccountMetadataParams {
  locale: Locale
  page?: 'login' | 'register' | 'profile' | 'orders' | 'addresses'
}

export function generateAccountMetadata({ locale, page }: AccountMetadataParams): Metadata {
  const pageTitles: Record<string, Record<Locale, string>> = {
    login: { lv: 'Pieslēgties', en: 'Login', ru: 'Вход' },
    register: { lv: 'Reģistrēties', en: 'Register', ru: 'Регистрация' },
    profile: { lv: 'Mans Profils', en: 'My Profile', ru: 'Мой Профиль' },
    orders: { lv: 'Mani Pasūtījumi', en: 'My Orders', ru: 'Мои Заказы' },
    addresses: { lv: 'Manas Adreses', en: 'My Addresses', ru: 'Мои Адреса' },
  }

  const title = page ? pageTitles[page][locale] : pageTitles.profile[locale]

  return {
    title: `${title} | ${SITE_NAME}`,
    description: locale === 'lv'
      ? 'Pārvaldiet savu LAGO kontu, pasūtījumus un adreses.'
      : locale === 'en'
      ? 'Manage your LAGO account, orders and addresses.'
      : 'Управляйте своим аккаунтом LAGO, заказами и адресами.',
    robots: {
      index: false,
      follow: false,
    },
  }
}

// Order detail metadata (noindex)
interface OrderDetailMetadataParams {
  locale: Locale
  orderNumber: string
}

export function generateOrderDetailMetadata({ locale, orderNumber }: OrderDetailMetadataParams): Metadata {
  return {
    title: `Pasūtījums ${orderNumber} | ${SITE_NAME}`,
    description: locale === 'lv'
      ? `Pasūtījuma ${orderNumber} informācija un statuss.`
      : locale === 'en'
      ? `Order ${orderNumber} details and status.`
      : `Информация о заказе ${orderNumber} и статус.`,
    robots: {
      index: false,
      follow: false,
    },
  }
}

// Contact page metadata
interface ContactMetadataParams {
  locale: Locale
}

export function generateContactMetadata({ locale }: ContactMetadataParams): Metadata {
  const title = locale === 'lv' ? 'Kontakti' : locale === 'en' ? 'Contact' : 'Контакты'
  const description = locale === 'lv'
    ? 'Sazinieties ar mums. Mūsu salons Rīgā, Krasta ielā. Tālrunis, e-pasts, darba laiks.'
    : locale === 'en'
    ? 'Get in touch with us. Our showroom in Riga, Krasta street. Phone, email, working hours.'
    : 'Свяжитесь с нами. Наш салон в Риге, улица Краста. Телефон, email, часы работы.'

  return {
    title: `${title} | ${SITE_NAME}`,
    description,
    keywords: [...DEFAULT_KEYWORDS, 'contact', 'showroom', 'address', 'phone', 'email'],
    alternates: {
      canonical: `${SITE_URL}/${locale}/contact`,
      languages: buildAlternateUrls('/contact'),
    },
    openGraph: {
      type: 'website',
      title: `${title} | ${SITE_NAME}`,
      description,
      url: `${SITE_URL}/${locale}/contact`,
    },
  }
}

// About page metadata
interface AboutMetadataParams {
  locale: Locale
}

export function generateAboutMetadata({ locale }: AboutMetadataParams): Metadata {
  const title = locale === 'lv' ? 'Par Mums' : locale === 'en' ? 'About Us' : 'О Нас'
  const description = locale === 'lv'
    ? 'Uzziniet vairāk par LAGO - premium akmens virsmu un mēbeļu ražotāju Latvijā. Mūsu vēsture, komanda un vērtības.'
    : locale === 'en'
    ? 'Learn more about LAGO - premium stone surfaces and furniture manufacturer in Latvia. Our history, team and values.'
    : 'Узнайте больше о LAGO - производителе премиальных каменных поверхностей и мебели в Латвии. Наша история, команда и ценности.'

  return {
    title: `${title} | ${SITE_NAME}`,
    description,
    keywords: [...DEFAULT_KEYWORDS, 'about', 'company', 'team', 'history', 'values'],
    alternates: {
      canonical: `${SITE_URL}/${locale}/about`,
      languages: buildAlternateUrls('/about'),
    },
    openGraph: {
      type: 'website',
      title: `${title} | ${SITE_NAME}`,
      description,
      url: `${SITE_URL}/${locale}/about`,
    },
  }
}

// Cart page metadata
interface CartMetadataParams {
  locale: Locale
}

export function generateCartMetadata({ locale }: CartMetadataParams): Metadata {
  const title = locale === 'lv' ? 'Grozs' : locale === 'en' ? 'Cart' : 'Корзина'
  const description = locale === 'lv'
    ? 'Jūsu iepirkumu grozs. Pārskatiet izvēlētos produktus pirms pasūtīšanas.'
    : locale === 'en'
    ? 'Your shopping cart. Review selected products before ordering.'
    : 'Ваша корзина. Просмотрите выбранные товары перед заказом.'

  return {
    title: `${title} | ${SITE_NAME}`,
    description,
    robots: {
      index: false,
      follow: true,
    },
  }
}

// Full Service page metadata
interface FullServiceMetadataParams {
  locale: Locale
}

export function generateFullServiceMetadata({ locale }: FullServiceMetadataParams): Metadata {
  const title = locale === 'lv' 
    ? 'Pilns Serviss' 
    : locale === 'en' 
    ? 'Full Service' 
    : 'Полный Сервис'
  
  const description = locale === 'lv'
    ? 'Pilna cikla serviss - no dizaina līdz montāžai. Individuāli risinājumi, profesionāla uzstādīšana, garantija.'
    : locale === 'en'
    ? 'Full-cycle service - from design to installation. Custom solutions, professional installation, warranty.'
    : 'Полный цикл услуг - от дизайна до установки. Индивидуальные решения, профессиональный монтаж, гарантия.'

  return {
    title: `${title} | ${SITE_NAME}`,
    description,
    keywords: [...DEFAULT_KEYWORDS, 'service', 'installation', 'design', 'warranty', 'measurement'],
    alternates: {
      canonical: `${SITE_URL}/${locale}/full-service`,
      languages: buildAlternateUrls('/full-service'),
    },
    openGraph: {
      type: 'website',
      title: `${title} | ${SITE_NAME}`,
      description,
      url: `${SITE_URL}/${locale}/full-service`,
    },
  }
}

// Error page metadata
export function generateErrorMetadata(locale: Locale): Metadata {
  return {
    title: locale === 'lv'
      ? `Kļūda | ${SITE_NAME}`
      : locale === 'en'
      ? `Error | ${SITE_NAME}`
      : `Ошибка | ${SITE_NAME}`,
    description: locale === 'lv'
      ? 'Atvainojiet, radās kļūda. Lūdzu, mēģiniet vēlreiz vēlāk.'
      : locale === 'en'
      ? 'Sorry, an error occurred. Please try again later.'
      : 'Извините, произошла ошибка. Пожалуйста, попробуйте позже.',
    robots: {
      index: false,
      follow: false,
    },
  }
}
