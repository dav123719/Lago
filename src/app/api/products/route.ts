export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { createClient as createServerClient } from '@/lib/supabase/server'

type SortOption = 'featured' | 'price_asc' | 'price_desc' | 'name_asc' | 'name_desc' | 'newest'

const MAX_PAGE = 10_000
const MAX_LIMIT = 48
const MAX_PRICE = 9_999_999
const PRODUCT_COLUMNS = [
  'id', 'sanity_id', 'sku', 'slug', 'name', 'name_en', 'name_ru',
  'description_lv', 'description_en', 'description_ru',
  'short_description_lv', 'short_description_en', 'short_description_ru',
  'price', 'compare_at_price', 'stock_quantity', 'weight_kg', 'dimensions',
  'material', 'finish', 'tags', 'images', 'image', 'is_available', 'is_featured',
  'created_at', 'updated_at',
].join(',')
const CATEGORY_COLUMNS = 'id,sanity_id,slug,name_lv,name_en,name_ru,description_lv,description_en,description_ru,parent_id,sort_order,is_active,show_in_navigation,image_url,created_at,updated_at'

interface PublicProduct {
  id: string
  sanityId: string
  sku: string
  slug: string
  name: { lv: string; en: string; ru: string }
  description?: { lv: string; en: string; ru: string }
  shortDescription?: { lv: string; en: string; ru: string }
  basePrice: number
  salePrice?: number
  stockQuantity: number
  stockStatus: string
  weightKg?: number
  dimensionsCm?: Record<string, number>
  material?: string
  finish?: string
  category?: Record<string, unknown>
  tags: string[]
  images: unknown[]
  featuredImage?: string
  status: string
  isFeatured: boolean
  createdAt: string
  updatedAt: string
}

function parseInteger(value: string | null, fallback: number, label: string): number {
  if (value === null) return fallback
  if (!/^\d+$/.test(value)) throw new Error(`Invalid ${label}`)
  const parsed = Number(value)
  if (!Number.isSafeInteger(parsed)) throw new Error(`Invalid ${label}`)
  return parsed
}

function parsePrice(value: string | null, label: string): number | null {
  if (value === null) return null
  if (!/^(?:0|[1-9]\d{0,6})(?:\.\d{1,2})?$/.test(value)) throw new Error(`Invalid ${label}`)
  const parsed = Number(value)
  if (!Number.isFinite(parsed) || parsed > MAX_PRICE) throw new Error(`Invalid ${label}`)
  return parsed
}

function parseList(value: string | null, label: string): string[] | null {
  if (value === null) return null
  const items = value.split(',').map(item => item.trim())
  if (items.length > 10 || items.some(item => !/^[\p{L}\p{N} -]{1,40}$/u.test(item))) {
    throw new Error(`Invalid ${label}`)
  }
  return [...new Set(items)]
}

function transformProduct(item: Record<string, unknown>): PublicProduct {
  const category = item.category as Record<string, unknown> | null
  const name = String(item.name || '')
  const stockQuantity = Number(item.stock_quantity || 0)
  return {
    id: String(item.id),
    sanityId: String(item.sanity_id || ''),
    sku: String(item.sku || ''),
    slug: String(item.slug || ''),
    name: { lv: name, en: String(item.name_en || name), ru: String(item.name_ru || name) },
    description: item.description_en ? {
      lv: String(item.description_lv || ''), en: String(item.description_en), ru: String(item.description_ru || ''),
    } : undefined,
    shortDescription: item.short_description_en ? {
      lv: String(item.short_description_lv || ''), en: String(item.short_description_en), ru: String(item.short_description_ru || ''),
    } : undefined,
    basePrice: Number(item.price || 0),
    salePrice: item.compare_at_price == null ? undefined : Number(item.compare_at_price),
    stockQuantity,
    stockStatus: stockQuantity > 0 ? 'in_stock' : 'out_of_stock',
    weightKg: item.weight_kg == null ? undefined : Number(item.weight_kg),
    dimensionsCm: (item.dimensions as Record<string, number> | null) || undefined,
    material: item.material == null ? undefined : String(item.material),
    finish: item.finish == null ? undefined : String(item.finish),
    category: category ? {
      id: category.id,
      sanityId: category.sanity_id,
      slug: category.slug,
      name: {
        lv: category.name_lv,
        en: category.name_en || category.name_lv,
        ru: category.name_ru || category.name_lv,
      },
      description: category.description_en ? {
        lv: category.description_lv,
        en: category.description_en,
        ru: category.description_ru,
      } : undefined,
      parentId: category.parent_id,
      sortOrder: category.sort_order,
      isActive: category.is_active,
      showInNavigation: category.show_in_navigation,
      imageUrl: category.image_url,
      createdAt: category.created_at,
      updatedAt: category.updated_at,
    } : undefined,
    tags: (item.tags as string[] | null) || [],
    images: (item.images as unknown[] | null) || [],
    featuredImage: item.image == null ? undefined : String(item.image),
    status: item.is_available ? 'active' : 'inactive',
    isFeatured: Boolean(item.is_featured),
    createdAt: String(item.created_at || ''),
    updatedAt: String(item.updated_at || ''),
  }
}

