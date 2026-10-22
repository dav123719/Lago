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
    const supabase = createBrowserSupabaseClient()
    let active = true
    let revision = 0
    let pending: ReturnType<typeof setTimeout> | undefined

    const checkAdmin = async () => {
      const request = ++revision
      // UI state is advisory; every mutation is authorized again by the server.
      setState({ isAdmin: false, isLoading: true, user: null })
      try {
        const { data: { user }, error } = await supabase.auth.getUser()
        if (!active || request !== revision) return
        if (error || !user) {
          setState({ isAdmin: false, isLoading: false, user: null })
          return
        }
        const { data: isAdmin, error: roleError } = await supabase.rpc('is_current_user_admin')
        if (!active || request !== revision) return
        const authorized = !roleError && isAdmin === true
        setState({
          isAdmin: authorized,
          isLoading: false,
          user: { id: user.id, email: user.email, role: authorized ? 'admin' : 'user' },
        })
      } catch {
        if (active && request === revision) setState({ isAdmin: false, isLoading: false, user: null })
      }
    }

    const scheduleCheck = () => {
      revision++
      setState({ isAdmin: false, isLoading: true, user: null })
      clearTimeout(pending)
      // Supabase auth callbacks hold a lock; never await another auth call inside them.
      pending = setTimeout(() => { void checkAdmin() }, 0)
    }
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session?.user) {
        revision++
        clearTimeout(pending)
        setState({ isAdmin: false, isLoading: false, user: null })
      } else scheduleCheck()
    })
    const onFocus = () => { if (document.visibilityState === 'visible') scheduleCheck() }
    document.addEventListener('visibilitychange', onFocus)
    scheduleCheck()
    return () => {
      active = false
      revision++
      clearTimeout(pending)
      subscription.unsubscribe()
      document.removeEventListener('visibilitychange', onFocus)
    }
  }, [])

  return state
}

export default useAdmin
