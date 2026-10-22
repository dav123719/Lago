// ============================================
// Signup Modal Component (Email/Password)
// ============================================
// AGENT slave-4 v1.0.1 - Auth system verified

'use client'

import { useState, useEffect } from 'react'
import { X, Mail, Lock, Eye, EyeOff, Loader2, User } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { Locale } from '@/lib/i18n/config'
import { toast } from 'sonner'
import { useModalDialog } from '@/hooks/useModalDialog'

interface SignupModalProps {
  locale: Locale
  isOpen: boolean
  onClose: () => void
  onLoginClick: () => void
}

const labels = {
  lv: {
    title: 'Izveidot kontu',
    subtitle: 'Reģistrējieties, lai piekļūtu saviem pasūtījumiem',
    fullName: 'Vārds, Uzvārds',
    fullNamePlaceholder: 'Jānis Bērziņš',
    email: 'E-pasts',
    emailPlaceholder: 'jusu@epasts.lv',
    password: 'Parole',
    passwordPlaceholder: 'Vismaz 12 rakstzīmes',
    confirmPassword: 'Apstipriniet paroli',
    confirmPasswordPlaceholder: 'Atkārtoti ievadiet paroli',
    signupButton: 'Izveidot kontu',
    signingUp: 'Reģistrē...',
    hasAccount: 'Jau ir konts?',
    login: 'Ienākt',
    error: 'Kļūda. Lūdzu, mēģiniet vēlreiz.',
    passwordMismatch: 'Paroles nesakrīt',
    weakPassword: 'Parolei jābūt vismaz 12 rakstzīmēm',
    success: 'Ja šo e-pastu var reģistrēt, uz to nosūtīta apstiprinājuma saite.',
    resend: 'Nosūtīt apstiprinājuma e-pastu vēlreiz',
    sent: 'Ja šim kontam nepieciešams apstiprinājums, uz e-pastu nosūtīta saite. Pārbaudiet arī mēstuļu mapi.',
  },
  en: {
    title: 'Create Account',
    subtitle: 'Sign up to access your orders and more',
    fullName: 'Full Name',
    fullNamePlaceholder: 'John Smith',
    email: 'Email',
    emailPlaceholder: 'your@email.com',
    password: 'Password',
    passwordPlaceholder: 'At least 12 characters',
    confirmPassword: 'Confirm Password',
    confirmPasswordPlaceholder: 'Re-enter your password',
    signupButton: 'Create Account',
    signingUp: 'Creating account...',
    hasAccount: 'Already have an account?',
    login: 'Login',
    error: 'Error. Please try again.',
    passwordMismatch: 'Passwords do not match',
    weakPassword: 'Password must be at least 12 characters',
    success: 'If this email can be registered, a confirmation link has been sent.',
    resend: 'Resend confirmation email',
    sent: 'If this account needs confirmation, a link has been sent. Check your spam folder too.',
  },
  ru: {
    title: 'Создать аккаунт',
    subtitle: 'Зарегистрируйтесь для доступа к заказам',
    fullName: 'Полное имя',
    fullNamePlaceholder: 'Иван Иванов',
    email: 'Email',
    emailPlaceholder: 'ваш@email.ru',
    password: 'Пароль',
    passwordPlaceholder: 'Не менее 12 символов',
    confirmPassword: 'Подтвердите пароль',
    confirmPasswordPlaceholder: 'Повторно введите пароль',
    signupButton: 'Создать аккаунт',
    signingUp: 'Создание аккаунта...',
    hasAccount: 'Уже есть аккаунт?',
    login: 'Войти',
    error: 'Ошибка. Пожалуйста, попробуйте снова.',
    passwordMismatch: 'Пароли не совпадают',
    weakPassword: 'Пароль должен содержать не менее 12 символов',
    success: 'Если этот адрес можно зарегистрировать, на него отправлена ссылка подтверждения.',
    resend: 'Отправить письмо подтверждения повторно',
    sent: 'Если аккаунту нужно подтверждение, ссылка отправлена. Проверьте также папку спама.',
  },
}

