'use client'

// ===================================
// Toast Provider for Notifications
// ===================================

import { Toaster } from 'sonner'

interface ToastProviderProps {
  children: React.ReactNode
}

export function ToastProvider({ children }: ToastProviderProps) {
  return (
    <>
      {children}
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#1a1a1a',
            border: '1px solid #2a2a2a',
            color: '#e8e8e8',
          },
        }}
      />
    </>
  )
}
