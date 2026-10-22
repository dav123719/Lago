import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

describe('error reporting safety and delivery', () => {
  let reporting: typeof import('@/lib/error/reporting')
  const previousOnError = window.onerror
  const previousOnRejection = window.onunhandledrejection

  beforeEach(async () => {
    vi.resetModules()
    vi.stubEnv('NODE_ENV', 'production')
    reporting = await import('@/lib/error/reporting')
    vi.mocked(navigator.sendBeacon).mockReturnValue(true)
    vi.mocked(fetch).mockResolvedValue(new Response(null, { status: 204 }))
    reporting.initErrorReporting({ enabled: true, endpoint: 'https://errors.example.test/events' })
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    vi.unstubAllEnvs()
    window.onerror = previousOnError
    window.onunhandledrejection = previousOnRejection
    window.history.replaceState(null, '', '/')
  })

  it('excludes recovery credentials, confirmation codes, and email from the reported page URL', () => {
    window.history.replaceState(null, '', '/auth/callback?code=private-code&email=private@example.test#access_token=private-token')
    reporting.captureError(new Error('Failed callback'))

    const payload = JSON.parse(vi.mocked(navigator.sendBeacon).mock.calls[0][1] as string)
    expect(payload.url).toBe(`${window.location.origin}/auth/callback`)
    expect(JSON.stringify(payload)).not.toMatch(/private-code|private-token|private@example/)
  })

  it('honors zero sampling for explicit events and global handlers', () => {
    reporting.initErrorReporting({ sampleRate: 0 })
    reporting.captureError(new Error('Test'))
    reporting.captureMessage('Test')
    window.onerror?.(new Event('error'))
    window.onunhandledrejection?.({ reason: new Error('Test') } as PromiseRejectionEvent)
    expect(navigator.sendBeacon).not.toHaveBeenCalled()
    expect(fetch).not.toHaveBeenCalled()
  })

  it('applies beforeSend to global errors as well as explicit errors', () => {
    const beforeSend = vi.fn(() => null)
    reporting.initErrorReporting({ beforeSend })
    window.onerror?.(new Event('error'))
    reporting.captureError(new Error('Test'))
    expect(beforeSend).toHaveBeenCalledTimes(2)
    expect(navigator.sendBeacon).not.toHaveBeenCalled()
  })

  it('falls back to fetch when the beacon queue rejects the event', () => {
    vi.mocked(navigator.sendBeacon).mockReturnValue(false)
    reporting.captureMessage('Queue fallback')
    expect(fetch).toHaveBeenCalledWith('https://errors.example.test/events', expect.objectContaining({
      method: 'POST', keepalive: true, body: expect.stringContaining('Queue fallback'),
    }))
  })

  it('does not require browser globals for server-side reporting', () => {
    vi.stubGlobal('window', undefined)
    vi.stubGlobal('navigator', undefined)
    expect(() => reporting.captureError(new Error('Server error'))).not.toThrow()
    const request = vi.mocked(fetch).mock.calls[0][1]
    expect(JSON.parse(request!.body as string).url).toBe('')
  })

  it('does not crash an error boundary if the transport throws', () => {
    vi.mocked(navigator.sendBeacon).mockImplementation(() => { throw new Error('Transport unavailable') })
    expect(() => reporting.captureError(new Error('Original error'))).not.toThrow()
  })

  it('does not crash an error boundary when context cannot be serialized', () => {
    const cycle: Record<string, unknown> = {}
    cycle.self = cycle
    expect(() => reporting.captureError(new Error('Original error'), { extra: cycle })).not.toThrow()
    expect(navigator.sendBeacon).not.toHaveBeenCalled()
  })
})
