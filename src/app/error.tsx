// AGENT slave-8 v1.0.1 - Final optimization complete
'use client'

// ============================================
// Global Error Boundary
// ============================================
// Catches errors in the root layout

import { ErrorBoundary } from '@/components/error/ErrorBoundary'
import { ErrorFallback } from '@/components/error/ErrorFallback'

interface GlobalErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

/**
 * Global Error Component
 * 
 * Catches errors that bubble up to the root of the app.
 * This is the last line of defense for error handling.
 */
export default function GlobalError({ error, reset }: GlobalErrorProps) {
  return (
    <html lang="lv">
      <body className="bg-lago-black min-h-screen">
        <ErrorBoundary fallback={<ErrorFallback error={error} reset={reset} locale="lv" />}>
          {/* This won't render if there's an error */}
        </ErrorBoundary>
      </body>
    </html>
  )
}
