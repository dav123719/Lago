'use client'

// ============================================
// Focus Trap Component
// ============================================
// Traps focus within a container for modals and dialogs

import { useEffect, useRef, useCallback } from 'react'

interface FocusTrapProps {
  children: React.ReactNode
  isActive: boolean
  onEscape?: () => void
  restoreFocus?: boolean
  className?: string
}

/**
 * FocusTrap Component
 * 
 * Traps keyboard focus within a container element.
 * Essential for accessible modals, dialogs, and dropdowns.
 * 
 * @example
 * <Dialog open={isOpen}>
 *   <FocusTrap isActive={isOpen} onEscape={closeDialog}>
 *     <div role="dialog">
 *       <h2>Dialog Title</h2>
 *       <button>Action</button>
 *       <button onClick={closeDialog}>Close</button>
 *     </div>
 *   </FocusTrap>
 * </Dialog>
 */
export function FocusTrap({
  children,
  isActive,
  onEscape,
  restoreFocus = true,
  className = '',
}: FocusTrapProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const previousFocusRef = useRef<HTMLElement | null>(null)

  // Store previously focused element
  useEffect(() => {
    if (isActive) {
      previousFocusRef.current = document.activeElement as HTMLElement
    }
  }, [isActive])

  // Restore focus on unmount
  useEffect(() => {
    return () => {
      if (restoreFocus && previousFocusRef.current) {
        previousFocusRef.current.focus()
      }
    }
  }, [restoreFocus])

  // Get all focusable elements
  const getFocusableElements = useCallback((): HTMLElement[] => {
    const container = containerRef.current
    if (!container) return []

    const focusableSelectors = [
      'button:not([disabled])',
      'a[href]',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      '[tabindex]:not([tabindex="-1"])',
      '[contenteditable]',
    ].join(', ')

    return Array.from(container.querySelectorAll(focusableSelectors))
  }, [])

  // Handle tab key
  const handleTabKey = useCallback((event: KeyboardEvent) => {
    const focusableElements = getFocusableElements()
    if (focusableElements.length === 0) return

    const firstElement = focusableElements[0]
    const lastElement = focusableElements[focusableElements.length - 1]

    // Shift + Tab
    if (event.shiftKey) {
      if (document.activeElement === firstElement) {
        event.preventDefault()
        lastElement.focus()
      }
    } else {
      // Tab
      if (document.activeElement === lastElement) {
        event.preventDefault()
        firstElement.focus()
      }
    }
  }, [getFocusableElements])

  // Handle keyboard events
  useEffect(() => {
    if (!isActive) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && onEscape) {
        event.preventDefault()
        onEscape()
      }

      if (event.key === 'Tab') {
        handleTabKey(event)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isActive, onEscape, handleTabKey])

  // Focus first element when activated
  useEffect(() => {
    if (isActive && containerRef.current) {
      const focusableElements = getFocusableElements()
      if (focusableElements.length > 0) {
        // Try to find the first non-close button to focus
        const firstNonCloseButton = focusableElements.find(
          (el) => !el.getAttribute('data-auto-focus') === false
        )
        ;(firstNonCloseButton || focusableElements[0]).focus()
      }
    }
  }, [isActive, getFocusableElements])

  return (
    <div ref={containerRef} className={className}>
      {children}
    </div>
  )
}

/**
 * useFocusTrap Hook
 * Hook version for custom implementations
 */
export function useFocusTrap(isActive: boolean, options: { onEscape?: () => void; restoreFocus?: boolean } = {}) {
  const { onEscape, restoreFocus = true } = options
  const containerRef = useRef<HTMLElement>(null)
  const previousFocusRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    if (isActive) {
      previousFocusRef.current = document.activeElement as HTMLElement
    }
  }, [isActive])

  useEffect(() => {
    return () => {
      if (restoreFocus && previousFocusRef.current) {
        previousFocusRef.current.focus()
      }
    }
  }, [restoreFocus])

  useEffect(() => {
    if (!isActive || !containerRef.current) return

    const container = containerRef.current
    const focusableSelectors = [
      'button:not([disabled])',
      'a[href]',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      '[tabindex]:not([tabindex="-1"])',
    ].join(', ')

    const getFocusableElements = () => 
      Array.from(container.querySelectorAll(focusableSelectors)) as HTMLElement[]

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && onEscape) {
        event.preventDefault()
        onEscape()
      }

      if (event.key === 'Tab') {
        const focusableElements = getFocusableElements()
        if (focusableElements.length === 0) return

        const firstElement = focusableElements[0]
        const lastElement = focusableElements[focusableElements.length - 1]

        if (event.shiftKey && document.activeElement === firstElement) {
          event.preventDefault()
          lastElement.focus()
        } else if (!event.shiftKey && document.activeElement === lastElement) {
          event.preventDefault()
          firstElement.focus()
        }
      }
    }

    // Focus first element
    const focusableElements = getFocusableElements()
    if (focusableElements.length > 0) {
      focusableElements[0].focus()
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isActive, onEscape])

  return containerRef
}
