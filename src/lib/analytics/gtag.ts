// ============================================
// Google Analytics 4 Integration
// ============================================
// GA4 tracking implementation

// ============================================
// CONFIGURATION
// ============================================

const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID

// ============================================
// TYPES
// ============================================

declare global {
  interface Window {
    gtag: (
      command: 'config' | 'event' | 'consent' | 'js' | 'set',
      targetId: string,
      config?: Record<string, unknown>
    ) => void
    dataLayer: unknown[]
  }
}

export interface GtagConfig {
  send_page_view?: boolean
  cookie_flags?: string
  custom_map?: Record<string, string>
  [key: string]: unknown
}

// ============================================
// INITIALIZATION
// ============================================

/**
 * Initialize Google Analytics
 */
export function initGA(measurementId: string = GA_MEASUREMENT_ID || '') {
  if (typeof window === 'undefined') return
  if (!measurementId) {
    console.warn('GA Measurement ID not provided')
    return
  }

  // Initialize dataLayer
  window.dataLayer = window.dataLayer || []

  // Define gtag function
  window.gtag = function(...args: Parameters<Window['gtag']>) {
    window.dataLayer.push(args)
  }

  // Initialize with timestamp
  window.gtag('js', new Date().toISOString())

  // Configure GA
  window.gtag('config', measurementId, {
    send_page_view: false, // We'll handle page views manually
    cookie_flags: 'SameSite=None;Secure',
    custom_map: {
      custom_parameter_1: 'dimension1',
      custom_parameter_2: 'dimension2',
    },
  })
}

// ============================================
// PAGE TRACKING
// ============================================

/**
 * Track page view
 */
export function pageview(
  url: string,
  title?: string,
  location?: string
) {
  if (typeof window === 'undefined' || !window.gtag) return

  window.gtag('config', GA_MEASUREMENT_ID || '', {
    page_path: url,
    page_title: title,
    page_location: location || window.location.href,
    send_page_view: true,
  })
}

/**
 * Track SPA page view
 */
export function pageviewSPA(
  url: string,
  title?: string
) {
  if (typeof window === 'undefined' || !window.gtag) return

  window.gtag('event', 'page_view', {
    page_path: url,
    page_title: title,
    page_location: window.location.href,
  })
}

// ============================================
// EVENT TRACKING
// ============================================

interface EventParams {
  [key: string]: string | number | boolean | undefined | unknown[]
}

/**
 * Track custom event
 */
export function event(
  action: string,
  params: EventParams = {}
) {
  if (typeof window === 'undefined' || !window.gtag) return

  window.gtag('event', action, {
    ...params,
    send_to: GA_MEASUREMENT_ID,
  })
}

/**
 * Track click event
 */
export function trackClick(
  elementName: string,
  elementLocation: string,
  additionalParams?: EventParams
) {
  event('click', {
    element_name: elementName,
    element_location: elementLocation,
    ...additionalParams,
  })
}

/**
 * Track form submission
 */
export function trackFormSubmit(
  formName: string,
  success: boolean,
  additionalParams?: EventParams
) {
  event('form_submit', {
    form_name: formName,
    form_submit_success: success,
    ...additionalParams,
  })
}

// ============================================
// USER PROPERTIES
// ============================================

/**
 * Set user properties
 */
export function setUserProperties(properties: Record<string, string | number | boolean>) {
  if (typeof window === 'undefined' || !window.gtag) return

  window.gtag('set', 'user_properties', properties)
}

/**
 * Set user ID
 */
export function setUserId(userId: string | null) {
  if (typeof window === 'undefined' || !window.gtag) return

  window.gtag('config', GA_MEASUREMENT_ID || '', {
    user_id: userId,
  })
}

// ============================================
// CONSENT MANAGEMENT
// ============================================

export type ConsentStatus = 'granted' | 'denied'

export interface ConsentSettings {
  ad_storage?: ConsentStatus
  analytics_storage?: ConsentStatus
  functionality_storage?: ConsentStatus
  personalization_storage?: ConsentStatus
  security_storage?: ConsentStatus
  [key: string]: string | undefined
}

/**
 * Update consent settings
 */
export function updateConsent(consent: ConsentSettings) {
  if (typeof window === 'undefined' || !window.gtag) return

  window.gtag('consent', 'update', consent as Record<string, unknown>)
}

/**
 * Set default consent (before user interaction)
 */
export function defaultConsent(consent: ConsentSettings) {
  if (typeof window === 'undefined' || !window.gtag) return

  window.gtag('consent', 'default', consent as Record<string, unknown>)
}

