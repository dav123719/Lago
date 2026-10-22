'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { createBrowserSupabaseClient } from '@/lib/supabase/client'
import { defaultLocale, locales, type Locale } from '@/lib/i18n/config'

export default function ForgotPasswordPage() {
  const search = useSearchParams()
  const rawLocale = search.get('locale') || defaultLocale
  const locale = (locales.includes(rawLocale as Locale) ? rawLocale : defaultLocale) as Locale
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState(false)
  const t = {
    title: { lv: 'Atjaunot paroli', en: 'Reset password', ru: 'Сбросить пароль' }[locale],
    email: { lv: 'E-pasts', en: 'Email', ru: 'Email' }[locale],
    submit: { lv: 'Nosūtīt saiti', en: 'Send reset link', ru: 'Отправить ссылку' }[locale],
    generic: { lv: 'Ja konts ar šo e-pastu eksistē, nosūtījām atjaunošanas saiti.', en: 'If an account exists for this email, a reset link has been sent.', ru: 'Если аккаунт существует, ссылка для сброса отправлена.' }[locale],
    errorText: { lv: 'Neizdevās nosūtīt pieprasījumu. Mēģiniet vēlāk.', en: 'Could not send the request. Please try again later.', ru: 'Не удалось отправить запрос. Попробуйте позже.' }[locale],
    back: { lv: 'Atpakaļ uz sākumlapu', en: 'Back to the website', ru: 'Вернуться на сайт' }[locale],
  }
  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault(); setLoading(true); setError(false)
    const callback = new URL('/auth/callback', window.location.origin)
    callback.searchParams.set('flow', 'recovery')
    callback.searchParams.set('locale', locale)
    const { error: requestError } = await createBrowserSupabaseClient().auth.resetPasswordForEmail(email.trim(), { redirectTo: callback.toString() })
    setLoading(false)
    if (requestError) setError(true)
    else setSent(true)
  }
  return <main className="min-h-screen bg-lago-black px-4 py-20 text-white"><section className="mx-auto max-w-md rounded-xl border border-white/10 bg-lago-dark p-8">
    <h1 className="mb-6 text-2xl font-heading">{t.title}</h1>
    {sent ? <p role="status" className="mb-6 text-lago-muted">{t.generic}</p> : <form onSubmit={submit} className="space-y-4">
      <label htmlFor="recovery-email" className="block text-sm">{t.email}</label>
      <input id="recovery-email" name="email" type="email" autoComplete="email" required value={email} onChange={e => setEmail(e.target.value)} className="w-full rounded-lg border border-white/15 bg-black/20 px-3 py-3" />
      {error && <p role="alert" className="text-sm text-red-300">{t.errorText}</p>}
      <button disabled={loading} className="flex w-full items-center justify-center gap-2 rounded-lg bg-lago-gold px-5 py-3 font-semibold text-lago-black disabled:opacity-50">{loading && <Loader2 className="h-4 w-4 animate-spin" />}{t.submit}</button>
    </form>}
    <Link href={`/${locale}/`} className="mt-6 inline-block text-sm text-lago-gold">{t.back}</Link>
  </section></main>
}
