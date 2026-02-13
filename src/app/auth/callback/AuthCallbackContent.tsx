// ============================================
// OAuth Callback Content (Client Component)
// ============================================

'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createBrowserSupabaseClient } from '@/lib/supabase/client'
import { Loader2, CheckCircle, XCircle } from 'lucide-react'
import { Locale, locales, defaultLocale } from '@/lib/i18n/config'

export function AuthCallbackContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [locale, setLocale] = useState<Locale>(defaultLocale)

  useEffect(() => {
    const handleAuthCallback = async () => {
      const code = searchParams.get('code')
      const localeParam = searchParams.get('locale') || defaultLocale
      
      // Validate locale
      const validLocale = locales.includes(localeParam as Locale) 
        ? localeParam as Locale 
        : defaultLocale
      setLocale(validLocale)

      if (code) {
        try {
          const supabase = createBrowserSupabaseClient()
          const { error } = await supabase.auth.exchangeCodeForSession(code)
          
          if (error) {
            console.error('Auth error:', error)
            setStatus('error')
            setTimeout(() => {
              router.push(`/${validLocale}?error=auth_failed`)
            }, 2000)
          } else {
            setStatus('success')
            setTimeout(() => {
              router.push(`/${validLocale}/account`)
            }, 1000)
          }
        } catch (err) {
          console.error('Callback error:', err)
          setStatus('error')
          setTimeout(() => {
            router.push(`/${validLocale}?error=auth_failed`)
          }, 2000)
        }
      } else {
        setStatus('error')
        setTimeout(() => {
          router.push(`/${validLocale}?error=no_code`)
        }, 2000)
      }
    }

    handleAuthCallback()
  }, [searchParams, router])

  const labels = {
    lv: {
      loading: 'Pieslēdzamies...',
      success: 'Veiksmīgi ielogojāties!',
      error: 'Kļūda pieslēdzoties',
      redirecting: 'Pāradresē...',
    },
    en: {
      loading: 'Logging in...',
      success: 'Successfully logged in!',
      error: 'Error logging in',
      redirecting: 'Redirecting...',
    },
    ru: {
      loading: 'Вход...',
      success: 'Успешный вход!',
      error: 'Ошибка входа',
      redirecting: 'Перенаправление...',
    },
  }

  const t = labels[locale]

  return (
    <div className="min-h-screen bg-lago-black flex items-center justify-center px-4">
      <div className="text-center">
        {status === 'loading' && (
          <>
            <Loader2 className="w-16 h-16 text-lago-gold animate-spin mx-auto mb-6" />
            <h1 className="text-2xl font-heading text-white mb-2">{t.loading}</h1>
            <p className="text-lago-muted">{t.redirecting}</p>
          </>
        )}
        
        {status === 'success' && (
          <>
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-6" />
            <h1 className="text-2xl font-heading text-white mb-2">{t.success}</h1>
            <p className="text-lago-muted">{t.redirecting}</p>
          </>
        )}
        
        {status === 'error' && (
          <>
            <XCircle className="w-16 h-16 text-red-500 mx-auto mb-6" />
            <h1 className="text-2xl font-heading text-white mb-2">{t.error}</h1>
            <p className="text-lago-muted">{t.redirecting}</p>
          </>
        )}
      </div>
    </div>
  )
}
