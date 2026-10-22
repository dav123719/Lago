import { defineConfig, devices } from '@playwright/test'

// Read-only checks against an already running production build.
export default defineConfig({
  testDir: './src/__tests__/smoke',
  outputDir: 'test-results/smoke',
  workers: 1,
  reporter: 'list',
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL || 'http://127.0.0.1:3100',
    ...devices['Desktop Chrome'],
    screenshot: 'only-on-failure',
  },
})
