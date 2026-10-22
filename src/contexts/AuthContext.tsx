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
import { clearPasswordRecovery } from '@/lib/auth/recovery'

type Profile = Database['public']['Tables']['profiles']['Row']

interface AuthContextType {
  user: User | null
  profile: Profile | null
  isLoading: boolean
  isProfileLoading: boolean
  profileError: string | null
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
  const [isProfileLoading, setIsProfileLoading] = useState(false)
  const [profileError, setProfileError] = useState<string | null>(null)
  const supabase = createBrowserSupabaseClient()
  const activeUserId = useRef<string | null>(null)
  const sessionRevision = useRef(0)
  const profileRevision = useRef(0)

  // Fetch user profile
  const fetchProfile = useCallback(async (userId: string) => {
    let { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (!data && error?.code === 'PGRST116' && activeUserId.current === userId) {
      const provision = await supabase.rpc('ensure_my_profile')
      if (!provision.error) {
        data = provision.data
        error = null
      }
    }

    if (error) throw error

    return data
  }, [supabase])

  // Only the newest request for the current identity may publish private data.
  const refreshProfile = useCallback(async () => {
    const userId = activeUserId.current
    if (!userId) return
    const session = sessionRevision.current
    const request = ++profileRevision.current
    setIsProfileLoading(true)
    setProfileError(null)
    try {
      const nextProfile = await fetchProfile(userId)
      if (activeUserId.current === userId && sessionRevision.current === session && profileRevision.current === request) {
        setProfile(nextProfile)
      }
    } catch {
      if (activeUserId.current === userId && sessionRevision.current === session && profileRevision.current === request) {
        setProfileError('Could not load your profile. Please try again.')
      }
    } finally {
      if (activeUserId.current === userId && sessionRevision.current === session && profileRevision.current === request) {
        setIsProfileLoading(false)
      }
    }
  }, [fetchProfile])

  // Supabase invokes auth callbacks while holding its auth lock. Defer database
  // requests until the callback returns, and ignore results from older sessions.
  useEffect(() => {
    let active = true
    let authEventReceived = false
    let pending: ReturnType<typeof setTimeout> | undefined

    const applySession = (sessionUser: User | null) => {
      if (!active) return
      const nextId = sessionUser?.id ?? null
      const identityChanged = activeUserId.current !== nextId
      activeUserId.current = nextId
      setUser(sessionUser)
      setIsLoading(false)
      // Token refresh and tab focus must not blank a profile or repeat its query.
      if (!identityChanged) return
      sessionRevision.current++
      profileRevision.current++
      setProfile(null)
      setProfileError(null)
      setIsProfileLoading(Boolean(sessionUser))
      clearTimeout(pending)
      if (sessionUser) {
        pending = setTimeout(() => { void refreshProfile() }, 0)
      } else {
        clearPasswordRecovery()
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
      sessionRevision.current++
      profileRevision.current++
      clearTimeout(pending)
      subscription.unsubscribe()
    }
  }, [supabase, refreshProfile])

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
    const { error } = await supabase.auth.signOut()
    if (error) throw error
    activeUserId.current = null
    sessionRevision.current++
    profileRevision.current++
    clearPasswordRecovery()
    setUser(null)
    setProfile(null)
    setProfileError(null)
    setIsProfileLoading(false)
  }

  // Update profile
  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user?.id || activeUserId.current !== user.id) {
      return { error: new Error('No user logged in') }
    }

    const userId = user.id
    const session = sessionRevision.current
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
    const { data, error } = await supabase
      .from('profiles')
      .update(safeUpdates)
      .eq('id', userId)
      .select()
      .single()

    if (activeUserId.current !== userId || sessionRevision.current !== session) {
      return { error: new Error('Your session changed. Please sign in and try again.') }
    }
    if (!error) {
      // Invalidate older reads so they cannot undo a confirmed save.
      profileRevision.current++
      setProfile(data)
      setProfileError(null)
      setIsProfileLoading(false)
    }
    return { error }
  }

  const value: AuthContextType = {
    user,
    profile,
    isLoading,
    isProfileLoading,
    profileError,
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
