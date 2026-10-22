import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { HeroImageCarousel } from '@/components/ui/HeroImageCarousel'

vi.mock('next/image', () => ({
  default: ({ fill: _fill, priority: _priority, quality: _quality, alt = '', ...props }: React.ImgHTMLAttributes<HTMLImageElement> & { fill?: boolean; priority?: boolean; quality?: number }) => (
    // Native image events let these tests exercise delivery without the Next loader.
    // eslint-disable-next-line @next/next/no-img-element
    <img alt={alt} {...props} />
  ),
}))

let reducedMotion = false
beforeEach(() => {
  vi.useFakeTimers()
  reducedMotion = false
  vi.stubGlobal('matchMedia', () => ({
    get matches() { return reducedMotion },
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  }))
  Object.defineProperty(document, 'hidden', { configurable: true, value: false })
})
afterEach(() => {
  cleanup()
  vi.useRealTimers()
  vi.unstubAllGlobals()
})

const images = ['/first.webp', '/second.webp', '/third.webp']
const visibleImage = () => document.querySelector('.opacity-100 img')?.getAttribute('src')

describe('hero image delivery', () => {
  it('requests only the LCP slide until it has loaded and the warmup delay has elapsed', () => {
    render(<HeroImageCarousel images={images} />)
    expect(document.querySelectorAll('img')).toHaveLength(1)
    expect(document.querySelector('img')).toHaveAttribute('fetchpriority', 'high')
    act(() => { vi.advanceTimersByTime(10000) })
    expect(document.querySelectorAll('img')).toHaveLength(1)
    fireEvent.load(document.querySelector('img')!)
    act(() => { vi.advanceTimersByTime(1499) })
    expect(document.querySelectorAll('img')).toHaveLength(1)
    act(() => { vi.advanceTimersByTime(1) })
    expect(document.querySelectorAll('img')).toHaveLength(2)
    expect(document.querySelector('img[src="/second.webp"]')).toHaveAttribute('fetchpriority', 'low')
  })

  it('never fades into an unloaded slide, then advances once the next image is ready', () => {
    render(<HeroImageCarousel images={images} />)
    fireEvent.load(document.querySelector('img')!)
    act(() => { vi.advanceTimersByTime(1500) })
    act(() => { vi.advanceTimersByTime(5000) })
    expect(visibleImage()).toBe('/first.webp')
    fireEvent.load(document.querySelector('img[src="/second.webp"]')!)
    act(() => { vi.advanceTimersByTime(5000) })
    expect(visibleImage()).toBe('/second.webp')
    act(() => { vi.advanceTimersByTime(1100) })
    expect(document.querySelector('img[src="/first.webp"]')).toBeNull()
  })

  it('keeps a single still image for reduced-motion visitors', () => {
    reducedMotion = true
    render(<HeroImageCarousel images={images} />)
    fireEvent.load(document.querySelector('img')!)
    act(() => { vi.advanceTimersByTime(30000) })
    expect(document.querySelectorAll('img')).toHaveLength(1)
    expect(visibleImage()).toBe('/first.webp')
    expect(screen.queryByRole('img')).toBeNull()
  })

  it('stops rotation and upcoming-slide work while the document is hidden', () => {
    render(<HeroImageCarousel images={images} />)
    fireEvent.load(document.querySelector('img')!)
    act(() => { vi.advanceTimersByTime(1500) })
    fireEvent.load(document.querySelector('img[src="/second.webp"]')!)
    Object.defineProperty(document, 'hidden', { configurable: true, value: true })
    fireEvent(document, new Event('visibilitychange'))
    act(() => { vi.advanceTimersByTime(30000) })
    expect(document.querySelectorAll('img')).toHaveLength(1)
    expect(visibleImage()).toBe('/first.webp')
  })
})
