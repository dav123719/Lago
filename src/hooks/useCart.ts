// ===================================
// Cart Hook
// ===================================
// Cart operations and state management

'use client'

import { useCallback, useState } from 'react'
import { createBrowserSupabaseClient } from '@/lib/supabase/client'
import { useGuestSession } from './useGuestSession'
import type { 
  Cart, 
  CartItem, 
  Product, 
  AddToCartInput, 
  UpdateCartItemInput,
  ApiResponse 
} from '@/types/checkout'

export interface UseCartReturn {
  // State
  cart: Cart | null
  items: CartItem[]
  isLoading: boolean
  isSyncing: boolean
  error: string | null
  itemCount: number
  cartTotal: number
  
  // Actions
  loadCart: () => Promise<void>
  addItem: (input: AddToCartInput) => Promise<ApiResponse<CartItem>>
  updateItem: (input: UpdateCartItemInput) => Promise<ApiResponse<void>>
  removeItem: (itemId: string) => Promise<ApiResponse<void>>
  clearCart: () => Promise<ApiResponse<void>>
  refreshCart: () => Promise<void>
  mergeGuestCart: (userId: string) => Promise<ApiResponse<void>>
}

/**
 * Hook for managing cart operations
 * Integrates with Supabase for persistence
 * Supports both authenticated and guest users
 */
