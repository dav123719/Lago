// AGENT slave-8 v1.0.1 - Final optimization complete
import { ImageResponse } from 'next/og'

export const dynamic = 'force-static'

export const alt = 'LAGO - Premium Stone Surfaces & Custom Furniture'
export const size = {
  width: 1200,
  height: 630,
}

export const contentType = 'image/png'

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 50%, #111111 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '48px',
        }}
      >
        {/* Gold accent line */}
        <div
          style={{
            width: '120px',
            height: '4px',
            background: 'linear-gradient(90deg, #c9a962, #d4bc7d)',
            marginBottom: '40px',
            borderRadius: '2px',
          }}
        />
        
        {/* Logo text */}
        <div
          style={{
            fontSize: '96px',
            fontWeight: 500,
            color: '#c9a962',
            letterSpacing: '0.1em',
            fontFamily: 'Georgia, serif',
            marginBottom: '24px',
          }}
        >
          LAGO
        </div>
        
        {/* Tagline */}
        <div
          style={{
            fontSize: '32px',
            color: '#e8e8e8',
            textAlign: 'center',
            maxWidth: '800px',
            lineHeight: 1.4,
          }}
        >
          Premium Stone Surfaces & Custom Furniture
        </div>
        
        {/* Subtitle */}
        <div
          style={{
            fontSize: '24px',
            color: '#a0a0a0',
            marginTop: '24px',
            textAlign: 'center',
          }}
        >
          Silestone • Dekton • Granite • Marble
        </div>
      </div>
    ),
    {
      ...size,
    }
  )
}
