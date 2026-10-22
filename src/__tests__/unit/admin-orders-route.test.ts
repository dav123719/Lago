import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { NextRequest } from 'next/server'

const { admin, createClient, query } = vi.hoisted(() => {
  const query: Record<string, any> = {}
  for (const method of ['select', 'eq', 'gte', 'lte', 'or', 'ilike', 'order', 'range']) query[method] = vi.fn(() => query)
  query.then = (resolve: (value: unknown) => unknown) => Promise.resolve({ data: [], error: null, count: 0 }).then(resolve)
  return { query, admin: vi.fn(), createClient: vi.fn(async () => ({ from: vi.fn(() => query) })) }
})
vi.mock('@/lib/admin/auth', () => ({ checkAdminRole: admin }))
vi.mock('@/lib/supabase/server', () => ({ createClient }))
import { GET } from '@/app/api/admin/orders/route'

const get = (query = '') => GET(new NextRequest(`https://lago.lv/api/admin/orders?${query}`))

describe('admin orders list boundaries', () => {
  afterEach(() => vi.unstubAllEnvs())
  beforeEach(() => {
    vi.clearAllMocks()
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://project.supabase.co')
    vi.stubEnv('SUPABASE_SERVICE_ROLE_KEY', 'server-test-key')
    admin.mockResolvedValue(true)
  })

  it('retains authoritative authorization before parsing filters or querying orders', async () => {
    admin.mockResolvedValue(false)
    const response = await get('sortBy=arbitrary&page=-1')
    expect(response.status).toBe(403)
    expect(createClient).not.toHaveBeenCalled()
    expect(query.select).not.toHaveBeenCalled()
    expect(response.headers.get('cache-control')).toBe('private, no-store')
    expect(response.headers.get('access-control-allow-origin')).toBeNull()
  })

  it('returns bounded summary fields and a deterministic default page', async () => {
    const response = await get()
    expect(response.status).toBe(200)
    const selection = query.select.mock.calls[0][0]
    expect(selection).not.toContain('*')
    expect(selection).not.toMatch(/stripe|notes|unit_price|product_name/)
    expect(selection).toContain('items:order_items(id)')
    expect(query.range).toHaveBeenCalledWith(0, 49)
    expect(query.order).toHaveBeenCalledWith('created_at', { ascending: false })
    expect(query.order).toHaveBeenCalledWith('id', { ascending: true })
    expect((await response.json()).pagination).toEqual({ page: 1, limit: 50, total: 0, totalPages: 0 })
  })

  it('caps valid large limits and pages', async () => {
    expect((await get('page=100000&limit=999')).status).toBe(200)
    expect(query.range).toHaveBeenCalledWith(999900, 999999)
  })

  it.each(['page=-1', 'page=0', 'page=NaN', 'page=Infinity', 'page=1e3', 'page=1.5', 'limit=0', 'limit=-4', 'limit=1abc', 'limit=9007199254740992', 'sortBy=guest_email', 'sortOrder=sideways', 'status=unknown', 'search=a,b', 'search=one%28two%29', 'search=wild%25', 'customer=one%22two', 'dateFrom=not-a-date', 'dateFrom=2026-02-30', 'dateFrom=2026-10-30&dateTo=2026-10-01'])('rejects malformed filters before querying (%s)', async (filters) => {
    expect((await get(filters)).status).toBe(400)
    expect(createClient).not.toHaveBeenCalled()
  })

  it('accepts useful names and emails without allowing raw filter grammar', async () => {
    const response = await get(new URLSearchParams({ search: 'Jānis', customer: "o'neil+home_a@example.com", sortBy: 'total', sortOrder: 'asc', status: 'paid', dateFrom: '2026-10-01' }).toString())
    expect(response.status).toBe(200)
    expect(query.or).toHaveBeenCalledWith('order_number.ilike.%Jānis%,guest_email.ilike.%Jānis%')
    expect(query.ilike).toHaveBeenCalledWith('guest_email', "%o'neil+home\\_a@example.com%")
    expect(query.eq).toHaveBeenCalledWith('status', 'paid')
    expect(query.gte).toHaveBeenCalledWith('created_at', '2026-10-01')
    expect(query.order).toHaveBeenCalledWith('total', { ascending: true })
  })
})
