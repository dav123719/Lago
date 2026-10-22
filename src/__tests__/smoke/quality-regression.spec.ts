import { expect, test, type Page } from '@playwright/test'

// These checks are safe against a production build: auth submission and catalog
// responses are intercepted. They never create accounts, send mail or write data.
async function openLogin(page: Page) {
  await page.goto('/en/')
  await page.getByRole('button', { name: 'Login', exact: true }).first().hover()
  await page.getByRole('button', { name: 'Continue with Email', exact: true }).click()
  await expect(page.getByRole('heading', { name: 'Login', exact: true })).toBeVisible()
}

test('anonymous account and admin responses cannot be shared by public caches', async ({ request }) => {
  for (const path of ['/lv/account/', '/en/account/', '/ru/account/', '/admin/profiles/']) {
    const response = await request.get(path, { maxRedirects: 0 })
    expect([302, 303, 307, 308, 401, 403], path).toContain(response.status())
    expect(response.headers()['cache-control'], path).toMatch(/private.*no-store|no-store.*private/)
  }
  const response = await request.get('/api/admin/profiles/')
  expect(response.status()).toBe(401)
  expect(response.headers()['cache-control']).toMatch(/private.*no-store|no-store.*private/)
  expect(response.headers()['cdn-cache-control']).toBe('no-store')
  expect(await response.json()).toEqual({ error: 'Authentication required' })
})

test('admin mutations reject anonymous and cross-origin requests before data changes', async ({ request }) => {
  const anonymous = await request.patch('/api/admin/profiles/', { data: {} })
  expect(anonymous.status()).toBe(401)
  expect(anonymous.headers()['cache-control']).toContain('no-store')
  const publicOrigin = await request.patch('/api/admin/profiles/', { headers: { origin: 'https://lago.lv' }, data: {} })
  expect(publicOrigin.status()).toBe(401)
  const crossOrigin = await request.patch('/api/admin/profiles/', {
    headers: { origin: 'https://untrusted.invalid' }, data: {},
  })
  expect(crossOrigin.status()).toBe(403)
  expect(await crossOrigin.json()).toEqual({ error: 'Invalid request origin' })
})

