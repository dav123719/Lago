// ============================================
// Focus Management Hooks
// ============================================
// Advanced focus management utilities

import { useEffect, useRef, useCallback, useState } from 'react'

// ============================================
// FOCUS RETURN HOOK
// ============================================

/**
 * useFocusReturn Hook
 * Returns focus to a previous element when a condition changes
 * 
 * @example
 * const { returnFocus, saveFocus } = useFocusReturn()
 * 
 * // When opening modal
 * saveFocus()
 * 
 * // When closing modal
 * returnFocus()
 */
export function useFocusReturn() {
  const previousFocusRef = useRef<HTMLElement | null>(null)

  const saveFocus = useCallback(() => {
    previousFocusRef.current = document.activeElement as HTMLElement
  }, [])

  const returnFocus = useCallback(() => {
    if (previousFocusRef.current && document.contains(previousFocusRef.current)) {
      previousFocusRef.current.focus()
    }
  }, [])

  const clearSavedFocus = useCallback(() => {
    previousFocusRef.current = null
  }, [])

  return { saveFocus, returnFocus, clearSavedFocus }
}

// ============================================
// FOCUS SCOPE HOOK
// ============================================

/**
 * useFocusScope Hook
 * Manages focus within a specific scope
 */
interface UseFocusScopeOptions {
  contain?: boolean
  restoreFocus?: boolean
}

export function useFocusScope(options: UseFocusScopeOptions = {}) {
  const { contain = false, restoreFocus = false } = options
  const containerRef = useRef<HTMLElement>(null)
  const previousFocusRef = useRef<HTMLElement | null>(null)

  const getFocusableElements = useCallback((): HTMLElement[] => {
    const container = containerRef.current
    if (!container) return []

    const selector = [
      'button:not([disabled]):not([tabindex="-1"])',
      'a[href]:not([tabindex="-1"])',
      'input:not([disabled]):not([tabindex="-1"])',
      'select:not([disabled]):not([tabindex="-1"])',
      'textarea:not([disabled]):not([tabindex="-1"])',
      '[tabindex]:not([tabindex="-1"]):not([tabindex=""])',
      '[contenteditable]:not([tabindex="-1"])',
    ].join(', ')

    return Array.from(container.querySelectorAll(selector))
  }, [])

  const focusFirst = useCallback(() => {
    const elements = getFocusableElements()
    elements[0]?.focus()
  }, [getFocusableElements])

  const focusLast = useCallback(() => {
    const elements = getFocusableElements()
    elements[elements.length - 1]?.focus()
  }, [getFocusableElements])

  const focusNext = useCallback(() => {
    const elements = getFocusableElements()
    const currentIndex = elements.indexOf(document.activeElement as HTMLElement)
    const nextElement = elements[currentIndex + 1] || elements[0]
    nextElement?.focus()
  }, [getFocusableElements])

  const focusPrevious = useCallback(() => {
    const elements = getFocusableElements()
    const currentIndex = elements.indexOf(document.activeElement as HTMLElement)
    const previousElement = elements[currentIndex - 1] || elements[elements.length - 1]
    previousElement?.focus()
  }, [getFocusableElements])

  useEffect(() => {
    if (restoreFocus) {
      previousFocusRef.current = document.activeElement as HTMLElement

      return () => {
        if (previousFocusRef.current && document.contains(previousFocusRef.current)) {
          previousFocusRef.current.focus()
        }
      }
    }
  }, [restoreFocus])

  useEffect(() => {
    if (!contain) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') return

      const elements = getFocusableElements()
      if (elements.length === 0) return

      const firstElement = elements[0]
      const lastElement = elements[elements.length - 1]

      if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault()
        lastElement.focus()
      } else if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault()
        firstElement.focus()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [contain, getFocusableElements])

  return {
    containerRef,
    focusFirst,
    focusLast,
    focusNext,
    focusPrevious,
    getFocusableElements,
  }
}

// ============================================
// FOCUS VISIBLE HOOK
// ============================================

/**
 * useFocusVisible Hook
 * Determines if focus should be visible (keyboard vs mouse)
 */
export function useFocusVisibleState() {
  const [isKeyboardUser, setIsKeyboardUser] = useState(false)

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Tab') {
        setIsKeyboardUser(true)
      }
    }

    const handlePointerDown = () => {
      setIsKeyboardUser(false)
    }

    document.addEventListener('keydown', handleKeyDown)
    document.addEventListener('mousedown', handlePointerDown)
    document.addEventListener('touchstart', handlePointerDown)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('mousedown', handlePointerDown)
      document.removeEventListener('touchstart', handlePointerDown)
    }
  }, [])

  return isKeyboardUser
}

// ============================================
// FOCUS WITHIN HOOK
// ============================================

/**
 * useFocusWithin Hook
 * Tracks if any element within a container has focus
 */
