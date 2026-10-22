import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { CartProvider, useCartContext } from '@/contexts/CartContext'

const state = vi.hoisted(() => ({ user: 'a' as string | null, pathname: '/lv/', carts: vi.fn(), items: vi.fn(), from: vi.fn() }))
vi.mock('next/navigation', () => ({ usePathname: () => state.pathname }))
vi.mock('@/contexts/AuthContext', () => ({ useAuthContext: () => ({ user: state.user ? { id: state.user } : null, isLoading: false }) }))
vi.mock('@/hooks/useGuestSession', () => ({ useGuestSession: ({ scope, enabled }: { scope?: string; enabled: boolean }) => ({ sessionId: enabled ? `guest_${scope || 'anonymous'}` : null, isLoading: false }) }))
const client = vi.hoisted(() => ({
  from: state.from,
  channel: () => ({ on() { return this }, subscribe: () => ({ unsubscribe: vi.fn() }) }),
}))
vi.mock('@/lib/supabase/client', () => ({ createBrowserSupabaseClient: () => client }))
function Consumer() {
  const cart = useCartContext()
  return <><button onClick={cart.openCart}>open cart</button><span>{cart.cart?.id || 'none'}:{cart.items.map(item => item.id).join(',') || 'empty'}</span></>
}

describe('cart loading and identity boundaries', () => {
  beforeEach(() => {
    state.user = 'a'; state.pathname = '/lv/'
    state.carts.mockImplementation((sessionId: string) => Promise.resolve({ data: { id: `cart_${sessionId}` }, error: null }))
    state.items.mockImplementation((cartId: string) => Promise.resolve({ data: [{ id: `item_${cartId}`, quantity: 1, price_at_time: 1 }], error: null }))
    state.from.mockImplementation((table: string) => {
      let id = ''
      const chain = { select() { return this }, eq(key: string, value: string) { if (key === 'guest_session_id' || key === 'cart_id') id = value; return this }, single: () => state.carts(id), order: () => state.items(id) }
      if (table !== 'carts' && table !== 'cart_items') throw new Error('Unexpected table')
      return chain
    })
  })
  it('does not query carts on public entry until the cart is requested', async () => {
    render(<CartProvider><Consumer /></CartProvider>)
    expect(screen.getByText('none:empty')).toBeTruthy()
    expect(state.from).not.toHaveBeenCalled()
    fireEvent.click(screen.getByText('open cart'))
    await screen.findByText('cart_guest_a:item_cart_guest_a')
    expect(state.carts).toHaveBeenCalledExactlyOnceWith('guest_a')
  })
  it('clears A state and ignores A item data after switching to B', async () => {
    state.pathname = '/lv/cart'
    let resolveA: (value: any) => void = () => {}
    state.items.mockImplementationOnce(() => new Promise(resolve => { resolveA = resolve }))
    const view = render(<CartProvider><Consumer /></CartProvider>)
    await waitFor(() => expect(state.items).toHaveBeenCalledOnce())
    state.user = 'b'
    view.rerender(<CartProvider><Consumer /></CartProvider>)
    await screen.findByText('cart_guest_b:item_cart_guest_b')
    await act(async () => { resolveA({ data: [{ id: 'private-a', quantity: 1, price_at_time: 1 }], error: null }) })
    expect(screen.getByText('cart_guest_b:item_cart_guest_b')).toBeTruthy()
    expect(screen.queryByText(/private-a/)).toBeNull()
  })
})
