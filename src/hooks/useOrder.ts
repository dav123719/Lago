'use client'

// ===================================
// useOrder Hook - Single order with realtime updates
// ===================================

import { useState, useEffect, useCallback } from 'react'
import { createBrowserSupabaseClient } from '@/lib/supabase/client'
import type { Order, OrderStatus } from '@/types/orders'

interface UseOrderReturn {
  order: Order | null
  isLoading: boolean
  error: Error | null
  refetch: () => Promise<void>
}

export function useOrder(
  orderId: string | undefined,
  userId: string | undefined
): UseOrderReturn {
  const [order, setOrder] = useState<Order | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const supabase = createBrowserSupabaseClient()

  const fetchOrder = useCallback(async () => {
    if (!orderId || !userId) {
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const { data, error: fetchError } = await supabase
        .from('orders')
        .select(`
          *,
          items:order_items(*)
        `)
        .eq('id', orderId)
        .eq('user_id', userId)
        .single()

      if (fetchError) {
        throw new Error(fetchError.message)
      }

      setOrder(data)
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch order'))
    } finally {
      setIsLoading(false)
    }
  }, [orderId, userId, supabase])

  // Initial fetch
  useEffect(() => {
    fetchOrder()
  }, [fetchOrder])

  // Realtime subscription
  useEffect(() => {
    if (!orderId) return

    const channel = supabase
      .channel(`order-${orderId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders',
          filter: `id=eq.${orderId}`,
        },
        (payload) => {
          if (payload.eventType === 'UPDATE') {
            const newData = payload.new as Order
            setOrder((prev) => {
              if (!prev) return newData
              
              // Show notification if status changed
              if (prev.status !== newData.status) {
                showStatusChangeNotification(newData.status)
              }
              
              return { ...prev, ...newData }
            })
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [orderId, supabase])

  return {
    order,
    isLoading,
    error,
    refetch: fetchOrder,
  }
}

// Status change notification
function showStatusChangeNotification(status: OrderStatus) {
  // Dispatch custom event for toast notification
  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent('order-status-change', {
        detail: { status },
      })
    )
  }
}
