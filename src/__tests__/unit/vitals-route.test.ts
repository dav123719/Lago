import { beforeEach, describe, expect, it, vi } from 'vitest'
import { NextRequest } from 'next/server'

async function handler() { return (await import('@/app/api/vitals/route')).POST }
function request(body: string, headers: Record<string, string> = {}) {
  return new NextRequest('https://lago.lv/api/vitals/', { method: 'POST', body, headers: { 'content-type': 'application/json', ...headers } })
}
const metric = { name: 'LCP', value: 1234, device: 'mobile', group: 'public' }

describe('anonymous numerical field metrics', () => {
  beforeEach(() => { vi.resetModules(); vi.spyOn(console, 'info').mockImplementation(() => {}) })
  it('accepts only coarse numerical telemetry and never returns cacheable content', async () => {
    const response = await (await handler())(request(JSON.stringify(metric)))
    expect(response.status).toBe(204)
    expect(response.headers.get('cache-control')).toContain('no-store')
    expect(console.info).toHaveBeenCalledWith('LAGO_VITAL ' + JSON.stringify(metric))
  })
  it.each(['null', '{}', '{', JSON.stringify({ ...metric, email: 'private@example.com' }), JSON.stringify({ ...metric, value: -1 }), JSON.stringify({ ...metric, name: ['LCP'] }), JSON.stringify({ ...metric, group: '/auth/callback?token=secret' })])('rejects malformed or sensitive-shaped telemetry: %s', async body => {
    expect((await (await handler())(request(body))).status).toBe(400)
    expect(console.info).not.toHaveBeenCalled()
  })
  it('bounds request memory and rejects cross-site requests', async () => {
    const post = await handler()
    expect((await post(request(' '.repeat(513)))).status).toBe(413)
    expect((await post(request(JSON.stringify(metric), { 'sec-fetch-site': 'cross-site' }))).status).toBe(403)
  })
})
