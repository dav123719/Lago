// ============================================
// Auth Context Provider
// ============================================
// AGENT slave-4 v1.0.1 - Auth system verified

'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
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

  // Fetch user profile
  const fetchProfile = async (userId: string) => {
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
  }

  // Refresh profile
  const refreshProfile = async () => {
    if (user?.id) {
      const profile = await fetchProfile(user.id)
      setProfile(profile)
    }
  }

  // Initialize auth state
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        setUser(session?.user ?? null)
        
        if (session?.user?.id) {
          const profile = await fetchProfile(session.user.id)
          setProfile(profile)
        }
      } catch (error) {
        console.error('Error initializing auth:', error)
      } finally {
        setIsLoading(false)
      }
    }

    initializeAuth()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null)
        
        if (session?.user?.id) {
          const profile = await fetchProfile(session.user.id)
          setProfile(profile)
        } else {
          setProfile(null)
        }
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase])

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
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (!error && data.user) {
      const profile = await fetchProfile(data.user.id)
      setProfile(profile)
    }

    return { error }
  }

  // Sign up
  const signUp = async (email: string, password: string, fullName: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    })

    if (!error && data.user) {
      // Profile is created by database trigger
      const profile = await fetchProfile(data.user.id)
      setProfile(profile)
    }

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
