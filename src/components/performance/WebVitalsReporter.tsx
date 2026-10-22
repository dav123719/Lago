'use client'

import dynamic from 'next/dynamic'
import { useEffect, useState } from 'react'

const Observer = dynamic(() => import('./WebVitalsObserver'), { ssr: false })

// Sampling is per page load, with no persistent visitor identifier.
export function WebVitalsReporter() {
  const [sampled, setSampled] = useState(false)
  useEffect(() => {
    if (process.env.NEXT_PUBLIC_WEB_VITALS_ENABLED !== 'false') setSampled(Math.random() < 0.1)
  }, [])
  return sampled ? <Observer /> : null
}
