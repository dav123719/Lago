'use client'

// ============================================
// Preload Resources Component
// ============================================
// Preloads critical resources for better performance

import { useEffect } from 'react'

interface PreloadResourcesProps {
  fonts?: Array<{
    href: string
    type?: string
    crossOrigin?: boolean
  }>
  images?: string[]
  stylesheets?: string[]
  scripts?: string[]
}

/**
 * PreloadResources Component
 * 
 * Dynamically injects resource hints into the document head.
 * Use this for critical resources that should be loaded early.
 * 
 * @example
 * <PreloadResources
 *   fonts={[{ href: '/fonts/myfont.woff2', type: 'font/woff2', crossOrigin: true }]}
 *   images={['/hero.jpg', '/logo.svg']}
 * />
 */
export function PreloadResources({
  fonts = [],
  images = [],
  stylesheets = [],
  scripts = [],
}: PreloadResourcesProps) {
  useEffect(() => {
    const head = document.head
    const fragments: DocumentFragment[] = []

    // Preload fonts
    fonts.forEach((font) => {
      const link = document.createElement('link')
      link.rel = 'preload'
      link.href = font.href
      link.as = 'font'
      if (font.type) link.type = font.type
      if (font.crossOrigin) link.crossOrigin = 'anonymous'
      
      const fragment = document.createDocumentFragment()
      fragment.appendChild(link)
      fragments.push(fragment)
    })

    // Preload critical images
    images.forEach((src) => {
      const link = document.createElement('link')
      link.rel = 'preload'
      link.href = src
      link.as = 'image'
      
      const fragment = document.createDocumentFragment()
      fragment.appendChild(link)
      fragments.push(fragment)
    })

    // Preload stylesheets
    stylesheets.forEach((href) => {
      const link = document.createElement('link')
      link.rel = 'preload'
      link.href = href
      link.as = 'style'
      
      const fragment = document.createDocumentFragment()
      fragment.appendChild(link)
      fragments.push(fragment)
    })

    // Preload scripts
    scripts.forEach((src) => {
      const link = document.createElement('link')
      link.rel = 'preload'
      link.href = src
      link.as = 'script'
      
      const fragment = document.createDocumentFragment()
      fragment.appendChild(link)
      fragments.push(fragment)
    })

    // Append all fragments
    fragments.forEach((fragment) => {
      head.appendChild(fragment)
    })

    // Cleanup not needed for preloads as they should persist
  }, [fonts, images, stylesheets, scripts])

  return null
}

/**
 * Preconnect Component
 * Establishes early connections to required origins
 */
interface PreconnectProps {
  origins: Array<{
    href: string
    crossOrigin?: boolean
  }>
}

export function Preconnect({ origins }: PreconnectProps) {
  useEffect(() => {
    const head = document.head

    origins.forEach((origin) => {
      // Preconnect
      const preconnect = document.createElement('link')
      preconnect.rel = 'preconnect'
      preconnect.href = origin.href
      if (origin.crossOrigin) preconnect.crossOrigin = 'anonymous'
      head.appendChild(preconnect)

      // DNS prefetch fallback
      const dnsPrefetch = document.createElement('link')
      dnsPrefetch.rel = 'dns-prefetch'
      dnsPrefetch.href = origin.href
      head.appendChild(dnsPrefetch)
    })
  }, [origins])

  return null
}

/**
 * Prefetch Component
 * Prefetches resources for likely navigation
 */
interface PrefetchProps {
  urls: string[]
}

export function Prefetch({ urls }: PrefetchProps) {
  useEffect(() => {
    const head = document.head

    urls.forEach((url) => {
      const link = document.createElement('link')
      link.rel = 'prefetch'
      link.href = url
      head.appendChild(link)
    })
  }, [urls])

  return null
}

/**
 * PreloadCriticalResources
 * Pre-configured component for LAGO critical resources
 */
export function PreloadCriticalResources() {
  const criticalFonts = [
    { href: '/_next/static/media/cormorant-garamond-latin-400.woff2', type: 'font/woff2', crossOrigin: true },
    { href: '/_next/static/media/inter-latin-400.woff2', type: 'font/woff2', crossOrigin: true },
  ]

  return (
    <PreloadResources
      fonts={criticalFonts}
    />
  )
}

/**
 * PreconnectExternalServices
 * Preconnects to external services used by the app
 */
export function PreconnectExternalServices() {
  const origins = [
    { href: 'https://fonts.googleapis.com', crossOrigin: true },
    { href: 'https://fonts.gstatic.com', crossOrigin: true },
    { href: 'https://cdn.sanity.io', crossOrigin: true },
  ]

  return <Preconnect origins={origins} />
}

/**
 * ResourceHints Component
 * Combined resource hints for the application
 */
interface ResourceHintsProps {
  preloadImages?: string[]
  prefetchUrls?: string[]
}

export function ResourceHints({ preloadImages = [], prefetchUrls = [] }: ResourceHintsProps) {
  return (
    <>
      <PreconnectExternalServices />
      <PreloadCriticalResources />
      {preloadImages.length > 0 && <PreloadResources images={preloadImages} />}
      {prefetchUrls.length > 0 && <Prefetch urls={prefetchUrls} />}
    </>
  )
}
