import { act, renderHook, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useAdmin } from '@/hooks/useAdmin'

const state = vi.hoisted(() => ({ callback: null as any, getUser: vi.fn(), role: vi.fn() }))
const client = vi.hoisted(() => ({ auth: {
  getUser: state.getUser,
  onAuthStateChange: vi.fn((callback: any) => { state.callback = callback; return { data: { subscription: { unsubscribe: vi.fn() } } } }),
}, rpc: state.role }))
vi.mock('@/lib/supabase/client', () => ({ createBrowserSupabaseClient: () => client }))

describe('admin UI session lifecycle', () => {
  beforeEach(() => {
    state.getUser.mockResolvedValue({ data: { user: { id: 'admin' } }, error: null })
    state.role.mockResolvedValue({ data: true, error: null })
  })
  it('clears the old admin on logout and recomputes for a new ordinary user', async () => {
    const { result } = renderHook(useAdmin)
    await waitFor(() => expect(result.current.isAdmin).toBe(true))
    act(() => state.callback('SIGNED_OUT', null))
    expect(result.current).toEqual({ isAdmin: false, isLoading: false, user: null })
    state.getUser.mockResolvedValue({ data: { user: { id: 'customer' } }, error: null })
    state.role.mockResolvedValue({ data: false, error: null })
    act(() => state.callback('SIGNED_IN', { user: { id: 'customer' } }))
    expect(result.current.isAdmin).toBe(false)
    await waitFor(() => expect(result.current.user?.id).toBe('customer'))
    expect(result.current.isAdmin).toBe(false)
  })
  it('does not republish an in-flight admin grant after logout', async () => {
    let resolveRole: (value: any) => void = () => {}
    state.role.mockImplementation(() => new Promise(resolve => { resolveRole = resolve }))
    const { result } = renderHook(useAdmin)
    await waitFor(() => expect(state.role).toHaveBeenCalledOnce())
    act(() => state.callback('SIGNED_OUT', null))
    await act(async () => { resolveRole({ data: true, error: null }) })
    expect(result.current).toEqual({ isAdmin: false, isLoading: false, user: null })
  })
})
