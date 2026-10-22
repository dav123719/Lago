// ============================================
// Auth Context Provider
// ============================================
// AGENT slave-4 v1.0.1 - Auth system verified

'use client'

import { createContext, useContext, useEffect, useState, useRef, useCallback, ReactNode } from 'react'
import { User, AuthError, Provider, UserIdentity } from '@supabase/supabase-js'
import { createBrowserSupabaseClient } from '@/lib/supabase/client'
import { Database } from '@/lib/supabase/database.types'
import { toast } from 'sonner'
import { Locale } from '@/lib/i18n/config'
import { safeInternalRedirect } from '@/lib/auth/redirect'

type Profile = Database['public']['Tables']['profiles']['Row']

interface AuthContextType {
  user: User | null
  profile: Profile | null
  isLoading: boolean
  isAuthenticated: boolean
  signInWithOAuth: (provider: Provider, locale: Locale) => Promise<{ error: AuthError | Error | null }>
  signInWithEmail: (email: string, password: string) => Promise<{ error: AuthError | null }>
  signUp: (email: string, password: string, fullName: string, locale?: Locale) => Promise<{ error: AuthError | null }>
  resendSignupConfirmation: (email: string, locale: Locale) => Promise<{ error: AuthError | null }>
  requestPasswordReset: (email: string, locale: Locale) => Promise<{ error: AuthError | null }>
  updateEmail: (email: string, locale?: Locale) => Promise<{ error: AuthError | null }>
  updatePassword: (password: string) => Promise<{ error: AuthError | null }>
  getIdentities: () => Promise<{ identities: UserIdentity[]; error: AuthError | null }>
  linkOAuthIdentity: (provider: 'google' | 'facebook', locale: Locale) => Promise<{ error: AuthError | Error | null }>
  unlinkIdentity: (identity: UserIdentity) => Promise<{ error: AuthError | Error | null }>
  signOut: () => Promise<void>
  updateProfile: (updates: Partial<Profile>) => Promise<{ error: AuthError | Error | null }>
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface AuthProviderProps {
  children: ReactNode
}

const authMessages = {
  lv: {
    loginSuccess: 'Veiksmīgi ielogojāties!',
    logoutSuccess: 'Veiksmīgi izlogojāties',
    cartMerged: 'Grozs apvienots ar jūsu kontu',
    error: 'Kļūda. Lūdzu, mēģiniet vēlreiz.',
    profileUpdated: 'Profils atjaunināts',
  },
  en: {
    loginSuccess: 'Successfully logged in!',
    logoutSuccess: 'Successfully logged out',
    cartMerged: 'Cart merged with your account',
    error: 'Error. Please try again.',
    profileUpdated: 'Profile updated',
  },
  ru: {
    loginSuccess: 'Успешный вход!',
    logoutSuccess: 'Успешный выход',
    cartMerged: 'Корзина объединена с вашим аккаунтом',
    error: 'Ошибка. Пожалуйста, попробуйте снова.',
    profileUpdated: 'Профиль обновлен',
  },
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createBrowserSupabaseClient()
  const activeUserId = useRef<string | null>(null)

  // Fetch user profile
  const fetchProfile = useCallback(async (userId: string) => {
    let { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (!data && error?.code === 'PGRST116') {
      const provision = await supabase.rpc('ensure_my_profile')
      if (!provision.error) {
        data = provision.data
        error = null
      }
    }

    if (error) {
      console.error('Error fetching profile:', error)
      return null
    }

    return data
  }, [supabase])

  // Refresh profile
  const refreshProfile = async () => {
    if (user?.id) {
      const profile = await fetchProfile(user.id)
      if (activeUserId.current === user.id) setProfile(profile)
    }
  }

  // Supabase invokes auth callbacks while holding its auth lock. Defer database
  // requests until the callback returns, and ignore results from older sessions.
  useEffect(() => {
    let active = true
    let revision = 0
    let authEventReceived = false
    let pending: ReturnType<typeof setTimeout> | undefined

    const applySession = (sessionUser: User | null) => {
      if (!active) return
      const currentRevision = ++revision
      activeUserId.current = sessionUser?.id ?? null
      setUser(sessionUser)
      setProfile(null)
      setIsLoading(false)
      clearTimeout(pending)
      if (sessionUser) {
        pending = setTimeout(() => {
          void fetchProfile(sessionUser.id).then((nextProfile) => {
            if (active && revision === currentRevision) setProfile(nextProfile)
          }).catch((error) => {
            if (active && revision === currentRevision) console.error('Error fetching profile:', error)
          })
        }, 0)
      }
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        authEventReceived = true
        applySession(session?.user ?? null)
      }
    )

    void supabase.auth.getSession().then(({ data: { session } }) => {
      // An auth event can arrive while getSession is resolving.
      if (!authEventReceived) applySession(session?.user ?? null)
    }).catch((error) => {
      if (active && !authEventReceived) {
        console.error('Error initializing auth:', error)
        setIsLoading(false)
      }
    })

    return () => {
      active = false
      activeUserId.current = null
      revision++
      clearTimeout(pending)
      subscription.unsubscribe()
    }
  }, [supabase, fetchProfile])

  // OAuth sign in
  const signInWithOAuth = async (provider: Provider, locale: Locale, next = `/${locale}/account`) => {
    try {
      const enabled = provider === 'google'
        ? process.env.NEXT_PUBLIC_GOOGLE_OAUTH_ENABLED === 'true'
        : provider === 'facebook' && process.env.NEXT_PUBLIC_FACEBOOK_OAUTH_ENABLED === 'true'
      if (!enabled) throw new Error(`${provider} sign-in is not configured`)
      const origin = typeof window !== 'undefined' ? window.location.origin : process.env.NEXT_PUBLIC_APP_URL || ''
      const callback = new URL('/auth/callback', origin)
      callback.searchParams.set('flow', 'signin')
      callback.searchParams.set('locale', locale)
      callback.searchParams.set('next', safeInternalRedirect(next, `/${locale}/account`))
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: callback.toString(),
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      })

      if (error) throw error
      return { error: null }
    } catch (error) {
      toast.error(authMessages[locale].error)
      return { error: error instanceof Error ? error : new Error(authMessages[locale].error) }
    }
  }

  // Email sign in
  const signInWithEmail = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    return { error }
  }

  // Sign up
  const authCallbackUrl = (flow: string, locale: Locale) => {
    const origin = typeof window !== 'undefined' ? window.location.origin : process.env.NEXT_PUBLIC_APP_URL || ''
    const callback = new URL('/auth/callback', origin)
    callback.searchParams.set('flow', flow)
    callback.searchParams.set('locale', locale)
    return callback.toString()
  }

  const signUp = async (email: string, password: string, fullName: string, locale: Locale = 'lv') => {
    const { error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        emailRedirectTo: authCallbackUrl('signup', locale),
        data: {
          full_name: fullName.trim().slice(0, 120),
        },
      },
    })

    return { error }
  }

  const resendSignupConfirmation = async (email: string, locale: Locale) => {
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: email.trim(),
      options: { emailRedirectTo: authCallbackUrl('signup', locale) },
    })
    return { error }
  }

  const requestPasswordReset = async (email: string, locale: Locale) => {
    const callback = authCallbackUrl('recovery', locale)
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), { redirectTo: callback })
    return { error }
  }

  const updateEmail = async (email: string, locale: Locale = 'lv') => {
    const { error } = await supabase.auth.updateUser(
      { email: email.trim() },
      { emailRedirectTo: authCallbackUrl('email_change', locale) }
    )
    return { error }
  }

  const updatePassword = async (password: string) => {
    const { error } = await supabase.auth.updateUser({ password })
    return { error }
  }

  const getIdentities = async () => {
    const { data, error } = await supabase.auth.getUserIdentities()
    return { identities: data?.identities ?? [], error }
  }

  const linkOAuthIdentity = async (provider: 'google' | 'facebook', locale: Locale) => {
    const manualLinkEnabled = process.env.NEXT_PUBLIC_MANUAL_IDENTITY_LINKING_ENABLED === 'true'
    const providerEnabled = provider === 'google'
      ? process.env.NEXT_PUBLIC_GOOGLE_OAUTH_ENABLED === 'true'
      : process.env.NEXT_PUBLIC_FACEBOOK_OAUTH_ENABLED === 'true'
    if (!manualLinkEnabled || !providerEnabled) {
      return { error: new Error('This sign-in provider is not enabled') }
    }
    const callback = authCallbackUrl('link', locale)
    const { error } = await supabase.auth.linkIdentity({
      provider,
      options: { redirectTo: callback },
    })
    return { error }
  }

  const unlinkIdentity = async (identity: UserIdentity) => {
    const { data, error: identitiesError } = await supabase.auth.getUserIdentities()
    if (identitiesError) return { error: identitiesError }
    if ((data?.identities.length ?? 0) <= 1) {
      return { error: new Error('Keep at least one sign-in method connected') }
    }
    const { error } = await supabase.auth.unlinkIdentity(identity)
    return { error }
  }

  // Sign out
  const signOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setProfile(null)
  }

  // Update profile
  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user?.id) {
      return { error: new Error('No user logged in') }
    }

    const safeUpdates: Database['public']['Tables']['profiles']['Update'] = {}
    if (updates.full_name !== undefined) safeUpdates.full_name = updates.full_name?.trim().slice(0, 120) || null
    if (updates.first_name !== undefined) safeUpdates.first_name = updates.first_name?.trim().slice(0, 100) || null
    if (updates.last_name !== undefined) safeUpdates.last_name = updates.last_name?.trim().slice(0, 100) || null
    if (updates.phone !== undefined) safeUpdates.phone = updates.phone?.trim().slice(0, 50) || null
    if (updates.avatar_url !== undefined) {
      const avatar = updates.avatar_url?.trim().slice(0, 2048) || null
      if (avatar && !/^https:\/\//i.test(avatar)) return { error: new Error('Avatar URL must use HTTPS') }
      safeUpdates.avatar_url = avatar
    }
    if (updates.bio !== undefined) safeUpdates.bio = updates.bio?.trim().slice(0, 500) || null
    if (updates.preferred_language !== undefined) safeUpdates.preferred_language = updates.preferred_language
    if (updates.email_notifications !== undefined) safeUpdates.email_notifications = updates.email_notifications
    if (updates.sms_notifications !== undefined) safeUpdates.sms_notifications = updates.sms_notifications
    const { error } = await supabase
      .from('profiles')
      .update(safeUpdates)
      .eq('id', user.id)

    if (!error) {
      await refreshProfile()
    }

    return { error }
  }

  const value: AuthContextType = {
    user,
    profile,
    isLoading,
    isAuthenticated: !!user,
    signInWithOAuth,
    signInWithEmail,
    signUp,
    resendSignupConfirmation,
    requestPasswordReset,
    updateEmail,
    updatePassword,
    getIdentities,
    linkOAuthIdentity,
    unlinkIdentity,
    signOut,
    updateProfile,
    refreshProfile,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuthContext() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider')
  }
  return context
}
