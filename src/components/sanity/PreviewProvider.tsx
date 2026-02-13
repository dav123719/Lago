// ============================================
// Preview Provider Component
// ============================================
// Provides live preview context for Sanity drafts

'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { SanityProject } from '@/lib/sanity/types'

interface PreviewContextType {
  enabled: boolean
  data: SanityProject | null
  isLoading: boolean
  error: Error | null
}

const PreviewContext = createContext<PreviewContextType>({
  enabled: false,
  data: null,
  isLoading: false,
  error: null,
})

export function usePreview() {
  return useContext(PreviewContext)
}

interface PreviewProviderProps {
  children: ReactNode
  initialEnabled?: boolean
  projectId?: string
}

export function PreviewProvider({ 
  children, 
  initialEnabled = false,
  projectId 
}: PreviewProviderProps) {
  const [enabled, setEnabled] = useState(initialEnabled)
  const [data, setData] = useState<SanityProject | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (!enabled || !projectId) return

    // Set up real-time subscription to Sanity
    const eventSource = new EventSource(
      `/api/preview?project=${projectId}&token=${process.env.SANITY_PREVIEW_SECRET}`
    )

    eventSource.onmessage = (event) => {
      try {
        const update = JSON.parse(event.data)
        if (update.type === 'update') {
          setData(update.document)
        }
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to parse preview update'))
      }
    }

    eventSource.onerror = () => {
      setError(new Error('Preview connection error'))
      eventSource.close()
    }

    return () => {
      eventSource.close()
    }
  }, [enabled, projectId])

  // Fetch initial draft data
  useEffect(() => {
    if (!enabled || !projectId) return

    const fetchDraft = async () => {
      setIsLoading(true)
      try {
        const response = await fetch(`/api/preview?project=${projectId}&token=${process.env.SANITY_PREVIEW_SECRET}`)
        if (!response.ok) throw new Error('Failed to fetch draft')
        const draft = await response.json()
        setData(draft)
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch draft'))
      } finally {
        setIsLoading(false)
      }
    }

    fetchDraft()
  }, [enabled, projectId])

  return (
    <PreviewContext.Provider value={{ enabled, data, isLoading, error }}>
      {children}
    </PreviewContext.Provider>
  )
}

// Preview banner component
interface PreviewBannerProps {
  onExit: () => void
}

export function PreviewBanner({ onExit }: PreviewBannerProps) {
  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-lago-gold text-lago-black px-4 py-2 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <span className="inline-block w-2 h-2 bg-red-500 rounded-full animate-pulse" />
        <span className="font-medium text-sm">
          Preview Mode - Draft Content
        </span>
      </div>
      <button
        onClick={onExit}
        className="text-sm font-medium hover:underline px-3 py-1 bg-lago-black/10 rounded-md hover:bg-lago-black/20 transition-colors"
      >
        Exit Preview
      </button>
    </div>
  )
}

// Wrapper for preview mode pages
interface PreviewWrapperProps {
  children: ReactNode
  preview: boolean
  onExitPreview: () => void
}

export function PreviewWrapper({ children, preview, onExitPreview }: PreviewWrapperProps) {
  return (
    <>
      {preview && <PreviewBanner onExit={onExitPreview} />}
      <div className={preview ? 'pt-10' : ''}>
        {children}
      </div>
    </>
  )
}
