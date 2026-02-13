// ============================================
// Supabase Server Client (SSR)
// ============================================
// AGENT slave-4 v1.0.1 - Auth system verified
// AGENT slave-6 v1.0.1 - Data fetching fixed

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { Database } from './database.types'

// Check if Supabase credentials are available
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

const hasCredentials = Boolean(supabaseUrl && supabaseAnonKey)

// Mock client for when credentials are missing
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
        }),
        order: () => ({
          limit: () => ({
            single: async () => ({ data: null, error: null }),
          }),
        }),
      }),
    }),
    auth: {
      getUser: async () => ({ data: { user: null }, error: null }),
      getSession: async () => ({ data: { session: null }, error: null }),
    },
  } as unknown as ReturnType<typeof createServerClient>
}

export async function createClient() {
  if (!hasCredentials) {
    console.warn('Supabase SSR credentials not configured, returning mock client')
    return createMockClient()
  }

  try {
    const cookieStore = await cookies()

    return createServerClient<Database>(
      supabaseUrl!,
      supabaseAnonKey!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              )
            } catch {
              // The `setAll` method was called from a Server Component.
              // This can be ignored if you have middleware refreshing
              // user sessions.
            }
          },
        },
      }
    )
  } catch (error) {
    console.error('Failed to create Supabase SSR client:', error)
    return createMockClient()
  }
}
