'use client'

import { useState } from 'react'
import { Loader2, Mail, X } from 'lucide-react'
import { toast } from 'sonner'
import { useAuth } from '@/hooks/useAuth'
import type { Locale } from '@/lib/i18n/config'

const copy = {
  lv: { title: 'Atjaunot paroli', help: 'Ievadiet konta e-pastu. Ja konts eksistē, nosūtīsim atjaunošanas saiti.', email: 'E-pasts', send: 'Nosūtīt saiti', sent: 'Ja konts ar šo e-pastu eksistē, nosūtījām atjaunošanas saiti.', back: 'Atpakaļ uz pieslēgšanos', error: 'Neizdevās nosūtīt saiti. Mēģiniet vēlāk.' },
  en: { title: 'Reset password', help: 'Enter your account email. If an account exists, we will send a reset link.', email: 'Email', send: 'Send reset link', sent: 'If an account exists for this email, a reset link has been sent.', back: 'Back to login', error: 'Could not send the link. Please try again later.' },
  ru: { title: 'Сбросить пароль', help: 'Введите адрес почты. Если аккаунт существует, мы отправим ссылку для сброса.', email: 'Email', send: 'Отправить ссылку', sent: 'Если аккаунт существует, ссылка для сброса отправлена.', back: 'Вернуться ко входу', error: 'Не удалось отправить ссылку. Попробуйте позже.' },
} satisfies Record<Locale, Record<string, string>>

export function ForgotPasswordModal({ locale, isOpen, onClose, onBackToLogin }: {
  locale: Locale
  isOpen: boolean
  onClose: () => void
  onBackToLogin: () => void
}) {
  const { requestPasswordReset } = useAuth()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const t = copy[locale]
  if (!isOpen) return null

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setLoading(true)
    const { error } = await requestPasswordReset(email, locale)
    setLoading(false)
    if (error) {
      toast.error(t.error)
      return
    }
    setSent(true)
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="reset-request-title">
      <button className="absolute inset-0 bg-black/80" aria-label="Close" onClick={onClose} />
      <section className="relative w-full max-w-md rounded-xl border border-lago-gold/30 bg-[#0a0a0a] p-8 text-white shadow-2xl">
        <button onClick={onClose} aria-label="Close" className="absolute right-4 top-4 rounded p-2 hover:bg-white/10"><X className="h-5 w-5" /></button>
        <h2 id="reset-request-title" className="mb-3 text-2xl font-heading">{t.title}</h2>
        {sent ? <div role="status" className="space-y-5">
          <p className="text-lago-muted">{t.sent}</p>
          <button onClick={onBackToLogin} className="text-lago-gold">{t.back}</button>
        </div> : <>
          <p className="mb-5 text-sm text-lago-muted">{t.help}</p>
          <form onSubmit={submit} className="space-y-5">
            <label className="block text-sm" htmlFor="reset-email">{t.email}</label>
            <div className="relative -mt-3">
              <Mail className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-lago-muted" aria-hidden="true" />
              <input id="reset-email" name="email" type="email" autoComplete="email" required value={email} onChange={e => setEmail(e.target.value)} className="w-full rounded-lg border border-white/15 bg-lago-dark py-3 pl-12 pr-4 text-white" />
            </div>
            <button disabled={loading} className="flex w-full items-center justify-center gap-2 rounded-lg bg-lago-gold px-5 py-3 font-semibold text-lago-black disabled:opacity-60">
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}{t.send}
            </button>
          </form>
          <button onClick={onBackToLogin} className="mt-5 text-sm text-lago-gold">{t.back}</button>
        </>}
      </section>
    </div>
  )
}
