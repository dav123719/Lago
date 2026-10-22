// ============================================
// Auth Button Component
// ============================================
// AGENT slave-4 v1.0.1 - Auth system verified

'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import { User, LogIn } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { Locale } from '@/lib/i18n/config'
import { AuthDropdown } from './AuthDropdown'

function LoadingDialog() {
  return <div role="status" aria-label="Loading" className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80"><span className="h-8 w-8 animate-spin rounded-full border-2 border-lago-gold border-t-transparent" /></div>
}

const ProfileDropdown = dynamic(() => import('./ProfileDropdown').then(module => module.ProfileDropdown))
const LoginModal = dynamic(() => import('./LoginModal').then(module => module.LoginModal), { loading: LoadingDialog })
const SignupModal = dynamic(() => import('./SignupModal').then(module => module.SignupModal), { loading: LoadingDialog })
const ForgotPasswordModal = dynamic(() => import('./ForgotPasswordModal').then(module => module.ForgotPasswordModal), { loading: LoadingDialog })

interface AuthButtonProps {
  locale: Locale
  mobile?: boolean
}

const buttonLabels = {
  lv: { login: 'Ienākt' },
  en: { login: 'Login' },
  ru: { login: 'Войти' },
}

export function AuthButton({ locale, mobile = false }: AuthButtonProps) {
  const { isAuthenticated, profile, isLoading } = useAuth()
  const [showAuthDropdown, setShowAuthDropdown] = useState(false)
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [showSignupModal, setShowSignupModal] = useState(false)
  const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false)

  if (isLoading) {
    return (
      <div className={`flex items-center ${mobile ? 'w-full' : ''}`}>
        <div className="w-8 h-8 rounded-full bg-lago-gray animate-pulse" />
      </div>
    )
  }

  // Authenticated state - show profile dropdown
  if (isAuthenticated) {
    return (
      <ProfileDropdown
        locale={locale}
        mobile={mobile}
        profile={profile}
      />
    )
  }

  // Unauthenticated state - show login button with dropdown
  return (
    <>
      <div className={`relative ${mobile ? 'w-full' : ''}`}>
        <button
          onClick={() => setShowAuthDropdown(!showAuthDropdown)}
          onMouseEnter={() => !mobile && setShowAuthDropdown(true)}
          className={`flex items-center gap-2 transition-all duration-300 ${
            mobile
              ? 'w-full py-4 text-2xl text-white hover:text-lago-gold font-button justify-between'
              : 'text-white/90 hover:text-white p-2 rounded-lg hover:bg-white/5'
          }`}
          aria-expanded={showAuthDropdown}
          aria-haspopup="true"
        >
          <div className="flex items-center gap-2">
            <div className={`flex items-center justify-center rounded-full bg-lago-gold/10 border border-lago-gold/30 ${
              mobile ? 'w-10 h-10' : 'w-8 h-8'
            }`}>
              <User className={`text-lago-gold ${mobile ? 'w-5 h-5' : 'w-4 h-4'}`} />
            </div>
            <span className={mobile ? '' : 'text-sm font-button font-medium'}>
              {buttonLabels[locale].login}
            </span>
          </div>
          {!mobile && <LogIn className="w-4 h-4" />}
        </button>

        {showAuthDropdown && (
          <AuthDropdown
            locale={locale}
            mobile={mobile}
            onClose={() => setShowAuthDropdown(false)}
            onEmailClick={() => {
              setShowAuthDropdown(false)
              setShowLoginModal(true)
            }}
            onSignupClick={() => {
              setShowAuthDropdown(false)
              setShowSignupModal(true)
            }}
          />
        )}
      </div>

      {showLoginModal && <LoginModal
        locale={locale}
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onForgotPasswordClick={() => {
          setShowLoginModal(false)
          setShowForgotPasswordModal(true)
        }}
        onSignupClick={() => {
          setShowLoginModal(false)
          setShowSignupModal(true)
        }}
      />}

      {showSignupModal && <SignupModal
        locale={locale}
        isOpen={showSignupModal}
        onClose={() => setShowSignupModal(false)}
        onLoginClick={() => {
          setShowSignupModal(false)
          setShowLoginModal(true)
        }}
      />}
      {showForgotPasswordModal && <ForgotPasswordModal
        locale={locale}
        isOpen={showForgotPasswordModal}
        onClose={() => setShowForgotPasswordModal(false)}
        onBackToLogin={() => {
          setShowForgotPasswordModal(false)
          setShowLoginModal(true)
        }}
      />}
    </>
  )
}
