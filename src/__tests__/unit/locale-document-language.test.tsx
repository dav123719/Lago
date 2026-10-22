import React from 'react'
import { render } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { LocaleDocumentLanguage } from '@/components/layout/LocaleDocumentLanguage'

afterEach(() => { vi.restoreAllMocks(); document.documentElement.lang = 'lv' })

describe('localized document language', () => {
  it('sets English before paint when entering an English page', () => {
    document.documentElement.lang = 'lv'
    render(<LocaleDocumentLanguage locale="en" />)
    expect(document.documentElement.lang).toBe('en')
  })
  it('updates Russian and Latvian after client-side locale changes', () => {
    const page = render(<LocaleDocumentLanguage locale="en" />)
    page.rerender(<LocaleDocumentLanguage locale="ru" />)
    expect(document.documentElement.lang).toBe('ru')
    page.rerender(<LocaleDocumentLanguage locale="lv" />)
    expect(document.documentElement.lang).toBe('lv')
  })
})

describe('document language synchronization', () => {
  it('does not mutate an already correct server-rendered language', () => {
    document.documentElement.lang = 'lv'
    const setter = vi.spyOn(HTMLElement.prototype, 'lang', 'set')
    render(<LocaleDocumentLanguage locale="lv" />)
    expect(setter).not.toHaveBeenCalled()
    expect(document.documentElement.lang).toBe('lv')
  })

  it('updates language for locale changes and avoids redundant updates', () => {
    document.documentElement.lang = 'lv'
    const setter = vi.spyOn(HTMLElement.prototype, 'lang', 'set')
    const { rerender } = render(<LocaleDocumentLanguage locale="en" />)
    expect(document.documentElement.lang).toBe('en')
    rerender(<LocaleDocumentLanguage locale="ru" />)
    expect(document.documentElement.lang).toBe('ru')
    rerender(<LocaleDocumentLanguage locale="ru" />)
    expect(setter).toHaveBeenCalledTimes(2)
  })
})
