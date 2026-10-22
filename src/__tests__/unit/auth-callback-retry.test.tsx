import { StrictMode } from 'react'
import { act, render, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { AuthCallbackContent } from '@/app/auth/callback/AuthCallbackContent'

const state = vi.hoisted(() => ({ exchange: vi.fn(), replace: vi.fn(), search: new URLSearchParams() }))
const router = vi.hoisted(() => ({ replace: state.replace }))
vi.mock('next/navigation', () => ({ useRouter: () => router, useSearchParams: () => state.search }))
vi.mock('@/lib/supabase/client', () => ({ createBrowserSupabaseClient: () => ({ auth: { exchangeCodeForSession: state.exchange } }) }))

describe('one-time auth callback', () => {
  beforeEach(() => { state.search = new URLSearchParams('code=one-time&locale=lv&next=%2Flv%2Faccount') })
  it('exchanges the PKCE code once during strict effect retries and navigates without a timer', async () => {
    let resolveExchange: (value: any) => void = () => {}
    state.exchange.mockImplementation(() => new Promise(resolve => { resolveExchange = resolve }))
    render(<StrictMode><AuthCallbackContent /></StrictMode>)
    expect(state.exchange).toHaveBeenCalledExactlyOnceWith('one-time')
    await act(async () => { resolveExchange({ data: { session: { user: { id: 'a' } } }, error: null }) })
    expect(state.replace).toHaveBeenCalledExactlyOnceWith('/lv/account')
  })
  it('does not navigate after unmounting during exchange', async () => {
    let resolveExchange: (value: any) => void = () => {}
    state.exchange.mockImplementation(() => new Promise(resolve => { resolveExchange = resolve }))
    const view = render(<AuthCallbackContent />)
    await waitFor(() => expect(state.exchange).toHaveBeenCalledOnce())
    view.unmount()
    await act(async () => { resolveExchange({ data: { session: { user: { id: 'a' } } }, error: null }) })
    expect(state.replace).not.toHaveBeenCalled()
  })
})
