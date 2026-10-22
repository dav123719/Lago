import { notFound } from 'next/navigation'
import { createServerClient } from '@/lib/supabase/client'
import { locales, type Locale } from '@/lib/i18n/config'
import { ProductDetailContent } from './ProductDetailContent'
import type { Product } from '@/types/store'
export const dynamic = 'force-dynamic'
export default async function ProductPage({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params
  if (!locales.includes(locale as Locale)) notFound()
  const { data, error } = await createServerClient().from('products').select('*').eq('slug', slug).single()
  if (error || !data || !data.is_available) notFound()
  const row = data as unknown as Record<string, unknown>
  const text = (key: string, fallback = '') => String(row[key] ?? fallback)
  const name = text('name', text('name_lv'))
  const stock = Number(row.stock_quantity ?? 0)
  const product: Product = {
    id: text('id'), sku: text('sku'), slug: text('slug'),
    name: { lv: name, en: text('name_en', name), ru: text('name_ru', name) },
    description: { lv: text('description_lv', text('description')), en: text('description_en', text('description')), ru: text('description_ru', text('description')) },
    basePrice: Number(row.price ?? 0), stockQuantity: stock,
    stockStatus: stock > 0 ? 'in_stock' : 'out_of_stock', lowStockThreshold: 5,
    tags: Array.isArray(row.tags) ? row.tags as string[] : [],
    images: [], featuredImage: text('featured_image', text('image')) || undefined,
    status: 'active', isFeatured: Boolean(row.is_featured),
    createdAt: text('created_at'), updatedAt: text('updated_at'),
  }
  return <ProductDetailContent product={product} relatedProducts={[]} locale={locale as Locale} />
}
