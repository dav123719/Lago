import type { Metadata } from 'next'
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
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}

