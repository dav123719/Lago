import { act, renderHook, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useProductStock } from '@/hooks/useProductStock'

const state = vi.hoisted(() => ({ from: vi.fn(), single: vi.fn(), update: null as null | ((payload: any) => void), remove: vi.fn() }))
vi.mock('@/lib/supabase/client', () => ({ createBrowserSupabaseClient: () => ({
  from: state.from,
  channel: () => ({ on: (_type: unknown, _filter: unknown, callback: (payload: any) => void) => { state.update = callback; return { subscribe: () => ({}) } } }),
  removeChannel: state.remove,
}) }))

describe('listing stock delivery', () => {
  beforeEach(() => { state.from.mockImplementation(() => ({ select: () => ({ eq: () => ({ single: state.single }) }) })); state.single.mockResolvedValue({ data: { stock_quantity: 8, stock_status: 'in_stock' }, error: null }) })
  it('uses supplied listing stock without N duplicate initial REST reads, preserving live updates and cleanup', () => {
    const { result, unmount } = renderHook(() => useProductStock({ productId: 'a', initialStock: 4, initialStatus: 'low_stock', fetchOnMount: false }))
    expect(result.current.stockQuantity).toBe(4)
    expect(state.from).not.toHaveBeenCalled()
    act(() => state.update?.({ new: { stock_quantity: 3, stock_status: 'low_stock' } }))
    expect(result.current.stockQuantity).toBe(3)
    unmount()
    expect(state.remove).toHaveBeenCalledOnce()
  })
  it('retains explicit stock refresh for authoritative detail interactions', async () => {
    const { result } = renderHook(() => useProductStock({ productId: 'a', initialStock: 4, fetchOnMount: false }))
    await act(async () => { await result.current.refetch() })
    await waitFor(() => expect(result.current.stockQuantity).toBe(8))
    expect(state.single).toHaveBeenCalledOnce()
  })
  it('accepts a refreshed listing snapshot without issuing another read', async () => {
    const { result, rerender } = renderHook(({ count }) => useProductStock({ productId: 'a', initialStock: count, initialStatus: 'in_stock', fetchOnMount: false }), { initialProps: { count: 4 } })
    rerender({ count: 12 })
    await waitFor(() => expect(result.current.stockQuantity).toBe(12))
    expect(state.from).not.toHaveBeenCalled()
  })
})
