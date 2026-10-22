// ============================================
// Next.js Middleware
// ============================================
// AGENT slave-4 v1.0.1 - Auth system verified

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { locales, defaultLocale } from '@/lib/i18n/config'
import { updateSession } from '@/lib/supabase/middleware'
import { materials } from '@/content/materials'
import { furnitureTypes } from '@/content/furniture'
import { projects } from '@/content/projects'

// Reject unknown content routes before a streamed layout commits HTTP 200.
// CMS-backed project/product details remain dynamic and validate their own data.
function isKnownLocalizedRoute(pathname: string): boolean {
  const [locale, ...segments] = pathname.split('/').filter(Boolean)
  if (!locales.includes(locale as typeof locales[number])) return true
  const language = locale as typeof locales[number]
  if (!segments.length) return true
  const [base, slug] = segments
  if (segments.length === 1 && ['store', 'cart', 'checkout', 'account', 'projects'].includes(base)) return true
  if (base === 'store' && segments.length === 3 && slug === 'product') return true
  if (base === 'projects' && segments.length === 2) return true
  if (base === 'checkout' && segments.length === 2 && slug === 'success') return true
  if (base === 'account') {
    if (segments.length === 2 && ['addresses', 'orders'].includes(slug)) return true
    if (segments.length === 3 && slug === 'orders') return true
  }
  const stoneBase = language === 'lv' ? 'akmens-virsmas' : language === 'ru' ? 'kamennye-poverhnosti' : 'stone-surfaces'
  const furnitureBase = language === 'lv' ? 'mebeles' : language === 'ru' ? 'mebel' : 'furniture'
  const projectsBase = language === 'lv' ? 'projekti' : language === 'ru' ? 'proekty' : 'projects'
  const aboutBase = language === 'lv' ? 'par-mums' : language === 'ru' ? 'o-nas' : 'about-us'
  if (segments.length === 1 && [stoneBase, furnitureBase, projectsBase, aboutBase].includes(base)) return true
  if (segments.length !== 2) return false
  if (base === stoneBase) return materials.some(item => item.slug[language] === slug)
  if (base === furnitureBase) return furnitureTypes.some(item => item.slug[language] === slug)
  if (base === projectsBase) return projects.some(item => item.slug[language] === slug)
  return false
}

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  if (pathname === '/_not-found' || pathname === '/_not-found/') return NextResponse.next()
  if (!isKnownLocalizedRoute(pathname)) {
    // skipProxyUrlNormalize preserves the listener origin in request.url so
    // HTTPS reverse-proxy headers cannot turn this into an external self-fetch.
    return NextResponse.rewrite(new URL('/_not-found/', request.url), { status: 404 })
  }

  // ============================================
  // Auth Session Management
  // ============================================
  // Update Supabase auth session and get user
  const { response, user } = await updateSession(request)

  // ============================================
  // Studio Access Control
  // ============================================
  if (['/studio', '/admin', '/auth', '/api'].some(path => pathname === path || pathname.startsWith(path + '/'))) {
    // Let the Studio layout handle authentication
    return response
  }

  // ============================================
  // Protected Routes Check
  // ============================================
  const protectedPaths = ['/account']
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
    const detectedLocale = locales.includes(localeCookie?.value as typeof locales[number]) ? localeCookie!.value : defaultLocale

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
