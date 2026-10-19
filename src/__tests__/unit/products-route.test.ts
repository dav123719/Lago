import { beforeEach, describe, expect, it, vi } from 'vitest'
import { NextRequest } from 'next/server'

const { createServerClient, query } = vi.hoisted(() => {
  const result = { data: [], error: null, count: 0 }
  const query: Record<string, any> = {}
  for (const method of ['select', 'eq', 'or', 'in', 'gte', 'lte', 'gt', 'order', 'range']) {
    query[method] = vi.fn(() => query)
  }
  query.then = (resolve: (value: typeof result) => unknown) => Promise.resolve(result).then(resolve)
  return {
    query,
    createServerClient: vi.fn(async () => ({ from: vi.fn(() => query) })),
  }
})

vi.mock('@/lib/supabase/server', () => ({ createClient: createServerClient }))

import { GET } from '@/app/api/products/route'

function request(path = '/api/products') {
  return new NextRequest(`https://lago.lv${path}`)
}

describe('public products API', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://project.supabase.co'
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-publishable-key'
  })

  it('selects explicit public catalog fields and omits wildcard CORS', async () => {
    const response = await GET(request())
    const body = await response.json()
    const select = query.select.mock.calls[0][0] as string
    expect(response.status).toBe(200)
    expect(select).not.toContain('*')
    expect(select).not.toMatch(/cost_price|metadata|margin/i)
    expect(response.headers.get('access-control-allow-origin')).toBeNull()
    expect(body).toEqual({ products: [], total: 0, hasMore: false })
  })

  it('clamps pagination to safe bounds', async () => {
    const response = await GET(request('/api/products?page=0&limit=999'))
    expect(response.status).toBe(200)
    expect(query.range).toHaveBeenCalledWith(0, 47)
  })

  it.each([
    '/api/products?page=1e3',
    '/api/products?page=-1',
    '/api/products?minPrice=NaN',
    '/api/products?minPrice=20&maxPrice=10',
    '/api/products?search=a%2Cb',
    '/api/products?category=chairs%2C%28select%29',
    '/api/products?material=one,two,three,four,five,six,seven,eight,nine,ten,eleven',
  ])('rejects malformed or overlong filters (%s)', async (path) => {
    const response = await GET(request(path))
    expect(response.status).toBe(400)
    expect(createServerClient).not.toHaveBeenCalled()
  })

  it('uses an inner category relation only when category filtering is requested', async () => {
    const response = await GET(request('/api/products?category=chairs'))
    expect(response.status).toBe(200)
    expect(query.select.mock.calls[0][0]).toContain('category:categories!inner(')
    expect(query.eq).toHaveBeenCalledWith('category.slug', 'chairs')
  })
})
