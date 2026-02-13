// ============================================
// Test Mocks
// ============================================
// Mock data for tests

import { Product, Cart, CartItem, Order, OrderItem } from '@/types/store'
import { SanityProject } from '@/lib/sanity/types'
import { Locale } from '@/lib/i18n/config'

// ============================================
// PRODUCT MOCKS
// ============================================

export const mockProduct: Product = {
  id: 'prod-1',
  sku: 'LAGO-001',
  slug: 'silestone-eternal-calacatta-gold',
  name: {
    lv: 'Silestone Eternal Calacatta Gold',
    en: 'Silestone Eternal Calacatta Gold',
    ru: 'Silestone Eternal Calacatta Gold',
  },
  description: {
    lv: 'Eleganta akmens virsma ar zelta veiniem',
    en: 'Elegant stone surface with golden veins',
    ru: 'Элегантная каменная поверхность с золотыми прожилками',
  },
  shortDescription: {
    lv: 'Premium Silestone virsma virtuvei',
    en: 'Premium Silestone surface for kitchens',
    ru: 'Премиальная поверхность Silestone для кухонь',
  },
  basePrice: 450,
  salePrice: 399,
  stockQuantity: 10,
  stockStatus: 'in_stock',
  lowStockThreshold: 3,
  weightKg: 75,
  dimensionsCm: { length: 300, width: 140, height: 2 },
  material: 'silestone',
  finish: 'polished',
  tags: ['kitchen', 'countertop', 'premium'],
  images: [],
  featuredImage: '/images/products/silestone-calacatta.jpg',
  status: 'active',
  isFeatured: true,
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
}

export const mockProducts: Product[] = [
  mockProduct,
  {
    ...mockProduct,
    id: 'prod-2',
    sku: 'LAGO-002',
    slug: 'dekton-aura',
    name: {
      lv: 'Dekton Aura',
      en: 'Dekton Aura',
      ru: 'Dekton Aura',
    },
    basePrice: 550,
    salePrice: undefined,
    material: 'dekton',
  },
  {
    ...mockProduct,
    id: 'prod-3',
    sku: 'LAGO-003',
    slug: 'granite-kashmir-white',
    name: {
      lv: 'Granīts Kashmir White',
      en: 'Granite Kashmir White',
      ru: 'Гранит Kashmir White',
    },
    basePrice: 350,
    material: 'granite',
    stockStatus: 'low_stock',
    stockQuantity: 2,
  },
]

// ============================================
// CART MOCKS
// ============================================

export const mockCartItem: CartItem = {
  id: 'ci-1',
  cart_id: 'cart-1',
  product_id: 'prod-1',
  product_name: 'Silestone Eternal Calacatta Gold',
  sku: 'LAGO-001',
  quantity: 2,
  unit_price: 399,
  total_price: 798,
  image_url: '/images/products/silestone-calacatta.jpg',
  created_at: '2024-01-01T00:00:00Z',
  product: mockProduct,
}

export const mockCart: Cart = {
  id: 'cart-1',
  user_id: 'user-1',
  guest_session_id: 'session-1',
  status: 'active',
  subtotal: 798,
  shipping_cost: 25,
  tax: 0,
  total: 823,
  currency: 'EUR',
  item_count: 2,
  items: [mockCartItem],
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
}

// ============================================
// ORDER MOCKS
// ============================================

export const mockOrderItem: OrderItem = {
  id: 'oi-1',
  order_id: 'order-1',
  product_id: 'prod-1',
  product_name: 'Silestone Eternal Calacatta Gold',
  product_sku: 'LAGO-001',
  quantity: 2,
  unit_price: 399,
  total_price: 798,
  image_url: '/images/products/silestone-calacatta.jpg',
  created_at: '2024-01-01T00:00:00Z',
}

export const mockOrder: Order = {
  id: 'order-1',
  order_number: 'LGO-240101-1234',
  user_id: 'user-1',
  customer_email: 'customer@example.com',
  customer_name: 'John Doe',
  customer_phone: '+371 20000000',
  status: 'paid',
  subtotal: 798,
  tax: 0,
  shipping: 25,
  discount: 0,
  total: 823,
  currency: 'EUR',
  shipping_address: {
    first_name: 'John',
    last_name: 'Doe',
    address1: 'Krasta iela 52',
    city: 'Riga',
    postal_code: 'LV-1003',
    country: 'Latvia',
    phone: '+371 20000000',
  },
  billing_address: {
    first_name: 'John',
    last_name: 'Doe',
    address1: 'Krasta iela 52',
    city: 'Riga',
    postal_code: 'LV-1003',
    country: 'Latvia',
    phone: '+371 20000000',
  },
  notes: '',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
  paid_at: '2024-01-01T00:05:00Z',
  items: [mockOrderItem],
  tracking: {
    carrier: 'DPD',
    tracking_number: '123456789',
    shipped_at: '2024-01-02T00:00:00Z',
  },
}

// ============================================
// PROJECT MOCKS
// ============================================

