// ============================================
// Sanity to Supabase Product Sync
// ============================================

import { createServerClient } from '@/lib/supabase/client'
import type { Product, Category, ProductImage } from '@/types/store'

// ============================================
// FETCH FROM SANITY
// ============================================

export async function fetchSanityProduct(sanityId: string, client: { fetch: (query: string, params: Record<string, string>) => Promise<unknown> }) {
  const query = `*[_type == "product" && _id == $sanityId][0] {
    _id,
    _updatedAt,
    sku,
    slug,
    name,
    shortDescription,
    description,
    basePrice,
    salePrice,
    stockQuantity,
    lowStockThreshold,
    weight,
    dimensions,
    material,
    finish,
    "category": category->{
      _id,
      slug,
      name,
      description,
      sortOrder,
      isActive,
      showInNavigation,
      "imageUrl": image.asset->url
    },
    tags,
    images[] {
      ...,
      "url": asset->url,
      "metadata": asset->metadata
    },
    status,
    isFeatured,
    metaTitle,
    metaDescription
  }`

  return client.fetch(query, { sanityId }) as Promise<{
    _id: string
    _updatedAt: string
    sku: string
    slug: { current: string }
    name: { lv: string; en: string; ru: string }
    shortDescription?: { lv?: string; en?: string; ru?: string }
    description?: { lv?: unknown[]; en?: unknown[]; ru?: unknown[] }
    basePrice: number
    salePrice?: number
    stockQuantity?: number
    lowStockThreshold?: number
    weight?: number
    dimensions?: { length?: number; width?: number; height?: number }
    material?: string
    finish?: string
    category?: {
      _id: string
      slug: { current: string }
      name: { lv: string; en: string; ru: string }
      description?: { lv?: string; en?: string; ru?: string }
      sortOrder?: number
      isActive?: boolean
      showInNavigation?: boolean
      imageUrl?: string
    }
    tags?: string[]
    images?: unknown[]
    status?: 'active' | 'draft' | 'archived'
    isFeatured?: boolean
    metaTitle?: { lv?: string; en?: string; ru?: string }
    metaDescription?: { lv?: string; en?: string; ru?: string }
  }>
}

export async function fetchAllSanityProducts(client: { fetch: (query: string) => Promise<unknown[]> }) {
  const query = `*[_type == "product"] {
    _id,
    _updatedAt,
    sku,
    slug,
    name,
    shortDescription,
    description,
    basePrice,
    salePrice,
    stockQuantity,
    lowStockThreshold,
    weight,
    dimensions,
    material,
    finish,
    "category": category->{
      _id,
      slug,
      name,
      description,
      sortOrder,
      isActive,
      showInNavigation,
      "imageUrl": image.asset->url
    },
    tags,
    images[] {
      ...,
      "url": asset->url,
      "metadata": asset->metadata
    },
    status,
    isFeatured,
    metaTitle,
    metaDescription
  }`

  return client.fetch(query) as Promise<Array<{
    _id: string
    _updatedAt: string
    sku: string
    slug: { current: string }
    name: { lv: string; en: string; ru: string }
    shortDescription?: { lv?: string; en?: string; ru?: string }
    description?: { lv?: unknown[]; en?: unknown[]; ru?: unknown[] }
    basePrice: number
    salePrice?: number
    stockQuantity?: number
    lowStockThreshold?: number
    weight?: number
    dimensions?: { length?: number; width?: number; height?: number }
    material?: string
    finish?: string
    category?: {
      _id: string
      slug: { current: string }
      name: { lv: string; en: string; ru: string }
      description?: { lv?: string; en?: string; ru?: string }
      sortOrder?: number
      isActive?: boolean
      showInNavigation?: boolean
      imageUrl?: string
    }
    tags?: string[]
    images?: unknown[]
    status?: 'active' | 'draft' | 'archived'
    isFeatured?: boolean
    metaTitle?: { lv?: string; en?: string; ru?: string }
    metaDescription?: { lv?: string; en?: string; ru?: string }
  }>>
}

// ============================================
// CATEGORY SYNC
// ============================================

