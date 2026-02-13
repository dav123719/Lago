// ============================================
// Login Modal Component (Email/Password)
// ============================================
// AGENT slave-4 v1.0.1 - Auth system verified

'use client'

import { useState, useEffect, useCallback } from 'react'
import { X, Mail, Lock, Eye, EyeOff, Loader2 } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { Locale } from '@/lib/i18n/config'
import { toast } from 'sonner'

interface LoginModalProps {
  locale: Locale
  isOpen: boolean
  onClose: () => void
  onSignupClick: () => void
}

const labels = {
  lv: {
    title: 'Ienākt',
    subtitle: 'Ievadiet savu e-pastu un paroli',
    email: 'E-pasts',
    emailPlaceholder: 'jusu@epasts.lv',
    password: 'Parole',
    passwordPlaceholder: 'Jūsu parole',
    forgotPassword: 'Aizmirsi paroli?',
    loginButton: 'Ienākt',
    loggingIn: 'Ienāk...',
    noAccount: 'Vēl nav konta?',
    signup: 'Izveidot kontu',
    error: 'Kļūda. Pārbaudiet datus un mēģiniet vēlreiz.',
  },
  en: {
    title: 'Login',
    subtitle: 'Enter your email and password',
    email: 'Email',
    emailPlaceholder: 'your@email.com',
    password: 'Password',
    passwordPlaceholder: 'Your password',
    forgotPassword: 'Forgot password?',
    loginButton: 'Login',
    loggingIn: 'Logging in...',
    noAccount: 'Don\'t have an account?',
    signup: 'Sign up',
    error: 'Error. Please check your credentials and try again.',
  },
  ru: {
    title: 'Вход',
    subtitle: 'Введите email и пароль',
    email: 'Email',
    emailPlaceholder: 'ваш@email.ru',
    password: 'Пароль',
    passwordPlaceholder: 'Ваш пароль',
    forgotPassword: 'Забыли пароль?',
    loginButton: 'Войти',
    loggingIn: 'Вход...',
    noAccount: 'Еще нет аккаунта?',
    signup: 'Создать аккаунт',
    error: 'Ошибка. Проверьте данные и попробуйте снова.',
  },
}

export function LoginModal({ locale, isOpen, onClose, onSignupClick }: LoginModalProps) {
  const { signInWithEmail } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const t = labels[locale]

  // Handle escape key
  const handleEscape = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') onClose()
  }, [onClose])

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = ''
    }
  }, [isOpen, handleEscape])

  // Reset form when closed
  useEffect(() => {
    if (!isOpen) {
      setEmail('')
      setPassword('')
      setShowPassword(false)
      setIsLoading(false)
    }
  }, [isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    const { error } = await signInWithEmail(email, password)

    if (error) {
      toast.error(t.error)
      setIsLoading(false)
    } else {
      onClose()
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
      <div className="relative w-full max-w-md animate-scale-in">
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
            <h2 className="text-2xl font-heading text-white mb-2">{t.title}</h2>
            <p className="text-lago-muted text-sm">{t.subtitle}</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-lago-light mb-2">
                {t.email}
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-lago-muted" />
                <input
                  type="email"
                  id="email"
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
              <label htmlFor="password" className="block text-sm font-medium text-lago-light mb-2">
                {t.password}
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-lago-muted" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t.passwordPlaceholder}
                  required
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

            {/* Forgot password link */}
            <div className="text-right">
              <button
                type="button"
                className="text-sm text-lago-gold hover:text-lago-gold-light transition-colors"
              >
                {t.forgotPassword}
              </button>
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
                  {t.loggingIn}
                </>
              ) : (
                t.loginButton
              )}
            </button>
          </form>

          {/* Sign up link */}
          <div className="mt-6 text-center">
            <span className="text-lago-muted text-sm">{t.noAccount} </span>
            <button
              onClick={onSignupClick}
              className="text-sm text-lago-gold hover:text-lago-gold-light font-medium transition-colors"
            >
              {t.signup}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
