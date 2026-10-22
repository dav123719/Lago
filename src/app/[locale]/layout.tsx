import { notFound } from 'next/navigation'
import { locales, Locale, localeHtmlLang } from '@/lib/i18n/config'
import { Header, Footer } from '@/components/layout'
import { AuthProvider } from '@/contexts/AuthContext'
import { CartProvider } from '@/contexts/CartContext'
import { DeferredCartDrawer } from '@/components/cart/DeferredCartDrawer'
import { Toaster } from 'sonner'
import { LocaleDocumentLanguage } from '@/components/layout/LocaleDocumentLanguage'

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
    <>
      <link rel="preload" as="font" href={validLocale === 'ru' ? '/fonts/cormorant-garamond-cyrillic.woff2' : '/fonts/cormorant-garamond-latin.woff2'} type="font/woff2" crossOrigin="anonymous" />
      {validLocale === 'lv' && <link rel="preload" as="font" href="/fonts/cormorant-garamond-latvian.82f6c1b716c1.woff2" type="font/woff2" crossOrigin="anonymous" />}
      <div className="min-h-screen flex flex-col" lang={localeHtmlLang[validLocale]}>
        <LocaleDocumentLanguage locale={validLocale} />
        <AuthProvider>
          <CartProvider>
            <Header locale={validLocale} />
            <main className="flex-1">
              {children}
            </main>
            <Footer locale={validLocale} />
            <DeferredCartDrawer locale={validLocale} />
          </CartProvider>
        </AuthProvider>
        <Toaster 
          position="top-center"
          toastOptions={{
            style: {
              background: '#111111',
              color: '#e0e0e0',
              border: '1px solid rgba(201, 169, 98, 0.3)',
            },
          }}
        />
      </div>
    </>
  )
}