export async function syncCategoryToSupabase(
  sanityCategory: {
    _id: string
    slug: { current: string }
    name: { lv: string; en: string; ru: string }
    description?: { lv?: string; en?: string; ru?: string }
    sortOrder?: number
    isActive?: boolean
    showInNavigation?: boolean
    imageUrl?: string
  }
): Promise<string> {
  const supabase = createServerClient()

  const categoryData = {
    sanity_id: sanityCategory._id,
    slug: sanityCategory.slug.current,
    name_lv: sanityCategory.name.lv,
    name_en: sanityCategory.name.en,
    name_ru: sanityCategory.name.ru,
    description_lv: sanityCategory.description?.lv || null,
    description_en: sanityCategory.description?.en || null,
    description_ru: sanityCategory.description?.ru || null,
    sort_order: sanityCategory.sortOrder || 0,
    is_active: sanityCategory.isActive ?? true,
    image_url: sanityCategory.imageUrl || null,
  }

  // Check if category exists
  const { data: existing } = await (supabase.from('categories') as any)
    .select('id')
    .eq('sanity_id', sanityCategory._id)
    .single() as { data: { id: string } | null, error: any }

  if (existing) {
    // Update existing category
    const { data, error } = await (supabase.from('categories') as any)
      .update(categoryData)
      .eq('id', existing.id)
      .select()
      .single() as { data: { id: string }, error: any }

    if (error) throw error
    return (data as { id: string }).id
  } else {
    // Create new category
    const { data, error } = await (supabase.from('categories') as any)
      .insert(categoryData)
      .select()
      .single() as { data: { id: string }, error: any }

    if (error) throw error
    return (data as { id: string }).id
  }
}

// ============================================
// PRODUCT SYNC
// ============================================

export function transformImages(images: unknown[]): ProductImage[] {
  if (!Array.isArray(images)) return []

  return (images as Array<{
    url?: string
    alt?: { lv?: string; en?: string; ru?: string }
    caption?: { lv?: string; en?: string; ru?: string }
    position?: number
  }>).map((img, index) => ({
    url: img.url || '',
    alt: {
      lv: img.alt?.lv || '',
      en: img.alt?.en || '',
      ru: img.alt?.ru || '',
    },
    caption: {
      lv: img.caption?.lv || '',
      en: img.caption?.en || '',
      ru: img.caption?.ru || '',
    },
    position: img.position || index,
  }))
}

export function calculateStockStatus(
  quantity: number,
  threshold: number
): 'in_stock' | 'low_stock' | 'out_of_stock' {
  if (quantity <= 0) return 'out_of_stock'
  if (quantity <= threshold) return 'low_stock'
  return 'in_stock'
}

