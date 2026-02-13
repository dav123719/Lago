// AGENT slave-8 v1.0.1 - Final optimization complete
// ============================================
// Route Loading UI
// ============================================
// Loading state for Next.js App Router

import { LazyRouteLoader } from '@/components/loading/PageLoader'

/**
 * Loading component for Next.js App Router
 * Automatically shown when a route is loading
 */
export default function Loading() {
  return <LazyRouteLoader />
}
