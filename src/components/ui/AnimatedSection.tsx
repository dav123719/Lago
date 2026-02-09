'use client'

import { ReactNode } from 'react'
import { useScrollAnimation } from '@/hooks'

interface AnimatedSectionProps {
  children: ReactNode
  className?: string
  animation?: 'fade-up' | 'fade-down' | 'fade-left' | 'fade-right' | 'scale' | 'blur'
  delay?: number
  duration?: number
  threshold?: number
}

export function AnimatedSection({
  children,
  className = '',
  animation = 'fade-up',
  delay = 0,
  duration = 500,
  threshold = 0.05,
}: AnimatedSectionProps) {
  const { ref, isInView } = useScrollAnimation<HTMLDivElement>({ 
    threshold,
    rootMargin: '150px 0px 0px 0px',
  })

  const animationStyles: Record<string, { hidden: string; visible: string }> = {
    'fade-up': {
      hidden: 'opacity-0 translate-y-6',
      visible: 'opacity-100 translate-y-0',
    },
    'fade-down': {
      hidden: 'opacity-0 -translate-y-10',
      visible: 'opacity-100 translate-y-0',
    },
    'fade-left': {
      hidden: 'opacity-0 -translate-x-10',
      visible: 'opacity-100 translate-x-0',
    },
    'fade-right': {
      hidden: 'opacity-0 translate-x-10',
      visible: 'opacity-100 translate-x-0',
    },
    'scale': {
      hidden: 'opacity-0 scale-95',
      visible: 'opacity-100 scale-100',
    },
    'blur': {
      hidden: 'opacity-0 blur-sm',
      visible: 'opacity-100 blur-0',
    },
  }

  const { hidden, visible } = animationStyles[animation]

  return (
    <div
      ref={ref}
      className={`transition-all ease-out ${isInView ? visible : hidden} ${className}`}
      style={{
        transitionDuration: `${duration}ms`,
        transitionDelay: `${delay}ms`,
        // PERFORMANCE: Use will-change only when animating to reduce layout calculations
        willChange: isInView ? 'transform, opacity' : 'auto',
      }}
    >
      {children}
    </div>
  )
}

// Staggered children animation wrapper
interface StaggeredContainerProps {
  children: ReactNode
  className?: string
  staggerDelay?: number
  animation?: 'fade-up' | 'fade-down' | 'fade-left' | 'fade-right' | 'scale'
}

export function StaggeredContainer({
  children,
  className = '',
  staggerDelay = 100,
  animation = 'fade-up',
}: StaggeredContainerProps) {
  const { ref, isInView } = useScrollAnimation({ 
    threshold: 0.05,
    rootMargin: '150px 0px 0px 0px',
  })

  return (
    <div
      ref={ref}
      className={className}
      style={{
        // @ts-expect-error - CSS custom property
        '--stagger-delay': `${staggerDelay}ms`,
      }}
      data-animation={animation}
      data-in-view={isInView}
    >
      {children}
    </div>
  )
}

// Individual staggered item
interface StaggeredItemProps {
  children: ReactNode
  className?: string
  index: number
}

export function StaggeredItem({ children, className = '', index }: StaggeredItemProps) {
  return (
    <div
      className={`stagger-item ${className}`}
      style={{ transitionDelay: `${index * 100}ms` }}
    >
      {children}
    </div>
  )
}

