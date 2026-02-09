'use client'

import { useState, useRef, useCallback, useEffect } from 'react'

interface MousePosition {
  x: number
  y: number
}

interface UseMouseGlowOptions {
  enabled?: boolean
  throttleMs?: number
}

export function useMouseGlow({ enabled = true, throttleMs = 16 }: UseMouseGlowOptions = {}) {
  const [mousePosition, setMousePosition] = useState<MousePosition>({ x: 50, y: 50 })
  const [isHovered, setIsHovered] = useState(false)
  const elementRef = useRef<HTMLElement>(null)
  const rafRef = useRef<number | null>(null)
  const lastUpdateRef = useRef<number>(0)

  const updateMousePosition = useCallback((e: React.MouseEvent<HTMLElement>) => {
    if (!enabled || !elementRef.current) return

    const now = Date.now()
    if (now - lastUpdateRef.current < throttleMs) return

    const rect = elementRef.current.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100

    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current)
    }

    rafRef.current = requestAnimationFrame(() => {
      setMousePosition({ x, y })
      lastUpdateRef.current = now
    })
  }, [enabled, throttleMs])

  const handleMouseEnter = useCallback((e: React.MouseEvent<HTMLElement>) => {
    setIsHovered(true)
    updateMousePosition(e)
  }, [updateMousePosition])

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLElement>) => {
    if (isHovered) {
      updateMousePosition(e)
    }
  }, [isHovered, updateMousePosition])

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false)
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current)
    }
  }, [])

  useEffect(() => {
    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current)
      }
    }
  }, [])

  return {
    elementRef,
    mousePosition,
    isHovered,
    handleMouseEnter,
    handleMouseMove,
    handleMouseLeave,
  }
}

