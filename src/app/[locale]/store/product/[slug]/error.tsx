// ============================================
// Product Detail Error Boundary
// ============================================

'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { AlertCircle, RefreshCw, ArrowLeft } from 'lucide-react'
import { useParams } from 'next/navigation'

interface ErrorBoundaryProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function ProductErrorBoundary({ error, reset }: ErrorBoundaryProps) {
  const params = useParams()
  const locale = (params?.locale as string) || 'lv'

  useEffect(() => {
    console.error('Product detail error:', error)
  }, [error])

  const t = {
    title: locale === 'lv' ? 'Kļūda ielādējot produktu' : locale === 'ru' ? 'Ошибка загрузки продукта' : 'Error Loading Product',
    description: locale === 'lv' 
      ? 'Mēs nevarējām ielādēt šo produktu. Lūdzu, mēģiniet vēlreiz.' 
      : locale === 'ru' 
      ? 'Мы не смогли загрузить этот продукт. Пожалуйста, попробуйте снова.' 
      : 'We could not load this product. Please try again.',
    backToStore: locale === 'lv' ? 'Atpakaļ uz veikalu' : locale === 'ru' ? 'Назад в магазин' : 'Back to Store',
    tryAgain: locale === 'lv' ? 'Mēģināt vēlreiz' : locale === 'ru' ? 'Попробовать снова' : 'Try Again',
  }

  return (
    <div className="min-h-screen bg-lago-black flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="w-20 h-20 mx-auto mb-6 bg-red-500/10 rounded-full flex items-center justify-center">
          <AlertCircle className="w-10 h-10 text-red-500" />
        </div>
        
        <h2 className="text-2xl font-heading text-white mb-4">
          {t.title}
        </h2>
        
        <p className="text-lago-muted mb-8">
          {t.description}
        </p>
        
        {error.message && (
          <p className="text-sm text-red-400 mb-8 p-4 bg-red-500/10 rounded-lg">
            {error.message}
          </p>
        )}
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href={`/${locale}/store`}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-lago-gray text-white rounded-lg hover:border-lago-gold transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            {t.backToStore}
          </Link>
          
          <button
            onClick={reset}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-lago-gold text-lago-black font-medium rounded-lg hover:bg-lago-gold-light transition-colors"
          >
            <RefreshCw className="w-5 h-5" />
            {t.tryAgain}
          </button>
        </div>
      </div>
    </div>
  )
}
