'use client'

// ===================================
// useAdminOrders Hook - Admin order management
// ===================================

import { useState, useEffect, useCallback } from 'react'
import { createBrowserSupabaseClient } from '@/lib/supabase/client'
import type { Order, OrderFilters, OrderStats, OrderStatus } from '@/types/orders'

interface UseAdminOrdersReturn {
  orders: Order[]
  stats: OrderStats
  isLoading: boolean
  error: Error | null
  refetch: () => Promise<void>
  updateOrderStatus: (orderId: string, status: OrderStatus, notes?: string) => Promise<void>
  addTrackingInfo: (
    orderId: string,
    tracking: { carrier: string; tracking_number: string; tracking_url?: string }
  ) => Promise<void>
}

export function useAdminOrders(filters?: OrderFilters): UseAdminOrdersReturn {
  const [orders, setOrders] = useState<Order[]>([])
  const [stats, setStats] = useState<OrderStats>({
    total: 0,
    pending: 0,
    paid: 0,
    processing: 0,
    shipped: 0,
    delivered: 0,
    cancelled: 0,
    refunded: 0,
    revenue: 0,
  })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const supabase = createBrowserSupabaseClient()

  const fetchOrders = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      // Fetch orders with filters
      let query = supabase
        .from('orders')
        .select(`
          *,
          items:order_items(*)
        `)

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
      if (filters?.customer) {
        query = query.or(
          `customer_email.ilike.%${filters.customer}%,customer_name.ilike.%${filters.customer}%`
        )
      }

      // Apply sorting
      const sortBy = filters?.sortBy || 'created_at'
      const sortOrder = filters?.sortOrder || 'desc'
      query = query.order(sortBy, { ascending: sortOrder === 'asc' })

      const { data: ordersData, error: ordersError } = await query

      if (ordersError) {
        throw new Error(ordersError.message)
      }

      setOrders(ordersData || [])

      // Fetch stats
      const { data: statsData, error: statsError } = await (supabase
        .from('orders') as any)
        .select('status, total')

      if (statsError) {
        throw new Error(statsError.message)
      }

      // Calculate stats
      const newStats: OrderStats = {
        total: statsData?.length || 0,
        pending: 0,
        paid: 0,
        processing: 0,
        shipped: 0,
        delivered: 0,
        cancelled: 0,
        refunded: 0,
        revenue: 0,
      }

      ;(statsData as unknown as Array<{ status: string; total: number }>)?.forEach((order) => {
        ;(newStats as any)[order.status as OrderStatus]++
        if (['paid', 'processing', 'shipped', 'delivered'].includes(order.status)) {
          newStats.revenue += order.total
        }
      })

      setStats(newStats)
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch orders'))
    } finally {
      setIsLoading(false)
    }
  }, [filters, supabase])

  // Update order status
  const updateOrderStatus = useCallback(
    async (orderId: string, status: OrderStatus, notes?: string) => {
      try {
        const response = await fetch(`/api/admin/orders/${orderId}/status`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status, notes }),
        })

        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.message || 'Failed to update status')
        }

        // Refresh orders
        await fetchOrders()
      } catch (err) {
        throw err instanceof Error ? err : new Error('Failed to update status')
      }
    },
    [fetchOrders]
  )

  // Add tracking info
  const addTrackingInfo = useCallback(
    async (
      orderId: string,
      tracking: { carrier: string; tracking_number: string; tracking_url?: string }
    ) => {
      try {
        const response = await fetch(`/api/admin/orders/${orderId}/tracking`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(tracking),
        })

        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.message || 'Failed to add tracking')
        }

        // Refresh orders
        await fetchOrders()
      } catch (err) {
        throw err instanceof Error ? err : new Error('Failed to add tracking')
      }
    },
    [fetchOrders]
  )

  // Initial fetch and realtime subscription
  useEffect(() => {
    fetchOrders()

    // Subscribe to all order changes
    const channel = supabase
      .channel('admin-orders')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders',
        },
        () => {
          // Refresh orders on any change
          fetchOrders()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [fetchOrders, supabase])

  return {
    orders,
    stats,
    isLoading,
    error,
    refetch: fetchOrders,
    updateOrderStatus,
    addTrackingInfo,
  }
}
