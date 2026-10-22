'use client'

import { useReportWebVitals } from 'next/web-vitals'

function group(path: string) {
  if (/^\/admin(?:\/|$)/.test(path)) return 'admin'
  if (/^\/auth(?:\/|$)/.test(path)) return 'auth'
  if (/\/(?:account)(?:\/|$)/.test(path)) return 'account'
  if (/\/(?:store)(?:\/|$)/.test(path)) return 'store'
  if (/\/(?:projekti|projects|proekty)(?:\/|$)/.test(path)) return 'projects'
  if (/\/(?:akmens-virsmas|stone-surfaces|kamennye-poverhnosti)(?:\/|$)/.test(path)) return 'surfaces'
  return 'public'
}

const report: Parameters<typeof useReportWebVitals>[0] = metric => {
  if (!['LCP', 'INP', 'CLS'].includes(metric.name)) return
  // Deliberately omit URLs, query strings, metric IDs, DOM entries, user IDs,
  // cookies, email addresses and any account/profile content.
  void fetch('/api/vitals/', {
    method: 'POST', credentials: 'omit', referrerPolicy: 'no-referrer',
    keepalive: true, cache: 'no-store', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: metric.name, value: metric.value, device: documentDevice, group: documentGroup }),
  }).catch(() => { /* Telemetry must never interrupt the visit. */ })
}

// Standard Web Vitals describe the document lifecycle, even if a later SPA
// navigation changes location before the final metric is reported.
const documentPath = typeof window === 'undefined' ? '/' : new URL(performance.getEntriesByType('navigation')[0]?.name || window.location.href).pathname
const documentGroup = group(documentPath)
const documentDevice = typeof window !== 'undefined' && window.matchMedia('(max-width: 767px)').matches ? 'mobile' : 'desktop'

export default function WebVitalsObserver() {
  useReportWebVitals(report)
  return null
}