export function useFocusWithin() {
  const [isFocusWithin, setIsFocusWithin] = useState(false)
  const containerRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const handleFocusIn = () => {
      setIsFocusWithin(true)
    }

    const handleFocusOut = (event: FocusEvent) => {
      // Check if the new focus target is outside the container
      if (!container.contains(event.relatedTarget as Node)) {
        setIsFocusWithin(false)
      }
    }

    container.addEventListener('focusin', handleFocusIn)
    container.addEventListener('focusout', handleFocusOut)

    return () => {
      container.removeEventListener('focusin', handleFocusIn)
      container.removeEventListener('focusout', handleFocusOut)
    }
  }, [])

  return { ref: containerRef, isFocusWithin }
}

// ============================================
// AUTO FOCUS HOOK
// ============================================

/**
 * useAutoFocus Hook
 * Automatically focuses an element when a condition is met
 */
interface UseAutoFocusOptions {
  when?: boolean
  delay?: number
}

export function useAutoFocus<T extends HTMLElement>(options: UseAutoFocusOptions = {}) {
  const { when = true, delay = 0 } = options
  const elementRef = useRef<T>(null)

  useEffect(() => {
    if (!when) return

    const timeoutId = setTimeout(() => {
      elementRef.current?.focus()
    }, delay)

    return () => clearTimeout(timeoutId)
  }, [when, delay])

  return elementRef
}

// ============================================
// FOCUS RING HOOK
// ============================================

/**
 * useFocusRing Hook
 * Manages focus ring visibility
 */
export function useFocusRing() {
  const [isFocused, setIsFocused] = useState(false)
  const [isFocusVisible, setIsFocusVisible] = useState(false)

  const onFocus = useCallback((event: React.FocusEvent) => {
    setIsFocused(true)
    // Focus is visible if not triggered by mouse/touch
    if (event.nativeEvent.detail === 0) {
      setIsFocusVisible(true)
    }
  }, [])

  const onBlur = useCallback(() => {
    setIsFocused(false)
    setIsFocusVisible(false)
  }, [])

  const onMouseDown = useCallback(() => {
    setIsFocusVisible(false)
  }, [])

  return {
    isFocused,
    isFocusVisible,
    focusRingProps: {
      onFocus,
      onBlur,
      onMouseDown,
    },
  }
}

// ============================================
// Roving TABINDEX HOOK
// ============================================

/**
 * useRovingTabIndex Hook
 * Implements roving tabindex pattern for lists
 */
export function useRovingTabIndex(itemCount: number, orientation: 'horizontal' | 'vertical' = 'horizontal') {
  const [activeIndex, setActiveIndex] = useState(0)
  const containerRef = useRef<HTMLElement>(null)

  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    switch (event.key) {
      case 'ArrowRight':
        if (orientation === 'horizontal') {
          event.preventDefault()
          setActiveIndex((prev) => (prev + 1) % itemCount)
        }
        break
      case 'ArrowLeft':
        if (orientation === 'horizontal') {
          event.preventDefault()
          setActiveIndex((prev) => (prev - 1 + itemCount) % itemCount)
        }
        break
      case 'ArrowDown':
        if (orientation === 'vertical') {
          event.preventDefault()
          setActiveIndex((prev) => (prev + 1) % itemCount)
        }
        break
      case 'ArrowUp':
        if (orientation === 'vertical') {
          event.preventDefault()
          setActiveIndex((prev) => (prev - 1 + itemCount) % itemCount)
        }
        break
      case 'Home':
        event.preventDefault()
        setActiveIndex(0)
        break
      case 'End':
        event.preventDefault()
        setActiveIndex(itemCount - 1)
        break
    }
  }, [itemCount, orientation])

  const getTabIndex = useCallback((index: number) => {
    return index === activeIndex ? 0 : -1
  }, [activeIndex])

  return {
    containerRef,
    activeIndex,
    setActiveIndex,
    handleKeyDown,
    getTabIndex,
  }
}

// ============================================
// FOCUS SYNC HOOK
// ============================================

/**
 * useFocusSync Hook
 * Syncs focus state between components
 */
export function useFocusSync(focusId: string) {
  const [isFocused, setIsFocused] = useState(false)

  const focus = useCallback(() => {
    const event = new CustomEvent('focus-sync', { 
      detail: { focusId, action: 'focus' } 
    })
    window.dispatchEvent(event)
  }, [focusId])

  const blur = useCallback(() => {
    const event = new CustomEvent('focus-sync', { 
      detail: { focusId, action: 'blur' } 
    })
    window.dispatchEvent(event)
  }, [focusId])

  useEffect(() => {
    const handleFocusSync = (event: CustomEvent) => {
      if (event.detail.focusId === focusId) {
        setIsFocused(event.detail.action === 'focus')
      }
    }

    window.addEventListener('focus-sync' as any, handleFocusSync)
    return () => window.removeEventListener('focus-sync' as any, handleFocusSync)
  }, [focusId])

  return { isFocused, focus, blur }
}

// ============================================
// INITIAL FOCUS HOOK
// ============================================

/**
 * useInitialFocus Hook
 * Sets initial focus when component mounts
 */
export function useInitialFocus<T extends HTMLElement>(shouldFocus = true) {
  const elementRef = useRef<T>(null)

  useEffect(() => {
    if (shouldFocus && elementRef.current) {
      // Small delay to ensure DOM is ready
      requestAnimationFrame(() => {
        elementRef.current?.focus()
      })
    }
  }, [shouldFocus])

  return elementRef
}
