// ============================================
// Next.js Middleware
// ============================================
// AGENT slave-4 v1.0.1 - Auth system verified

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { locales, defaultLocale } from '@/lib/i18n/config'
import { updateSession } from '@/lib/supabase/middleware'

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  // ============================================
  // Auth Session Management
  // ============================================
  // Update Supabase auth session and get user
  const { response, user } = await updateSession(request)

  // ============================================
  // Studio Access Control
  // ============================================
  if (pathname.startsWith('/studio')) {
    // Let the Studio layout handle authentication
    return response
  }

  // ============================================
  // Protected Routes Check
  // ============================================
  const protectedPaths = ['/account', '/checkout']
  const isProtectedPath = protectedPaths.some(path => pathname.includes(path))
  
  if (isProtectedPath && !user) {
    // Redirect to home with error parameter
    const locale = pathname.split('/')[1]
    const validLocale = locales.includes(locale as typeof locales[number]) ? locale : defaultLocale
    return NextResponse.redirect(new URL(`/${validLocale}?error=auth_required`, request.url))
  }

  // ============================================
  // Locale Detection & Redirect
  // ============================================
  
  // Check if pathname starts with a valid locale
  const pathnameIsMissingLocale = locales.every(
    (locale) => !pathname.startsWith(`/${locale}/`) && pathname !== `/${locale}`
  )

  if (pathnameIsMissingLocale) {
    // Check if there's a locale cookie
    const localeCookie = request.cookies.get('NEXT_LOCALE')
    const detectedLocale = localeCookie?.value || defaultLocale

    // Redirect to the path with detected locale
    return NextResponse.redirect(
      new URL(`/${detectedLocale}${pathname}`, request.url)
    )
  }

  // ============================================
  // Preview Mode Cookie
  // ============================================
  const previewCookie = request.cookies.get('__next_preview_data')
  if (previewCookie && pathname.includes('/projects/')) {
    // Add cache-busting header for preview mode
    const requestHeaders = new Headers(request.headers)
    requestHeaders.set('x-preview-mode', 'true')
    
    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    })
  }

  return response
}

export const config = {
  matcher: [
    // Skip all internal paths (_next, api, static files, favicon)
    '/((?!_next|api|.*\\..*).*)',
  ],
}
