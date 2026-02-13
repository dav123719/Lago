// ============================================
// Embedded Sanity Studio
// ============================================
// Only accessible to admin users

import { NextStudio } from 'next-sanity/studio'
import config from '../../../../sanity.config'

// AGENT slave-8 v1.0.1 - Final optimization complete
// Studio is disabled for static export - use Sanity Studio at sanity.lago.lv instead

export const dynamic = 'force-static'

export function generateStaticParams() {
  return [{ tool: [] }]
}

export default function StudioPage() {
  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh',
      background: '#0a0a0a',
      color: '#e8e8e8',
      fontFamily: 'system-ui, sans-serif'
    }}>
      <div style={{ textAlign: 'center' }}>
        <h1 style={{ color: '#c9a962', marginBottom: '1rem' }}>LAGO Studio</h1>
        <p>Sanity Studio is not available in static export mode.</p>
        <p>Please use the hosted Studio at <a href="https://sanity.lago.lv" style={{ color: '#c9a962' }}>sanity.lago.lv</a></p>
      </div>
    </div>
  )
}
