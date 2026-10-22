// ============================================
// Admin Role Utilities
// ============================================
// Helper functions for checking admin permissions


/**
 * Check if a user has admin role (server-side)
 */
export async function isAdminServer(): Promise<boolean> {
  try {
    const { createClient } = await import('@/lib/supabase/server')
    const supabase = await createClient()
    const { data: { user }, error } = await supabase.auth.getUser()

    if (error || !user) return false

    const { data: isAdmin, error: roleError } = await supabase.rpc('is_current_user_admin')
    return !roleError && isAdmin === true

  } catch {
    return false
  }
}

/**
 * Check if a user has admin role (client-side)
 */
export async function isAdminClient(): Promise<boolean> {
  try {
    const { createBrowserSupabaseClient } = await import('@/lib/supabase/client')
    const supabase = createBrowserSupabaseClient()
    const { data: { user }, error } = await supabase.auth.getUser()
    if (error || !user) return false
    const { data: isAdmin, error: roleError } = await supabase.rpc('is_current_user_admin')
    return !roleError && isAdmin === true
  } catch {
    return false
  }
}

/**
 * Get current user info (server-side)
 */
export async function getCurrentUser() {
  try {
    const { createClient } = await import('@/lib/supabase/server')
    const supabase = await createClient()
    const { data: { user }, error } = await supabase.auth.getUser()

    if (error || !user) return null

    return {
      id: user.id,
      email: user.email,
      role: await isAdminServer() ? 'admin' : 'user',
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
