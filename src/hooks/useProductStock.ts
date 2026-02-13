// ============================================
// Real-time Product Stock Hook
// ============================================

'use client'

import { useEffect, useState, useCallback } from 'react'
import { createBrowserSupabaseClient } from '@/lib/supabase/client'
import type { StockStatus } from '@/types/store'

interface StockData {
  productId: string
  variantId?: string
  stockQuantity: number
  stockStatus: StockStatus
}

interface UseProductStockOptions {
  productId: string
  variantId?: string
  initialStock?: number
  initialStatus?: StockStatus
}

export function useProductStock({
  productId,
  variantId,
  initialStock = 0,
  initialStatus = 'out_of_stock',
}: UseProductStockOptions) {
  const [stock, setStock] = useState<StockData>({
    productId,
    variantId,
    stockQuantity: initialStock,
    stockStatus: initialStatus,
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  // Fetch initial stock
  const fetchStock = useCallback(async () => {
    if (!productId) return

    setIsLoading(true)
    setError(null)

    try {
      const supabase = createBrowserSupabaseClient()

      // Check if this is a variant or main product
      if (variantId) {
        const { data, error } = await supabase
          .from('product_variants')
          .select('stock_quantity, is_active')
          .eq('id', variantId)
          .single() as { data: { stock_quantity: number; is_active: boolean } | null, error: any }

        if (error) throw error

        setStock({
          productId,
          variantId,
          stockQuantity: data!.stock_quantity,
          stockStatus: calculateStockStatus(data!.stock_quantity, 5),
        })
      } else {
        const { data, error } = await supabase
          .from('products')
          .select('stock_quantity, stock_status')
          .eq('id', productId)
          .single() as { data: { stock_quantity: number; stock_status: string } | null, error: any }

        if (error) throw error

        setStock({
          productId,
          stockQuantity: data!.stock_quantity,
          stockStatus: data!.stock_status as StockStatus,
        })
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch stock'))
    } finally {
      setIsLoading(false)
    }
  }, [productId, variantId])

  // Subscribe to real-time stock updates
  useEffect(() => {
    if (!productId) return

    const supabase = createBrowserSupabaseClient()

    // Set up real-time subscription
    const channel = supabase
      .channel(`stock:${productId}${variantId ? `:${variantId}` : ''}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: variantId ? 'product_variants' : 'products',
          filter: `id=eq.${variantId || productId}`,
        },
        (payload: { new: { stock_quantity: number; stock_status?: string } }) => {
          const newData = payload.new
          setStock({
            productId,
            variantId,
            stockQuantity: newData.stock_quantity,
            stockStatus: (newData.stock_status as StockStatus) || calculateStockStatus(newData.stock_quantity, 5),
          })
        }
      )
      .subscribe()

    // Initial fetch
    fetchStock()

    // Cleanup subscription
    return () => {
      supabase.removeChannel(channel)
    }
  }, [productId, variantId, fetchStock])

  return {
    ...stock,
    isLoading,
    error,
    refetch: fetchStock,
  }
}

// Hook for monitoring multiple products' stock
export function useMultipleProductStock(productIds: string[]) {
  const [stocks, setStocks] = useState<Record<string, StockData>>({})
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (productIds.length === 0) return

    const supabase = createBrowserSupabaseClient()

    // Fetch initial stock for all products
    const fetchStocks = async () => {
      setIsLoading(true)

      const { data, error } = await supabase
        .from('products')
        .select('id, stock_quantity, stock_status')
        .in('id', productIds)

      if (error) {
        console.error('Error fetching stocks:', error)
        setIsLoading(false)
        return
      }

      const stocksMap: Record<string, StockData> = {}
      data.forEach((item: { id: string; stock_quantity: number; stock_status: string }) => {
        stocksMap[item.id] = {
          productId: item.id,
          stockQuantity: item.stock_quantity,
          stockStatus: item.stock_status as StockStatus,
        }
      })

      setStocks(stocksMap)
      setIsLoading(false)
    }

    fetchStocks()

    // Subscribe to changes for all products
    const channel = supabase
      .channel('stocks')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'products',
        },
        (payload: { new: { id: string; stock_quantity: number; stock_status: string } }) => {
          const newData = payload.new
          if (productIds.includes(newData.id)) {
            setStocks((prev) => ({
              ...prev,
              [newData.id]: {
                productId: newData.id,
                stockQuantity: newData.stock_quantity,
                stockStatus: newData.stock_status as StockStatus,
              },
            }))
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [productIds])

  return { stocks, isLoading }
}

// Helper function to calculate stock status
function calculateStockStatus(quantity: number, threshold: number): StockStatus {
  if (quantity <= 0) return 'out_of_stock'
  if (quantity <= threshold) return 'low_stock'
  return 'in_stock'
}
