import { describe, expect, it } from 'vitest'
import { NextRequest } from 'next/server'
import { GET, POST } from '@/app/api/shipping/rates/route'

const get = (query: string) => GET(new NextRequest(`https://lago.lv/api/shipping/rates?${query}`))
const post = (body: unknown) => POST(new NextRequest('https://lago.lv/api/shipping/rates', { method: 'POST', body: JSON.stringify(body) }))

describe('shipping rate request boundaries', () => {
  it('quotes valid input and accepts lowercase country codes', async () => {
    const response = await get('country=lv&subtotal=25')
    expect(response.status).toBe(200)
    expect(response.headers.get('cache-control')).toBe('no-store')
    const { rates } = await response.json()
    expect(rates.length).toBeGreaterThan(0)
    expect(rates.every((rate: { price: number }) => Number.isFinite(rate.price) && rate.price >= 0)).toBe(true)
  })

  it.each(['-1', 'NaN', 'Infinity', '', '1e9', '100000000', '1abc'])('rejects invalid subtotal %s', async (subtotal) => {
    expect((await get(`country=LV&subtotal=${subtotal}`)).status).toBe(400)
  })

  it.each([null, [], {}, { address: { country: [] }, subtotal: 5 }, { address: { country: 'Latvia' }, subtotal: 5 }, { address: { country: 'LV' }, subtotal: false }, { address: { country: 'LV' }, subtotal: -1 }, { address: { country: 'LV' }, subtotal: 5, weightKg: -1 }])('rejects malformed POST input %j', async (body) => {
    expect((await post(body)).status).toBe(400)
  })

  it('accepts zero subtotal/weight and optional weight', async () => {
    expect((await post({ address: { country: 'LV' }, subtotal: 0, weightKg: 0 })).status).toBe(200)
    expect((await get('country=LV')).status).toBe(200)
  })

  it('applies weight limits without returning an invalid rate', async () => {
    const response = await get('country=LV&subtotal=25&weightKg=999999')
    expect(response.status).toBe(200)
    expect((await response.json()).rates).toEqual([])
  })

  it('rejects malformed JSON and oversized bodies before calculating', async () => {
    const malformed = await POST(new NextRequest('https://lago.lv/api/shipping/rates', { method: 'POST', body: '{' }))
    const oversized = await POST(new NextRequest('https://lago.lv/api/shipping/rates', { method: 'POST', body: 'x'.repeat(4097) }))
    expect(malformed.status).toBe(400)
    expect(oversized.status).toBe(413)
  })

  it('does not reuse a different subtotal or country quote', async () => {
    const normal = await (await get('country=LV&subtotal=1')).json()
    const free = await (await get('country=LV&subtotal=99999')).json()
    expect(normal.rates.some((rate: { price: number }) => rate.price > 0)).toBe(true)
    expect(free.rates.every((rate: { price: number }) => rate.price === 0)).toBe(true)
    expect((await (await get('country=ZZ&subtotal=25')).json()).rates).toEqual([])
  })
})
