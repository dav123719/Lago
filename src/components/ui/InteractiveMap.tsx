// ============================================
// Interactive Map Component
// ============================================

'use client'

import { ReactNode } from 'react'

interface InteractiveMapProps {
  children?: ReactNode
}

export function InteractiveMap({ children }: InteractiveMapProps) {
  return (
    <div className="w-full h-full">
      {children}
    </div>
  )
}
