import React, { useState } from 'react'
import { act, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { Product, ProductFilters as Filters } from '@/types/store'

const navigation = vi.hoisted(() => ({ query: '' }))
vi.mock('next/navigation', () => ({ useSearchParams: () => new URLSearchParams(navigation.query) }))
vi.mock('@/components/store/ProductCard', () => ({
  ProductCard: ({ product }: { product: Product }) => <div>{product.name.en}</div>,
  ProductCardSkeleton: () => <div>Skeleton</div>,
}))

import { ProductFilters } from '@/components/store/ProductFilters'
import { ProductGrid } from '@/components/store/ProductGrid'
import { StoreContent } from '@/app/[locale]/store/StoreContent'

const options = {
  locale: 'en' as const,
  availableMaterials: ['granite', 'marble'] as const,
  availableFinishes: ['polished'] as const,
  priceRange: { min: 0, max: 1000 },
}
const filterProps = { ...options, availableMaterials: [...options.availableMaterials], availableFinishes: [...options.availableFinishes] }
const product = (id: string, name: string) => ({ id, name: { lv: name, en: name, ru: name } }) as Product
const response = (products: Product[], hasMore = false) => ({
  ok: true,
  json: async () => ({ products, total: products.length, hasMore }),
})
const deferred = <T,>() => {
  let resolve!: (value: T) => void
  const promise = new Promise<T>(done => { resolve = done })
  return { promise, resolve }
}
const settle = async () => { await act(async () => { await Promise.resolve(); await Promise.resolve() }) }

beforeEach(() => {
  navigation.query = ''
  window.history.replaceState(null, '', '/lv/store')
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue(response([])))
})
afterEach(() => {
  vi.useRealTimers()
  vi.unstubAllGlobals()
})

describe('store filter controls', () => {
  it('does not issue a redundant search on mount', async () => {
    vi.useFakeTimers()
    const onChange = vi.fn()
    render(<ProductFilters {...filterProps} filters={{}} onFiltersChange={onChange} />)
    await act(async () => { await vi.advanceTimersByTimeAsync(500) })
    expect(onChange).not.toHaveBeenCalled()
  })

  it('keeps typing immediate and preserves filter changes during the search debounce', async () => {
    vi.useFakeTimers()
    const changed = vi.fn()
    function Harness() {
      const [filters, setFilters] = useState<Filters>({})
      return <ProductFilters {...filterProps} filters={filters} onFiltersChange={value => { changed(value); setFilters(value) }} />
    }
    render(<Harness />)
    fireEvent.change(screen.getByRole('textbox', { name: 'Search...' }), { target: { value: 'stone' } })
    expect(screen.getByRole('textbox')).toHaveValue('stone')
    expect(changed).not.toHaveBeenCalled()
    fireEvent.click(screen.getByRole('checkbox', { name: 'Granite' }))
    await act(async () => { await vi.advanceTimersByTimeAsync(300) })
    expect(changed).toHaveBeenLastCalledWith({ material: 'granite', search: 'stone' })
  })

  it('restores visible search and price controls across external A -> B -> A navigation', () => {
    const onChange = vi.fn()
    const { rerender } = render(<ProductFilters {...filterProps} filters={{ search: 'first', minPrice: 0 }} onFiltersChange={onChange} />)
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'unfinished draft' } })
    rerender(<ProductFilters {...filterProps} filters={{ search: 'second', minPrice: 25 }} onFiltersChange={onChange} />)
    expect(screen.getByRole('textbox')).toHaveValue('second')
    expect(screen.getByRole('spinbutton', { name: 'Minimum price' })).toHaveValue(25)
    rerender(<ProductFilters {...filterProps} filters={{ search: 'first', minPrice: 0 }} onFiltersChange={onChange} />)
    expect(screen.getByRole('textbox')).toHaveValue('first')
    expect(screen.getByRole('spinbutton', { name: 'Minimum price' })).toHaveValue(0)
  })

  it('cancels pending search when filters are cleared', async () => {
    vi.useFakeTimers()
    const onChange = vi.fn()
    render(<ProductFilters {...filterProps} filters={{ material: 'granite' }} onFiltersChange={onChange} />)
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'stone' } })
    fireEvent.click(screen.getByRole('button', { name: 'Clear', exact: true }))
    await act(async () => { await vi.advanceTimersByTimeAsync(500) })
    expect(onChange).toHaveBeenCalledExactlyOnceWith({})
  })
})