// ============================================
// E-COMMERCE TRACKING
// ============================================

export interface ProductItem {
  item_id: string
  item_name: string
  item_brand?: string
  item_category?: string
  item_category2?: string
  item_variant?: string
  price?: number
  quantity?: number
  item_list_name?: string
  item_list_id?: string
  index?: number
}

export interface PromotionItem {
  promotion_id?: string
  promotion_name?: string
  creative_name?: string
  creative_slot?: string
  location_id?: string
}

/**
 * View item (product detail)
 */
export function viewItem(item: ProductItem) {
  event('view_item', {
    currency: 'EUR',
    value: item.price,
    items: [item] as unknown as string,
  })
}

/**
 * View item list (category page)
 */
export function viewItemList(items: ProductItem[], listName?: string) {
  event('view_item_list', {
    item_list_name: listName,
    items: items as unknown as string,
  })
}

/**
 * Select item from list
 */
export function selectItem(item: ProductItem, listName?: string) {
  event('select_item', {
    item_list_name: listName,
    items: [item] as unknown as string,
  })
}

/**
 * Add to cart
 */
export function addToCart(item: ProductItem) {
  event('add_to_cart', {
    currency: 'EUR',
    value: (item.price || 0) * (item.quantity || 1),
    items: [item] as unknown as string,
  })
}

/**
 * Remove from cart
 */
export function removeFromCart(item: ProductItem) {
  event('remove_from_cart', {
    currency: 'EUR',
    value: (item.price || 0) * (item.quantity || 1),
    items: [item] as unknown as string,
  })
}

/**
 * View cart
 */
export function viewCart(items: ProductItem[], total: number) {
  event('view_cart', {
    currency: 'EUR',
    value: total,
    items: items as unknown as string,
  })
}

/**
 * Begin checkout
 */
export function beginCheckout(items: ProductItem[], total: number, coupon?: string) {
  event('begin_checkout', {
    currency: 'EUR',
    value: total,
    coupon,
    items: items as unknown as string,
  })
}

/**
 * Add shipping info
 */
export function addShippingInfo(
  items: ProductItem[],
  total: number,
  shippingTier: string,
  coupon?: string
) {
  event('add_shipping_info', {
    currency: 'EUR',
    value: total,
    coupon,
    shipping_tier: shippingTier,
    items: items as unknown as string,
  })
}

/**
 * Add payment info
 */
export function addPaymentInfo(
  items: ProductItem[],
  total: number,
  paymentType: string,
  coupon?: string
) {
  event('add_payment_info', {
    currency: 'EUR',
    value: total,
    coupon,
    payment_type: paymentType,
    items: items as unknown as string,
  })
}

/**
 * Purchase
 */
export function purchase(
  transactionId: string,
  items: ProductItem[],
  total: number,
  tax?: number,
  shipping?: number,
  coupon?: string
) {
  event('purchase', {
    transaction_id: transactionId,
    value: total,
    currency: 'EUR',
    tax,
    shipping,
    coupon,
    items: items as unknown as string,
  })
}

// ============================================
// SEARCH TRACKING
// ============================================

/**
 * Track search
 */
export function search(searchTerm: string, resultsCount?: number) {
  event('search', {
    search_term: searchTerm,
    results_count: resultsCount,
  })
}

// ============================================
// ENGAGEMENT TRACKING
// ============================================

/**
 * Track scroll depth
 */
export function scroll(depthPercent: number) {
  event('scroll', {
    percent_scrolled: depthPercent,
  })
}

/**
 * Track video engagement
 */
export function videoStart(videoTitle: string, videoProvider?: string) {
  event('video_start', {
    video_title: videoTitle,
    video_provider: videoProvider,
  })
}

export function videoComplete(videoTitle: string, videoProvider?: string) {
  event('video_complete', {
    video_title: videoTitle,
    video_provider: videoProvider,
  })
}

// ============================================
// CUSTOM DIMENSIONS & METRICS
// ============================================

/**
 * Set custom dimension
 */
export function setCustomDimension(index: number, value: string) {
  if (typeof window === 'undefined' || !window.gtag) return

  window.gtag('config', GA_MEASUREMENT_ID || '', {
    [`custom_map.dimension${index}`]: value,
  })
}

/**
 * Set custom metric
 */
export function setCustomMetric(index: number, value: number) {
  if (typeof window === 'undefined' || !window.gtag) return

  window.gtag('config', GA_MEASUREMENT_ID || '', {
    [`custom_map.metric${index}`]: value,
  })
}
