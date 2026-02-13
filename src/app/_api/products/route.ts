// AGENT slave-3 v1.0.1 - API routes verified

// ============================================
export const dynamic = "force-dynamic"

// Products API Route
// ============================================

import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/client'

// CORS headers for API routes
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
}

type SortOption = 'featured' | 'price_asc' | 'price_desc' | 'name_asc' | 'name_desc' | 'newest'

interface Product {
  id: string
  sanityId: string
  sku: string
  slug: string
  name: {
    lv: string
    en: string
    ru: string
  }
  description?: {
    lv: string
    en: string
    ru: string
  }
  shortDescription?: {
    lv: string
    en: string
    ru: string
  }
  basePrice: number
  salePrice?: number
  costPrice?: number
  stockQuantity: number
  stockStatus: string
  lowStockThreshold?: number
  weightKg?: number
  dimensionsCm?: {
    length: number
    width: number
    height: number
  }
  material?: string
  finish?: string
  categoryId?: string
  category?: {
    id: string
    sanityId: string
    slug: string
    name: {
      lv: string
      en: string
      ru: string
    }
    description?: {
      lv: string
      en: string
      ru: string
    }
    parentId?: string
    sortOrder?: number
    isActive: boolean
    showInNavigation: boolean
    imageUrl?: string
    createdAt: string
    updatedAt: string
  }
  tags: string[]
  images: unknown[]
  featuredImage?: string
  status: string
  isFeatured: boolean
  metaTitle?: {
    lv: string
    en: string
    ru: string
  }
  metaDescription?: {
    lv: string
    en: string
    ru: string
  }
  lastSyncedAt?: string
  sanityUpdatedAt?: string
  createdAt: string
  updatedAt: string
}

// Environment variable validation
function validateEnv() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    throw new Error('Missing environment variable: NEXT_PUBLIC_SUPABASE_URL')
  }
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('Missing environment variable: SUPABASE_SERVICE_ROLE_KEY')
  }
}

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders })
}

export async function GET(req: NextRequest) {
  try {
    // Validate environment variables
    validateEnv()

    const { searchParams } = new URL(req.url)
    
    // Parse query parameters
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '12')
    const sort = (searchParams.get('sort') || 'featured') as SortOption
    const search = searchParams.get('search')
    const category = searchParams.get('category')
    const material = searchParams.get('material')
    const finish = searchParams.get('finish')
    const minPrice = searchParams.get('minPrice')
    const maxPrice = searchParams.get('maxPrice')
    const inStock = searchParams.get('inStock') === 'true'

    const supabase = createServerClient()

    // Build query
    let query = supabase
      .from('products')
      .select(
        `
        *,
        category:categories(*)
      `,
        { count: 'exact' }
      )
      .eq('is_available', true)

    // Apply filters
    if (search) {
      query = query.or(
        `name.ilike.%${search}%,sku.ilike.%${search}%`
      )
    }

    if (category) {
      query = query.eq('category.slug', category)
    }

    if (material) {
      const materials = material.split(',')
      query = query.in('material', materials)
    }

    if (finish) {
      const finishes = finish.split(',')
      query = query.in('finish', finishes)
    }

    if (minPrice !== null && minPrice !== undefined) {
      query = query.gte('price', parseFloat(minPrice))
    }

    if (maxPrice !== null && maxPrice !== undefined) {
      query = query.lte('price', parseFloat(maxPrice))
    }

    if (inStock) {
      query = query.gt('stock_quantity', 0)
    }

    // Apply sorting
    switch (sort) {
      case 'price_asc':
        query = query.order('price', { ascending: true })
        break
      case 'price_desc':
        query = query.order('price', { ascending: false })
        break
      case 'name_asc':
        query = query.order('name', { ascending: true })
        break
      case 'name_desc':
        query = query.order('name', { ascending: false })
        break
      case 'newest':
        query = query.order('created_at', { ascending: false })
        break
      case 'featured':
      default:
        query = query.order('is_featured', { ascending: false })
        query = query.order('created_at', { ascending: false })
        break
    }

    // Apply pagination
    const from = (page - 1) * limit
    const to = from + limit - 1
    query = query.range(from, to)

    const { data, error, count } = await query

    if (error) {
      throw error
    }

    // Transform data to match Product type
    const products: Product[] = ((data as unknown[]) || []).map((item: unknown) => {
      const productItem = item as Record<string, unknown>
      const categoryData = productItem.category as Record<string, unknown> | null
      
      return {
        id: productItem.id as string,
        sanityId: productItem.sanity_id as string,
        sku: productItem.sku as string,
        slug: productItem.slug as string,
        name: {
          lv: productItem.name as string,
          en: (productItem.name_en as string) || (productItem.name as string),
          ru: (productItem.name_ru as string) || (productItem.name as string),
        },
        description: productItem.description_en ? {
          lv: productItem.description_lv as string,
          en: productItem.description_en as string,
          ru: productItem.description_ru as string,
        } : undefined,
        shortDescription: productItem.short_description_en ? {
          lv: productItem.short_description_lv as string,
          en: productItem.short_description_en as string,
          ru: productItem.short_description_ru as string,
        } : undefined,
        basePrice: productItem.price as number,
        salePrice: productItem.compare_at_price as number | undefined,
        stockQuantity: productItem.stock_quantity as number,
        stockStatus: productItem.stock_quantity as number > 0 ? 'in_stock' : 'out_of_stock',
        weightKg: productItem.weight_kg as number | undefined,
        material: productItem.material as string | undefined,
        finish: productItem.finish as string | undefined,
        category: categoryData ? {
          id: categoryData.id as string,
          sanityId: categoryData.sanity_id as string,
          slug: categoryData.slug as string,
          name: {
            lv: categoryData.name as string,
            en: (categoryData.name_en as string) || (categoryData.name as string),
            ru: (categoryData.name_ru as string) || (categoryData.name as string),
          },
          isActive: true,
          showInNavigation: true,
          createdAt: categoryData.created_at as string,
          updatedAt: categoryData.updated_at as string,
        } : undefined,
        tags: (productItem.tags as string[]) || [],
        images: (productItem.images as unknown[]) || [],
        featuredImage: productItem.image as string | undefined,
        status: productItem.is_available ? 'active' : 'inactive',
        isFeatured: productItem.is_featured as boolean,
        createdAt: productItem.created_at as string,
        updatedAt: productItem.updated_at as string,
      }
    })

    const total = count || 0
    const hasMore = from + products.length < total

    return NextResponse.json({
      products,
      total,
      hasMore,
    }, { headers: corsHeaders })
  } catch (error) {
    console.error('Error fetching products:', error)
    
    // Check if it's an environment variable error
    if (error instanceof Error && error.message.includes('Missing environment variable')) {
      return NextResponse.json(
        { 
          error: 'Server configuration error',
          message: error.message
        },
        { status: 500, headers: corsHeaders }
      )
    }
    
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500, headers: corsHeaders }
    )
  }
}
