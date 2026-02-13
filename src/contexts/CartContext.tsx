// ===================================
// Cart Context
// ===================================
// Global cart state provider with Supabase sync

'use client'

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { createBrowserSupabaseClient } from '@/lib/supabase/client'
import { useGuestSession } from '@/hooks/useGuestSession'
import type { Cart, CartItem, Product } from '@/types/checkout'

// ===================================
// Types
// ===================================

export interface CartContextState {
  cart: Cart | null
  items: CartItem[]
  isLoading: boolean
  isSyncing: boolean
  error: string | null
  itemCount: number
  subtotal: number
}

export interface CartContextActions {
  addItem: (productId: string, quantity: number) => Promise<void>
  updateQuantity: (itemId: string, quantity: number) => Promise<void>
  removeItem: (itemId: string) => Promise<void>
  clearCart: () => Promise<void>
  refreshCart: () => Promise<void>
  openCart: () => void
  closeCart: () => void
}

export interface CartContextType extends CartContextState, CartContextActions {
  isCartOpen: boolean
}

// ===================================
// Context
// ===================================

const CartContext = createContext<CartContextType | undefined>(undefined)

// ===================================
// Provider
// ===================================

interface CartProviderProps {
  children: React.ReactNode
}

export function CartProvider({ children }: CartProviderProps) {
  const supabase = createBrowserSupabaseClient()
  const { sessionId, isLoading: isSessionLoading } = useGuestSession()
  
  // State
  const [cart, setCart] = useState<Cart | null>(null)
  const [items, setItems] = useState<CartItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSyncing, setIsSyncing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isCartOpen, setIsCartOpen] = useState(false)
  
  // Derived state
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0)
  const subtotal = items.reduce((sum, item) => {
    const price = item.price_at_time || item.product?.price || 0
    return sum + price * item.quantity
  }, 0)

  // ===================================
  // Cart Management
  // ===================================

  const fetchOrCreateCart = useCallback(async () => {
    if (!sessionId) return

    try {
      // Try to get existing active cart
      const { data: existingCart, error: cartError } = await supabase
        .from('carts')
        .select('*')
        .eq('guest_session_id', sessionId)
        .eq('status', 'active')
        .single() as { data: { id: string } | null, error: any }

      if (cartError && cartError.code !== 'PGRST116') {
        throw cartError
      }

      if (existingCart) {
        setCart(existingCart as Cart)
        await fetchCartItems(existingCart.id)
      } else {
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
        setCart(newCart as Cart)
        setItems([])
      }
    } catch (err) {
      console.error('Error fetching/creating cart:', err)
      setError(err instanceof Error ? err.message : 'Failed to load cart')
    }
  }, [sessionId, supabase])

  const fetchCartItems = async (cartId: string) => {
    try {
      const { data: cartItems, error: itemsError } = await supabase
        .from('cart_items')
        .select(`
          *,
          product:products(*)
        `)
        .eq('cart_id', cartId)
        .order('created_at', { ascending: false }) as { data: CartItem[] | null, error: any }

      if (itemsError) throw itemsError
      setItems(cartItems || [])
    } catch (err) {
      console.error('Error fetching cart items:', err)
      setError(err instanceof Error ? err.message : 'Failed to load cart items')
    }
  }

  // ===================================
  // Actions
  // ===================================

  const addItem = useCallback(async (productId: string, quantity: number) => {
    if (!cart?.id) {
      setError('Cart not initialized')
      return
    }

    setIsSyncing(true)
    setError(null)

    try {
      // Fetch current product details
      const { data: product, error: productError } = await supabase
        .from('products')
        .select('*')
        .eq('id', productId)
        .single() as { data: Product | null, error: any }

      if (productError) throw productError
      if (!product) throw new Error('Product not found')
      if (!product.is_available) throw new Error('Product is not available')
      if (product.stock_quantity < quantity) {
        throw new Error(`Only ${product.stock_quantity} items available`)
      }

      // Check for existing item
      const { data: existingItem } = await supabase
        .from('cart_items')
        .select('*')
        .eq('cart_id', cart.id)
        .eq('product_id', productId)
        .single() as { data: { id: string, quantity: number } | null, error: any }

      if (existingItem) {
        const newQuantity = existingItem.quantity + quantity
        if (newQuantity > product.stock_quantity) {
          throw new Error(`Cannot add more. Only ${product.stock_quantity} items available.`)
        }

        await (supabase
          .from('cart_items') as any)
          .update({ quantity: newQuantity })
          .eq('id', existingItem.id)
      } else {
        await (supabase
          .from('cart_items') as any)
          .insert({
            cart_id: cart.id,
            product_id: productId,
            quantity,
            price_at_time: product.price,
          })
      }

      // Refresh items
      await fetchCartItems(cart.id)
      
      // Open cart drawer
      setIsCartOpen(true)
    } catch (err) {
      console.error('Error adding item:', err)
      setError(err instanceof Error ? err.message : 'Failed to add item')
    } finally {
      setIsSyncing(false)
    }
  }, [cart?.id, supabase])

  const updateQuantity = useCallback(async (itemId: string, quantity: number) => {
    if (!cart?.id) return

    setIsSyncing(true)
    setError(null)

    try {
      if (quantity <= 0) {
        await (supabase
          .from('cart_items') as any)
          .delete()
          .eq('id', itemId)
      } else {
        // Check stock
        const { data: item } = await supabase
          .from('cart_items')
          .select('product:products(stock_quantity)')
          .eq('id', itemId)
          .single() as { data: { product: { stock_quantity: number } } | null, error: any }

        const stockQuantity = item?.product?.stock_quantity || 0
        if (quantity > stockQuantity) {
          throw new Error(`Only ${stockQuantity} items available`)
        }

        await (supabase
          .from('cart_items') as any)
          .update({ quantity })
          .eq('id', itemId)
      }

      await fetchCartItems(cart.id)
    } catch (err) {
      console.error('Error updating quantity:', err)
      setError(err instanceof Error ? err.message : 'Failed to update quantity')
    } finally {
      setIsSyncing(false)
    }
  }, [cart?.id, supabase])

  const removeItem = useCallback(async (itemId: string) => {
    setIsSyncing(true)
    setError(null)

    try {
      await (supabase
        .from('cart_items') as any)
        .delete()
        .eq('id', itemId)

      if (cart?.id) {
        await fetchCartItems(cart.id)
      }
    } catch (err) {
      console.error('Error removing item:', err)
      setError(err instanceof Error ? err.message : 'Failed to remove item')
    } finally {
      setIsSyncing(false)
    }
  }, [cart?.id, supabase])

  const clearCart = useCallback(async () => {
    if (!cart?.id) return

    setIsSyncing(true)
    setError(null)

    try {
      await (supabase
        .from('cart_items') as any)
        .delete()
        .eq('cart_id', cart.id)

      setItems([])
    } catch (err) {
      console.error('Error clearing cart:', err)
      setError(err instanceof Error ? err.message : 'Failed to clear cart')
    } finally {
      setIsSyncing(false)
    }
  }, [cart?.id, supabase])

  const refreshCart = useCallback(async () => {
    if (cart?.id) {
      await fetchCartItems(cart.id)
    }
  }, [cart?.id, supabase])

  const openCart = useCallback(() => setIsCartOpen(true), [])
  const closeCart = useCallback(() => setIsCartOpen(false), [])

  // ===================================
  // Effects
  // ===================================

  // Initial cart load
  useEffect(() => {
    if (!isSessionLoading && sessionId) {
      setIsLoading(true)
      fetchOrCreateCart().finally(() => setIsLoading(false))
    }
  }, [sessionId, isSessionLoading, fetchOrCreateCart])

  // Real-time subscription to cart changes
  useEffect(() => {
    if (!cart?.id) return

    const subscription = supabase
      .channel(`cart:${cart.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'cart_items',
          filter: `cart_id=eq.${cart.id}`,
        },
        () => {
          // Refresh cart items on any change
          fetchCartItems(cart.id)
        }
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [cart?.id, supabase])

  // ===================================
  // Context Value
  // ===================================

  const value: CartContextType = {
    cart,
    items,
    isLoading: isLoading || isSessionLoading,
    isSyncing,
    error,
    itemCount,
    subtotal,
    isCartOpen,
    addItem,
    updateQuantity,
    removeItem,
    clearCart,
    refreshCart,
    openCart,
    closeCart,
  }

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  )
}

// ===================================
// Hook
// ===================================

export function useCartContext(): CartContextType {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error('useCartContext must be used within a CartProvider')
  }
  return context
}