test('lazy login gives feedback, handles rejection and closes with Escape', async ({ page }) => {
  const errors: string[] = []
  page.on('pageerror', error => errors.push(error.message))
  let release: (() => void) | undefined
  const gate = new Promise<void>(resolve => { release = resolve })
  await page.route('**/auth/v1/token?grant_type=password', async route => {
    await gate
    await route.fulfill({ status: 400, contentType: 'application/json', body: JSON.stringify({ code: 'invalid_credentials', message: 'Invalid login credentials' }) })
  })
  await openLogin(page)
  await page.getByLabel('Email', { exact: true }).fill('controlled-test@example.invalid')
  await page.getByLabel('Password', { exact: true }).fill('Invalid-test-password')
  await page.getByRole('button', { name: 'Login', exact: true }).last().click()
  await expect(page.getByRole('button', { name: 'Logging in...' })).toBeDisabled()
  release?.()
  await expect(page.getByText('Error. Please check your credentials and try again.', { exact: true })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Login', exact: true }).last()).toBeEnabled()
  await page.keyboard.press('Escape')
  await expect(page.getByRole('heading', { name: 'Login', exact: true })).toHaveCount(0)
  await expect.poll(() => page.evaluate(() => document.body.style.overflow)).toBe('')
  expect(errors).toEqual([])
})

test('recovery request presents generic feedback with a mocked mail endpoint', async ({ page }) => {
  let requests = 0
  await page.route('**/auth/v1/recover**', async route => {
    requests++
    await route.fulfill({ status: 200, contentType: 'application/json', body: '{}' })
  })
  await openLogin(page)
  await page.getByRole('button', { name: 'Forgot password?', exact: true }).click()
  await expect(page.getByRole('dialog')).toBeVisible()
  await page.getByLabel('Email', { exact: true }).fill('controlled-test@example.invalid')
  await page.getByRole('button', { name: 'Send reset link', exact: true }).click()
  await expect(page.getByRole('status').filter({ hasText: 'If an account exists for this email' })).toBeVisible()
  expect(requests).toBe(1)
})

test('invalid recovery and OAuth callbacks never expose a password update form or external redirect', async ({ page }) => {
  for (const query of ['?locale=en&invalid=1', '?locale=en']) {
    const response = await page.goto(`/auth/reset-password/${query}`)
    expect(response?.headers()['cache-control']).toContain('no-store')
    await expect(page.getByRole('alert').filter({ hasText: 'invalid or expired' })).toBeVisible()
    await expect(page.locator('input[type="password"]')).toHaveCount(0)
    await expect(page.getByRole('link', { name: 'Request a new reset link' })).toHaveAttribute('href', /^\/auth\/forgot-password\/?\?locale=en$/)
  }
  await page.goto('/auth/callback/?locale=en&flow=recovery&error=access_denied&next=https%3A%2F%2Funtrusted.invalid')
  await expect(page).toHaveURL(/\/auth\/reset-password\/?\?locale=en&invalid=1/)
  await expect(page.getByRole('alert').filter({ hasText: 'invalid or expired' })).toBeVisible()
})

function product(name: string) {
  return {
    id: `controlled-${name}`, slug: name.toLowerCase(), sku: name,
    name: { lv: name, en: name, ru: name }, images: [], tags: [],
    basePrice: 100, stockQuantity: 5, stockStatus: 'in_stock', status: 'active',
    lowStockThreshold: 2, isFeatured: false, createdAt: '2026-01-01', updatedAt: '2026-01-01',
  }
}

test('store deep links, stale requests and history restore meaningful results without shell reloads', async ({ page }) => {
  const documents: string[] = []
  const queries: string[] = []
  page.on('request', request => { if (request.isNavigationRequest() && request.frame() === page.mainFrame()) documents.push(request.url()) })
  await page.route('**/api/products?**', async route => {
    const search = new URL(route.request().url()).searchParams.get('search') || 'initial'
    queries.push(search)
    if (search === 'slow') await new Promise(resolve => setTimeout(resolve, 900))
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ products: [product(search)], total: 1, hasMore: false }) }).catch(() => {})
  })
  await page.route('**/rest/v1/products?**', route => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ stock_quantity: 5, stock_status: 'in_stock' }) }))
  await page.goto('/en/store/?search=initial&sort=price_asc')
  const input = page.getByRole('textbox', { name: 'Search...', exact: true })
  await expect(input).toHaveValue('initial')
  await expect(page.getByRole('link', { name: /initial/ }).first()).toBeVisible()
  await expect(page.getByRole('button', { name: 'Price: Low to High', exact: true })).toBeVisible()
  await input.fill('slow')
  await expect.poll(() => queries.includes('slow')).toBe(true)
  await input.fill('fast')
  await expect(input).toHaveValue('fast')
  await expect(page.getByRole('link', { name: /fast/ }).first()).toBeVisible()
  await expect(page).toHaveURL(/search=fast/)
  await page.waitForTimeout(1000) // Let the obsolete response attempt to complete.
  await expect(page.getByRole('link', { name: /slow/ })).toHaveCount(0)
  await page.goBack()
  await expect(input).toHaveValue('slow')
  await expect(page.getByRole('link', { name: /slow/ }).first()).toBeVisible()
  expect(documents).toHaveLength(1)
})

test('every public sitemap URL remains reachable and indexable', async ({ request }) => {
  test.setTimeout(90_000)
  const sitemap = await request.get('/sitemap.xml')
  expect(sitemap.status()).toBe(200)
  const xml = await sitemap.text()
  const urls = [...new Set([...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(match => match[1]))]
  expect(urls.length).toBeGreaterThan(30)
  // Small batches limit pressure on a live server. This is route correctness,
  // not a production load test or a substitute for rendered browser coverage.
  for (let offset = 0; offset < urls.length; offset += 3) {
    await Promise.all(urls.slice(offset, offset + 3).map(async url => {
      const path = new URL(url).pathname
      const response = await request.get(path)
      expect(response.status(), path).toBe(200)
      const html = await response.text()
      expect(html, path).toContain('rel="canonical"')
      expect(html, path).not.toMatch(/<meta[^>]*name="robots"[^>]*content="[^"]*noindex/)
    }))
  }
})

test('store uses a real page heading and responsive sidebar without overriding breakpoint utilities', async ({ page }) => {
  await page.route('**/api/products?**', route => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ products: [], total: 0, hasMore: false }) }))
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto('/en/store/')
  await expect(page.locator('main h1')).toHaveCount(1)
  const toggle = page.getByRole('button', { name: 'Filters', exact: true, includeHidden: true })
  await expect(toggle).toBeHidden()
  const sidebar = await page.locator('main aside').boundingBox()
  const sort = await page.getByRole('button', { name: 'Featured', exact: true }).boundingBox()
  expect(sidebar).not.toBeNull()
  expect(sort).not.toBeNull()
  expect(sort!.x).toBeGreaterThan(sidebar!.x + sidebar!.width)
  expect(Math.abs(sort!.y - sidebar!.y)).toBeLessThan(40)
  await page.setViewportSize({ width: 390, height: 844 })
  await expect(toggle).toBeVisible()
  await toggle.click()
  await expect(toggle).toHaveAttribute('aria-expanded', 'true')
  await expect(page.getByRole('spinbutton', { name: 'Minimum price', exact: true })).toBeVisible()
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(390)
})
