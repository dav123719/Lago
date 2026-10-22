import { describe, expect, it } from 'vitest'
import { safeInternalRedirect } from '@/lib/auth/redirect'

describe('safeInternalRedirect', () => {
  it('keeps same-site routes and their query', () => {
    expect(safeInternalRedirect('/lv/account?tab=security', '/lv/')).toBe('/lv/account?tab=security')
  })

  it('rejects external, protocol-relative, and backslash paths', () => {
    expect(safeInternalRedirect('https://attacker.example', '/lv/account')).toBe('/lv/account')
    expect(safeInternalRedirect('//attacker.example/path', '/lv/account')).toBe('/lv/account')
    expect(safeInternalRedirect('/\\attacker.example', '/lv/account')).toBe('/lv/account')
  })

  it('uses the fallback for empty paths', () => {
    expect(safeInternalRedirect(null, '/lv/account')).toBe('/lv/account')
  })
})
