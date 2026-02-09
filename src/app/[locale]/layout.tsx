import { notFound } from 'next/navigation'
import { locales, Locale, localeHtmlLang } from '@/lib/i18n/config'
import { Header, Footer } from '@/components/layout'
import { headingFont, bodyFont, buttonFont } from '@/lib/fonts'
import { AsyncCSSLoader } from '@/components/AsyncCSSLoader'

interface LocaleLayoutProps {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}

// Generate static params for all locales
export function generateStaticParams() {
  return locales.map((locale) => ({ locale }))
}

export default async function LocaleLayout({
  children,
  params,
}: LocaleLayoutProps) {
  const { locale } = await params
  
  // Validate locale
  if (!locales.includes(locale as Locale)) {
    notFound()
  }

  const validLocale = locale as Locale

  return (
    <html lang={localeHtmlLang[validLocale]} className={`dark ${headingFont.variable} ${bodyFont.variable} ${buttonFont.variable}`}>
      <head>
        {/* PERFORMANCE: Resource hints for faster font loading */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://fonts.googleapis.com" />
        <link rel="dns-prefetch" href="https://fonts.gstatic.com" />
        
        {/* PERFORMANCE: Inline critical CSS to eliminate render-blocking (minified) */}
        <style dangerouslySetInnerHTML={{ __html: `
          :root{--lago-black:#0a0a0a;--lago-dark:#111111;--lago-charcoal:#1a1a1a;--lago-gray:#2a2a2a;--lago-stone:#4a4a4a;--lago-muted:#a0a0a0;--lago-light:#e8e8e8;--lago-white:#ffffff;--lago-gold:#c9a962;--lago-gold-light:#d4bc7d;--lago-gold-dark:#a8893f}
          *{box-sizing:border-box;padding:0;margin:0}
          html{scroll-behavior:smooth}
          body{font-family:var(--font-body),system-ui,sans-serif;color:var(--lago-light);background:var(--lago-black);line-height:1.7;font-weight:400;-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale}
          h1,h2,h3,h4,h5,h6{font-family:var(--font-heading),Georgia,serif;font-weight:500;line-height:1.15;letter-spacing:-0.02em;color:var(--lago-white);text-shadow:0 2px 10px rgba(0,0,0,0.5)}
          .min-h-screen{min-height:100vh}
          .flex{display:flex}
          .flex-col{flex-direction:column}
          .items-center{align-items:center}
          .justify-center{justify-content:center}
          .relative{position:relative}
          .absolute{position:absolute}
          .inset-0{top:0;right:0;bottom:0;left:0}
          .overflow-hidden{overflow:hidden}
          .bg-lago-black{background-color:var(--lago-black)}
          .text-lago-light{color:var(--lago-light)}
          .text-white{color:var(--lago-white)}
          .antialiased{-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale}
        `}} />
      </head>
      <body className={`min-h-screen flex flex-col bg-lago-black text-lago-light antialiased ${bodyFont.className}`}>
        {/* PERFORMANCE: Load non-critical CSS asynchronously after initial render */}
        <AsyncCSSLoader />
        <Header locale={validLocale} />
        <main className="flex-1">
          {children}
        </main>
        <Footer locale={validLocale} />
      </body>
    </html>
  )
}
