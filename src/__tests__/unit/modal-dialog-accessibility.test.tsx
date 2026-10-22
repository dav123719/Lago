import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
vi.mock('@/hooks/useAuth', () => ({ useAuth: () => ({ signUp: vi.fn(), resendSignupConfirmation: vi.fn() }) }))
import { SignupModal } from '@/components/auth/SignupModal'
import { useModalDialog } from '@/hooks/useModalDialog'

function Dialog({ close }: { close: () => void }) {
  const ref = useModalDialog(true, close)
  return <div ref={ref} role="dialog" aria-modal="true" tabIndex={-1}><button>First</button><input aria-label="Email" /><button>Last</button></div>
}

describe('auth dialog keyboard lifecycle', () => {
  it('moves focus inside, wraps both directions and handles Escape', () => {
    const close = vi.fn()
    render(<Dialog close={close} />)
    expect(screen.getByLabelText('Email')).toHaveFocus()
    screen.getByRole('button', { name: 'Last' }).focus()
    fireEvent.keyDown(document, { key: 'Tab' })
    expect(screen.getByRole('button', { name: 'First' })).toHaveFocus()
    fireEvent.keyDown(document, { key: 'Tab', shiftKey: true })
    expect(screen.getByRole('button', { name: 'Last' })).toHaveFocus()
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(close).toHaveBeenCalledExactlyOnceWith()
  })

  it('signup supplies the dialog semantics and focus target to its shared keyboard hook', () => {
    render(<SignupModal locale="en" isOpen onClose={vi.fn()} onLoginClick={vi.fn()} />)
    const dialog = screen.getByRole('dialog')
    expect(dialog).toHaveAttribute('aria-modal', 'true')
    expect(dialog).toContainElement(document.activeElement as HTMLElement)
    expect(document.activeElement?.tagName).toBe('INPUT')
  })

  it('restores the invoking control and previous scroll style on close', () => {
    const trigger = document.createElement('button')
    document.body.append(trigger)
    trigger.focus()
    document.body.style.overflow = 'clip'
    const view = render(<Dialog close={vi.fn()} />)
    expect(document.body.style.overflow).toBe('hidden')
    view.unmount()
    expect(trigger).toHaveFocus()
    expect(document.body.style.overflow).toBe('clip')
    trigger.remove()
    document.body.style.overflow = ''
  })
})
