import React from 'react'
import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import type { SanityProject } from '@/lib/sanity/types'

const dynamicLoads = vi.hoisted(() => vi.fn())
vi.mock('next/dynamic', async () => {
  const React = await import('react')
  return {
    default: (loader: () => Promise<React.ComponentType<Record<string, unknown>>>) => {
      const Lazy = React.lazy(async () => { dynamicLoads(); return { default: await loader() } })
      return function DeferredEditor(props: Record<string, unknown>) {
        return <React.Suspense fallback={<p>Loading editor</p>}><Lazy {...props} /></React.Suspense>
      }
    },
  }
})

import { ProjectsPageClient } from '@/app/[locale]/projects/ProjectsPageClient'

const project = (id: string, title: string) => ({
  _id: id,
  title: { lv: title, en: title, ru: title },
  slug: { lv: { current: id }, en: { current: id }, ru: { current: id } },
  category: 'stone', material: 'granite', tags: [],
}) as unknown as SanityProject

describe('deferred project editor', () => {
  it('does not load administrative editor code for public project browsing', () => {
    render(<ProjectsPageClient projects={[project('one', 'First project')]} locale="en" isAdmin={false} projectsBasePath="/en/projects" />)
    expect(screen.queryByTitle('Edit Project')).not.toBeInTheDocument()
    expect(dynamicLoads).not.toHaveBeenCalled()
  })

  it('initializes the selected project and clears unsaved form state when reopening another', async () => {
    render(<ProjectsPageClient projects={[project('one', 'First project'), project('two', 'Second project')]} locale="en" isAdmin projectsBasePath="/en/projects" />)
    expect(screen.queryByPlaceholderText('Title in en')).not.toBeInTheDocument()
    fireEvent.click(screen.getAllByTitle('Edit Project')[0])
    const title = await screen.findByPlaceholderText('Title in en')
    expect(title).toHaveValue('First project')
    fireEvent.change(title, { target: { value: 'Unsaved draft' } })
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }))
    fireEvent.click(screen.getAllByTitle('Edit Project')[1])
    expect(await screen.findByPlaceholderText('Title in en')).toHaveValue('Second project')
  })
})
