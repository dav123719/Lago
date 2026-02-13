// ============================================
// LAGO Store Types
// ============================================

import { Locale } from '@/lib/i18n/config'

// ============================================
// LOCALIZED CONTENT
// ============================================

export interface LocalizedString {
  lv: string
  en: string
  ru: string
}

export interface LocalizedContent {
  lv: string
  en: string
  ru: string
}

export interface LocalizedRichText {
  lv: unknown[] // Sanity portable text
  en: unknown[]
  ru: unknown[]
}

// ============================================
// CATEGORY
// ============================================

export interface Category {
  id: string
  sanityId?: string
  slug: string
  name: LocalizedString
  description?: LocalizedString
  parentId?: string | null
  sortOrder: number
  isActive: boolean
  showInNavigation: boolean
  imageUrl?: string
  createdAt: string
  updatedAt: string
}

// ============================================
// PRODUCT
// ============================================

export interface ProductDimensions {
  length?: number
  width?: number
  height?: number
}

export interface ProductImage {
  url: string
  alt: LocalizedString
  caption?: LocalizedString
  position?: number
}

export type ProductStatus = 'active' | 'draft' | 'archived'
export type StockStatus = 'in_stock' | 'low_stock' | 'out_of_stock' | 'pre_order'
export type MaterialType = 'silestone' | 'dekton' | 'granite' | 'marble' | 'other'
export type FinishType = 'polished' | 'matte' | 'honed' | 'leather'

export interface Product {
  id: string
  sanityId?: string
  sku: string
  slug: string
  name: LocalizedString
  description?: LocalizedString
  shortDescription?: LocalizedString
  basePrice: number
  salePrice?: number
  costPrice?: number
  stockQuantity: number
  stockStatus: StockStatus
  lowStockThreshold: number
  weightKg?: number
  dimensionsCm?: ProductDimensions
  material?: MaterialType
  finish?: FinishType
  categoryId?: string
  category?: Category
  tags: string[]
  images: ProductImage[]
  featuredImage?: string
  status: ProductStatus
  isFeatured: boolean
  metaTitle?: LocalizedString
  metaDescription?: LocalizedString
  lastSyncedAt?: string
  sanityUpdatedAt?: string
  createdAt: string
  updatedAt: string
}

// ============================================
// PRODUCT VARIANT
// ============================================

export interface ProductVariant {
  id: string
  productId: string
  sku: string
  name: LocalizedString
  priceAdjustment: number
  stockQuantity: number
  attributes: Record<string, string> // e.g., {"size": "60x60", "thickness": "20mm"}
  isActive: boolean
  createdAt: string
}

// ============================================
// FILTERS & SORTING
// ============================================

export interface ProductFilters {
  category?: string
  material?: MaterialType
  finish?: FinishType
  minPrice?: number
  maxPrice?: number
  inStock?: boolean
  search?: string
  tags?: string[]
}

export type SortOption = 'price_asc' | 'price_desc' | 'name_asc' | 'name_desc' | 'newest' | 'featured'

export interface FilterState {
  filters: ProductFilters
  sort: SortOption
  page: number
  limit: number
}

// ============================================
// CART
// ============================================

export interface CartItem {
  id: string
  cartId: string
  productId: string
  variantId?: string
  productName: string
  sku: string
  unitPrice: number
  originalUnitPrice: number
  quantity: number
  lineTotal: number
  customOptions?: Record<string, unknown>
  product?: Product
  createdAt: string
  updatedAt: string
}

export interface Cart {
  id: string
  userId?: string
  sessionId?: string
  expiresAt?: string
  subtotal: number
  discountAmount: number
  shippingCost: number
  taxAmount: number
  total: number
  shippingCountry?: string
  shippingPostalCode?: string
  currency: string
  itemCount: number
  items: CartItem[]
  createdAt: string
  updatedAt: string
}

// ============================================
// ORDER
// ============================================

export type OrderStatus = 
  | 'pending'
  | 'payment_processing'
  | 'paid'
  | 'processing'
  | 'ready_for_pickup'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'refunded'
  | 'partially_refunded'

export type PaymentStatus = 
  | 'pending'
  | 'authorized'
  | 'captured'
  | 'failed'
  | 'refunded'
  | 'partially_refunded'

export interface OrderAddress {
  firstName: string
  lastName: string
  phone?: string
  streetAddress: string
  apartmentSuite?: string
  city: string
  postalCode: string
  country: string
  countryCode: string
  parcelLockerId?: string
  parcelLockerProvider?: string
}

export interface OrderItem {
  id: string
  orderId: string
  productId?: string
  variantId?: string
  sku: string
  name: LocalizedString
  unitPrice: number
  originalUnitPrice?: number
  quantity: number
  lineTotal: number
  weightKg?: number
  dimensionsCm?: ProductDimensions
  material?: string
  customOptions?: Record<string, unknown>
  customPrice?: number
  returnedQuantity: number
  createdAt: string
}

export interface Order {
  id: string
  orderNumber: string
  userId?: string
  guestEmail?: string
  guestPhone?: string
  status: OrderStatus
  paymentStatus: PaymentStatus
  paymentMethod?: string
  paymentProvider?: string
  paymentIntentId?: string
  paymentRef?: string
  paidAt?: string
  subtotal: number
  discountCode?: string
  discountAmount: number
  shippingCost: number
  shippingMethod?: string
  taxRate: number
  taxAmount: number
  total: number
  currency: string
  shippingAddress: OrderAddress
  billingAddress?: OrderAddress
  carrier?: string
  carrierService?: string
  trackingNumber?: string
  trackingUrl?: string
  shippedAt?: string
  estimatedDelivery?: string
  deliveredAt?: string
  customerNotes?: string
  internalNotes?: string
  items: OrderItem[]
  createdAt: string
  updatedAt: string
}

// ============================================
// API RESPONSES
// ============================================

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
  hasMore: boolean
}

export interface ProductListResponse extends PaginatedResponse<Product> {
  filters: {
    categories: Category[]
    materials: MaterialType[]
    finishes: FinishType[]
    priceRange: {
      min: number
      max: number
    }
  }
}

// ============================================
// WEBHOOK
// ============================================

export interface SanityWebhookPayload {
  _id: string
  _type: string
  slug?: { current?: string }
  operation: 'create' | 'update' | 'delete'
}

// ============================================
// STOCK
// ============================================

export interface StockUpdate {
  productId: string
  variantId?: string
  stockQuantity: number
  stockStatus: StockStatus
  timestamp: string
}
