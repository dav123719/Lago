// ============================================
// Test Render Utilities
// ============================================
// Custom render wrapper for tests

import React, { ReactElement } from 'react'
import { render, RenderOptions, RenderResult } from '@testing-library/react'
import { vi } from 'vitest'

// Mock contexts/providers for tests
interface AllTheProvidersProps {
  children: React.ReactNode
}

function AllTheProviders({ children }: AllTheProvidersProps) {
  // Add any context providers needed for tests
  return (
    <>
      {children}
    </>
  )
}

/**
 * Custom render function that wraps components with necessary providers
 */
function customRender(
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
): RenderResult {
  return render(ui, { wrapper: AllTheProviders, ...options })
}

// Re-export everything from testing-library
export * from '@testing-library/react'

// Override render method
export { customRender as render }

/**
 * Create a mock component for testing
 */
export function createMockComponent(name: string) {
  const MockComponent = (props: any) => (
    <div data-testid={`mock-${name.toLowerCase()}`} {...props}>
      {name}
    </div>
  )
  MockComponent.displayName = `Mock${name}`
  return MockComponent
}

/**
 * Wait for a specific amount of time
 */
export function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * Create a deferred promise for async testing
 */
export function createDeferred<T>() {
  let resolve: (value: T) => void
  let reject: (error: Error) => void

  const promise = new Promise<T>((res, rej) => {
    resolve = res
    reject = rej
  })

  return { promise, resolve: resolve!, reject: reject! }
}
