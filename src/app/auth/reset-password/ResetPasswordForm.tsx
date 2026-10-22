'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Loader2, Lock, XCircle } from 'lucide-react'
import { createBrowserSupabaseClient } from '@/lib/supabase/client'
import { locales, defaultLocale, type Locale } from '@/lib/i18n/config'
import { hasPasswordRecovery, clearPasswordRecovery } from '@/lib/auth/recovery'

export function ResetPasswordForm() {
  const search = useSearchParams()
  const rawLocale = search.get('locale') || defaultLocale
  const locale = (locales.includes(rawLocale as Locale) ? rawLocale : defaultLocale) as Locale
  const [ready, setReady] = useState(false)
  const [invalid, setInvalid] = useState(search.get('invalid') === '1')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [complete, setComplete] = useState(false)
  const labels = {
    lv: { title: 'Iestatīt jaunu paroli', password: 'Jaunā parole', confirm: 'Atkārtojiet paroli', submit: 'Saglabāt paroli', invalid: 'Atjaunošanas saite nav derīga vai ir beigusies. Pieprasiet jaunu saiti.', retry: 'Pieprasīt jaunu saiti', mismatch: 'Paroles nesakrīt.', weak: 'Parolei jābūt vismaz 12 rakstzīmēm.', error: 'Paroli neizdevās atjaunināt. Pieprasiet jaunu saiti.', done: 'Parole atjaunināta. Tagad varat izmantot savu kontu.' },
    en: { title: 'Set a new password', password: 'New password', confirm: 'Confirm password', submit: 'Save password', invalid: 'This reset link is invalid or expired. Request a new link.', retry: 'Request a new reset link', mismatch: 'Passwords do not match.', weak: 'Password must be at least 12 characters.', error: 'Could not update the password. Request a new link.', done: 'Password updated. Your account is ready to use.' },
    ru: { title: 'Новый пароль', password: 'Новый пароль', confirm: 'Повторите пароль', submit: 'Сохранить пароль', invalid: 'Ссылка для сброса недействительна или устарела. Запросите новую.', retry: 'Запросить новую ссылку', mismatch: 'Пароли не совпадают.', weak: 'Пароль должен содержать не менее 12 символов.', error: 'Не удалось обновить пароль. Запросите новую ссылку.', done: 'Пароль обновлен. Теперь вы можете войти.' },
  } satisfies Record<Locale, Record<string, string>>
  const t = labels[locale]

  useEffect(() => {
    let active = true
    const verify = async () => {
      if (search.get('invalid') === '1') {
        if (active) { setInvalid(true); setReady(true) }
        return
      }
      const supabase = createBrowserSupabaseClient()
      try {
        const { data, error: authError } = await supabase.auth.getUser()
        if (active) {
          setInvalid(Boolean(authError || !data.user || !hasPasswordRecovery(data.user.id)))
          setReady(true)
        }
      } catch {
        if (active) { setInvalid(true); setReady(true) }
      }
    }
    void verify()
    return () => { active = false }
  }, [search])

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (password.length < 12) { setError(t.weak); return }
    if (password !== confirm) { setError(t.mismatch); return }
    setLoading(true); setError('')
    try {
      const supabase = createBrowserSupabaseClient()
      const { data, error: userError } = await supabase.auth.getUser()
      if (userError || !data.user || !hasPasswordRecovery(data.user.id)) {
        clearPasswordRecovery()
        setInvalid(true)
        return
      }
      const { error: updateError } = await supabase.auth.updateUser({ password })
      if (updateError) { setError(t.error); return }
      clearPasswordRecovery()
      setPassword(''); setConfirm('')
      setComplete(true)
    } catch {
      setError(t.error)
    } finally {
      setLoading(false)
    }
  }

  return <main className="min-h-screen bg-lago-black px-4 py-20 text-white"><section className="mx-auto max-w-md rounded-xl border border-white/10 bg-lago-dark p-8">
    {!ready ? <div role="status" className="flex items-center gap-3 text-lago-muted"><Loader2 className="h-5 w-5 animate-spin" />…</div> : invalid ? <>
      <XCircle className="mb-4 h-9 w-9 text-red-400" aria-hidden="true" />
      <h1 className="mb-3 text-2xl font-heading">{t.title}</h1><p role="alert" className="mb-6 text-lago-muted">{t.invalid}</p>
      <Link href={`/auth/forgot-password?locale=${locale}`} className="text-lago-gold">{t.retry}</Link>
    </> : complete ? <><h1 className="mb-3 text-2xl font-heading">{t.title}</h1><p role="status" className="text-lago-muted">{t.done}</p><Link href={`/${locale}/account`} className="mt-4 inline-block text-lago-gold">{locale === 'lv' ? 'Mans konts' : locale === 'ru' ? 'Мой аккаунт' : 'My account'}</Link></> : <>
      <h1 className="mb-6 text-2xl font-heading">{t.title}</h1>
      <form onSubmit={submit} className="space-y-4">
        <label htmlFor="new-password" className="block text-sm">{t.password}</label>
        <div className="relative"><Lock aria-hidden="true" className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-lago-muted" /><input id="new-password" type="password" autoComplete="new-password" minLength={12} required value={password} onChange={e => setPassword(e.target.value)} className="w-full rounded-lg border border-white/15 bg-black/20 py-3 pl-10 pr-3" /></div>
        <label htmlFor="confirm-password" className="block text-sm">{t.confirm}</label>
        <input id="confirm-password" type="password" autoComplete="new-password" minLength={12} required value={confirm} onChange={e => setConfirm(e.target.value)} className="w-full rounded-lg border border-white/15 bg-black/20 px-3 py-3" />
        {error && <p role="alert" className="text-sm text-red-300">{error}</p>}
        <button disabled={loading} className="flex w-full items-center justify-center gap-2 rounded-lg bg-lago-gold px-5 py-3 font-semibold text-lago-black disabled:opacity-50">{loading && <Loader2 className="h-4 w-4 animate-spin" />}{t.submit}</button>
      </form>
    </>}
  </section></main>
}
