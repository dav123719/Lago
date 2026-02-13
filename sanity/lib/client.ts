// ============================================
// Sanity Client Configuration
// ============================================

import { createClient } from 'next-sanity'

export const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || ''
export const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production'
export const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2024-01-01'

// Client for fetching data (public)
export const client = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: true, // Use CDN for faster reads
  perspective: 'published', // Only get published documents
})

// Client for fetching preview data (drafts)
export const previewClient = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: false, // Don't use CDN for previews
  perspective: 'previewDrafts',
  token: process.env.SANITY_API_READ_TOKEN,
})

// Client for mutations (server-side only)
export const writeClient = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: false,
  token: process.env.SANITY_API_WRITE_TOKEN,
})

// Helper to get the correct client based on preview mode
export function getClient(preview = false) {
  return preview ? previewClient : client
}
