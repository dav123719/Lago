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
    await expect(page.locator('h1').first()).toBeVisible()
    await expect(page.getByRole('banner')).toBeVisible()
    const image = page.locator('img').first()
    await expect(image).toBeVisible()
    await expect.poll(() => image.evaluate((node: HTMLImageElement) => node.naturalWidth)).toBeGreaterThan(0)
    await page.locator(`header a[href="/${locale}/store/"]`).first().click()
    await expect(page).toHaveURL(new RegExp(`/${locale}/store/?$`))
    await expect(page.locator('main')).toBeVisible()
    expect(errors).toEqual([])
  })

  test(`${locale} homepage explains and links all four materials`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto(`/${locale}/`)
    const section = page.locator('#materials')
    await expect(section).toBeVisible()
    await expect(section.locator('article')).toHaveCount(4)
    await expect(section.getByRole('heading', { name: 'Silestone' })).toBeVisible()
    await expect(section.getByRole('heading', { name: 'Dekton' })).toBeVisible()
    await expect(section.locator('article dl dt')).toHaveCount(12)
    for (const image of await section.locator('article img').all()) {
      await image.scrollIntoViewIfNeeded()
      await expect.poll(() => image.evaluate((node: HTMLImageElement) => node.naturalWidth)).toBeGreaterThan(0)
    }
    const sectionWidth = await section.evaluate(element => element.scrollWidth)
    const viewportWidth = await page.evaluate(() => document.documentElement.clientWidth)
    expect(sectionWidth).toBeLessThanOrEqual(viewportWidth)
    await expect(section.getByRole('link', { name: /Silestone/ }).first()).toHaveAttribute('href', new RegExp(`/${locale}/.*silestone/`))
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
