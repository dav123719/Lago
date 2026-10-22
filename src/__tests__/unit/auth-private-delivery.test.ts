import { beforeEach, describe, expect, it, vi } from 'vitest'
import { NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

const state = vi.hoisted(() => ({ create: vi.fn(), getUser: vi.fn() }))
vi.mock('@supabase/ssr', () => ({ createServerClient: state.create }))

describe('Supabase middleware delivery', () => {
  beforeEach(() => {
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://project.supabase.co')
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', 'public-test-key')
    state.getUser.mockResolvedValue({ data: { user: { id: 'a' } }, error: null })
    state.create.mockReturnValue({ auth: { getUser: state.getUser } })
  })
  it('performs no auth work for a visitor with no Supabase session cookies', async () => {
    const result = await updateSession(new NextRequest('https://lago.lv/lv/', { headers: { cookie: 'NEXT_LOCALE=lv; guest_session_id=guest_123' } }))
    expect(result.user).toBeNull()
    expect(state.create).not.toHaveBeenCalled()
  })
  it('does not treat a PKCE verifier cookie as an authenticated session', async () => {
    await updateSession(new NextRequest('https://lago.lv/auth/callback', { headers: { cookie: 'sb-project-auth-token-code-verifier=test' } }))
    expect(state.create).not.toHaveBeenCalled()
  })
  it.each(['sb-project-auth-token', 'sb-project-auth-token.0'])('authoritatively verifies existing session cookie %s', async name => {
    const result = await updateSession(new NextRequest('https://lago.lv/lv/account', { headers: { cookie: `${name}=value` } }))
    expect(state.getUser).toHaveBeenCalledOnce()
    expect(result.user).toEqual({ id: 'a' })
  })
})
