// ============================================
// E-Commerce Event Tracking
// ============================================
// High-level event tracking functions

import {
  viewItem,
  viewItemList,
  selectItem,
  addToCart,
  removeFromCart,
  viewCart,
  beginCheckout,
  addShippingInfo,
  addPaymentInfo,
  purchase,
  search,
  event,
  ProductItem,
} from './gtag'
import { Product, CartItem } from '@/types/store'
import { Locale } from '@/lib/i18n/config'

// ============================================
// PRODUCT TO ANALYTICS MAPPING
// ============================================

/**
 * Convert product to GA4 item format
 */
export function productToAnalyticsItem(
  product: Product,
  quantity: number = 1,
  index?: number
): ProductItem {
  return {
    item_id: product.sku || product.id,
    item_name: product.name.en,
    item_brand: 'LAGO',
    item_category: product.category?.name.en || product.material || 'General',
    item_variant: product.finish || undefined,
    price: product.salePrice || product.basePrice,
    quantity,
    index,
  }
}

/**
 * Convert cart item to GA4 item format
 */
export function cartItemToAnalyticsItem(
  item: CartItem,
  index?: number
): ProductItem {
  return {
    item_id: item.sku || item.productId,
    item_name: (item as { productName: string }).productName,
    item_brand: 'LAGO',
    item_category: item.product?.material || 'General',
    price: (item as { unitPrice: number }).unitPrice,
    quantity: item.quantity,
    index,
  }
}

// ============================================
// PRODUCT EVENTS
// ============================================

/**
 * Track product view
 */
export function trackProductView(product: Product, locale: Locale) {
  viewItem(productToAnalyticsItem(product))
}

/**
 * Track product list view (category/store page)
 */
export function trackProductListView(
  products: Product[],
  listName: string,
  locale: Locale
) {
  const items = products.map((p, i) => productToAnalyticsItem(p, 1, i + 1))
  viewItemList(items, listName)
}

/**
 * Track product selection from list
 */
export function trackProductSelect(
  product: Product,
  listName: string,
  position: number,
  locale: Locale
) {
  selectItem(productToAnalyticsItem(product, 1, position), listName)
}

// ============================================
// CART EVENTS
// ============================================

/**
 * Track add to cart
 */
export function trackAddToCart(product: Product, quantity: number, locale: Locale) {
  addToCart(productToAnalyticsItem(product, quantity))
}

/**
 * Track remove from cart
 */
export function trackRemoveFromCart(product: Product, quantity: number, locale: Locale) {
  removeFromCart(productToAnalyticsItem(product, quantity))
}

/**
 * Track cart view
 */
export function trackViewCart(items: CartItem[], locale: Locale) {
  const analyticsItems = items.map((item, i) => cartItemToAnalyticsItem(item, i + 1))
  const total = items.reduce((sum, item) => sum + (item as { unitPrice: number }).unitPrice * item.quantity, 0)
  viewCart(analyticsItems, total)
}

// ============================================
// CHECKOUT EVENTS
// ============================================

/**
 * Track checkout start
 */
export function trackBeginCheckout(
  items: CartItem[],
  coupon?: string,
  locale?: Locale
) {
  const analyticsItems = items.map((item, i) => cartItemToAnalyticsItem(item, i + 1))
  const total = items.reduce((sum, item) => sum + (item as { unitPrice: number }).unitPrice * item.quantity, 0)
  beginCheckout(analyticsItems, total, coupon)
}

/**
 * Track shipping info addition
 */
export function trackAddShippingInfo(
  items: CartItem[],
  shippingTier: string,
  coupon?: string
) {
  const analyticsItems = items.map((item, i) => cartItemToAnalyticsItem(item, i + 1))
  const total = items.reduce((sum, item) => sum + (item as { unitPrice: number }).unitPrice * item.quantity, 0)
  addShippingInfo(analyticsItems, total, shippingTier, coupon)
}

/**
 * Track payment info addition
 */
