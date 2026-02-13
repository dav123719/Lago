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
          },
        },
      }
    )

    // refreshing the auth token
    const { data: { user }, error } = await supabase.auth.getUser()
    
    if (error) {
      console.error('[Supabase Middleware] Auth error:', error.message)
      return { response: supabaseResponse, user: null }
    }

    return { response: supabaseResponse, user }
  } catch (error) {
    console.error('[Supabase Middleware] Unexpected error:', error)
    return { response: supabaseResponse, user: null }
  }
}
