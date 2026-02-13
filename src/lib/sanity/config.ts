// ============================================
// Sanity Configuration
// ============================================
// Environment-based configuration for Sanity

// Project configuration
export const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || ''
export const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production'
export const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2024-01-01'

// Studio configuration
export const studioUrl = process.env.NEXT_PUBLIC_SANITY_STUDIO_URL || '/studio'

// Validate configuration
export function validateSanityConfig(): void {
  if (!projectId) {
    throw new Error('Missing NEXT_PUBLIC_SANITY_PROJECT_ID environment variable')
  }
  if (!dataset) {
    throw new Error('Missing NEXT_PUBLIC_SANITY_DATASET environment variable')
  }
}

// Check if Sanity is configured
export function isSanityConfigured(): boolean {
  return !!projectId && !!dataset
}

// Studio paths that should be accessible only to admins
export const adminOnlyPaths = ['/studio', '/studio/*']

// Project schema types
export const schemaTypes = {
  project: 'project',
  category: 'category',
  product: 'product',
  siteSettings: 'siteSettings',
} as const

export type SchemaType = (typeof schemaTypes)[keyof typeof schemaTypes]
