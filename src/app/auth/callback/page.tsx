// AGENT slave-8 v1.0.1 - Final optimization complete
// ============================================
// OAuth Callback Handler
// ============================================

import { Suspense } from 'react'
import { AuthCallbackContent } from './AuthCallbackContent'
import { SuspenseLoader } from '@/components/loading/PageLoader'

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-lago-black flex items-center justify-center px-4">
        <SuspenseLoader />
      </div>
    }>
      <AuthCallbackContent />
    </Suspense>
  )
}
