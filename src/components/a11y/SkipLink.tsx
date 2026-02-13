'use client'

// ============================================
// Skip Link Component
// ============================================
// Allows keyboard users to skip to main content

import Link from 'next/link'

interface SkipLinkProps {
  targetId?: string
  className?: string
}

/**
 * SkipLink Component
 * 
 * Provides a keyboard-accessible link to skip navigation and jump to main content.
 * Essential for WCAG compliance and keyboard navigation.
 * 
 * Place this component immediately after the opening <body> tag.
 * The target element should have a matching id.
 * 
 * @example
 * <body>
 *   <SkipLink targetId="main-content" />
 *   <Header />
 *   <main id="main-content">
 *     ...
 *   </main>
 * </body>
 */
export function SkipLink({ targetId = 'main-content', className = '' }: SkipLinkProps) {
  return (
    <Link
      href={`#${targetId}`}
      className={`
        absolute top-0 left-0 z-50
        -translate-y-full
        px-6 py-3
        bg-lago-gold text-lago-black
        font-medium text-sm
        transition-transform duration-200
        focus:translate-y-0 focus:outline-none focus:ring-2 focus:ring-lago-gold focus:ring-offset-2 focus:ring-offset-lago-black
        ${className}
      `}
    >
      Skip to main content
    </Link>
  )
}

/**
 * SkipLinks Component
 * Multiple skip links for complex page structures
 */
interface SkipLinksProps {
  links: Array<{
    targetId: string
    label: string
  }>
  className?: string
}

export function SkipLinks({ links, className = '' }: SkipLinksProps) {
  return (
    <div
      className={`fixed top-0 left-0 z-50 flex flex-col gap-2 ${className}`}
      role="navigation"
      aria-label="Skip links"
    >
      {links.map((link) => (
        <Link
          key={link.targetId}
          href={`#${link.targetId}`}
          className="
            -translate-y-full
            px-6 py-3
            bg-lago-gold text-lago-black
            font-medium text-sm
            transition-transform duration-200
            focus:translate-y-0 focus:outline-none focus:ring-2 focus:ring-lago-gold focus:ring-offset-2 focus:ring-offset-lago-black
          "
        >
          {link.label}
        </Link>
      ))}
    </div>
  )
}

/**
 * MainContent Marker
 * Marks the main content area for skip link targeting
 */
interface MainContentProps {
  children: React.ReactNode
  id?: string
  className?: string
  tabIndex?: number
}

export function MainContent({ 
  children, 
  id = 'main-content', 
  className = '',
  tabIndex = -1 
}: MainContentProps) {
  return (
    <main
      id={id}
      className={className}
      tabIndex={tabIndex}
      role="main"
    >
      {children}
    </main>
  )
}

/**
 * SkipToNavigation
 * Link to skip to navigation (useful when main content comes first)
 */
interface SkipToNavigationProps {
  navId?: string
  className?: string
}

export function SkipToNavigation({ navId = 'main-nav', className = '' }: SkipToNavigationProps) {
  return (
    <Link
      href={`#${navId}`}
      className={`
        absolute top-0 left-0 z-50
        -translate-y-full
        px-6 py-3
        bg-lago-gold text-lago-black
        font-medium text-sm
        transition-transform duration-200
        focus:translate-y-0 focus:outline-none focus:ring-2 focus:ring-lago-gold focus:ring-offset-2 focus:ring-offset-lago-black
        ${className}
      `}
    >
      Skip to navigation
    </Link>
  )
}
