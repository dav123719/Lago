import { useLayoutEffect } from 'react'
import { act, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { AuthProvider, useAuthContext } from '@/contexts/AuthContext'

const state = vi.hoisted(() => ({ callback: null as any, read: vi.fn(), write: vi.fn(), update: vi.fn(), signOut: vi.fn() }))
const client = vi.hoisted(() => ({
  auth: {
    getSession: vi.fn(async () => ({ data: { session: null } })),
    onAuthStateChange: vi.fn((callback: any) => {
      state.callback = callback
      return { data: { subscription: { unsubscribe: vi.fn() } } }
    }),
    signOut: state.signOut,
  },
  from: vi.fn(() => ({
    select: () => ({ eq: () => ({ single: state.read }) }),
    update: state.update,
  })),
}))
vi.mock('@/lib/supabase/client', () => ({ createBrowserSupabaseClient: () => client }))
let auth: ReturnType<typeof useAuthContext>
function Consumer() {
  const currentAuth = useAuthContext()
  useLayoutEffect(() => { auth = currentAuth }, [currentAuth])
  return <span>{currentAuth.user?.id || 'guest'}:{currentAuth.profile?.full_name || 'none'}:{currentAuth.isProfileLoading ? 'loading' : 'ready'}:{currentAuth.profileError || 'ok'}</span>
}
function session(id: string) { return { user: { id } } }

describe('private account state', () => {
  beforeEach(() => {
    state.read.mockResolvedValue({ data: { id: 'a', full_name: 'Alice' }, error: null })
    state.write.mockResolvedValue({ data: { id: 'a', full_name: 'Edited' }, error: null })
    state.update.mockImplementation(() => ({ eq: () => ({ select: () => ({ single: state.write }) }) }))
    state.signOut.mockResolvedValue({ error: null })
  })

  it('retains the profile on token refresh without a second query', async () => {
    render(<AuthProvider><Consumer /></AuthProvider>)
    act(() => state.callback('SIGNED_IN', session('a')))
    await screen.findByText('a:Alice:ready:ok')
    act(() => state.callback('TOKEN_REFRESHED', session('a')))
    expect(screen.getByText('a:Alice:ready:ok')).toBeTruthy()
    await act(async () => { await new Promise(resolve => setTimeout(resolve, 10)) })
    expect(state.read).toHaveBeenCalledOnce()
  })

  it('ignores an earlier identity result after switching users', async () => {
    let resolveFirst: (value: any) => void = () => {}
    state.read.mockImplementationOnce(() => new Promise(resolve => { resolveFirst = resolve }))
    render(<AuthProvider><Consumer /></AuthProvider>)
    act(() => state.callback('SIGNED_IN', session('a')))
    await waitFor(() => expect(state.read).toHaveBeenCalledOnce())
    act(() => state.callback('SIGNED_OUT', null))
    act(() => state.callback('SIGNED_IN', session('b')))
    state.read.mockResolvedValue({ data: { id: 'b', full_name: 'Bob' }, error: null })
    await screen.findByText('b:Bob:ready:ok')
    await act(async () => { resolveFirst({ data: { id: 'a', full_name: 'Old Alice' }, error: null }) })
    expect(screen.getByText('b:Bob:ready:ok')).toBeTruthy()
  })

  it('rejects an old result when A signs out then signs back in as A', async () => {
    let resolveFirst: (value: any) => void = () => {}
    state.read.mockImplementationOnce(() => new Promise(resolve => { resolveFirst = resolve }))
    render(<AuthProvider><Consumer /></AuthProvider>)
    act(() => state.callback('SIGNED_IN', session('a')))
    await waitFor(() => expect(state.read).toHaveBeenCalledOnce())
    act(() => state.callback('SIGNED_OUT', null))
    act(() => state.callback('SIGNED_IN', session('b')))
    state.read.mockResolvedValue({ data: { id: 'b', full_name: 'Bob' }, error: null })
    await screen.findByText('b:Bob:ready:ok')
    act(() => state.callback('SIGNED_OUT', null))
    act(() => state.callback('SIGNED_IN', session('a')))
    state.read.mockResolvedValue({ data: { id: 'a', full_name: 'New Alice' }, error: null })
    await screen.findByText('a:New Alice:ready:ok')
    await act(async () => { resolveFirst({ data: { id: 'a', full_name: 'Old Alice' }, error: null }) })
    expect(screen.getByText('a:New Alice:ready:ok')).toBeTruthy()
  })

  it('rejects a completed save from the previous session', async () => {
    let resolveSave: (value: any) => void = () => {}
    state.write.mockImplementation(() => new Promise(resolve => { resolveSave = resolve }))
    render(<AuthProvider><Consumer /></AuthProvider>)
    act(() => state.callback('SIGNED_IN', session('a')))
    await screen.findByText('a:Alice:ready:ok')
    let save: ReturnType<typeof auth.updateProfile>
    act(() => { save = auth.updateProfile({ full_name: 'Old edit' }) })
    act(() => state.callback('SIGNED_OUT', null))
    act(() => state.callback('SIGNED_IN', session('b')))
    state.read.mockResolvedValue({ data: { id: 'b', full_name: 'Bob' }, error: null })
    await screen.findByText('b:Bob:ready:ok')
    await act(async () => {
      resolveSave({ data: { id: 'a', full_name: 'Old edit' }, error: null })
      expect((await save).error?.message).toContain('session changed')
    })
    expect(screen.getByText('b:Bob:ready:ok')).toBeTruthy()
  })

  it('publishes the confirmed update without a second profile read', async () => {
    render(<AuthProvider><Consumer /></AuthProvider>)
    act(() => state.callback('SIGNED_IN', session('a')))
    await screen.findByText('a:Alice:ready:ok')
    await act(async () => { expect(await auth.updateProfile({ full_name: 'Edited' })).toEqual({ error: null }) })
    expect(screen.getByText('a:Edited:ready:ok')).toBeTruthy()
    expect(state.read).toHaveBeenCalledOnce()
    expect(state.update).toHaveBeenCalledWith({ full_name: 'Edited' })
  })

  it('does not display success when a profile mutation affects no row', async () => {
    state.write.mockResolvedValue({ data: null, error: { code: 'PGRST116' } })
    render(<AuthProvider><Consumer /></AuthProvider>)
    act(() => state.callback('SIGNED_IN', session('a')))
    await screen.findByText('a:Alice:ready:ok')
    await act(async () => { expect((await auth.updateProfile({ full_name: 'Edited' })).error).toEqual({ code: 'PGRST116' }) })
    expect(screen.getByText('a:Alice:ready:ok')).toBeTruthy()
  })

  it('keeps current auth state when remote signout fails', async () => {
    state.signOut.mockResolvedValue({ error: new Error('Network failure') })
    render(<AuthProvider><Consumer /></AuthProvider>)
    act(() => state.callback('SIGNED_IN', session('a')))
    await screen.findByText('a:Alice:ready:ok')
    await act(async () => { await expect(auth.signOut()).rejects.toThrow('Network failure') })
    expect(screen.getByText('a:Alice:ready:ok')).toBeTruthy()
  })

  it('shows recoverable profile errors without blocking public session state', async () => {
    state.read.mockResolvedValueOnce({ data: null, error: { code: '503' } })
    render(<AuthProvider><Consumer /></AuthProvider>)
    act(() => state.callback('SIGNED_IN', session('a')))
    await screen.findByText('a:none:ready:Could not load your profile. Please try again.')
    expect(auth.isLoading).toBe(false)
    await act(async () => { await auth.refreshProfile() })
    expect(screen.getByText('a:Alice:ready:ok')).toBeTruthy()
  })
})
