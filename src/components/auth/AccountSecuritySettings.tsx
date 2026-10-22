'use client'

import { useCallback, useEffect, useState } from 'react'
import { Loader2, Link2, Mail, ShieldCheck, Unlink } from 'lucide-react'
import { toast } from 'sonner'
import type { UserIdentity } from '@supabase/supabase-js'
import { useAuth } from '@/hooks/useAuth'
import type { Locale } from '@/lib/i18n/config'
import { createBrowserSupabaseClient } from '@/lib/supabase/client'

const text = {
  lv: { title: 'Piekļuves drošība', methods: 'Pieslēgšanās veidi', email: 'E-pasta adrese', changeEmail: 'Mainīt e-pastu', password: 'Parole', passwordPlaceholder: 'Jauna parole (vismaz 12 rakstzīmes)', updatePassword: 'Atjaunot paroli', linkGoogle: 'Pievienot Google', linkFacebook: 'Pievienot Facebook', unlink: 'Atvienot', verified: 'Apstiprināts', pending: 'Gaida apstiprinājumu', sent: 'Ja adresi var atjaunināt, nosūtījām verifikācijas saiti.', passwordSaved: 'Parole atjaunināta.', error: 'Izmaiņas neizdevās saglabāt.', providerDisabled: 'Pakalpojuma pieslēgšana vēl nav konfigurēta.', loading: 'Ielādē pieslēgšanās veidus…', keepOne: 'Atstājiet vismaz vienu pieslēgšanās veidu.', linked: 'Pieslēgts', unavailable: 'Nav konfigurēts' },
  en: { title: 'Sign-in security', methods: 'Connected sign-in methods', email: 'Email address', changeEmail: 'Change email', password: 'Password', passwordPlaceholder: 'New password (at least 12 characters)', updatePassword: 'Update password', linkGoogle: 'Connect Google', linkFacebook: 'Connect Facebook', unlink: 'Disconnect', verified: 'Verified', pending: 'Confirmation pending', sent: 'If the address can be updated, a verification link was sent.', passwordSaved: 'Password updated.', error: 'Could not save the change.', providerDisabled: 'Provider connection is not configured yet.', loading: 'Loading sign-in methods…', keepOne: 'Keep at least one sign-in method connected.', linked: 'Connected', unavailable: 'Not configured' },
  ru: { title: 'Безопасность входа', methods: 'Способы входа', email: 'Адрес электронной почты', changeEmail: 'Изменить email', password: 'Пароль', passwordPlaceholder: 'Новый пароль (не менее 12 символов)', updatePassword: 'Обновить пароль', linkGoogle: 'Подключить Google', linkFacebook: 'Подключить Facebook', unlink: 'Отключить', verified: 'Подтвержден', pending: 'Ожидает подтверждения', sent: 'Если адрес можно изменить, отправлена ссылка подтверждения.', passwordSaved: 'Пароль обновлен.', error: 'Не удалось сохранить изменения.', providerDisabled: 'Подключение провайдера пока не настроено.', loading: 'Загрузка способов входа…', keepOne: 'Оставьте хотя бы один способ входа.', linked: 'Подключен', unavailable: 'Не настроен' },
} satisfies Record<Locale, Record<string, string>>

const providerEnabled = (provider: 'google' | 'facebook') => provider === 'google'
  ? process.env.NEXT_PUBLIC_GOOGLE_OAUTH_ENABLED === 'true'
  : process.env.NEXT_PUBLIC_FACEBOOK_OAUTH_ENABLED === 'true'

