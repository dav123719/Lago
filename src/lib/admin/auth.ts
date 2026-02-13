// ===================================
// Admin Authentication Utilities
// ===================================

import { createServerClient } from '@/lib/supabase/client'
import type { Database } from '@/types/database'

export type UserRole = 'admin' | 'manager' | 'customer'

export interface AdminUser {
  id: string
  email: string
  full_name: string | null
  role: UserRole
}

/**
 * Check if the current user has admin role
 * This function should be called from server components or API routes
 */
export async function checkAdminRole(): Promise<boolean> {
  try {
    const supabase = createServerClient()
    
    // Get current session
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session?.user) {
      return false
    }

    // Check if user has admin role in profiles table
    const { data, error } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', session.user.id)
      .single() as { data: any, error: any }

    if (error || !data) {
      console.error('Error fetching user profile:', error)
      return false
    }

    const role = (data as { role: string }).role

    // Allow both 'admin' and 'manager' roles for admin panel access
    return role === 'admin' || role === 'manager'
  } catch (error) {
    console.error('Error checking admin role:', error)
    return false
  }
}

/**
 * Get the current admin user details
 */
export async function getCurrentAdminUser(): Promise<AdminUser | null> {
  try {
    const supabase = createServerClient()
    
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session?.user) {
      return null
    }

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .single() as { data: any, error: any }

    if (error || !data) {
      console.error('Error fetching user profile:', error)
      return null
    }

    const profile = data as { id: string, email: string, full_name: string | null, first_name?: string | null, last_name?: string | null, role: string }

    // Only return if user has admin/manager role
    if (profile.role !== 'admin' && profile.role !== 'manager') {
      return null
    }

    // Use full_name if available, otherwise combine first_name + last_name
    const fullName = profile.full_name || 
      (profile.first_name && profile.last_name 
        ? `${profile.first_name} ${profile.last_name}` 
        : profile.first_name || profile.last_name || null)

    return {
      id: profile.id,
      email: profile.email,
      full_name: fullName,
      role: profile.role as UserRole,
    }
  } catch (error) {
    console.error('Error getting current admin user:', error)
    return null
  }
}

/**
 * Check if user has specific permission level
 * admin: full access
 * manager: can manage orders and customers, limited settings
 * customer: no admin access
 */
export async function checkPermission(
  requiredRole: 'admin' | 'manager'
): Promise<boolean> {
  try {
    const supabase = createServerClient()
    
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session?.user) {
      return false
    }

    const { data, error } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', session.user.id)
      .single() as { data: any, error: any }

    if (error || !data) {
      return false
    }

    const userRole = (data as { role: string }).role as UserRole

    // Admin has all permissions
    if (userRole === 'admin') {
      return true
    }

    // Manager has manager permissions
    if (userRole === 'manager' && requiredRole === 'manager') {
      return true
    }

    return false
  } catch (error) {
    console.error('Error checking permission:', error)
    return false
  }
}

/**
 * Middleware helper to check admin access
 * Use this in middleware.ts for route protection
 */
export function isAdminRoute(pathname: string): boolean {
  return pathname.startsWith('/admin')
}

/**
 * Get admin dashboard stats
 */
export async function getAdminStats(): Promise<{
  pendingOrders: number
  todayOrders: number
  totalRevenue: number
  lowStockProducts: number
}> {
  try {
    const supabase = createServerClient()

    // Get pending orders count
    const { count: pendingCount } = await supabase
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending')

    // Get today's orders
    const today = new Date().toISOString().split('T')[0]
    const { count: todayCount } = await supabase
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', today)

    // Get total revenue (paid orders)
    const { data: revenueData } = await supabase
      .from('orders')
      .select('total')
      .in('status', ['paid', 'processing', 'shipped', 'delivered']) as { data: any, error: any }

    const totalRevenue = (revenueData as { total: number }[] | null)?.reduce((sum, order) => sum + (order as { total: number }).total, 0) || 0

    return {
      pendingOrders: pendingCount || 0,
      todayOrders: todayCount || 0,
      totalRevenue,
      lowStockProducts: 0, // Would fetch from products table
    }
  } catch (error) {
    console.error('Error getting admin stats:', error)
    return {
      pendingOrders: 0,
      todayOrders: 0,
      totalRevenue: 0,
      lowStockProducts: 0,
    }
  }
}
