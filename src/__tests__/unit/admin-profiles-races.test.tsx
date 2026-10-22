import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import AdminProfilesPage from '@/app/admin/profiles/page'

const profile = (id: string, email: string) => ({ id, email, full_name: null, first_name: null, last_name: null, phone: null, avatar_url: null, bio: null, preferred_language: 'lv' })
const response = (profiles: ReturnType<typeof profile>[]) => ({ ok: true, json: async () => ({ profiles }) })

describe('admin profile search', () => {
  beforeEach(() => { vi.mocked(fetch).mockResolvedValue(response([]) as Response) })

  it('waits for explicit search and does not reload the unfiltered list on every keystroke', async () => {
    render(<AdminProfilesPage />)
    await screen.findByText('No profiles found.')
    expect(fetch).toHaveBeenCalledOnce()
    fireEvent.change(screen.getByLabelText('Search by name or email'), { target: { value: 'Alice' } })
    await act(async () => { await new Promise(resolve => setTimeout(resolve, 5)) })
    expect(fetch).toHaveBeenCalledOnce()
    fireEvent.click(screen.getByRole('button', { name: 'Search' }))
    await waitFor(() => expect(fetch).toHaveBeenCalledTimes(2))
    expect(fetch).toHaveBeenLastCalledWith('/api/admin/profiles?q=Alice', expect.objectContaining({ cache: 'no-store', signal: expect.any(AbortSignal) }))
  })

  it('ignores obsolete results and aborts their requests', async () => {
    let resolveFirst: (value: Response) => void = () => {}
    vi.mocked(fetch).mockImplementationOnce(() => new Promise(resolve => { resolveFirst = resolve }))
    render(<AdminProfilesPage />)
    await waitFor(() => expect(fetch).toHaveBeenCalledOnce())
    const firstSignal = vi.mocked(fetch).mock.calls[0][1]?.signal
    vi.mocked(fetch).mockResolvedValue(response([profile('b', 'bob@example.com')]) as Response)
    fireEvent.change(screen.getByLabelText('Search by name or email'), { target: { value: 'Bob' } })
    fireEvent.click(screen.getByRole('button', { name: 'Search' }))
    await screen.findByText('bob@example.com')
    expect(firstSignal?.aborted).toBe(true)
    await act(async () => { resolveFirst(response([profile('a', 'alice@example.com')]) as Response) })
    expect(screen.queryByText('alice@example.com')).toBeNull()
    expect(screen.getByText('bob@example.com')).toBeTruthy()
  })
})
