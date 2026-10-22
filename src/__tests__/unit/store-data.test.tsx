import { beforeEach, describe, expect, it, vi } from 'vitest'

const state = vi.hoisted(() => ({
  started: [] as string[],
  release: [] as (() => void)[],
  selects: [] as string[],
}))

vi.mock('@/lib/supabase/client', () => ({
  isSupabaseConfigured: () => true,
  createServerClient: () => ({
    from(table: string) {
      const query: Record<string, unknown> = {}
      let selection = ''
      for (const method of ['eq', 'order', 'limit', 'single', 'maybeSingle']) query[method] = () => query
      query.select = (columns: string) => { selection = columns; state.selects.push(columns); return query }
      query.then = (resolve: (value: unknown) => void) => {
        state.started.push(`${table}:${selection}`)
        state.release.push(() => resolve({ data: selection === 'price' ? { price: 0 } : selection.includes('featured_image') ? null : [], error: null }))
      }
      return query
    },
  }),
}))
vi.mock('@/app/[locale]/store/StoreContent', () => ({ StoreContent: () => null }))

import StorePage from '@/app/[locale]/store/page'

describe('store public metadata reads', () => {
  beforeEach(() => { state.started = []; state.release = []; state.selects = [] })

  it('starts independent reads before waiting and preserves a real zero maximum price', async () => {
    const rendering = StorePage({ params: Promise.resolve({ locale: 'lv' }) })
    // Flush Promise/thenable assimilation without resolving any network request.
    for (let n = 0; n < 10; n++) await Promise.resolve()
    expect(state.started).toHaveLength(5)
    for (const release of state.release) release()
    const page = await rendering
    expect(page.props.filterOptions.priceRange).toEqual({ min: 0, max: 0 })
    expect(state.selects.every(selection => !selection.includes('*'))).toBe(true)
  })
})
