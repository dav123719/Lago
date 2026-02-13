'use client'

// ===================================
// useOrders Hook - Fetch user's orders
// ===================================

import { useState, useEffect, useCallback } from 'react'
import { createBrowserSupabaseClient } from '@/lib/supabase/client'
import type { Order, OrderFilters } from '@/types/orders'

interface UseOrdersReturn {
  orders: Order[]
  isLoading: boolean
  error: Error | null
  refetch: () => Promise<void>
}

export function useOrders(
  userId: string | undefined,
  filters?: OrderFilters
): UseOrdersReturn {
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const supabase = createBrowserSupabaseClient()

  const fetchOrders = useCallback(async () => {
    if (!userId) {
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      let query = supabase
        .from('orders')
        .select(`
          *,
          items:order_items(*)
        `)
        .eq('user_id', userId)

      // Apply filters
      if (filters?.status && filters.status !== 'all') {
        query = query.eq('status', filters.status)
      }
      if (filters?.dateFrom) {
        query = query.gte('created_at', filters.dateFrom)
      }
      if (filters?.dateTo) {
        query = query.lte('created_at', filters.dateTo)
      }
      if (filters?.search) {
        query = query.or(
          `order_number.ilike.%${filters.search}%,customer_email.ilike.%${filters.search}%,customer_name.ilike.%${filters.search}%`
        )
      }

      // Apply sorting
      const sortBy = filters?.sortBy || 'created_at'
      const sortOrder = filters?.sortOrder || 'desc'
      query = query.order(sortBy, { ascending: sortOrder === 'asc' })

      const { data, error: fetchError } = await query

      if (fetchError) {
        throw new Error(fetchError.message)
      }

      setOrders(data || [])
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch orders'))
    } finally {
      setIsLoading(false)
    }
  }, [userId, filters, supabase])

  useEffect(() => {
    fetchOrders()
  }, [fetchOrders])

  return {
    orders,
    isLoading,
    error,
    refetch: fetchOrders,
  }
}
