// ============================================
// Signup Modal Component (Email/Password)
// ============================================
// AGENT slave-4 v1.0.1 - Auth system verified

'use client'

import { useState, useEffect, useCallback } from 'react'
import { X, Mail, Lock, Eye, EyeOff, Loader2, User } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { Locale } from '@/lib/i18n/config'
import { toast } from 'sonner'

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
    passwordPlaceholder: 'Minimāli 8 simboli',
    confirmPassword: 'Apstipriniet paroli',
    confirmPasswordPlaceholder: 'Atkārtoti ievadiet paroli',
    signupButton: 'Izveidot kontu',
    signingUp: 'Reģistrē...',
    hasAccount: 'Jau ir konts?',
    login: 'Ienākt',
    error: 'Kļūda. Lūdzu, mēģiniet vēlreiz.',
    passwordMismatch: 'Paroles nesakrīt',
    weakPassword: 'Parolei jābūt vismaz 8 simboliem',
    success: 'Konts izveidots! Lūdzu, pārbaudiet e-pastu, lai apstiprinātu.',
  },
  en: {
    title: 'Create Account',
    subtitle: 'Sign up to access your orders and more',
    fullName: 'Full Name',
    fullNamePlaceholder: 'John Smith',
    email: 'Email',
    emailPlaceholder: 'your@email.com',
    password: 'Password',
    passwordPlaceholder: 'Minimum 8 characters',
    confirmPassword: 'Confirm Password',
    confirmPasswordPlaceholder: 'Re-enter your password',
    signupButton: 'Create Account',
    signingUp: 'Creating account...',
    hasAccount: 'Already have an account?',
    login: 'Login',
    error: 'Error. Please try again.',
    passwordMismatch: 'Passwords do not match',
    weakPassword: 'Password must be at least 8 characters',
    success: 'Account created! Please check your email to confirm.',
  },
  ru: {
    title: 'Создать аккаунт',
    subtitle: 'Зарегистрируйтесь для доступа к заказам',
    fullName: 'Полное имя',
    fullNamePlaceholder: 'Иван Иванов',
    email: 'Email',
    emailPlaceholder: 'ваш@email.ru',
    password: 'Пароль',
    passwordPlaceholder: 'Минимум 8 символов',
    confirmPassword: 'Подтвердите пароль',
    confirmPasswordPlaceholder: 'Повторно введите пароль',
    signupButton: 'Создать аккаунт',
    signingUp: 'Создание аккаунта...',
    hasAccount: 'Уже есть аккаунт?',
    login: 'Войти',
    error: 'Ошибка. Пожалуйста, попробуйте снова.',
    passwordMismatch: 'Пароли не совпадают',
    weakPassword: 'Пароль должен быть не менее 8 символов',
    success: 'Аккаунт создан! Пожалуйста, проверьте почту для подтверждения.',
  },
}

export function SignupModal({ locale, isOpen, onClose, onLoginClick }: SignupModalProps) {
  const { signUp } = useAuth()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
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
      setFullName('')
      setEmail('')
      setPassword('')
      setConfirmPassword('')
      setShowPassword(false)
      setShowConfirmPassword(false)
      setIsLoading(false)
    }
  }, [isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validation
    if (password.length < 8) {
      toast.error(t.weakPassword)
      return
    }

    if (password !== confirmPassword) {
      toast.error(t.passwordMismatch)
      return
    }

    setIsLoading(true)

    const { error } = await signUp(email, password, fullName)

    if (error) {
      toast.error(t.error)
      setIsLoading(false)
    } else {
      toast.success(t.success)
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
      <div className="relative w-full max-w-md animate-scale-in max-h-[90vh] overflow-y-auto">
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
                  minLength={8}
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
        </div>
      </div>
    </div>
  )
}
