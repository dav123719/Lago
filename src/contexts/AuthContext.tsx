// ============================================
// Auth Context Provider
// ============================================
// AGENT slave-4 v1.0.1 - Auth system verified

'use client'

import { createContext, useContext, useEffect, useState, useRef, useCallback, ReactNode } from 'react'
import { User, AuthError, Provider } from '@supabase/supabase-js'
import { createBrowserSupabaseClient } from '@/lib/supabase/client'
import { Database } from '@/lib/supabase/database.types'
import { toast } from 'sonner'
import { Locale } from '@/lib/i18n/config'

type Profile = Database['public']['Tables']['profiles']['Row']

interface AuthContextType {
  user: User | null
  profile: Profile | null
  isLoading: boolean
  isAuthenticated: boolean
  signInWithOAuth: (provider: Provider, locale: Locale) => Promise<void>
  signInWithEmail: (email: string, password: string) => Promise<{ error: AuthError | null }>
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: AuthError | null }>
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
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

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
  const signInWithOAuth = async (provider: Provider, locale: Locale) => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback?locale=${locale}`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      })

      if (error) {
        toast.error(authMessages[locale].error)
        throw error
      }
    } catch (error) {
      console.error('OAuth error:', error)
      toast.error(authMessages[locale].error)
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
  const signUp = async (email: string, password: string, fullName: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL || window.location.origin}/auth/callback/`,
        data: {
          full_name: fullName,
        },
      },
    })

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

    const { error } = await (supabase
      .from('profiles') as any)
      .update({ ...updates, updated_at: new Date().toISOString() })
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
