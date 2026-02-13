// ============================================
// Admin Role Utilities
// ============================================
// Helper functions for checking admin permissions

import { createServerClient, createBrowserSupabaseClient } from '@/lib/supabase/client'

/**
 * Check if a user has admin role (server-side)
 */
export async function isAdminServer(): Promise<boolean> {
  try {
    const supabase = createServerClient()
    const { data: { user }, error } = await supabase.auth.getUser()

    if (error || !user) return false

    // Check admin role in user metadata
    if (user.user_metadata?.role === 'admin') return true

    // Check email domain
    if (user.email?.endsWith('@lago.lv')) return true

    // Check user_roles table
    const { data } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .single()

    return !!data
  } catch {
    return false
  }
}

/**
 * Check if a user has admin role (client-side)
 */
export async function isAdminClient(): Promise<boolean> {
  try {
    const supabase = createBrowserSupabaseClient()
    const { data: { user }, error } = await supabase.auth.getUser()

    if (error || !user) return false

    // Check admin role in user metadata
    if (user.user_metadata?.role === 'admin') return true

    // Check email domain
    if (user.email?.endsWith('@lago.lv')) return true

    return false
  } catch {
    return false
  }
}

/**
 * Get current user info (server-side)
 */
export async function getCurrentUser() {
  try {
    const supabase = createServerClient()
    const { data: { user }, error } = await supabase.auth.getUser()

    if (error || !user) return null

    return {
      id: user.id,
      email: user.email,
      role: user.user_metadata?.role || 'user',
      isAdmin: await isAdminServer(),
    }
  } catch {
    return null
  }
}

/**
 * Require admin access - throws if not admin
 */
export async function requireAdmin(): Promise<void> {
  const isAdmin = await isAdminServer()
  if (!isAdmin) {
    throw new Error('Admin access required')
  }
}
