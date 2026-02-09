'use client'

import React, { useState, useRef } from 'react'
import Link from 'next/link'

// Simplified cn function (can use clsx + tailwind-merge when installed)
function cn(...classes: (string | undefined | null | false)[]) {
  return classes.filter(Boolean).join(' ')
}

type ButtonVariant = 'default' | 'solid' | 'outline' | 'ghost' | 'dark' | 'light'
type ButtonSize = 'sm' | 'default' | 'lg' | 'xl'

const variantStyles: Record<ButtonVariant, string> = {
  // Primary - Gold neon effect
  default: 'bg-lago-gold/10 hover:bg-lago-gold/5 border-lago-gold/30 text-lago-gold hover:text-lago-gold-light',
  // Solid gold button
  solid: 'bg-lago-gold/85 hover:bg-lago-gold/75 text-lago-black border-2 border-white/40 hover:border-white/60 hover:shadow-lg hover:shadow-lago-gold/30 backdrop-blur-sm',
  // Outline style
  outline: 'bg-transparent border-lago-gold/50 text-lago-gold hover:bg-lago-gold/10 hover:border-lago-gold',
  // Ghost - minimal style
  ghost: 'border-transparent bg-transparent hover:border-lago-gold/30 hover:bg-white/5 text-lago-light hover:text-white',
  // Dark solid
  dark: 'bg-lago-charcoal hover:bg-lago-dark border-lago-stone/30 text-white hover:border-lago-gold/30',
  // White/Light variant
  light: 'bg-white/10 hover:bg-white/20 border-white/20 text-white hover:border-white/40',
}

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'px-4 py-2 text-xs',
  default: 'px-6 py-2.5 text-sm',
  lg: 'px-8 py-3.5 text-base',
  xl: 'px-10 py-4 text-lg',
}

export interface NeonButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  neon?: boolean
  href?: string
  children: React.ReactNode
  variant?: ButtonVariant
  size?: ButtonSize
}

const NeonButton = React.forwardRef<HTMLButtonElement, NeonButtonProps>(
  ({ className, neon = true, size = 'default', variant = 'default', children, href, onClick, ...props }, ref) => {
    const buttonRef = useRef<HTMLButtonElement | HTMLAnchorElement>(null)
    const [mousePosition, setMousePosition] = useState({ x: 50, y: 50 })
    const [isHovered, setIsHovered] = useState(false)

    const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement | HTMLAnchorElement>) => {
      if (!buttonRef.current) return
      const rect = buttonRef.current.getBoundingClientRect()
      const x = ((e.clientX - rect.left) / rect.width) * 100
      const y = ((e.clientY - rect.top) / rect.height) * 100
      setMousePosition({ x, y })
    }

    const baseStyles = 'relative group border text-center rounded-xl font-button font-semibold transition-all duration-300 inline-flex items-center justify-center gap-2 overflow-hidden'
    const combinedStyles = cn(baseStyles, variantStyles[variant], sizeStyles[size], className)

    const content = (
      <>
        {/* Top neon glow line - appears on hover */}
        <span
          className={cn(
            'absolute h-px opacity-0 group-hover:opacity-100 transition-all duration-500 ease-out inset-x-0 top-0 bg-gradient-to-r w-3/4 mx-auto from-transparent via-lago-gold to-transparent',
            !neon && 'hidden'
          )}
        />
        
        {/* Dynamic gloss/shine effect that follows mouse */}
        <div
          className={cn(
            'absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-250 pointer-events-none',
            !neon && 'hidden'
          )}
          style={{
            background: `radial-gradient(circle 150px at ${mousePosition.x}% ${mousePosition.y}%, rgba(255, 255, 255, 0.2) 0%, rgba(255, 255, 255, 0.05) 40%, transparent 70%)`,
            transform: `translate(${(mousePosition.x - 50) * 0.1}px, ${(mousePosition.y - 50) * 0.1}px)`,
            transition: isHovered ? 'background 0.1s ease-out, transform 0.1s ease-out' : 'opacity 0.25s ease-out',
            willChange: 'background, transform',
          }}
        />
        
        {/* Subtle glow effect that follows mouse */}
        <div
          className={cn(
            'absolute inset-0 rounded-xl opacity-0 group-hover:opacity-60 transition-opacity duration-250 pointer-events-none blur-xl',
            !neon && 'hidden'
          )}
          style={{
            background: `radial-gradient(circle 100px at ${mousePosition.x}% ${mousePosition.y}%, rgba(201, 169, 98, 0.4) 0%, transparent 60%)`,
            transform: `translate(${(mousePosition.x - 50) * 0.15}px, ${(mousePosition.y - 50) * 0.15}px)`,
            transition: isHovered ? 'background 0.15s ease-out, transform 0.15s ease-out' : 'opacity 0.25s ease-out',
            willChange: 'background, transform',
          }}
        />
        
        {/* Button content */}
        <span className="relative z-10 flex items-center gap-2">{children}</span>
        
        {/* Bottom neon glow line - always slightly visible, brighter on hover */}
        <span
          className={cn(
            'absolute group-hover:opacity-60 opacity-30 transition-all duration-500 ease-out inset-x-0 h-px -bottom-px bg-gradient-to-r w-3/4 mx-auto from-transparent via-lago-gold to-transparent',
            !neon && 'hidden'
          )}
        />
        
        {/* Ambient glow effect on hover */}
        <span
          className={cn(
            'absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-xl bg-gradient-to-t from-lago-gold/10 to-transparent pointer-events-none',
            !neon && 'hidden'
          )}
        />
      </>
    )

    if (href) {
      return (
        <Link
          ref={buttonRef as React.Ref<HTMLAnchorElement>}
          href={href}
          className={combinedStyles}
          onClick={onClick as unknown as React.MouseEventHandler<HTMLAnchorElement>}
          onMouseEnter={(e) => {
            setIsHovered(true)
            handleMouseMove(e as unknown as React.MouseEvent<HTMLAnchorElement>)
          }}
          onMouseMove={handleMouseMove as unknown as React.MouseEventHandler<HTMLAnchorElement>}
          onMouseLeave={() => setIsHovered(false)}
        >
          {content}
        </Link>
      )
    }

    return (
      <button
        ref={(node) => {
          if (buttonRef) {
            (buttonRef as React.MutableRefObject<HTMLButtonElement | HTMLAnchorElement | null>).current = node
          }
          if (typeof ref === 'function') ref(node)
          else if (ref) (ref as React.MutableRefObject<HTMLButtonElement | null>).current = node
        }}
        className={combinedStyles}
        onClick={onClick}
        onMouseEnter={(e) => {
          setIsHovered(true)
          handleMouseMove(e)
        }}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setIsHovered(false)}
        {...props}
      >
        {content}
      </button>
    )
  }
)

NeonButton.displayName = 'NeonButton'

export { NeonButton }
