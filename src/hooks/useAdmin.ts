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

        const { data: isAdmin, error: roleError } = await supabase.rpc('is_current_user_admin')
        const authorized = !roleError && isAdmin === true

        setState({
          isAdmin: authorized,
          isLoading: false,
          user: {
            id: user.id,
            email: user.email,
            role: authorized ? 'admin' : 'user',
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
