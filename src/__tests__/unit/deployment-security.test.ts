import { describe, expect, it } from 'vitest'
import { isAllowedOrigin, isValidQuantity, ownsCart } from '@/lib/security/cart'

describe('production checkout request boundaries', () => {
  const trusted = ['https://lago.lv']
  it.each(['https://lago.lv.attacker.example', 'https://lago.lv@attacker.example', 'http://lago.lv', 'https://lago.lv:8443', 'null'])('rejects untrusted origin %s even with a valid referer', origin => {
    expect(isAllowedOrigin(origin, 'https://lago.lv/lv/checkout', trusted)).toBe(false)
  })
  it('permits the canonical origin and same-origin referer fallback', () => {
    expect(isAllowedOrigin('https://lago.lv', null, trusted)).toBe(true)
    expect(isAllowedOrigin(null, 'https://lago.lv/en/checkout', trusted)).toBe(true)
    expect(isAllowedOrigin(null, null, trusted)).toBe(false)
  })
  it.each([-1, 0, 1.5, '2', null, NaN, Infinity, 1000, Number.MAX_SAFE_INTEGER])('rejects unsafe cart quantities %s', value => {
    expect(isValidQuantity(value)).toBe(false)
  })
  it('allows normal positive integer quantities', () => {
    expect(isValidQuantity(1)).toBe(true)
    expect(isValidQuantity(20)).toBe(true)
  })
})

describe('cart ownership isolation', () => {
  it('never grants a user cart through a copied guest cookie', () => {
    const cart = { user_id: 'alice', guest_session_id: 'guest', status: 'active' }
    expect(ownsCart(cart, 'bob', 'guest')).toBe(false)
    expect(ownsCart(cart, null, 'guest')).toBe(false)
    expect(ownsCart(cart, 'alice', null)).toBe(true)
  })
  it('requires a matching nonempty session for guest carts', () => {
    expect(ownsCart({ status: 'active' }, null, null)).toBe(false)
    expect(ownsCart({ guest_session_id: 'one', status: 'active' }, 'alice', 'two')).toBe(false)
    expect(ownsCart({ guest_session_id: 'one', status: 'active' }, null, 'one')).toBe(true)
  })
  it('rejects checkout reuse of converted carts', () => {
    expect(ownsCart({ user_id: 'alice', status: 'converted' }, 'alice')).toBe(false)
  })
})

// The privileged merge endpoint must reject impersonation before creating an admin client.
import { afterEach, beforeEach, vi } from 'vitest'
import { NextRequest } from 'next/server'
const auth = vi.hoisted(() => ({ getUser: vi.fn(), admin: vi.fn(), cookie: vi.fn() }))
vi.mock('@/lib/supabase/server', () => ({ createClient: async () => ({ auth: { getUser: auth.getUser } }) }))
vi.mock('@/lib/supabase/admin', () => ({ createAdminClient: auth.admin }))
vi.mock('next/headers', () => ({ cookies: async () => ({ get: auth.cookie }) }))
import { POST as mergeCart } from '@/app/api/cart/merge/route'

describe('privileged cart merge authorization', () => {
  afterEach(() => vi.unstubAllEnvs())
  beforeEach(() => {
    vi.stubEnv('NEXT_PUBLIC_SITE_URL', 'https://lago.lv')
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://example.supabase.co')
    vi.stubEnv('SUPABASE_SERVICE_ROLE_KEY', 'test-placeholder')
    auth.cookie.mockReturnValue({ value: 'browser-session' })
  })
  const request = (body: object) => new NextRequest('https://lago.lv/api/cart/merge', { method: 'POST', headers: { origin: 'https://lago.lv', 'content-type': 'application/json' }, body: JSON.stringify(body) })
  it('rejects unauthenticated users before any privileged database access', async () => {
    auth.getUser.mockResolvedValue({ data: { user: null } })
    expect((await mergeCart(request({ userId: 'victim', guestSessionId: 'browser-session' }))).status).toBe(401)
    expect(auth.admin).not.toHaveBeenCalled()
  })
  it('rejects a forged destination user even with a valid authenticated session', async () => {
    auth.getUser.mockResolvedValue({ data: { user: { id: 'attacker' } } })
    expect((await mergeCart(request({ userId: 'victim', guestSessionId: 'browser-session' }))).status).toBe(403)
    expect(auth.admin).not.toHaveBeenCalled()
  })
  it('rejects a stolen guest-cart identifier without its session cookie', async () => {
    auth.getUser.mockResolvedValue({ data: { user: { id: 'alice' } } })
    expect((await mergeCart(request({ userId: 'alice', guestSessionId: 'other-session' }))).status).toBe(403)
    expect(auth.admin).not.toHaveBeenCalled()
  })
})

vi.mock('@/lib/stripe/server', () => ({ isStripeConfigured: true, createCheckoutSession: vi.fn() }))
import { POST as checkout } from '@/app/api/checkout/create-session/route'

describe('payment activation safeguard', () => {
  afterEach(() => vi.unstubAllEnvs())
  it('keeps payment disabled even with Stripe configured until explicitly activated', async () => {
    vi.stubEnv('PAYMENTS_ENABLED', 'false')
    const response = await checkout(new NextRequest('https://lago.lv/api/checkout/create-session', { method: 'POST' }))
    expect(response.status).toBe(503)
    expect(await response.json()).toMatchObject({ error: expect.stringContaining('temporarily unavailable') })
  })
})
