// ============================================
// OAuth Callback Content (Client Component)
// ============================================

'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createBrowserSupabaseClient } from '@/lib/supabase/client'
import { Loader2, CheckCircle, XCircle } from 'lucide-react'
import { Locale, locales, defaultLocale } from '@/lib/i18n/config'
import { safeInternalRedirect } from '@/lib/auth/redirect'
import { markPasswordRecovery, clearPasswordRecovery } from '@/lib/auth/recovery'

export function AuthCallbackContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [locale, setLocale] = useState<Locale>(defaultLocale)

  const exchange = useRef<{
    code: string
    promise: ReturnType<ReturnType<typeof createBrowserSupabaseClient>['auth']['exchangeCodeForSession']>
  } | null>(null)

  useEffect(() => {
    let active = true
    const handleAuthCallback = async () => {
      const code = searchParams.get('code')
      const flow = searchParams.get('flow') || 'signin'
      const localeParam = searchParams.get('locale') || defaultLocale
      const validLocale = locales.includes(localeParam as Locale) ? localeParam as Locale : defaultLocale
      setLocale(validLocale)
      const failed = searchParams.get('error_description') || searchParams.get('error') || searchParams.get('error_code')
      const recoveryUrl = `/auth/reset-password?locale=${validLocale}&invalid=1`
      const fail = () => {
        if (!active) return
        clearPasswordRecovery()
        setStatus('error')
        router.replace(flow === 'recovery' ? recoveryUrl : `/${validLocale}/?auth_error=1`)
      }
      if (failed || !code) { fail(); return }
      try {
        // React effect retries must consume a one-time PKCE code only once.
        if (exchange.current?.code !== code) {
          exchange.current = { code, promise: createBrowserSupabaseClient().auth.exchangeCodeForSession(code) }
        }
        const { data, error } = await exchange.current.promise
        if (!active) return
        if (error || !data.session) { fail(); return }
        setStatus('success')
        if (flow === 'recovery') {
          if (!markPasswordRecovery(data.session.user.id)) { fail(); return }
          router.replace(`/auth/reset-password?locale=${validLocale}`)
        } else {
          clearPasswordRecovery()
          router.replace(safeInternalRedirect(searchParams.get('next'), `/${validLocale}/account`))
        }
      } catch {
        fail()
      }
    }
    void handleAuthCallback()
    return () => { active = false }
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
