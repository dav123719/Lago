import { act, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { AuthProvider, useAuthContext } from '@/contexts/AuthContext'

const state = vi.hoisted(() => ({ callback: null as any, single: vi.fn(), signup: vi.fn(), unsubscribe: vi.fn() }))
const client = vi.hoisted(() => ({
  auth: {
    getSession: vi.fn(async () => ({ data: { session: null } })),
    onAuthStateChange: vi.fn((callback: any) => {
      state.callback = callback
      return { data: { subscription: { unsubscribe: state.unsubscribe } } }
    }),
    signUp: state.signup,
  },
  from: vi.fn(() => ({ select: () => ({ eq: () => ({ single: state.single }) }) })),
}))
vi.mock('@/lib/supabase/client', () => ({ createBrowserSupabaseClient: () => client }))
function Consumer() {
  const auth = useAuthContext()
  return <><span>{auth.user?.id || 'guest'}:{auth.profile?.full_name || 'none'}</span><button onClick={() => auth.signUp('person@example.com', 'Password1', 'Person')}>signup</button></>
}

describe('auth session lifecycle', () => {
  beforeEach(() => {
    state.single.mockResolvedValue({ data: null, error: null })
    state.signup.mockResolvedValue({ error: null })
  })
  it('defers profile queries outside the auth callback and ignores a stale signed-out profile', async () => {
    let resolveProfile: (value: any) => void = () => {}
    state.single.mockImplementation(() => new Promise(resolve => { resolveProfile = resolve }))
    const view = render(<AuthProvider><Consumer /></AuthProvider>)
    await waitFor(() => expect(state.callback).toBeTypeOf('function'))
    act(() => {
      expect(state.callback('SIGNED_IN', { user: { id: 'user-a' } })).toBeUndefined()
      expect(state.single).not.toHaveBeenCalled()
    })
    await waitFor(() => expect(state.single).toHaveBeenCalledOnce())
    act(() => { state.callback('SIGNED_OUT', null) })
    await act(async () => { resolveProfile({ data: { full_name: 'Old profile' }, error: null }) })
    expect(screen.getByText('guest:none')).toBeTruthy()
    view.unmount()
    expect(state.unsubscribe).toHaveBeenCalledOnce()
  })
  it('uses the canonical confirmation callback and does not fetch a profile without a session', async () => {
    vi.stubEnv('NEXT_PUBLIC_APP_URL', 'https://lago.lv')
    render(<AuthProvider><Consumer /></AuthProvider>)
    await act(async () => { screen.getByText('signup').click() })
    expect(state.signup).toHaveBeenCalledWith(expect.objectContaining({ options: expect.objectContaining({ emailRedirectTo: 'https://lago.lv/auth/callback/' }) }))
    expect(state.single).not.toHaveBeenCalled()
    vi.unstubAllEnvs()
  })
})
