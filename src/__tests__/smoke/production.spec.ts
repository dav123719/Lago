import { test, expect } from '@playwright/test'

for (const locale of ['lv', 'en', 'ru']) {
  test(`${locale} home renders and navigation works without browser exceptions`, async ({ page }) => {
    const errors: string[] = []
    page.on('pageerror', error => errors.push(error.message))
    const response = await page.goto(`/${locale}/`)
    expect(response?.status()).toBe(200)
    await expect(page.locator('html')).toHaveAttribute('lang', locale)
    await expect(page.locator('main')).toHaveCount(1)
    await expect(page.locator('main')).toBeVisible()
    await expect(page.locator('h1')).toHaveCount(1)
    await expect(page.locator('h1').first()).toBeVisible()
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', new RegExp(`/${locale}/?$`))
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
    const section = page.locator('main #materials:visible').first()
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

  test(`${locale} applications guide is indexable and keeps material pages linked`, async ({ page }) => {
    const browserErrors: string[] = []
    page.on('pageerror', error => browserErrors.push(error.message))
    const stoneBase = locale === 'lv' ? 'akmens-virsmas' : locale === 'ru' ? 'kamennye-poverhnosti' : 'stone-surfaces'
    const response = await page.goto(`/${locale}/${stoneBase}/`)
    expect(response?.status()).toBe(200)
    await expect(page.locator('h1:visible').first()).toBeVisible()
    await expect(page.locator('#kitchen-worktops:visible').first()).toBeVisible()
    await expect(page.locator('#bathroom-surfaces:visible').first()).toBeVisible()
    await expect(page.locator('#wall-panels:visible').first()).toBeVisible()
    await expect(page.locator('#material-comparison:visible article')).toHaveCount(4)
    const canonical = page.locator('link[rel="canonical"]')
    await expect(canonical).toHaveAttribute('href', new RegExp(`/${locale}/${stoneBase}/?$`))
    await expect(page.locator('link[rel="alternate"][hreflang="lv"]')).toHaveAttribute('href', /\/lv\/akmens-virsmas\/$/)
    const materialPath = locale === 'lv' ? 'granits' : locale === 'ru' ? 'granit' : 'granite'
    await expect(page.locator(`#material-comparison:visible a[href*="${materialPath}"]`)).toHaveCount(1)
    for (const width of [390, 768, 1440]) {
      await page.setViewportSize({ width, height: 900 })
      const documentWidth = await page.evaluate(() => document.documentElement.scrollWidth)
      const viewportWidth = await page.evaluate(() => document.documentElement.clientWidth)
      expect(documentWidth, `${locale} application guide at ${width}px`).toBeLessThanOrEqual(viewportWidth)
    }
    expect(browserErrors).toEqual([])
  })

  test(`${locale} material detail URLs remain valid with distinct canonical metadata`, async ({ page }) => {
    const stoneBase = locale === 'lv' ? 'akmens-virsmas' : locale === 'ru' ? 'kamennye-poverhnosti' : 'stone-surfaces'
    const materialSlugs = locale === 'lv'
      ? ['silestone', 'dekton', 'granits', 'marmors']
      : locale === 'ru'
      ? ['silestone', 'dekton', 'granit', 'mramor']
      : ['silestone', 'dekton', 'granite', 'marble']
    for (const slug of materialSlugs) {
      const path = `/${locale}/${stoneBase}/${slug}/`
      const response = await page.goto(path)
      expect(response?.status(), path).toBe(200)
      await expect(page.locator('h1:visible').first()).toBeVisible()
      await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', /.+/)
      await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', new RegExp(`${stoneBase}/${slug}/?$`))
    }
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

test('sitemap contains current localized public routes and valid language links', async ({ request }) => {
  const response = await request.get('/sitemap.xml')
  expect(response.status()).toBe(200)
  const xml = await response.text()
  expect(xml).toContain('xmlns:xhtml="http://www.w3.org/1999/xhtml"')
  expect(xml).toContain('https://lago.lv/lv/akmens-virsmas/')
  expect(xml).toContain('https://lago.lv/en/stone-surfaces/silestone/')
  expect(xml).toContain('https://lago.lv/ru/kamennye-poverhnosti/mramor/')
  expect(xml).not.toContain('/checkout/')
  expect(xml).not.toContain('/admin/')
})

test('anonymous user cannot access admin dashboard', async ({ request }) => {
  const response = await request.get('/admin/dashboard/', { maxRedirects: 0 })
  expect([302, 303, 307, 308, 401, 403]).toContain(response.status())
  if (response.status() < 400) expect(response.headers().location).toMatch(/login|account|auth/)
})