describe('catalog request lifecycle', () => {
  it('ignores a superseded response even when the transport ignores abort', async () => {
    const older = deferred<ReturnType<typeof response>>()
    const newer = deferred<ReturnType<typeof response>>()
    vi.mocked(fetch).mockReturnValueOnce(older.promise as Promise<Response>).mockReturnValueOnce(newer.promise as Promise<Response>)
    const { rerender } = render(<ProductGrid locale="en" filters={{ search: 'old' }} sort="featured" />)
    const firstSignal = vi.mocked(fetch).mock.calls[0][1]?.signal
    rerender(<ProductGrid locale="en" filters={{ search: 'new' }} sort="featured" />)
    expect(firstSignal?.aborted).toBe(true)
    newer.resolve(response([product('new', 'New result')]))
    await settle()
    older.resolve(response([product('old', 'Outdated result')]))
    await settle()
    expect(screen.getByText('New result')).toBeInTheDocument()
    expect(screen.queryByText('Outdated result')).not.toBeInTheDocument()
  })

  it('keeps useful results visible while revalidating and does not refetch equivalent filters', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(response([product('one', 'Existing result')]) as Response)
    const { rerender } = render(<ProductGrid locale="en" filters={{}} sort="featured" />)
    await settle()
    rerender(<ProductGrid locale="en" filters={{}} sort="featured" />)
    expect(fetch).toHaveBeenCalledTimes(1)
    const pending = deferred<ReturnType<typeof response>>()
    vi.mocked(fetch).mockReturnValueOnce(pending.promise as Promise<Response>)
    rerender(<ProductGrid locale="en" filters={{ search: 'different' }} sort="featured" />)
    expect(screen.getByText('Existing result')).toBeInTheDocument()
    expect(screen.getByRole('status')).toHaveTextContent('Updating products')
    pending.resolve(response([product('two', 'Updated result')]))
    await settle()
    expect(screen.getByText('Updated result')).toBeInTheDocument()
    expect(screen.queryByText('Existing result')).not.toBeInTheDocument()
  })

  it('retains results on pagination failure and retries the same page', async () => {
    vi.mocked(fetch)
      .mockResolvedValueOnce(response([product('one', 'First page')], true) as Response)
      .mockResolvedValueOnce({ ok: false } as Response)
      .mockResolvedValueOnce(response([product('two', 'Second page')]) as Response)
    render(<ProductGrid locale="en" filters={{}} sort="featured" />)
    await settle()
    fireEvent.click(screen.getByRole('button', { name: 'Load more' }))
    await settle()
    expect(screen.getByText('First page')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Try Again' }))
    await settle()
    expect(String(vi.mocked(fetch).mock.calls[1][0])).toContain('page=2')
    expect(String(vi.mocked(fetch).mock.calls[2][0])).toContain('page=2')
    expect(screen.getByText('Second page')).toBeInTheDocument()
    expect(screen.getByText('First page')).toBeInTheDocument()
  })
})

describe('store URL state', () => {
  const props = {
    locale: 'en' as const, categories: [], featuredProduct: null,
    filterOptions: { priceRange: options.priceRange, materials: ['granite'], finishes: ['polished'] },
  }

  it('requests the initial catalog once and preserves filter/sort deep links without a document navigation', async () => {
    vi.useFakeTimers()
    const { rerender } = render(<StoreContent {...props} />)
    await settle()
    expect(screen.getByRole('heading', { level: 1, name: 'All Products' })).toBeInTheDocument()
    await act(async () => { await vi.advanceTimersByTimeAsync(500) })
    expect(fetch).toHaveBeenCalledTimes(1)
    fireEvent.click(screen.getByRole('checkbox', { name: 'Granite' }))
    await settle()
    expect(window.location.search).toBe('?material=granite')
    fireEvent.click(screen.getByRole('button', { name: 'Featured' }))
    fireEvent.click(screen.getByRole('button', { name: 'Price: Low to High' }))
    await settle()
    expect(window.location.search).toContain('sort=price_asc')
    navigation.query = 'search=back&sort=newest'
    rerender(<StoreContent {...props} />)
    await settle()
    expect(screen.getByRole('textbox')).toHaveValue('back')
    expect(screen.getByRole('button', { name: 'Newest' })).toBeInTheDocument()
    expect(screen.getByRole('checkbox', { name: 'Granite' })).not.toBeChecked()
    expect(String(vi.mocked(fetch).mock.calls.at(-1)?.[0])).toContain('search=back')
  })
})
