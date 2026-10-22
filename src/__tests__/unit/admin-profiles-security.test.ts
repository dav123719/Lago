import { beforeEach, describe, expect, it, vi } from 'vitest'
import { NextRequest } from 'next/server'
import { GET, PATCH } from '@/app/api/admin/profiles/route'
const state = vi.hoisted(() => ({ getUser: vi.fn(), rpc: vi.fn() }))
vi.mock('@/lib/supabase/server', () => ({ createClient: async () => ({ auth: { getUser: state.getUser }, rpc: state.rpc }) }))
const request = (method = 'GET', origin = 'https://lago.lv') => new NextRequest('https://lago.lv/api/admin/profiles/', {
  method, ...(method === 'PATCH' ? { headers: { Origin: origin, 'Content-Type': 'application/json' }, body: JSON.stringify({}) } : {}),
})
describe('admin profile API cache and permission enforcement', () => {
  beforeEach(() => {
    vi.stubEnv('NEXT_PUBLIC_SITE_URL', 'https://lago.lv')
    state.getUser.mockResolvedValue({ data: { user: null }, error: null })
    state.rpc.mockResolvedValue({ data: false, error: null })
  })
  it.each([GET, PATCH])('denies anonymous requests and forbids response caching', async handler => {
    const result = await handler(request(handler === PATCH ? 'PATCH' : 'GET'))
    expect(result.status).toBe(401)
    expect(result.headers.get('cache-control')).toContain('private, no-store')
    expect(result.headers.get('cdn-cache-control')).toBe('no-store')
    expect(state.rpc).not.toHaveBeenCalled()
  })
  it.each([GET, PATCH])('denies an ordinary signed-in user without calling privileged functions', async handler => {
    state.getUser.mockResolvedValue({ data: { user: { id: 'ordinary' } }, error: null })
    const result = await handler(request(handler === PATCH ? 'PATCH' : 'GET'))
    expect(result.status).toBe(403)
    expect(state.rpc).toHaveBeenCalledExactlyOnceWith('is_current_user_admin')
  })
  it.each([null, [], 'unexpected'])('rejects malformed JSON shapes safely: %j', async body => {
    state.getUser.mockResolvedValue({ data: { user: { id: 'admin' } }, error: null })
    state.rpc.mockResolvedValue({ data: true, error: null })
    const result = await PATCH(new NextRequest('https://lago.lv/api/admin/profiles/', {
      method: 'PATCH', headers: { Origin: 'https://lago.lv', 'Content-Type': 'application/json' }, body: JSON.stringify(body),
    }))
    expect(result.status).toBe(400)
    expect(state.rpc).toHaveBeenCalledExactlyOnceWith('is_current_user_admin')
  })
  it('rejects cross-origin mutation before any account lookup', async () => {
    const result = await PATCH(request('PATCH', 'https://other.example'))
    expect(result.status).toBe(403)
    expect(state.getUser).not.toHaveBeenCalled()
  })
  it('accepts the configured HTTPS origin behind the loopback Apache listener', async () => {
    const result = await PATCH(new NextRequest('http://127.0.0.1:3100/api/admin/profiles/', {
      method: 'PATCH', headers: { Origin: 'https://lago.lv', 'Content-Type': 'application/json' }, body: '{}',
    }))
    expect(result.status).toBe(401)
    expect(state.getUser).toHaveBeenCalledOnce()
  })
  it('does not trust forwarded or listener hosts to authorize an origin', async () => {
    const result = await PATCH(new NextRequest('https://attacker.example/api/admin/profiles/', {
      method: 'PATCH', headers: { Origin: 'https://attacker.example', 'x-forwarded-host': 'attacker.example' }, body: '{}',
    }))
    expect(result.status).toBe(403)
    expect(state.getUser).not.toHaveBeenCalled()
  })
})
