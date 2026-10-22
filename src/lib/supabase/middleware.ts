// ============================================
// Supabase Middleware Helper
// ============================================
// AGENT slave-4 v1.0.1 - Auth system verified

import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// Environment variable validation
const getEnvVar = (name: string): string => {
  const value = process.env[name]
  if (!value) {
    console.error(`[Supabase Middleware] Missing environment variable: ${name}`)
    return ''
  }
  return value
}

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  // Public anonymous pages have no identity to refresh. Avoid constructing an
  // auth client (or making an auth request) until a Supabase auth cookie exists.
  // Protected pages still perform server getUser verification in their layout.
  const hasAuthCookie = request.cookies.getAll().some(({ name }) =>
    /^sb-.+-auth-token(?:\.\d+)?$/.test(name)
  )
  if (!hasAuthCookie) return { response: supabaseResponse, user: null }

  const url = getEnvVar('NEXT_PUBLIC_SUPABASE_URL')
  const key = getEnvVar('NEXT_PUBLIC_SUPABASE_ANON_KEY')
  
  if (!url || !key) {
    console.warn('[Supabase Middleware] Missing environment variables, skipping auth check')
    return { response: supabaseResponse, user: null }
  }

  try {
    const supabase = createServerClient(
      url,
      key,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
            supabaseResponse = NextResponse.next({
              request,
            })
            cookiesToSet.forEach(({ name, value, options }) =>
              supabaseResponse.cookies.set(name, value, options)
            )
            // Never allow refreshed session cookies to enter a shared cache.
            supabaseResponse.headers.set('Cache-Control', 'private, no-store, max-age=0')
            supabaseResponse.headers.set('CDN-Cache-Control', 'no-store')
          },
        },
      }
    )

    // refreshing the auth token
    const { data: { user }, error } = await supabase.auth.getUser()
    
    if (error) {
      if (error.name !== 'AuthSessionMissingError') console.error('[Supabase Middleware] Auth error:', error.message)
      return { response: supabaseResponse, user: null }
    }

    return { response: supabaseResponse, user }
  } catch (error) {
    console.error('[Supabase Middleware] Unexpected error:', error)
    return { response: supabaseResponse, user: null }
  }
}