export async function syncProductToSupabase(
  sanityProduct: {
    _id: string
    _updatedAt: string
    sku: string
    slug: { current: string }
    name: { lv: string; en: string; ru: string }
    shortDescription?: { lv?: string; en?: string; ru?: string }
    description?: { lv?: unknown[]; en?: unknown[]; ru?: unknown[] }
    basePrice: number
    salePrice?: number
    stockQuantity?: number
    lowStockThreshold?: number
    weight?: number
    dimensions?: { length?: number; width?: number; height?: number }
    material?: string
    finish?: string
    category?: {
      _id: string
      slug: { current: string }
      name: { lv: string; en: string; ru: string }
      description?: { lv?: string; en?: string; ru?: string }
      sortOrder?: number
      isActive?: boolean
      showInNavigation?: boolean
      imageUrl?: string
    }
    tags?: string[]
    images?: unknown[]
    status?: 'active' | 'draft' | 'archived'
    isFeatured?: boolean
    metaTitle?: { lv?: string; en?: string; ru?: string }
    metaDescription?: { lv?: string; en?: string; ru?: string }
  }
): Promise<{ success: boolean; productId?: string; error?: string }> {
  const supabase = createServerClient()

  try {
    // First, sync category if it exists
    let categoryId: string | null = null
    if (sanityProduct.category) {
      categoryId = await syncCategoryToSupabase(sanityProduct.category)
    }

    // Transform images
    const images = transformImages(sanityProduct.images || [])
    const featuredImage = images[0]?.url || null

    // Calculate stock status
    const stockQuantity = sanityProduct.stockQuantity || 0
    const lowStockThreshold = sanityProduct.lowStockThreshold || 5
    const stockStatus = calculateStockStatus(stockQuantity, lowStockThreshold)

    // Prepare product data
    const productData = {
      sanity_id: sanityProduct._id,
      sku: sanityProduct.sku,
      slug: sanityProduct.slug.current,
      name_lv: sanityProduct.name.lv,
      name_en: sanityProduct.name.en,
      name_ru: sanityProduct.name.ru,
      description_lv: JSON.stringify(sanityProduct.description?.lv || []),
      description_en: JSON.stringify(sanityProduct.description?.en || []),
      description_ru: JSON.stringify(sanityProduct.description?.ru || []),
      short_description_lv: sanityProduct.shortDescription?.lv || null,
      short_description_en: sanityProduct.shortDescription?.en || null,
      short_description_ru: sanityProduct.shortDescription?.ru || null,
      base_price: sanityProduct.basePrice,
      sale_price: sanityProduct.salePrice || null,
      stock_quantity: stockQuantity,
      stock_status: stockStatus,
      low_stock_threshold: lowStockThreshold,
      weight_kg: sanityProduct.weight || null,
      dimensions_cm: sanityProduct.dimensions || null,
      material: sanityProduct.material || null,
      finish: sanityProduct.finish || null,
      category_id: categoryId,
      tags: sanityProduct.tags || [],
      images: images,
      featured_image: featuredImage,
      status: sanityProduct.status || 'draft',
      is_featured: sanityProduct.isFeatured || false,
      meta_title_lv: sanityProduct.metaTitle?.lv || null,
      meta_title_en: sanityProduct.metaTitle?.en || null,
      meta_title_ru: sanityProduct.metaTitle?.ru || null,
      meta_description_lv: sanityProduct.metaDescription?.lv || null,
      meta_description_en: sanityProduct.metaDescription?.en || null,
      meta_description_ru: sanityProduct.metaDescription?.ru || null,
      last_synced_at: new Date().toISOString(),
      sanity_updated_at: sanityProduct._updatedAt,
    }

    // Check if product exists
    const { data: existing } = await supabase
      .from('products')
      .select('id')
      .eq('sanity_id', sanityProduct._id)
      .single() as { data: { id: string } | null, error: any }

    let productId: string

    if (existing) {
      // Update existing product
      const { data, error } = await (supabase.from('products') as any)
        .update(productData)
        .eq('id', existing.id)
        .select()
        .single() as { data: { id: string }, error: any }

      if (error) throw error
      productId = data.id
    } else {
      // Create new product
      const { data, error } = await (supabase.from('products') as any)
        .insert(productData)
        .select()
        .single() as { data: { id: string }, error: any }

      if (error) throw error
      productId = data.id
    }

    return { success: true, productId }
  } catch (error) {
    console.error('Error syncing product:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

// ============================================
// DELETE PRODUCT
// ============================================

export async function deleteProductFromSupabase(
  sanityId: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = createServerClient()

  try {
    const { error } = await (supabase.from('products') as any)
      .delete()
      .eq('sanity_id', sanityId)

    if (error) throw error

    return { success: true }
  } catch (error) {
    console.error('Error deleting product:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

// ============================================
// BULK SYNC
// ============================================

export async function syncAllProducts(client: { fetch: (query: string) => Promise<unknown[]> }): Promise<{
  success: boolean
  synced: number
  failed: number
  errors: string[]
}> {
  try {
    const sanityProducts = await fetchAllSanityProducts(client)
    const results = {
      success: true,
      synced: 0,
      failed: 0,
      errors: [] as string[],
    }

    for (const product of sanityProducts) {
      const result = await syncProductToSupabase(product)
      if (result.success) {
        results.synced++
      } else {
        results.failed++
        results.errors.push(`Product ${product.sku}: ${result.error}`)
      }
    }

    return results
  } catch (error) {
    return {
      success: false,
      synced: 0,
      failed: 0,
      errors: [error instanceof Error ? error.message : 'Unknown error'],
    }
  }
}
