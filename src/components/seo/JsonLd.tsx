'use client'

// ============================================
// JSON-LD Script Injector Component
// ============================================
// Renders structured data as JSON-LD script tags

import { JsonLdScript } from '@/lib/seo/json-ld'

interface JsonLdProps {
  schema: JsonLdScript | JsonLdScript[]
  id?: string
}

/**
 * JSON-LD Component
 * 
 * Injects structured data as a JSON-LD script tag into the document head.
 * Use this component in page components to add Schema.org structured data.
 * 
 * @example
 * <JsonLd schema={generateProductSchema(product, locale)} />
 */
export function JsonLd({ schema, id }: JsonLdProps) {
  const schemas = Array.isArray(schema) ? schema : [schema]
  const jsonLdString = JSON.stringify(schemas.length === 1 ? schemas[0] : schemas)

  return (
    <script
      id={id}
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: jsonLdString }}
    />
  )
}

/**
 * Organization JSON-LD
 * Renders organization structured data
 */
import { generateOrganizationSchema } from '@/lib/seo/json-ld'

export function OrganizationJsonLd() {
  return <JsonLd schema={generateOrganizationSchema()} id="organization-schema" />
}

/**
 * Local Business JSON-LD
 * Renders local business structured data for the showroom
 */
import { generateLocalBusinessSchema } from '@/lib/seo/json-ld'

export function LocalBusinessJsonLd() {
  return <JsonLd schema={generateLocalBusinessSchema()} id="localbusiness-schema" />
}

/**
 * WebSite JSON-LD
 * Renders website structured data with search action
 */
import { generateWebSiteSchema } from '@/lib/seo/json-ld'

export function WebSiteJsonLd() {
  return <JsonLd schema={generateWebSiteSchema()} id="website-schema" />
}

/**
 * Breadcrumb JSON-LD
 * Renders breadcrumb structured data
 */
import { generateBreadcrumbSchema, type BreadcrumbItem } from '@/lib/seo/json-ld'
export type { BreadcrumbItem }
import { Locale } from '@/lib/i18n/config'

interface BreadcrumbJsonLdProps {
  items: BreadcrumbItem[]
  locale: Locale
}

export function BreadcrumbJsonLd({ items, locale }: BreadcrumbJsonLdProps) {
  if (items.length === 0) return null
  
  return <JsonLd schema={generateBreadcrumbSchema(items, locale)} id="breadcrumb-schema" />
}

/**
 * Product JSON-LD
 * Renders product structured data
 */
import { generateProductSchema, ProductSchema } from '@/lib/seo/json-ld'
import { Product } from '@/types/store'

interface ProductJsonLdProps {
  product: Product
  locale: Locale
  images?: string[]
}

export function ProductJsonLd({ product, locale, images }: ProductJsonLdProps) {
  return <JsonLd schema={generateProductSchema(product, locale, images)} id="product-schema" />
}

/**
 * Product List JSON-LD
 * Renders product list structured data
 */
import { generateProductListSchema } from '@/lib/seo/json-ld'

interface ProductListJsonLdProps {
  products: Product[]
  locale: Locale
}

export function ProductListJsonLd({ products, locale }: ProductListJsonLdProps) {
  if (products.length === 0) return null
  
  return <JsonLd schema={generateProductListSchema(products, locale)} id="productlist-schema" />
}

/**
 * Order JSON-LD
 * Renders order structured data
 */
import { generateOrderSchema } from '@/lib/seo/json-ld'
import { Order } from '@/types/store'

interface OrderJsonLdProps {
  order: Order
}

export function OrderJsonLd({ order }: OrderJsonLdProps) {
  return <JsonLd schema={generateOrderSchema(order)} id="order-schema" />
}

/**
 * FAQ JSON-LD
 * Renders FAQ page structured data
 */
import { generateFAQSchema } from '@/lib/seo/json-ld'

interface FAQJsonLdProps {
  faqs: Array<{ question: Record<Locale, string>; answer: Record<Locale, string> }>
  locale: Locale
}

export function FAQJsonLd({ faqs, locale }: FAQJsonLdProps) {
  if (faqs.length === 0) return null
  
  return <JsonLd schema={generateFAQSchema(faqs, locale)} id="faq-schema" />
}

/**
 * Project JSON-LD
 * Renders creative work structured data for projects
 */
import { generateProjectSchema } from '@/lib/seo/json-ld'
import { SanityProject } from '@/lib/sanity/types'

interface ProjectJsonLdProps {
  project: SanityProject
  locale: Locale
  images?: string[]
}

export function ProjectJsonLd({ project, locale, images }: ProjectJsonLdProps) {
  return <JsonLd schema={generateProjectSchema(project, locale, images)} id="project-schema" />
}

/**
 * Combined Global Schemas
 * Renders all global schemas (organization, website, local business)
 */
export function GlobalJsonLd() {
  const schemas = [
    generateOrganizationSchema(),
    generateWebSiteSchema(),
    generateLocalBusinessSchema(),
  ]
  
  return <JsonLd schema={schemas} id="global-schemas" />
}
