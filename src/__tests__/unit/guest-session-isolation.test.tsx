import { act, renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useGuestSession } from '@/hooks/useGuestSession'

beforeEach(() => {
  const values = new Map<string, string>()
  vi.mocked(localStorage.getItem).mockImplementation(key => values.get(key) ?? null)
  vi.mocked(localStorage.setItem).mockImplementation((key, value) => { values.set(key, value) })
  vi.mocked(localStorage.removeItem).mockImplementation(key => { values.delete(key) })
  document.cookie = 'guest_session_id=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/'
})

describe('browser cart identity isolation', () => {
  it('does not create a session, cookie or storage entry before shopping activation', () => {
    const view = renderHook(() => useGuestSession({ enabled: false }))
    expect(view.result.current.sessionId).toBeNull()
    expect(view.result.current.isLoading).toBe(false)
    expect(localStorage.setItem).not.toHaveBeenCalled()
    expect(document.cookie).not.toContain('guest_session_id=')
  })

  it('keeps account carts separate and never restores the last user cookie as a guest cart', () => {
    const first = renderHook(() => useGuestSession({ scope: 'user-a' }))
    const firstId = first.result.current.sessionId
    expect(firstId).toMatch(/^guest_/)
    act(() => first.result.current.setSessionEmail('user-a@example.invalid'))
    first.unmount()
    const second = renderHook(() => useGuestSession({ scope: 'user-b' }))
    const secondId = second.result.current.sessionId
    expect(secondId).not.toBe(firstId)
    expect(second.result.current.getSessionEmail()).toBeNull()
    second.unmount()
    const guest = renderHook(() => useGuestSession())
    expect(guest.result.current.sessionId).not.toBe(secondId)
    expect(guest.result.current.sessionId).not.toBe(firstId)
    expect(guest.result.current.getSessionEmail()).toBeNull()
    guest.unmount()
    const restoredFirst = renderHook(() => useGuestSession({ scope: 'user-a' }))
    expect(restoredFirst.result.current.sessionId).toBe(firstId)
    expect(restoredFirst.result.current.getSessionEmail()).toBe('user-a@example.invalid')
  })
})
