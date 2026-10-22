'use client'

import { useEffect, useRef } from 'react'

/** Manage keyboard focus and scroll while a single auth dialog is open. */
export function useModalDialog(isOpen: boolean, onClose: () => void) {
  const dialogRef = useRef<HTMLDivElement>(null)
  const onCloseRef = useRef(onClose)
  useEffect(() => { onCloseRef.current = onClose }, [onClose])

  useEffect(() => {
    if (!isOpen) return
    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const dialog = dialogRef.current
    const focusable = () => Array.from(dialog?.querySelectorAll<HTMLElement>(
      'button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), a[href], [tabindex="0"]'
    ) ?? []).filter(element => !element.hidden && element.getAttribute('aria-hidden') !== 'true')
    const initial = dialog?.querySelector<HTMLElement>('input:not([disabled])') || focusable()[0] || dialog
    initial?.focus()

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        onCloseRef.current()
      } else if (event.key === 'Tab') {
        const controls = focusable()
        const first = controls[0]
        const last = controls[controls.length - 1]
        if (!first || !last) { event.preventDefault(); dialog?.focus(); return }
        if (event.shiftKey && (document.activeElement === first || !dialog?.contains(document.activeElement))) {
          event.preventDefault(); last.focus()
        } else if (!event.shiftKey && (document.activeElement === last || !dialog?.contains(document.activeElement))) {
          event.preventDefault(); first.focus()
        }
      }
    }
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = previousOverflow
      // A replacement dialog gets focus in its own effect after this cleanup.
      if (previousFocus?.isConnected) previousFocus.focus()
    }
  }, [isOpen])

  return dialogRef
}
