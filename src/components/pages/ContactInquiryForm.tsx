'use client'

import { FormEvent, useState } from 'react'
import { ArrowRight, LoaderCircle } from 'lucide-react'
import { Locale } from '@/lib/i18n/config'

const messages = {
  lv: {
    title: 'Nosūtiet projekta pieteikumu', name: 'Vārds', email: 'E-pasts', phone: 'Tālrunis (pēc izvēles)', message: 'Pastāstiet par savu projektu',
    submit: 'Nosūtīt pieteikumu', sending: 'Nosūta…', success: 'Paldies! Jūsu pieteikums ir nosūtīts.', error: 'Pieteikumu neizdevās nosūtīt. Lūdzu, mēģiniet vēlreiz vai sazinieties ar mums pa tālruni vai e-pastu.', required: 'Lūdzu, aizpildiet šo lauku.',
  },
  en: {
    title: 'Send a project enquiry', name: 'Name', email: 'Email', phone: 'Phone (optional)', message: 'Tell us about your project',
    submit: 'Send enquiry', sending: 'Sending…', success: 'Thank you. Your enquiry has been sent.', error: 'We could not send your enquiry. Please try again or contact us by phone or email.', required: 'Please complete this field.',
  },
  ru: {
    title: 'Отправить запрос по проекту', name: 'Имя', email: 'Эл. почта', phone: 'Телефон (необязательно)', message: 'Расскажите о проекте',
    submit: 'Отправить запрос', sending: 'Отправка…', success: 'Спасибо! Ваш запрос отправлен.', error: 'Не удалось отправить запрос. Попробуйте ещё раз или свяжитесь с нами по телефону или электронной почте.', required: 'Заполните это поле.',
  },
} as const

interface ContactInquiryFormProps {
  locale: Locale
}

export function ContactInquiryForm({ locale }: ContactInquiryFormProps) {
  const text = messages[locale]
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle')

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (status === 'sending') return
    setStatus('sending')

    const form = event.currentTarget
    const values = new FormData(form)
    const payload = {
      name: String(values.get('name') || '').trim(),
      email: String(values.get('email') || '').trim(),
      phone: String(values.get('phone') || '').trim() || undefined,
      message: String(values.get('message') || '').trim(),
    }

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!response.ok) throw new Error('Contact request failed')
      form.reset()
      setStatus('success')
    } catch {
      setStatus('error')
    }
  }

  const inputClass = 'w-full rounded-xl border border-white/15 bg-lago-black/60 px-4 py-3 text-white placeholder:text-white/40 outline-none transition-colors focus:border-lago-gold focus:ring-2 focus:ring-lago-gold/20'

  return (
    <form onSubmit={handleSubmit} className="sm:col-span-2 rounded-2xl border border-white/10 bg-lago-charcoal/65 p-5 md:p-7" aria-labelledby="contact-form-title">
      <h3 id="contact-form-title" className="text-xl font-heading text-white mb-6">{text.title}</h3>
      <div className="grid md:grid-cols-2 gap-4">
        <label className="block text-sm text-lago-light/80">
          {text.name} <span className="text-lago-gold" aria-hidden="true">*</span>
          <input className={`${inputClass} mt-2`} name="name" autoComplete="name" required maxLength={120} aria-label={`${text.name} *`} />
        </label>
        <label className="block text-sm text-lago-light/80">
          {text.email} <span className="text-lago-gold" aria-hidden="true">*</span>
          <input className={`${inputClass} mt-2`} name="email" type="email" autoComplete="email" required maxLength={320} aria-label={`${text.email} *`} />
        </label>
        <label className="block text-sm text-lago-light/80 md:col-span-2">
          {text.phone}
          <input className={`${inputClass} mt-2`} name="phone" type="tel" autoComplete="tel" maxLength={40} />
        </label>
        <label className="block text-sm text-lago-light/80 md:col-span-2">
          {text.message} <span className="text-lago-gold" aria-hidden="true">*</span>
          <textarea className={`${inputClass} mt-2 min-h-32 resize-y`} name="message" required maxLength={5000} rows={5} aria-label={`${text.message} *`} />
        </label>
      </div>
      <div className="mt-5 flex flex-col sm:flex-row sm:items-center gap-4">
        <button type="submit" disabled={status === 'sending'} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-lago-gold px-6 font-semibold text-lago-black transition-colors hover:bg-white disabled:cursor-wait disabled:opacity-70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-lago-charcoal">
          {status === 'sending' ? <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" /> : null}
          {status === 'sending' ? text.sending : text.submit}
          {status !== 'sending' ? <ArrowRight className="h-4 w-4" aria-hidden="true" /> : null}
        </button>
        <p className="text-sm text-lago-light/70" role="status" aria-live="polite">
          {status === 'success' ? text.success : status === 'error' ? text.error : ''}
        </p>
      </div>
    </form>
  )
}
