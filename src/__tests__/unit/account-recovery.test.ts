import { beforeEach, describe, expect, it, vi } from 'vitest'
import { markPasswordRecovery, hasPasswordRecovery, clearPasswordRecovery } from '@/lib/auth/recovery'

describe('recovery UI session isolation', () => {
  let storage: Map<string, string>
  beforeEach(() => {
    storage = new Map()
    vi.mocked(sessionStorage.getItem).mockImplementation(key => storage.get(key) ?? null)
    vi.mocked(sessionStorage.setItem).mockImplementation((key, value) => { storage.set(key, value) })
    vi.mocked(sessionStorage.removeItem).mockImplementation(key => { storage.delete(key) })
  })
  it('only accepts a fresh marker for the authenticated UUID and clears after use', () => {
    markPasswordRecovery('a')
    expect(hasPasswordRecovery('a')).toBe(true)
    expect(hasPasswordRecovery('b')).toBe(false)
    clearPasswordRecovery()
    expect(hasPasswordRecovery('a')).toBe(false)
  })
  it('rejects expired, malformed, and previous unscoped markers', () => {
    storage.set('lago:password-recovery', JSON.stringify({ userId: 'a', expiresAt: Date.now() - 1 }))
    expect(hasPasswordRecovery('a')).toBe(false)
    storage.set('lago:password-recovery', '1')
    expect(hasPasswordRecovery('a')).toBe(false)
    storage.set('lago:password-recovery', '{invalid')
    expect(hasPasswordRecovery('a')).toBe(false)
  })
})
