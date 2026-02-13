// AGENT slave-8 v1.0.1 - Final optimization complete
import type { Metadata, Viewport } from 'next'
// PERFORMANCE: CSS is loaded asynchronously via AsyncCSSLoader to prevent render-blocking
// Critical CSS is inlined in [locale]/layout.tsx
import './globals.css'

export const metadata: Metadata = {
  title: {
    template: '%s | LAGO',
    default: 'LAGO - Premium Stone Surfaces & Custom Furniture',
  },
  description: 'LAGO - Premium stone surfaces and custom furniture manufacturer in Latvia. Silestone, Dekton, granite, marble countertops and bespoke furniture solutions.',
  keywords: ['stone surfaces', 'kitchen countertops', 'Silestone', 'Dekton', 'granite', 'marble', 'custom furniture', 'Latvia', 'Riga'],
  authors: [{ name: 'LAGO' }],
  creator: 'LAGO',
  metadataBase: new URL('https://lago.lv'),
  openGraph: {
    type: 'website',
    locale: 'lv_LV',
    alternateLocale: ['en_US', 'ru_RU'],
    siteName: 'LAGO',
    images: [{
      url: '/og-image.png',
      width: 1200,
      height: 630,
      alt: 'LAGO - Premium Stone Surfaces & Custom Furniture',
    }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'LAGO - Premium Stone Surfaces & Custom Furniture',
    description: 'Premium stone surfaces and custom furniture manufacturer in Latvia',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icons/icon-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
    ],
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_VERIFICATION,
  },
  alternates: {
    canonical: '/',
    languages: {
      'lv': '/lv',
      'en': '/en',
      'ru': '/ru',
    },
  },
}

export const viewport: Viewport = {
  themeColor: '#c9a962',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}

