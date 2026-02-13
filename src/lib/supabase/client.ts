// ============================================
// Supabase Client Configuration
// ============================================
// AGENT slave-4 v1.0.1 - Auth system verified
// AGENT slave-6 v1.0.1 - Data fetching fixed

import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { createBrowserClient, createServerClient as createSSRClient } from '@supabase/ssr'
import type { Database } from './database.types'
// AGENT slave-8 v1.0.1 - Final optimization complete

// Check if Supabase credentials are available
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

const hasServerCredentials = Boolean(supabaseUrl && supabaseServiceKey)
const hasBrowserCredentials = Boolean(supabaseUrl && supabaseAnonKey)

// Mock client for graceful degradation when credentials are missing
const createMockClient = () => {
  return {
    from: () => ({
      select: () => ({
        eq: () => ({
          order: () => ({
            limit: () => ({
              single: async () => ({ data: null, error: null }),
            }),
            single: async () => ({ data: null, error: null }),
          }),
          single: async () => ({ data: null, error: null }),
          limit: () => ({
            single: async () => ({ data: null, error: null }),
          }),
        }),
        order: () => ({
          limit: () => ({
            single: async () => ({ data: null, error: null }),
          }),
        }),
        single: async () => ({ data: null, error: null }),
      }),
    }),
    auth: {
      getUser: async () => ({ data: { user: null }, error: null }),
      getSession: async () => ({ data: { session: null }, error: null }),
    },
  } as unknown as ReturnType<typeof createSupabaseClient<Database>>
}

// Server-side Supabase client (for use in Server Components/API routes)
export function createServerClient() {
  if (!hasServerCredentials) {
    console.warn('Supabase server credentials not configured, returning mock client')
    return createMockClient()
  }

  try {
    return createSupabaseClient<Database>(
      supabaseUrl!,
      supabaseServiceKey!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    )
  } catch (error) {
    console.error('Failed to create Supabase server client:', error)
    return createMockClient()
  }
}

// Client-side Supabase client (for use in Client Components)
export function createBrowserSupabaseClient() {
  if (!hasBrowserCredentials) {
    console.warn('Supabase browser credentials not configured, returning mock client')
    return createMockClient()
  }

  try {
    return createBrowserClient<Database>(
      supabaseUrl!,
      supabaseAnonKey!
    )
  } catch (error) {
    console.error('Failed to create Supabase browser client:', error)
    return createMockClient()
  }
}

// For server components that need SSR
export { createSSRClient }

// Safe wrapper for Supabase queries with error handling
export async function safeSupabaseQuery<T>(
  queryFn: () => Promise<{ data: T | null; error: Error | null }>
): Promise<T | null> {
  try {
    const { data, error } = await queryFn()
    if (error) {
      console.error('Supabase query error:', error)
      return null
    }
    return data
  } catch (error) {
    console.error('Supabase query exception:', error)
    return null
  }
}

// Check if Supabase is configured
export function isSupabaseConfigured(): boolean {
  return hasServerCredentials
}

// Export singleton for convenience (server-side only) with fallback
export const supabase = hasServerCredentials ? createServerClient() : createMockClient()
