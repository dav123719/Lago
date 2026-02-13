// ============================================
// useAdmin Hook
// ============================================
// Client-side hook for checking admin status

'use client'

import { useState, useEffect } from 'react'
import { createBrowserSupabaseClient } from '@/lib/supabase/client'

interface AdminState {
  isAdmin: boolean
  isLoading: boolean
  user: {
    id: string
    email?: string
    role?: string
  } | null
}

export function useAdmin(): AdminState {
  const [state, setState] = useState<AdminState>({
    isAdmin: false,
    isLoading: true,
    user: null,
  })

  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const supabase = createBrowserSupabaseClient()
        const { data: { user }, error } = await supabase.auth.getUser()

        if (error || !user) {
          setState({ isAdmin: false, isLoading: false, user: null })
          return
        }

        // Check admin status
        const isAdmin = 
          user.user_metadata?.role === 'admin' ||
          user.email?.endsWith('@lago.lv') ||
          false

        setState({
          isAdmin,
          isLoading: false,
          user: {
            id: user.id,
            email: user.email,
            role: user.user_metadata?.role || 'user',
          },
        })
      } catch {
        setState({ isAdmin: false, isLoading: false, user: null })
      }
    }

    checkAdmin()
  }, [])

  return state
}

export default useAdmin
