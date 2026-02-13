// ============================================
// Accessibility Hooks
// ============================================
// Hooks for managing accessibility features

import { useEffect, useState, useCallback, useRef } from 'react'

// ============================================
// REDUCED MOTION HOOK
// ============================================

/**
 * useReducedMotion Hook
 * Detects user's preference for reduced motion
 * 
 * @example
 * const prefersReducedMotion = useReducedMotion()
 * 
 * return (
 *   <motion.div
 *     animate={prefersReducedMotion ? {} : { opacity: 1 }}
 *   />
 * )
 */
export function useReducedMotion(): boolean {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    setPrefersReducedMotion(mediaQuery.matches)

    const handler = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches)
    }

    mediaQuery.addEventListener('change', handler)
    return () => mediaQuery.removeEventListener('change', handler)
  }, [])

  return prefersReducedMotion
}

// ============================================
// HIGH CONTRAST HOOK
// ============================================

/**
 * useHighContrast Hook
 * Detects user's preference for high contrast
 * 
 * @example
 * const prefersHighContrast = useHighContrast()
 * 
 * return (
 *   <div className={prefersHighContrast ? 'high-contrast' : ''}>
 *     ...
 *   </div>
 * )
 */
export function useHighContrast(): boolean {
  const [prefersHighContrast, setPrefersHighContrast] = useState(false)

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-contrast: high)')
    setPrefersHighContrast(mediaQuery.matches)

    const handler = (event: MediaQueryListEvent) => {
      setPrefersHighContrast(event.matches)
    }

    mediaQuery.addEventListener('change', handler)
    return () => mediaQuery.removeEventListener('change', handler)
  }, [])

  return prefersHighContrast
}

// ============================================
// DARK MODE HOOK
// ============================================

/**
 * useDarkMode Hook
 * Detects user's color scheme preference
 */
export function useDarkMode(): boolean {
  const [isDarkMode, setIsDarkMode] = useState(true)

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    setIsDarkMode(mediaQuery.matches)

    const handler = (event: MediaQueryListEvent) => {
      setIsDarkMode(event.matches)
    }

    mediaQuery.addEventListener('change', handler)
    return () => mediaQuery.removeEventListener('change', handler)
  }, [])

  return isDarkMode
}

// ============================================
// FOCUS VISIBLE HOOK
// ============================================

/**
 * useFocusVisible Hook
 * Tracks if focus should be visible (keyboard navigation)
 */
export function useFocusVisible(): boolean {
  const [isFocusVisible, setIsFocusVisible] = useState(false)

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Tab') {
        setIsFocusVisible(true)
      }
    }

    const handlePointerDown = () => {
      setIsFocusVisible(false)
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

  return isFocusVisible
}

// ============================================
// KEYBOARD NAVIGATION HOOK
// ============================================

/**
 * useKeyboardNavigation Hook
 * Enhanced keyboard navigation handling
 */
interface UseKeyboardNavigationOptions {
  onEnter?: () => void
  onEscape?: () => void
  onArrowUp?: () => void
  onArrowDown?: () => void
  onArrowLeft?: () => void
  onArrowRight?: () => void
  onHome?: () => void
  onEnd?: () => void
  onSpace?: () => void
}

export function useKeyboardNavigation(options: UseKeyboardNavigationOptions) {
  const { 
    onEnter, 
    onEscape, 
    onArrowUp, 
    onArrowDown, 
    onArrowLeft, 
    onArrowRight,
    onHome,
    onEnd,
    onSpace,
  } = options

  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    switch (event.key) {
      case 'Enter':
        onEnter?.()
        break
      case 'Escape':
        onEscape?.()
        break
      case 'ArrowUp':
        event.preventDefault()
        onArrowUp?.()
        break
      case 'ArrowDown':
        event.preventDefault()
        onArrowDown?.()
        break
      case 'ArrowLeft':
        event.preventDefault()
        onArrowLeft?.()
        break
      case 'ArrowRight':
        event.preventDefault()
        onArrowRight?.()
        break
      case 'Home':
        event.preventDefault()
        onHome?.()
        break
      case 'End':
        event.preventDefault()
        onEnd?.()
        break
      case ' ':
        event.preventDefault()
        onSpace?.()
        break
    }
  }, [onEnter, onEscape, onArrowUp, onArrowDown, onArrowLeft, onArrowRight, onHome, onEnd, onSpace])

  return { handleKeyDown }
}

// ============================================
// ARIA EXPANDED HOOK
// ============================================

/**
 * useAriaExpanded Hook
 * Manages aria-expanded state for expandable components
 */
