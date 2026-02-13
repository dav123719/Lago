// ============================================
// Store Error Boundary
// ============================================

'use client'

import { useEffect } from 'react'
import { AlertCircle, RefreshCw } from 'lucide-react'

interface ErrorBoundaryProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function StoreErrorBoundary({ error, reset }: ErrorBoundaryProps) {
  useEffect(() => {
    // Log error to monitoring service
    console.error('Store error:', error)
  }, [error])

  return (
    <div className="min-h-screen bg-lago-black flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="w-20 h-20 mx-auto mb-6 bg-red-500/10 rounded-full flex items-center justify-center">
          <AlertCircle className="w-10 h-10 text-red-500" />
        </div>
        
        <h2 className="text-2xl font-heading text-white mb-4">
          Something went wrong
        </h2>
        
        <p className="text-lago-muted mb-8">
          We encountered an error while loading the store. Please try again.
        </p>
        
        {error.message && (
          <p className="text-sm text-red-400 mb-8 p-4 bg-red-500/10 rounded-lg">
            {error.message}
          </p>
        )}
        
        <button
          onClick={reset}
          className="inline-flex items-center gap-2 px-6 py-3 bg-lago-gold text-lago-black font-medium rounded-lg hover:bg-lago-gold-light transition-colors"
        >
          <RefreshCw className="w-5 h-5" />
          Try Again
        </button>
      </div>
    </div>
  )
}
