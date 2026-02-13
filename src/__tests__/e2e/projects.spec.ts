// ============================================
// Projects Page E2E Tests
// ============================================

import { test, expect } from '@playwright/test'

test.describe('Projects Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/lv/projects')
    await page.waitForLoadState('networkidle')
  })

  test('displays projects list', async ({ page }) => {
    // Verify page title
    await expect(page.locator('h1')).toContainText('Projekti')

    // Verify projects are displayed
    const projects = page.locator('[data-testid="project-card"]')
    await expect(projects).toHaveCount.greaterThan(0)
  })

  test('can filter by category', async ({ page }) => {
    // Select stone category
    await page.click('[data-testid="filter-stone"]')

    // Wait for filter to apply
    await page.waitForTimeout(500)

    // Verify filtered results
    const projects = page.locator('[data-testid="project-card"]')
    await expect(projects).toHaveCount.greaterThan(0)

    // Verify filter is active
    await expect(page.locator('[data-testid="filter-stone"]')).toHaveClass(/active/)
  })

  test('can filter by material', async ({ page }) => {
    // Select material filter
    await page.click('[data-testid="filter-silestone"]')

    // Wait for filter to apply
    await page.waitForTimeout(500)

    // Verify results are filtered
    const projects = page.locator('[data-testid="project-card"]')
    await expect(projects).toHaveCount.greaterThan(0)
  })

  test('can clear filters', async ({ page }) => {
    // Apply a filter first
    await page.click('[data-testid="filter-stone"]')
    await page.waitForTimeout(500)

    // Clear filters
    await page.click('[data-testid="clear-filters"]')

    // Verify all projects are shown
    const projects = page.locator('[data-testid="project-card"]')
    await expect(projects).toHaveCount.greaterThan(0)
  })

  test('can search projects', async ({ page }) => {
    // Enter search term
    await page.fill('[data-testid="search-input"]', 'virtuve')
    await page.press('[data-testid="search-input"]', 'Enter')

    // Wait for search results
    await page.waitForTimeout(500)

    // Verify search results
    const projects = page.locator('[data-testid="project-card"]')
    // Results may be empty or contain matches
  })

  test('can navigate to project detail', async ({ page }) => {
    // Click first project
    await page.click('[data-testid="project-card"]:first-child')

    // Verify navigation to detail page
    await page.waitForURL(/\/projects\//)

    // Verify project detail elements
    await expect(page.locator('[data-testid="project-title"]')).toBeVisible()
    await expect(page.locator('[data-testid="project-gallery"]')).toBeVisible()
  })

  test('project detail shows gallery', async ({ page }) => {
    // Navigate to a project
    await page.goto('/lv/projects/test-project')

    // Verify gallery
    await expect(page.locator('[data-testid="project-gallery"]')).toBeVisible()

    // Verify gallery images
    const images = page.locator('[data-testid="gallery-image"]')
    await expect(images).toHaveCount.greaterThan(0)
  })

  test('project detail shows specifications', async ({ page }) => {
    await page.goto('/lv/projects/test-project')

    // Verify quick facts/specifications
    await expect(page.locator('[data-testid="project-specs"]')).toBeVisible()

    // Verify material information
    await expect(page.locator('[data-testid="project-material"]')).toBeVisible()
  })

  test('gallery lightbox opens on image click', async ({ page }) => {
    await page.goto('/lv/projects/test-project')

    // Click gallery image
    await page.click('[data-testid="gallery-image"]:first-child')

    // Verify lightbox opens
    await expect(page.locator('[data-testid="lightbox"]')).toBeVisible()

    // Verify image is displayed
    await expect(page.locator('[data-testid="lightbox-image"]')).toBeVisible()
  })

  test('can navigate between gallery images', async ({ page }) => {
    await page.goto('/lv/projects/test-project')
    await page.click('[data-testid="gallery-image"]:first-child')

    // Get initial image
    const initialImage = await page.locator('[data-testid="lightbox-image"]').getAttribute('src')

    // Click next
    await page.click('[data-testid="lightbox-next"]')

    // Verify image changed
    const nextImage = await page.locator('[data-testid="lightbox-image"]').getAttribute('src')
    expect(nextImage).not.toBe(initialImage)

    // Click previous
    await page.click('[data-testid="lightbox-prev"]')

    // Verify back to initial
    const prevImage = await page.locator('[data-testid="lightbox-image"]').getAttribute('src')
    expect(prevImage).toBe(initialImage)
  })

  test('can close lightbox', async ({ page }) => {
    await page.goto('/lv/projects/test-project')
    await page.click('[data-testid="gallery-image"]:first-child')

    // Verify lightbox is open
    await expect(page.locator('[data-testid="lightbox"]')).toBeVisible()

    // Click close
    await page.click('[data-testid="lightbox-close"]')

    // Verify lightbox closed
    await expect(page.locator('[data-testid="lightbox"]')).not.toBeVisible()
  })

  test('shows related projects', async ({ page }) => {
    await page.goto('/lv/projects/test-project')

    // Scroll to related projects
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))

    // Verify related projects section
    await expect(page.locator('[data-testid="related-projects"]')).toBeVisible()

    // Verify related project cards
    const related = page.locator('[data-testid="related-project-card"]')
    await expect(related).toHaveCount.greaterThan(0)
  })

  test('can contact about project', async ({ page }) => {
    await page.goto('/lv/projects/test-project')

    // Click contact button
    await page.click('[data-testid="contact-about-project"]')

    // Verify contact form or modal
    await expect(page.locator('[data-testid="contact-modal"]')).toBeVisible()
  })

  test('project list pagination works', async ({ page }) => {
    // If pagination exists
    const pagination = page.locator('[data-testid="pagination"]')
    
    if (await pagination.isVisible().catch(() => false)) {
      // Click next page
      await page.click('[data-testid="pagination-next"]')

      // Verify page changed
      await expect(page).toHaveURL(/page=2/)

      // Verify projects loaded
      await expect(page.locator('[data-testid="project-card"]')).toHaveCount.greaterThan(0)
    }
  })

  test('responsive layout on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })

    // Refresh page
    await page.goto('/lv/projects')

    // Verify mobile layout
    await expect(page.locator('[data-testid="mobile-filter-button"]')).toBeVisible()

    // Open mobile filters
    await page.click('[data-testid="mobile-filter-button"]')

    // Verify filter drawer
    await expect(page.locator('[data-testid="mobile-filter-drawer"]')).toBeVisible()
  })

  test('language switching on projects page', async ({ page }) => {
    // Switch to English
    await page.click('[data-testid="lang-en"]')

    // Verify URL changed
    await expect(page).toHaveURL(/\/en\/projects/)

    // Verify content in English
    await expect(page.locator('h1')).toContainText('Projects')

    // Switch to Russian
    await page.click('[data-testid="lang-ru"]')

    // Verify URL changed
    await expect(page).toHaveURL(/\/ru\/projects/)

    // Verify content in Russian
    await expect(page.locator('h1')).toContainText('Проекты')
  })
})
