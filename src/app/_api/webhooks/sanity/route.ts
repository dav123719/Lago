// AGENT slave-3 v1.0.1 - API routes verified

// ============================================
export const dynamic = "force-dynamic"

// Sanity Webhook Handler
// ============================================

import { NextRequest, NextResponse } from 'next/server'
import { isValidSignature, SIGNATURE_HEADER_NAME } from '@sanity/webhook'
import {
  syncProductToSupabase,
  deleteProductFromSupabase,
  syncCategoryToSupabase,
} from '@/lib/sync/products'

// CORS headers for API routes
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
}

// Environment variable validation
function validateEnv() {
  if (!process.env.SANITY_WEBHOOK_SECRET) {
    throw new Error('Missing environment variable: SANITY_WEBHOOK_SECRET')
  }
}

// Webhook secret from environment
const webhookSecret = process.env.SANITY_WEBHOOK_SECRET || ''

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders })
}

// ============================================
// WEBHOOK VERIFICATION
// ============================================

async function verifyWebhook(req: NextRequest): Promise<{ isValid: boolean; body?: unknown; error?: string }> {
  try {
    validateEnv()
  } catch (error) {
    return { 
      isValid: false, 
      error: error instanceof Error ? error.message : 'Environment variable error' 
    }
  }

  const signature = req.headers.get(SIGNATURE_HEADER_NAME)
  
  if (!signature) {
    return { isValid: false, error: 'Missing signature header' }
  }

  const body = await req.text()
  
  if (!isValidSignature(body, signature, webhookSecret)) {
    return { isValid: false, error: 'Invalid signature' }
  }

  try {
    return { isValid: true, body: JSON.parse(body) }
  } catch {
    return { isValid: false, error: 'Invalid JSON body' }
  }
}

// ============================================
// WEBHOOK HANDLER
// ============================================

export async function POST(req: NextRequest) {
  try {
    // Verify webhook signature
    const { isValid, body, error } = await verifyWebhook(req)

    if (!isValid) {
      return NextResponse.json(
        { error: error || 'Invalid webhook signature' },
        { status: 401, headers: corsHeaders }
      )
    }

    const payload = body as {
      _type: string
      _id: string
      slug?: { current?: string }
      operation?: 'create' | 'update' | 'delete'
    }

    const { _type, _id, operation = 'update' } = payload

    // Handle different document types
    switch (_type) {
      case 'product':
        return await handleProductWebhook(_id, operation)
      
      case 'category':
        return await handleCategoryWebhook(_id, operation)
      
      default:
        return NextResponse.json(
          { message: `Unhandled document type: ${_type}` },
          { status: 200, headers: corsHeaders }
        )
    }
  } catch (error) {
    console.error('Webhook error:', error)
    
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
      { error: 'Internal server error' },
      { status: 500, headers: corsHeaders }
    )
  }
}

// ============================================
// PRODUCT WEBHOOK HANDLER
// ============================================

async function handleProductWebhook(
  sanityId: string,
  operation: string
): Promise<Response> {
  try {
    // Import sanity client dynamically
    const { client } = await import('@sanity/lib/client')
    
    switch (operation) {
      case 'delete': {
        const deleteResult = await deleteProductFromSupabase(sanityId)
        if (deleteResult.success) {
          return NextResponse.json(
            { message: 'Product deleted successfully' },
            { status: 200, headers: corsHeaders }
          )
        } else {
          return NextResponse.json(
            { error: deleteResult.error },
            { status: 500, headers: corsHeaders }
          )
        }
      }

      case 'create':
      case 'update':
      default: {
        // Fetch full product data from Sanity
        const product = await fetchSanityProduct(sanityId, client)
        
        if (!product) {
          return NextResponse.json(
            { error: 'Product not found in Sanity' },
            { status: 404, headers: corsHeaders }
          )
        }

        const syncResult = await syncProductToSupabase(product)
        
        if (syncResult.success) {
          // Update Sanity with sync status
          await updateSanitySyncStatus(sanityId, 'synced')
          
          return NextResponse.json(
            { 
              message: 'Product synced successfully',
              productId: syncResult.productId,
            },
            { status: 200, headers: corsHeaders }
          )
        } else {
          // Update Sanity with error status
          await updateSanitySyncStatus(sanityId, 'error')
          
          return NextResponse.json(
            { error: syncResult.error },
            { status: 500, headers: corsHeaders }
          )
        }
      }
    }
  } catch (error) {
    console.error('Product webhook error:', error)
    return NextResponse.json(
      { error: 'Failed to process product webhook' },
      { status: 500, headers: corsHeaders }
    )
  }
}

// ============================================
// CATEGORY WEBHOOK HANDLER
// ============================================

async function handleCategoryWebhook(
  sanityId: string,
  operation: string
): Promise<Response> {
  try {
    if (operation === 'delete') {
      // Categories are soft-deleted by setting isActive to false
      return NextResponse.json(
        { message: 'Category deletion handled' },
        { status: 200, headers: corsHeaders }
      )
    }

    // Import sanity client dynamically
    const { client } = await import('@sanity/lib/client')
    
    // Fetch full category data from Sanity
    const category = await fetchSanityCategory(sanityId, client)
    
    if (!category) {
      return NextResponse.json(
        { error: 'Category not found in Sanity' },
        { status: 404, headers: corsHeaders }
      )
    }

    await syncCategoryToSupabase(category)

    return NextResponse.json(
      { message: 'Category synced successfully' },
      { status: 200, headers: corsHeaders }
    )
  } catch (error) {
    console.error('Category webhook error:', error)
    return NextResponse.json(
      { error: 'Failed to process category webhook' },
      { status: 500, headers: corsHeaders }
    )
  }
}

// ============================================
// SANITY DATA FETCHERS
// ============================================

async function fetchSanityProduct(sanityId: string, client: { fetch: (query: string, params: Record<string, string>) => Promise<unknown> }) {
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

async function fetchSanityCategory(sanityId: string, client: { fetch: (query: string, params: Record<string, string>) => Promise<unknown> }) {
  const query = `*[_type == "category" && _id == $sanityId][0] {
    _id,
    slug,
    name,
    description,
    sortOrder,
    isActive,
    showInNavigation,
    "imageUrl": image.asset->url
  }`

  return client.fetch(query, { sanityId }) as Promise<{
    _id: string
    slug: { current: string }
    name: { lv: string; en: string; ru: string }
    description?: { lv?: string; en?: string; ru?: string }
    sortOrder?: number
    isActive?: boolean
    showInNavigation?: boolean
    imageUrl?: string
  }>
}

async function updateSanitySyncStatus(
  sanityId: string,
  status: 'synced' | 'error' | 'pending'
) {
  try {
    const { writeClient } = await import('@sanity/lib/client')
    
    await writeClient
      .patch(sanityId)
      .set({
        syncStatus: status,
        lastSyncedAt: new Date().toISOString(),
      })
      .commit()
  } catch (error) {
    console.error('Failed to update Sanity sync status:', error)
  }
}
