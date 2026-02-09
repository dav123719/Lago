'use client'

import { useEffect } from 'react'

/**
 * PERFORMANCE: Optimize CSS loading by making existing stylesheets non-blocking
 * Next.js already handles CSS optimization, but we can improve render-blocking
 * by making stylesheets load with lower priority after initial render
 */
export function AsyncCSSLoader() {
  useEffect(() => {
    // Make existing stylesheets non-render-blocking after initial paint
    // This runs after hydration, so it doesn't affect initial render
    const optimizeCSSLoading = () => {
      // Find all stylesheet links and ensure they don't block rendering
      const stylesheets = document.querySelectorAll<HTMLLinkElement>('link[rel="stylesheet"]')
      
      stylesheets.forEach((link) => {
        // If stylesheet hasn't loaded yet, make it non-blocking
        if (!link.sheet && link.media !== 'print') {
          // Temporarily set to print media (non-blocking)
          const originalMedia = link.media || 'all'
          link.media = 'print'
          
          // Switch back to all after load
          link.onload = function() {
            if (this instanceof HTMLLinkElement) {
              this.media = originalMedia
            }
          }
          
          // Fallback: switch back after a short delay if onload doesn't fire
          setTimeout(() => {
            if (link.media === 'print') {
              link.media = originalMedia
            }
          }, 100)
        }
      })
    }

    // Run after a small delay to ensure initial render is complete
    const timer = setTimeout(optimizeCSSLoading, 100)
    
    return () => clearTimeout(timer)
  }, [])

  return null
}