export function AccountSecuritySettings({ locale }: { locale: Locale }) {
  const { user, updateEmail, updatePassword, linkOAuthIdentity, unlinkIdentity } = useAuth()
  const t = text[locale]
  const [identities, setIdentities] = useState<UserIdentity[]>([])
  const [loadingIdentities, setLoadingIdentities] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [saving, setSaving] = useState(false)
  const manualLinkingEnabled = process.env.NEXT_PUBLIC_MANUAL_IDENTITY_LINKING_ENABLED === 'true'

  const refreshIdentities = useCallback(async () => {
    setLoadingIdentities(true)
    const { data, error } = await createBrowserSupabaseClient().auth.getUserIdentities()
    if (error) toast.error(t.error)
    else setIdentities(data?.identities ?? [])
    setLoadingIdentities(false)
  }, [t.error])

  useEffect(() => {
    const timer = window.setTimeout(() => { void refreshIdentities() }, 0)
    return () => window.clearTimeout(timer)
  }, [refreshIdentities])

  const submitEmail = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!email.trim() || email.trim().toLowerCase() === user?.email?.toLowerCase()) return
    setSaving(true)
    const { error } = await updateEmail(email, locale)
    setSaving(false)
    if (error) toast.error(t.error)
    else { toast.success(t.sent); setEmail('') }
  }

  const submitPassword = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (password.length < 12) { toast.error(t.error); return }
    setSaving(true)
    const { error } = await updatePassword(password)
    setSaving(false)
    if (error) toast.error(t.error)
    else { setPassword(''); toast.success(t.passwordSaved) }
  }

  const connect = async (provider: 'google' | 'facebook') => {
    const { error } = await linkOAuthIdentity(provider, locale)
    if (error) toast.error(error.message || t.error)
  }

  const disconnect = async (identity: UserIdentity) => {
    if (identities.length <= 1) { toast.error(t.keepOne); return }
    const { error } = await unlinkIdentity(identity)
    if (error) toast.error(error.message || t.error)
    else { toast.success(t.linked); await refreshIdentities() }
  }

  const linked = (provider: string) => identities.some(identity => identity.provider === provider)

  return (
    <section className="rounded-xl border border-white/10 bg-lago-dark p-6 md:p-8" aria-labelledby="account-security-heading">
      <h2 id="account-security-heading" className="mb-6 flex items-center gap-3 text-xl font-heading text-white"><ShieldCheck className="h-5 w-5 text-lago-gold" />{t.title}</h2>
      <div className="grid gap-8 lg:grid-cols-2">
        <div className="space-y-6">
          <form onSubmit={submitEmail} className="space-y-3">
            <label htmlFor="account-email" className="block text-sm font-medium text-white">{t.email}</label>
            <div className="flex flex-wrap items-center gap-2 text-sm text-lago-muted"><Mail className="h-4 w-4" />{user?.email}<span>·</span>{user?.email_confirmed_at ? t.verified : t.pending}</div>
            <input id="account-email" type="email" autoComplete="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full rounded-lg border border-white/15 bg-black/20 px-4 py-3 text-white" />
            <button disabled={saving || !email.trim()} className="rounded-lg border border-white/20 px-4 py-2 text-sm text-white disabled:opacity-50">{t.changeEmail}</button>
          </form>
          <form onSubmit={submitPassword} className="space-y-3">
            <label htmlFor="account-new-password" className="block text-sm font-medium text-white">{t.password}</label>
            <input id="account-new-password" type="password" autoComplete="new-password" minLength={12} required value={password} onChange={e => setPassword(e.target.value)} placeholder={t.passwordPlaceholder} className="w-full rounded-lg border border-white/15 bg-black/20 px-4 py-3 text-white" />
            <button disabled={saving || password.length < 12} className="rounded-lg border border-white/20 px-4 py-2 text-sm text-white disabled:opacity-50">{t.updatePassword}</button>
          </form>
        </div>
        <div>
          <h3 className="mb-3 text-sm font-semibold text-white">{t.methods}</h3>
          {loadingIdentities ? <p className="flex items-center gap-2 text-sm text-lago-muted"><Loader2 className="h-4 w-4 animate-spin" />{t.loading}</p> : <ul className="space-y-2">
            {identities.map(identity => <li key={identity.id} className="flex items-center justify-between gap-3 rounded-lg border border-white/10 px-3 py-2 text-sm text-white">
              <span>{identity.provider}{identity.identity_data?.email ? ` · ${identity.identity_data.email}` : ''}</span>
              <button type="button" disabled={identities.length <= 1} onClick={() => void disconnect(identity)} className="inline-flex items-center gap-1 text-lago-muted hover:text-white disabled:cursor-not-allowed disabled:opacity-40" aria-label={`${t.unlink} ${identity.provider}`}><Unlink className="h-4 w-4" />{t.unlink}</button>
            </li>)}
          </ul>}
          {(['google', 'facebook'] as const).map(provider => !linked(provider) && <button key={provider} type="button" disabled={!providerEnabled(provider) || !manualLinkingEnabled} onClick={() => void connect(provider)} title={!providerEnabled(provider) || !manualLinkingEnabled ? t.providerDisabled : undefined} className="mt-3 flex w-full items-center gap-2 rounded-lg border border-white/15 px-4 py-3 text-left text-sm text-white disabled:cursor-not-allowed disabled:opacity-50"><Link2 className="h-4 w-4" />{provider === 'google' ? t.linkGoogle : t.linkFacebook}{(!providerEnabled(provider) || !manualLinkingEnabled) ? ` · ${t.unavailable}` : ''}</button>)}
          {!manualLinkingEnabled && <p className="mt-3 text-xs text-lago-muted">{t.providerDisabled}</p>}
        </div>
      </div>
    </section>
  )
}
