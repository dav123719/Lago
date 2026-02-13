'use client'

// ============================================
// Screen Reader Announcer Component
// ============================================
// Announces dynamic content changes to screen readers

import { useEffect, useState, useCallback } from 'react'

interface AnnouncerProps {
  politeness?: 'polite' | 'assertive'
  className?: string
}

/**
 * Announcer Component
 * 
 * Provides aria-live regions for screen reader announcements.
 * Place this component at the app root level.
 * 
 * @example
 * // In layout.tsx
 * <body>
 *   <Announcer />
 *   ...
 * </body>
 * 
 * // In components
 * const { announce } = useAnnouncer()
 * announce('Item added to cart')
 */
export function Announcer({ 
  politeness = 'polite',
  className = 'sr-only' 
}: AnnouncerProps) {
  const [messages, setMessages] = useState<{ id: number; text: string }[]>([])

  useEffect(() => {
    // Listen for custom announce events
    const handleAnnounce = (event: CustomEvent<string>) => {
      const newMessage = {
        id: Date.now(),
        text: event.detail,
      }
      setMessages((prev) => [...prev.slice(-2), newMessage])

      // Clear message after screen reader has had time to read it
      setTimeout(() => {
        setMessages((prev) => prev.filter((m) => m.id !== newMessage.id))
      }, 1000)
    }

    window.addEventListener('a11y-announce' as any, handleAnnounce)
    return () => window.removeEventListener('a11y-announce' as any, handleAnnounce)
  }, [])

  return (
    <div
      aria-live={politeness}
      aria-atomic="true"
      className={className}
      role="status"
    >
      {messages.map((message) => (
        <span key={message.id}>{message.text}</span>
      ))}
    </div>
  )
}

/**
 * useAnnouncer Hook
 * Hook for making announcements
 * 
 * @example
 * const { announce, announcePolite, announceAssertive } = useAnnouncer()
 * 
 * // Polite announcement (waits for current speech to finish)
 * announcePolite('Your cart has been updated')
 * 
 * // Assertive announcement (interrupts current speech)
 * announceAssertive('Error: Please check your input')
 */
export function useAnnouncer() {
  const announce = useCallback((message: string, politeness: 'polite' | 'assertive' = 'polite') => {
    const event = new CustomEvent(`a11y-announce`, { detail: message })
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

/**
 * LiveRegion Component
 * Component for announcing content changes
 */
interface LiveRegionProps {
  children: React.ReactNode
  politeness?: 'polite' | 'assertive'
  label?: string
  className?: string
}

export function LiveRegion({ 
  children, 
  politeness = 'polite',
  label,
  className = '' 
}: LiveRegionProps) {
  return (
    <div
      aria-live={politeness}
      aria-atomic="true"
      aria-label={label}
      className={className}
      role="status"
    >
      {children}
    </div>
  )
}

/**
 * Alert Component
 * Assertive announcement for important messages
 */
interface AlertProps {
  children: React.ReactNode
  className?: string
}

export function Alert({ children, className = '' }: AlertProps) {
  return (
    <div
      role="alert"
      aria-live="assertive"
      aria-atomic="true"
      className={className}
    >
      {children}
    </div>
  )
}

/**
 * Status Component
 * Polite announcement for status updates
 */
interface StatusProps {
  children: React.ReactNode
  className?: string
}

export function Status({ children, className = '' }: StatusProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-atomic="true"
      className={className}
    >
      {children}
    </div>
  )
}

/**
 * VisuallyHidden Component
 * Hides content visually but keeps it accessible to screen readers
 */
interface VisuallyHiddenProps {
  children: React.ReactNode
  className?: string
}

export function VisuallyHidden({ children, className = '' }: VisuallyHiddenProps) {
  return (
    <span
      className={`
        absolute w-px h-px p-0 -m-px
        overflow-hidden whitespace-nowrap
        border-0 clip-[rect(0,0,0,0)]
        ${className}
      `}
      style={{
        position: 'absolute',
        width: '1px',
        height: '1px',
        padding: '0',
        margin: '-1px',
        overflow: 'hidden',
        clip: 'rect(0, 0, 0, 0)',
        whiteSpace: 'nowrap',
        border: '0',
      }}
    >
      {children}
    </span>
  )
}
