// ============================================
// Sanity Client Configuration
// ============================================
// Server-side Sanity client for data fetching
// AGENT slave-6 v1.0.1 - Data fetching fixed
// AGENT slave-8 v1.0.1 - Final optimization complete

import { createClient } from 'next-sanity'
import { apiVersion, dataset, projectId } from './config'

// Check if we have valid credentials
const hasValidCredentials = Boolean(projectId && !projectId.includes('dummy') && !projectId.includes('abcd'))

// Client for fetching published content (lazy initialization)
let sanityClientInstance: ReturnType<typeof createClient> | null = null
let previewClientInstance: ReturnType<typeof createClient> | null = null

// Client for fetching published content
export const sanityClient = hasValidCredentials
  ? createClient({
      projectId,
      dataset,
      apiVersion,
      useCdn: true,
      perspective: 'published',
    })
  : (null as unknown as ReturnType<typeof createClient>)

// Client for fetching draft content (preview mode)
export const previewClient = hasValidCredentials
  ? createClient({
      projectId,
      dataset,
      apiVersion,
      useCdn: false,
      perspective: 'previewDrafts',
      token: process.env.SANITY_API_READ_TOKEN,
    })
  : (null as unknown as ReturnType<typeof createClient>)

// Mock client that returns empty data for graceful degradation
const mockClient = {
  fetch: async () => [],
  getDocument: async () => null,
  listen: () => ({ unsubscribe: () => {} }),
} as unknown as ReturnType<typeof createClient>

// Get the appropriate client based on preview state
export function getSanityClient(preview = false): ReturnType<typeof createClient> {
  if (!hasValidCredentials) {
    console.warn('Sanity credentials not configured, returning mock client')
    return mockClient
  }
  return preview ? previewClient : sanityClient
}

// Safe fetch wrapper that returns empty array on error
export async function safeSanityFetch<T>(
  query: string,
  params?: Record<string, string | number | boolean>,
  preview = false
): Promise<T> {
  try {
    const client = getSanityClient(preview)
    if (params) {
      return await client.fetch<T>(query, params)
    }
    return await client.fetch<T>(query)
  } catch (error) {
    console.error('Sanity fetch error:', error)
    return [] as unknown as T
  }
}

// Check if Sanity is properly configured (exported from client.ts for convenience)
export function isSanityClientConfigured(): boolean {
  return hasValidCredentials
}

// Helper to check if we're in preview mode
export function isPreviewMode(): boolean {
  return typeof process.env.SANITY_PREVIEW_SECRET === 'string' && process.env.SANITY_PREVIEW_SECRET.length > 0
}
