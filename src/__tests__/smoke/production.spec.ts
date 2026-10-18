import { test, expect } from '@playwright/test'

for (const locale of ['lv', 'en', 'ru']) {
  test(`${locale} home renders and navigation works without browser exceptions`, async ({ page }) => {
    const errors: string[] = []
    page.on('pageerror', error => errors.push(error.message))
    const response = await page.goto(`/${locale}/`)
    expect(response?.status()).toBe(200)
    await expect(page.locator('main')).toHaveCount(1)
    await expect(page.locator('main')).toBeVisible()
    await expect(page.locator('h1')).toHaveCount(1)
    await expect(page.locator('h1')).toBeVisible()
    await expect(page.locator('header')).toBeVisible()
    const image = page.locator('img').first()
    await expect(image).toBeVisible()
    await expect.poll(() => image.evaluate((node: HTMLImageElement) => node.naturalWidth)).toBeGreaterThan(0)
    await page.locator(`header a[href="/${locale}/store/"]`).first().click()
    await expect(page).toHaveURL(new RegExp(`/${locale}/store/?$`))
    await expect(page.locator('main')).toBeVisible()
    expect(errors).toEqual([])
  })
}

test('health endpoint reports readiness', async ({ request }) => {
  const response = await request.get('/api/health/')
  expect(response.status()).toBe(200)
  expect(await response.json()).toEqual({ status: 'ok' })
})

test('home image assets exist, including images below the fold', async ({ page, request }) => {
  await page.goto('/lv/')
  const sources = await page.locator('img').evaluateAll(images =>
    [...new Set(images.map(image => image.getAttribute('src')).filter((src): src is string => !!src && src.startsWith('/')))]
  )
  expect(sources.length).toBeGreaterThan(5)
  for (const source of sources) {
    const response = await request.get(source)
    expect(response.status(), source).toBe(200)
    expect(response.headers()['content-type'], source).toMatch(/^image\//)
  }
})

test('unknown URL returns HTTP 404', async ({ request }) => {
  const response = await request.get('/lv/nonexistent-deployment-smoke-route/')
  expect(response.status()).toBe(404)
})

test('anonymous user cannot access admin dashboard', async ({ request }) => {
  const response = await request.get('/admin/dashboard/', { maxRedirects: 0 })
  expect([302, 303, 307, 308, 401, 403]).toContain(response.status())
  if (response.status() < 400) expect(response.headers().location).toMatch(/login|account|auth/)
})