export function SignupModal({ locale, isOpen, onClose, onLoginClick }: SignupModalProps) {
  const { signUp, resendSignupConfirmation } = useAuth()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [resending, setResending] = useState(false)
  const [confirmationSent, setConfirmationSent] = useState(false)
  const t = labels[locale]

  const dialogRef = useModalDialog(isOpen, onClose)

  // Reset form when closed
  useEffect(() => {
    if (!isOpen) {
      setFullName('')
      setEmail('')
      setPassword('')
      setConfirmPassword('')
      setShowPassword(false)
      setShowConfirmPassword(false)
      setIsLoading(false)
      setResending(false)
      setConfirmationSent(false)
    }
  }, [isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validation
    if (password.length < 12) {
      toast.error(t.weakPassword)
      return
    }

    if (password !== confirmPassword) {
      toast.error(t.passwordMismatch)
      return
    }

    setIsLoading(true)

    try {
      const { error } = await signUp(email, password, fullName, locale)
      if (error) toast.error(t.error)
      else { setConfirmationSent(true); toast.success(t.success) }
    } catch {
      toast.error(t.error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleResend = async () => {
    setResending(true)
    try {
      const { error } = await resendSignupConfirmation(email, locale)
      if (error) { toast.error(t.error); return }
      toast.success(t.success)
    } catch {
      toast.error(t.error)
    } finally {
      setResending(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />

      {/* Modal */}
      <div ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby="signup-title" aria-describedby="signup-description" tabIndex={-1} className="relative w-full max-w-md animate-scale-in max-h-[90vh] overflow-y-auto">
        {/* Glow effect */}
        <div className="absolute -inset-1 bg-gradient-to-r from-lago-gold/20 via-lago-gold/10 to-lago-gold/20 rounded-2xl blur-xl" />

        <div
          className="relative rounded-xl border border-lago-gold/30 p-8"
          style={{
            backgroundColor: '#0a0a0a',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.9)',
          }}
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-lago-muted hover:text-white transition-colors rounded-lg hover:bg-white/5"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Header */}
          <div className="text-center mb-8">
            <h2 id="signup-title" className="text-2xl font-heading text-white mb-2">{t.title}</h2>
            <p id="signup-description" className="text-lago-muted text-sm">{t.subtitle}</p>
          </div>

          {confirmationSent ? (
            <div role="status" className="space-y-4 text-center">
              <p className="text-lago-muted">{t.sent}</p>
              <button type="button" onClick={handleResend} disabled={resending}
                className="w-full py-3 px-5 rounded-lg border border-white/15 text-white disabled:opacity-60">
                {resending ? t.signingUp : t.resend}
              </button>
              <button type="button" onClick={onLoginClick} className="text-sm text-lago-gold">
                {t.login}
              </button>
            </div>
          ) : <>
          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Full Name field */}
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-lago-light mb-2">
                {t.fullName}
              </label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-lago-muted" />
                <input
                  type="text"
                  id="fullName"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder={t.fullNamePlaceholder}
                  required
                  className="w-full pl-12 pr-4 py-3 rounded-lg bg-lago-dark border border-white/10 text-white placeholder-lago-muted focus:border-lago-gold/50 focus:outline-none focus:ring-1 focus:ring-lago-gold/50 transition-all"
                />
              </div>
            </div>

            {/* Email field */}
            <div>
              <label htmlFor="signup-email" className="block text-sm font-medium text-lago-light mb-2">
                {t.email}
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-lago-muted" />
                <input
                  type="email"
                  id="signup-email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t.emailPlaceholder}
                  required
                  className="w-full pl-12 pr-4 py-3 rounded-lg bg-lago-dark border border-white/10 text-white placeholder-lago-muted focus:border-lago-gold/50 focus:outline-none focus:ring-1 focus:ring-lago-gold/50 transition-all"
                />
              </div>
            </div>

            {/* Password field */}
            <div>
              <label htmlFor="signup-password" className="block text-sm font-medium text-lago-light mb-2">
                {t.password}
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-lago-muted" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="signup-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t.passwordPlaceholder}
                  required
                  minLength={12}
                  className="w-full pl-12 pr-12 py-3 rounded-lg bg-lago-dark border border-white/10 text-white placeholder-lago-muted focus:border-lago-gold/50 focus:outline-none focus:ring-1 focus:ring-lago-gold/50 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-lago-muted hover:text-white transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Confirm Password field */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-lago-light mb-2">
                {t.confirmPassword}
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-lago-muted" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder={t.confirmPasswordPlaceholder}
                  required
                  className="w-full pl-12 pr-12 py-3 rounded-lg bg-lago-dark border border-white/10 text-white placeholder-lago-muted focus:border-lago-gold/50 focus:outline-none focus:ring-1 focus:ring-lago-gold/50 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-lago-muted hover:text-white transition-colors"
                  aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 px-6 rounded-lg bg-gradient-to-r from-lago-gold to-lago-gold-dark text-lago-black font-button font-semibold hover:from-lago-gold-light hover:to-lago-gold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  {t.signingUp}
                </>
              ) : (
                t.signupButton
              )}
            </button>
          </form>

          {/* Login link */}
          <div className="mt-6 text-center">
            <span className="text-lago-muted text-sm">{t.hasAccount} </span>
            <button
              onClick={onLoginClick}
              className="text-sm text-lago-gold hover:text-lago-gold-light font-medium transition-colors"
            >
              {t.login}
            </button>
          </div>
          </>}
        </div>
      </div>
    </div>
  )
}