export const mockProject: SanityProject = {
  _id: 'proj-1',
  _type: 'project',
  _createdAt: '2024-01-01T00:00:00Z',
  _updatedAt: '2024-01-01T00:00:00Z',
  slug: {
    lv: { _type: 'slug', current: 'projekts-1' },
    en: { _type: 'slug', current: 'project-1' },
    ru: { _type: 'slug', current: 'proekt-1' },
  },
  title: {
    lv: 'Virtuves projekts Rīgā',
    en: 'Kitchen Project in Riga',
    ru: 'Кухонный проект в Риге',
  },
  subtitle: {
    lv: 'Moderna virtuve ar Silestone virsmu',
    en: 'Modern kitchen with Silestone surface',
    ru: 'Современная кухня с поверхностью Silestone',
  },
  category: 'stone',
  material: 'silestone',
  tags: ['kitchen', 'modern', 'residential'],
  year: 2024,
  location: {
    lv: 'Rīga, Latvija',
    en: 'Riga, Latvia',
    ru: 'Рига, Латвия',
  },
  summary: {
    lv: 'Elegantas virtuves projekts ar Calacatta Gold akmens virsmu',
    en: 'Elegant kitchen project with Calacatta Gold stone surface',
    ru: 'Элегантный кухонный проект с каменной поверхностью Calacatta Gold',
  },
  body: { lv: [], en: [], ru: [] },
  gallery: [],
}

// ============================================
// USER MOCKS
// ============================================

export const mockUser = {
  id: 'user-1',
  email: 'customer@example.com',
  user_metadata: {
    full_name: 'John Doe',
    phone: '+371 20000000',
  },
  app_metadata: {},
  aud: 'authenticated',
  created_at: '2024-01-01T00:00:00Z',
  role: 'authenticated',
}

export const mockGuestSession = {
  id: 'session-1',
  created_at: '2024-01-01T00:00:00Z',
  expires_at: '2024-02-01T00:00:00Z',
}

// ============================================
// TRANSLATION MOCKS
// ============================================

export const mockTranslations: Record<Locale, Record<string, string>> = {
  lv: {
    'nav.home': 'Sākums',
    'nav.store': 'Veikals',
    'nav.projects': 'Projekti',
    'nav.contact': 'Kontakti',
    'common.addToCart': 'Pievienot grozam',
    'common.buyNow': 'Pirkt tagad',
    'common.outOfStock': 'Nav noliktavā',
    'cart.empty': 'Jūsu grozs ir tukšs',
    'cart.total': 'Kopā',
    'cart.checkout': 'Noformēt pasūtījumu',
  },
  en: {
    'nav.home': 'Home',
    'nav.store': 'Store',
    'nav.projects': 'Projects',
    'nav.contact': 'Contact',
    'common.addToCart': 'Add to Cart',
    'common.buyNow': 'Buy Now',
    'common.outOfStock': 'Out of Stock',
    'cart.empty': 'Your cart is empty',
    'cart.total': 'Total',
    'cart.checkout': 'Checkout',
  },
  ru: {
    'nav.home': 'Главная',
    'nav.store': 'Магазин',
    'nav.projects': 'Проекты',
    'nav.contact': 'Контакты',
    'common.addToCart': 'Добавить в корзину',
    'common.buyNow': 'Купить сейчас',
    'common.outOfStock': 'Нет в наличии',
    'cart.empty': 'Ваша корзина пуста',
    'cart.total': 'Итого',
    'cart.checkout': 'Оформить заказ',
  },
}

// ============================================
// API RESPONSE MOCKS
// ============================================

export const mockApiResponses = {
  products: {
    success: {
      data: mockProducts,
      total: mockProducts.length,
      page: 1,
      limit: 20,
      totalPages: 1,
      hasMore: false,
      filters: {
        categories: [],
        materials: ['silestone', 'dekton', 'granite'],
        finishes: ['polished', 'matte', 'honed'],
        priceRange: { min: 300, max: 600 },
      },
    },
    error: {
      message: 'Failed to fetch products',
      code: 'PRODUCTS_FETCH_ERROR',
    },
  },
  cart: {
    success: {
      data: mockCart,
      message: 'Cart updated successfully',
    },
    error: {
      message: 'Failed to update cart',
      code: 'CART_UPDATE_ERROR',
    },
  },
  order: {
    success: {
      data: mockOrder,
      message: 'Order created successfully',
    },
    error: {
      message: 'Failed to create order',
      code: 'ORDER_CREATE_ERROR',
    },
  },
}

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Create a mock fetch response
 */
export function createMockResponse<T>(data: T, status = 200) {
  return Promise.resolve({
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(data),
    text: () => Promise.resolve(JSON.stringify(data)),
  } as Response)
}

/**
 * Create a mock error response
 */
export function createMockErrorResponse(message: string, status = 500) {
  return Promise.resolve({
    ok: false,
    status,
    json: () => Promise.resolve({ error: message }),
    text: () => Promise.resolve(message),
  } as Response)
}

/**
 * Wait for promises to resolve
 */
export function flushPromises(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, 0))
}