export async function GET(req: NextRequest) {
  try {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      return NextResponse.json({ error: 'Product catalog is temporarily unavailable' }, { status: 503 })
    }

    const { searchParams } = new URL(req.url)
    const requestedPage = parseInteger(searchParams.get('page'), 1, 'page')
    const requestedLimit = parseInteger(searchParams.get('limit'), 12, 'limit')
    const page = Math.min(Math.max(requestedPage, 1), MAX_PAGE)
    const limit = Math.min(Math.max(requestedLimit, 1), MAX_LIMIT)
    const rawSort = searchParams.get('sort') || 'featured'
    const validSorts: SortOption[] = ['featured', 'price_asc', 'price_desc', 'name_asc', 'name_desc', 'newest']
    if (!validSorts.includes(rawSort as SortOption)) throw new Error('Invalid sort')
    const sort = rawSort as SortOption
    const rawSearch = searchParams.get('search')
    const search = rawSearch?.trim() || null
    if (search && (search.length > 80 || !/^[\p{L}\p{N} -]+$/u.test(search))) throw new Error('Invalid search')

    const category = searchParams.get('category')?.trim() || null
    if (category && !/^[a-z0-9][a-z0-9-]{0,99}$/i.test(category)) throw new Error('Invalid category')
    const materials = parseList(searchParams.get('material'), 'material')
    const finishes = parseList(searchParams.get('finish'), 'finish')
    const minPrice = parsePrice(searchParams.get('minPrice'), 'minPrice')
    const maxPrice = parsePrice(searchParams.get('maxPrice'), 'maxPrice')
    if (minPrice !== null && maxPrice !== null && minPrice > maxPrice) throw new Error('Invalid price range')
    const inStockParam = searchParams.get('inStock')
    if (inStockParam !== null && inStockParam !== 'true' && inStockParam !== 'false') throw new Error('Invalid inStock')

    const supabase = await createServerClient()
    const categorySelection = category
      ? `category:categories!inner(${CATEGORY_COLUMNS})`
      : `category:categories(${CATEGORY_COLUMNS})`
    let query = supabase
      .from('products')
      .select(`${PRODUCT_COLUMNS},${categorySelection}`, { count: 'exact' })
      .eq('is_available', true)

    if (search) query = query.or(`name.ilike.%${search}%,sku.ilike.%${search}%`)
    if (category) query = query.eq('category.slug', category)
    if (materials) query = query.in('material', materials)
    if (finishes) query = query.in('finish', finishes)
    if (minPrice !== null) query = query.gte('price', minPrice)
    if (maxPrice !== null) query = query.lte('price', maxPrice)
    if (inStockParam === 'true') query = query.gt('stock_quantity', 0)

    switch (sort) {
      case 'price_asc': query = query.order('price', { ascending: true }); break
      case 'price_desc': query = query.order('price', { ascending: false }); break
      case 'name_asc': query = query.order('name', { ascending: true }); break
      case 'name_desc': query = query.order('name', { ascending: false }); break
      case 'newest': query = query.order('created_at', { ascending: false }); break
      default:
        query = query.order('is_featured', { ascending: false }).order('created_at', { ascending: false })
    }

    const from = (page - 1) * limit
    const to = from + limit - 1
    const { data, error, count } = await query.range(from, to)
    if (error) throw error

    const products = ((data as unknown[]) || []).map(item => transformProduct(item as Record<string, unknown>))
    const total = count || 0
    return NextResponse.json({ products, total, hasMore: from + products.length < total })
  } catch (error) {
    if (error instanceof Error && error.message.startsWith('Invalid ')) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }
    console.error('Error fetching products:', error)
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 })
  }
}