export function useAriaExpanded(initialState = false) {
  const [isExpanded, setIsExpanded] = useState(initialState)

  const toggle = useCallback(() => {
    setIsExpanded((prev) => !prev)
  }, [])

  const expand = useCallback(() => {
    setIsExpanded(true)
  }, [])

  const collapse = useCallback(() => {
    setIsExpanded(false)
  }, [])

  const setExpanded = useCallback((value: boolean) => {
    setIsExpanded(value)
  }, [])

  return {
    isExpanded,
    toggle,
    expand,
    collapse,
    setExpanded,
    ariaProps: {
      'aria-expanded': isExpanded,
    },
  }
}

// ============================================
// ARIA HIDDEN HOOK
// ============================================

/**
 * useAriaHidden Hook
 * Manages aria-hidden state
 */
export function useAriaHidden(initialState = false) {
  const [isHidden, setIsHidden] = useState(initialState)

  const hide = useCallback(() => setIsHidden(true), [])
  const show = useCallback(() => setIsHidden(false), [])
  const toggle = useCallback(() => setIsHidden((prev) => !prev), [])

  return {
    isHidden,
    hide,
    show,
    toggle,
    ariaProps: {
      'aria-hidden': isHidden,
    },
  }
}

// ============================================
// ARIA PRESSED HOOK
// ============================================

/**
 * useAriaPressed Hook
 * Manages aria-pressed state for toggle buttons
 */
export function useAriaPressed(initialState = false) {
  const [isPressed, setIsPressed] = useState(initialState)

  const toggle = useCallback(() => {
    setIsPressed((prev) => !prev)
  }, [])

  const press = useCallback(() => setIsPressed(true), [])
  const unpress = useCallback(() => setIsPressed(false), [])

  return {
    isPressed,
    toggle,
    press,
    unpress,
    ariaProps: {
      'aria-pressed': isPressed,
    },
  }
}

// ============================================
// ARIA SELECTED HOOK
// ============================================

/**
 * useAriaSelected Hook
 * Manages aria-selected state for selectable items
 */
export function useAriaSelected(initialState = false) {
  const [isSelected, setIsSelected] = useState(initialState)

  const select = useCallback(() => setIsSelected(true), [])
  const deselect = useCallback(() => setIsSelected(false), [])
  const toggle = useCallback(() => setIsSelected((prev) => !prev), [])

  return {
    isSelected,
    select,
    deselect,
    toggle,
    ariaProps: {
      'aria-selected': isSelected,
    },
  }
}

// ============================================
// ID GENERATOR HOOK
// ============================================

/**
 * useUniqueId Hook
 * Generates unique IDs for ARIA attributes
 */
let idCounter = 0

export function useUniqueId(prefix = 'a11y'): string {
  const [id] = useState(() => {
    idCounter += 1
    return `${prefix}-${idCounter}-${Date.now()}`
  })
  return id
}

// ============================================
// DESCRIBED BY HOOK
// ============================================

/**
 * useDescribedBy Hook
 * Manages aria-describedby for form fields
 */
export function useDescribedBy() {
  const descriptionId = useUniqueId('description')
  const errorId = useUniqueId('error')

  const getDescribedBy = useCallback((hasError = false, hasDescription = false): string | undefined => {
    const ids: string[] = []
    if (hasDescription) ids.push(descriptionId)
    if (hasError) ids.push(errorId)
    return ids.length > 0 ? ids.join(' ') : undefined
  }, [descriptionId, errorId])

  return {
    descriptionId,
    errorId,
    getDescribedBy,
  }
}

// ============================================
// LABELLED BY HOOK
// ============================================

/**
 * useLabelledBy Hook
 * Manages aria-labelledby
 */
export function useLabelledBy() {
  const labelId = useUniqueId('label')

  return {
    labelId,
    ariaProps: {
      'aria-labelledby': labelId,
    },
  }
}

// ============================================
// SKIP TO CONTENT HOOK
// ============================================

/**
 * useSkipToContent Hook
 * Handles skip to content functionality
 */
export function useSkipToContent(targetId: string) {
  const skipToContent = useCallback(() => {
    const element = document.getElementById(targetId)
    if (element) {
      element.focus()
      element.scrollIntoView({ behavior: 'smooth' })
    }
  }, [targetId])

  return { skipToContent }
}

// ============================================
// SCREEN READER ANNOUNCEMENT HOOK
// ============================================

/**
 * useScreenReaderAnnouncement Hook
 * Announces messages to screen readers
 */
export function useScreenReaderAnnouncement() {
  const announce = useCallback((message: string, priority: 'polite' | 'assertive' = 'polite') => {
    const event = new CustomEvent('a11y-announce', { 
      detail: { message, priority } 
    })
    window.dispatchEvent(event)
  }, [])

  const announcePolite = useCallback((message: string) => {
    announce(message, 'polite')
  }, [announce])

  const announceAssertive = useCallback((message: string) => {
    announce(message, 'assertive')
  }, [announce])

  return { announce, announcePolite, announceAssertive }
}