export function trackAddPaymentInfo(
  items: CartItem[],
  paymentType: string,
  coupon?: string
) {
  const analyticsItems = items.map((item, i) => cartItemToAnalyticsItem(item, i + 1))
  const total = items.reduce((sum, item) => sum + (item as { unitPrice: number }).unitPrice * item.quantity, 0)
  addPaymentInfo(analyticsItems, total, paymentType, coupon)
}

/**
 * Track purchase completion
 */
export function trackPurchase(
  transactionId: string,
  items: CartItem[],
  total: number,
  tax: number,
  shipping: number,
  coupon?: string
) {
  const analyticsItems = items.map((item, i) => cartItemToAnalyticsItem(item, i + 1))
  purchase(transactionId, analyticsItems, total, tax, shipping, coupon)
}

// ============================================
// SEARCH EVENTS
// ============================================

/**
 * Track search
 */
export function trackSearch(searchTerm: string, resultsCount: number, locale: Locale) {
  search(searchTerm, resultsCount)
}

// ============================================
// USER ENGAGEMENT EVENTS
// ============================================

/**
 * Track CTA click
 */
export function trackCTAClick(ctaName: string, ctaLocation: string, locale: Locale) {
  event('cta_click', {
    cta_name: ctaName,
    cta_location: ctaLocation,
    locale,
  })
}

/**
 * Track navigation
 */
export function trackNavigation(from: string, to: string, locale: Locale) {
  event('navigation', {
    from_path: from,
    to_path: to,
    locale,
  })
}

/**
 * Track project view
 */
export function trackProjectView(projectId: string, projectName: string, locale: Locale) {
  event('project_view', {
    project_id: projectId,
    project_name: projectName,
    locale,
  })
}

/**
 * Track contact form submission
 */
export function trackContactSubmit(success: boolean, locale: Locale) {
  event('contact_submit', {
    form_name: 'contact',
    form_submit_success: success,
    locale,
  })
}

/**
 * Track file download
 */
export function trackDownload(fileName: string, fileType: string, locale: Locale) {
  event('file_download', {
    file_name: fileName,
    file_extension: fileType,
    locale,
  })
}

/**
 * Track social share
 */
export function trackSocialShare(platform: string, contentType: string, locale: Locale) {
  event('share', {
    method: platform,
    content_type: contentType,
    locale,
  })
}

/**
 * Track video engagement
 */
export function trackVideoPlay(videoTitle: string, locale: Locale) {
  event('video_start', {
    video_title: videoTitle,
    video_provider: 'internal',
  })
}

/**
 * Track scroll depth
 */
export function trackScrollDepth(depthPercent: number, pagePath: string) {
  event('scroll', {
    percent_scrolled: depthPercent,
    page_path: pagePath,
  })
}

/**
 * Track time on page
 */
export function trackTimeOnPage(durationSeconds: number, pagePath: string) {
  event('time_on_page', {
    duration_seconds: durationSeconds,
    page_path: pagePath,
  })
}

// ============================================
// ERROR TRACKING
// ============================================

/**
 * Track error
 */
export function trackError(errorType: string, errorMessage: string, component?: string) {
  event('exception', {
    description: errorMessage,
    fatal: false,
    error_type: errorType,
    component: component || 'unknown',
  })
}

// ============================================
// PERFORMANCE EVENTS
// ============================================

/**
 * Track page load performance
 */
export function trackPageLoad(
  pagePath: string,
  loadTimeMs: number,
  locale: Locale
) {
  event('page_load_time', {
    page_path: pagePath,
    load_time_ms: loadTimeMs,
    locale,
  })
}

/**
 * Track Core Web Vitals
 */
export function trackWebVitals(
  metricName: string,
  value: number,
  rating: 'good' | 'needs-improvement' | 'poor'
) {
  event('web_vitals', {
    metric_name: metricName,
    metric_value: value,
    metric_rating: rating,
  })
}

// ============================================
// USER PROPERTIES
// ============================================

/**
 * Set user locale preference
 */
import { setUserProperties } from './gtag'

export function setUserLocalePreference(locale: Locale) {
  setUserProperties({
    preferred_locale: locale,
  })
}

/**
 * Set user type
 */
export function setUserType(type: 'guest' | 'registered' | 'vip') {
  setUserProperties({
    user_type: type,
  })
}