export function useCart(): UseCartReturn {
  const supabase = createBrowserSupabaseClient()
  const { sessionId, isLoading: isSessionLoading } = useGuestSession()
  
  const [cart, setCart] = useState<Cart | null>(null)
  const [items, setItems] = useState<CartItem[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isSyncing, setIsSyncing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Computed values
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0)
  const cartTotal = items.reduce((sum, item) => {
    const price = item.price_at_time || item.product?.price || 0
    return sum + price * item.quantity
  }, 0)

  /**
   * Load cart from Supabase
   */
  const loadCart = useCallback(async () => {
    if (isSessionLoading || !sessionId) return
    
    setIsLoading(true)
    setError(null)

    try {
      // First, try to get existing cart for this session
      const { data: existingCart, error: cartError } = await (supabase
        .from('carts') as any)
        .select('*')
        .eq('guest_session_id', sessionId)
        .eq('status', 'active')
        .single()

      if (cartError && cartError.code !== 'PGRST116') {
        throw cartError
      }

      let cartId: string

      if (!existingCart) {
        // Create new cart
        const { data: newCart, error: createError } = await (supabase
          .from('carts') as any)
          .insert({
            guest_session_id: sessionId,
            status: 'active',
          })
          .select()
          .single()

        if (createError) throw createError
        cartId = (newCart as Cart).id
        setCart(newCart as Cart)
        setItems([])
      } else {
        cartId = (existingCart as Cart).id
        setCart(existingCart as Cart)

        // Load cart items with product details
        const { data: cartItems, error: itemsError } = await (supabase
          .from('cart_items') as any)
          .select(`
            *,
            product:products(*)
          `)
          .eq('cart_id', cartId)
          .order('created_at', { ascending: false })

        if (itemsError) throw itemsError
        setItems((cartItems as unknown as CartItem[]) || [])
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load cart'
      setError(message)
      console.error('Error loading cart:', err)
    } finally {
      setIsLoading(false)
    }
  }, [sessionId, isSessionLoading, supabase])

  /**
   * Add item to cart
   */
  const addItem = useCallback(async (input: AddToCartInput): Promise<ApiResponse<CartItem>> => {
    if (!cart?.id) {
      return { success: false, error: 'Cart not initialized' }
    }

    setIsSyncing(true)
    setError(null)

    try {
      // Fetch current product price and stock
      const { data: product, error: productError } = await (supabase
        .from('products') as any)
        .select('*')
        .eq('id', input.productId)
        .single()

      const productData = product as unknown as Product

      if (productError) throw productError
      if (!productData) throw new Error('Product not found')
      if (!productData.is_available) throw new Error('Product is not available')
      if (productData.stock_quantity < input.quantity) {
        throw new Error(`Only ${productData.stock_quantity} items available`)
      }

      // Check if item already exists in cart
      const { data: existingItem, error: existingError } = await (supabase
        .from('cart_items') as any)
        .select('*')
        .eq('cart_id', cart.id)
        .eq('product_id', input.productId)
        .single()

      if (existingError && existingError.code !== 'PGRST116') {
        throw existingError
      }

      let result: CartItem

      if (existingItem) {
        // Update quantity
        const newQuantity = existingItem.quantity + input.quantity
        
        if (newQuantity > productData.stock_quantity) {
          throw new Error(`Cannot add more. Only ${productData.stock_quantity} items available.`)
        }

        const { data: updated, error: updateError } = await (supabase
          .from('cart_items') as any)
          .update({ quantity: newQuantity })
          .eq('id', existingItem.id)
          .select(`*, product:products(*)`)
          .single()

        if (updateError) throw updateError
        result = updated as CartItem
      } else {
        // Insert new item
        const { data: inserted, error: insertError } = await (supabase
          .from('cart_items') as any)
          .insert({
            cart_id: cart.id,
            product_id: input.productId,
            quantity: input.quantity,
            price_at_time: productData.price,
          })
          .select(`*, product:products(*)`)
          .single()

        if (insertError) throw insertError
        result = inserted as CartItem
      }

      // Refresh cart items
      await loadCart()

      return { success: true, data: result }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to add item'
      setError(message)
      return { success: false, error: message }
    } finally {
      setIsSyncing(false)
    }
  }, [cart?.id, supabase, loadCart])

  /**
   * Update cart item quantity
   */
  const updateItem = useCallback(async (input: UpdateCartItemInput): Promise<ApiResponse<void>> => {
    if (!cart?.id) {
      return { success: false, error: 'Cart not initialized' }
    }

    setIsSyncing(true)
    setError(null)

    try {
      if (input.quantity <= 0) {
        // Remove item if quantity is 0 or less
        const { error: deleteError } = await supabase
          .from('cart_items')
          .delete()
          .eq('id', input.itemId)

        if (deleteError) throw deleteError
      } else {
        // Check stock availability
        const { data: item, error: itemError } = await (supabase
          .from('cart_items') as any)
          .select('product:products(stock_quantity)')
          .eq('id', input.itemId)
          .single()

        if (itemError) throw itemError

        const stockQuantity = ((item as any).product as unknown as Product)?.stock_quantity || 0
        if (input.quantity > stockQuantity) {
          throw new Error(`Only ${stockQuantity} items available`)
        }

        // Update quantity
        const { error: updateError } = await (supabase
          .from('cart_items') as any)
          .update({ quantity: input.quantity })
          .eq('id', input.itemId)

        if (updateError) throw updateError
      }

      // Refresh cart items
      await loadCart()

      return { success: true }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update item'
      setError(message)
      return { success: false, error: message }
    } finally {
      setIsSyncing(false)
    }
  }, [cart?.id, supabase, loadCart])

  /**
   * Remove item from cart
   */
  const removeItem = useCallback(async (itemId: string): Promise<ApiResponse<void>> => {
    setIsSyncing(true)
    setError(null)

    try {
      const { error: deleteError } = await supabase
        .from('cart_items')
        .delete()
        .eq('id', itemId)

      if (deleteError) throw deleteError

      // Refresh cart items
      await loadCart()

      return { success: true }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to remove item'
      setError(message)
      return { success: false, error: message }
    } finally {
      setIsSyncing(false)
    }
  }, [supabase, loadCart])

  /**
   * Clear all items from cart
   */
  const clearCart = useCallback(async (): Promise<ApiResponse<void>> => {
    if (!cart?.id) {
      return { success: false, error: 'Cart not initialized' }
    }

    setIsSyncing(true)
    setError(null)

    try {
      const { error: deleteError } = await supabase
        .from('cart_items')
        .delete()
        .eq('cart_id', cart.id)

      if (deleteError) throw deleteError

      // Refresh cart items
      await loadCart()

      return { success: true }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to clear cart'
      setError(message)
      return { success: false, error: message }
    } finally {
      setIsSyncing(false)
    }
  }, [cart?.id, supabase, loadCart])

  /**
   * Refresh cart data
   */
  const refreshCart = useCallback(async () => {
    await loadCart()
  }, [loadCart])

  /**
   * Merge guest cart with user cart on login
   * (This would typically be handled by a database trigger,
   * but we provide a manual method as well)
   */
  const mergeGuestCart = useCallback(async (userId: string): Promise<ApiResponse<void>> => {
    if (!cart?.id || !sessionId) {
      return { success: false, error: 'No guest cart to merge' }
    }

    setIsSyncing(true)
    setError(null)

    try {
      // Call the merge function via API
      const response = await fetch('/api/cart/merge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          guestSessionId: sessionId,
          userId,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to merge carts')
      }

      // Refresh to get merged cart
      await loadCart()

      return { success: true }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to merge carts'
      setError(message)
      return { success: false, error: message }
    } finally {
      setIsSyncing(false)
    }
  }, [cart?.id, sessionId, loadCart])

  return {
    cart,
    items,
    isLoading: isLoading || isSessionLoading,
    isSyncing,
    error,
    itemCount,
    cartTotal,
    loadCart,
    addItem,
    updateItem,
    removeItem,
    clearCart,
    refreshCart,
    mergeGuestCart,
  }
}
