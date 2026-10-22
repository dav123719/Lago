import { chromium } from '@playwright/test'
import fs from 'node:fs/promises'
import { execFileSync } from 'node:child_process'

const base = process.env.PERF_BASE_URL || 'http://127.0.0.1:3100'
const output = process.env.PERF_OUTPUT || 'docs/performance/interactions.json'
const browser = await chromium.launch({ headless: true })
const rows = []
try {
  for (const device of ['desktop', 'mobile']) for (let run = 1; run <= 3; run++) {
    const mobile = device === 'mobile'
    const context = await browser.newContext({ viewport: mobile ? { width: 390, height: 844 } : { width: 1440, height: 900 }, isMobile: mobile, hasTouch: mobile, deviceScaleFactor: 1, reducedMotion: 'reduce' })
    const page = await context.newPage()
    const cdp = await context.newCDPSession(page)
    await cdp.send('Network.enable')
    await cdp.send('Emulation.setCPUThrottlingRate', { rate: mobile ? 4 : 1 })
    await cdp.send('Network.emulateNetworkConditions', { offline: false, latency: mobile ? 80 : 20, downloadThroughput: (mobile ? 1_600_000 : 10_000_000) / 8, uploadThroughput: (mobile ? 750_000 : 2_000_000) / 8 })
    let documents = 0
    let initialProductRequests = 0
    page.on('request', r => { if (r.isNavigationRequest() && r.frame() === page.mainFrame()) documents++; if (r.url().includes('/api/products/')) initialProductRequests++ })
    await page.goto(new URL('/lv/', base).href, { waitUntil: 'load' })
    await page.waitForTimeout(1600)
    if (mobile) { await page.getByRole('button', { name: 'Toggle menu' }).click(); await page.waitForTimeout(100) }
    const login = page.getByRole('button', { name: 'Ienākt', exact: true }).filter({ visible: true }).first()
    await login.waitFor()
    await page.evaluate(() => { window.__interactionStart = 0; document.addEventListener('click', () => { window.__interactionStart = performance.now() }, { capture: true, once: true }) })
    await login.focus()
    await login.press('Enter')
    const feedback = await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(() => resolve(performance.now() - window.__interactionStart)))))
    if (await login.getAttribute('aria-expanded') === 'true') await login.press('Enter')
    if (mobile) {
      const menu = page.getByRole('button', { name: 'Toggle menu' })
      if (await menu.getAttribute('aria-expanded') !== 'true') await menu.click()
    }
    await page.evaluate(() => { document.addEventListener('click', () => { window.__interactionStart = performance.now() }, { capture: true, once: true }) })
    const response = page.waitForResponse(r => r.url().includes('/api/products') && !r.url().includes('search=') && r.status() >= 400)
    await page.locator(`${mobile ? '' : 'header '}a[href="/lv/store/"]:visible`).first().click()
    await page.waitForURL(/\/lv\/store\//)
    const search = page.locator('input[placeholder*="Mekl"]')
    await search.waitFor({ state: 'visible' })
    const productResponse = await response
    const navigationMs = await page.evaluate(() => performance.now() - window.__interactionStart)
    await page.waitForTimeout(800)
    const initialRequests = initialProductRequests
    await search.evaluate(el => { el.addEventListener('input', () => { window.__interactionStart = performance.now() }, { once: true }) })
    const searchResponse = page.waitForResponse(r => r.url().includes('/api/products') && r.url().includes('search=granits') && r.status() >= 400)
    await search.fill('granits')
    const typingFeedbackMs = await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(() => resolve(performance.now() - window.__interactionStart)))))
    const searched = await searchResponse
    const searchTerminalMs = await page.evaluate(() => performance.now() - window.__interactionStart)
    rows.push({ device, run, loginTogglePaintProxyMs: feedback, navigationReadyMs: navigationMs, typingPaintProxyMs: typingFeedbackMs, searchTerminalResponseMs: searchTerminalMs, catalogueStatus: productResponse.status(), searchStatus: searched.status(), initialCatalogueRequests: initialRequests, documents })
    console.log(JSON.stringify(rows.at(-1)))
    await context.close()
  }
  await fs.writeFile(output, JSON.stringify({ sourceCommit: process.env.PERF_COMMIT || execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim(), runtimeRelease: process.env.PERF_RELEASE || 'candidate; see sourceCommit', node: process.version, base, recordedAt: new Date().toISOString(), browser: browser.version(), conditions: 'Same device/CPU/network/reduced-motion as performance-measure.mjs. Fresh context per run; homepage warmed before SPA navigation. Feedback proxy = input/click event to second RAF, not INP. Catalogue database absent: navigation/search report terminal error response readiness, not successful results.', results: rows }, null, 2) + '\n')
} finally { await browser.close() }
