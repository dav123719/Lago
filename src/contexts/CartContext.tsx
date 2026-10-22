// ===================================
// Cart Context
// ===================================
// Global cart state provider with Supabase sync

'use client'

import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react'
import { createBrowserSupabaseClient } from '@/lib/supabase/client'
import { useGuestSession } from '@/hooks/useGuestSession'
import type { Cart, CartItem, Product } from '@/types/checkout'
import { useAuthContext } from '@/contexts/AuthContext'
import { usePathname } from 'next/navigation'

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
  const { user, isLoading } = useAuthContext()
  // A changed identity gets fresh state and subscriptions, never the previous
  // user's in-flight results or drawer contents.
  return <IdentityCartProvider key={user?.id ?? 'guest'} userId={user?.id} authLoading={isLoading}>{children}</IdentityCartProvider>
}

function IdentityCartProvider({ children, userId, authLoading }: CartProviderProps & { userId?: string; authLoading: boolean }) {
  const pathname = usePathname()
  const [activated, setActivated] = useState(false)
  const shoppingRoute = /\/(?:cart|checkout)(?:\/|$)|\/store\/product\//.test(pathname)
  const enabled = !authLoading && (activated || shoppingRoute)
  const supabase = createBrowserSupabaseClient()
  const { sessionId, isLoading: isSessionLoading } = useGuestSession({ scope: userId, enabled })
  
  // State
  const [cart, setCart] = useState<Cart | null>(null)
  const [items, setItems] = useState<CartItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSyncing, setIsSyncing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isCartOpen, setIsCartOpen] = useState(false)
  
  const mounted = useRef(true)
  useEffect(() => {
    mounted.current = true
    return () => { mounted.current = false }
  }, [])

  // Derived state
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0)
  const subtotal = items.reduce((sum, item) => {
    const price = item.price_at_time ?? item.product?.price ?? 0
    return sum + price * item.quantity
  }, 0)

  // ===================================
  // Cart Management
  // ===================================

  const fetchCartItems = useCallback(async (cartId: string) => {
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
      if (mounted.current) setItems(cartItems || [])
    } catch (err) {
      console.error('Error fetching cart items:', err)
      if (mounted.current) setError(err instanceof Error ? err.message : 'Failed to load cart items')
    }
  }, [supabase])

  const fetchOrCreateCart = useCallback(async () => {
    if (!sessionId || !mounted.current) return

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

      if (!mounted.current) return
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
        if (!mounted.current) return
        setCart(newCart as Cart)
        setItems([])
      }
    } catch (err) {
      console.error('Error fetching/creating cart:', err)
      if (mounted.current) setError(err instanceof Error ? err.message : 'Failed to load cart')
    }
  }, [sessionId, supabase, fetchCartItems])


  // ===================================
  // Actions
  // ===================================

  const addItem = useCallback(async (productId: string, quantity: number) => {
    if (!Number.isSafeInteger(quantity) || quantity < 1) {
      setError('Choose a positive whole quantity')
      return
    }
    if (!cart?.id) {
      setActivated(true)
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
      if (!mounted.current) return
      const { data: existingItem, error: existingError } = await supabase
        .from('cart_items')
        .select('*')
        .eq('cart_id', cart.id)
        .eq('product_id', productId)
        .single() as { data: { id: string, quantity: number } | null, error: any }

      if (existingError && existingError.code !== 'PGRST116') throw existingError
      if (!mounted.current) return
      if (existingItem) {
        const newQuantity = existingItem.quantity + quantity
        if (newQuantity > product.stock_quantity) {
          throw new Error(`Cannot add more. Only ${product.stock_quantity} items available.`)
        }

        const { error: mutationError } = await (supabase
          .from('cart_items') as any)
          .update({ quantity: newQuantity })
          .eq('id', existingItem.id).eq('cart_id', cart.id)
        if (mutationError) throw mutationError
      } else {
        const { error: mutationError } = await (supabase
          .from('cart_items') as any)
          .insert({
            cart_id: cart.id,
            product_id: productId,
            quantity,
            price_at_time: product.price,
          })
        if (mutationError) throw mutationError
      }

      if (!mounted.current) return
      // Refresh items
      await fetchCartItems(cart.id)
      
      // Open cart drawer
      if (mounted.current) setIsCartOpen(true)
    } catch (err) {
      console.error('Error adding item:', err)
      if (mounted.current) setError(err instanceof Error ? err.message : 'Failed to add item')
    } finally {
      if (mounted.current) setIsSyncing(false)
    }
  }, [cart?.id, supabase, fetchCartItems])

  const updateQuantity = useCallback(async (itemId: string, quantity: number) => {
    if (!cart?.id || !mounted.current) return

    setIsSyncing(true)
    setError(null)

    try {
      if (!Number.isSafeInteger(quantity)) throw new Error('Choose a whole quantity')
      if (quantity <= 0) {
        const { error: mutationError } = await (supabase
          .from('cart_items') as any)
          .delete()
          .eq('id', itemId).eq('cart_id', cart.id)
        if (mutationError) throw mutationError
      } else {
        // Check stock
        const { data: item, error: itemError } = await supabase
          .from('cart_items')
          .select('product:products(stock_quantity)')
          .eq('id', itemId).eq('cart_id', cart.id)
          .single() as { data: { product: { stock_quantity: number } } | null, error: any }

        if (itemError) throw itemError
        if (!mounted.current) return
        const stockQuantity = item?.product?.stock_quantity ?? 0
        if (quantity > stockQuantity) {
          throw new Error(`Only ${stockQuantity} items available`)
        }

        const { error: mutationError } = await (supabase
          .from('cart_items') as any)
          .update({ quantity })
          .eq('id', itemId).eq('cart_id', cart.id)
        if (mutationError) throw mutationError
      }

      await fetchCartItems(cart.id)
    } catch (err) {
      console.error('Error updating quantity:', err)
      if (mounted.current) setError(err instanceof Error ? err.message : 'Failed to update quantity')
    } finally {
      if (mounted.current) setIsSyncing(false)
    }
  }, [cart?.id, supabase, fetchCartItems])

  const removeItem = useCallback(async (itemId: string) => {
    if (!cart?.id || !mounted.current) return
    setIsSyncing(true)
    setError(null)

    try {
      const { error: mutationError } = await (supabase
        .from('cart_items') as any)
        .delete()
        .eq('id', itemId).eq('cart_id', cart.id)
      if (mutationError) throw mutationError

      if (cart?.id) {
        await fetchCartItems(cart.id)
      }
    } catch (err) {
      console.error('Error removing item:', err)
      if (mounted.current) setError(err instanceof Error ? err.message : 'Failed to remove item')
    } finally {
      if (mounted.current) setIsSyncing(false)
    }
  }, [cart?.id, supabase, fetchCartItems])

  const clearCart = useCallback(async () => {
    if (!cart?.id || !mounted.current) return

    setIsSyncing(true)
    setError(null)

    try {
      const { error: mutationError } = await (supabase
        .from('cart_items') as any)
        .delete()
        .eq('cart_id', cart.id)
      if (mutationError) throw mutationError
      if (mounted.current) setItems([])
    } catch (err) {
      console.error('Error clearing cart:', err)
      if (mounted.current) setError(err instanceof Error ? err.message : 'Failed to clear cart')
    } finally {
      if (mounted.current) setIsSyncing(false)
    }
  }, [cart?.id, supabase, fetchCartItems])

  const refreshCart = useCallback(async () => {
    if (cart?.id) {
      await fetchCartItems(cart.id)
    }
  }, [cart?.id, supabase, fetchCartItems])

  const openCart = useCallback(() => { setActivated(true); setIsCartOpen(true) }, [])
  const closeCart = useCallback(() => setIsCartOpen(false), [])

  // ===================================
  // Effects
  // ===================================

  // Initial cart load
  useEffect(() => {
    if (enabled && !isSessionLoading && sessionId) {
      setIsLoading(true)
      fetchOrCreateCart().finally(() => { if (mounted.current) setIsLoading(false) })
    }
    else if (!enabled) setIsLoading(false)
  }, [enabled, sessionId, isSessionLoading, fetchOrCreateCart])

  // Real-time subscription to cart changes
  useEffect(() => {
    if (!cart?.id || !enabled) return

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
  }, [cart?.id, supabase, enabled, fetchCartItems])

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
