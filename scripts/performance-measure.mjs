import { chromium } from '@playwright/test'
import fs from 'node:fs/promises'
import os from 'node:os'
import { execFileSync } from 'node:child_process'

const base = process.env.PERF_BASE_URL || 'http://127.0.0.1:3100'
const output = process.env.PERF_OUTPUT || 'docs/performance/results.json'
const runs = Number(process.env.PERF_RUNS || 3)
const routes = (process.env.PERF_ROUTES || '/lv/,/lv/akmens-virsmas/,/lv/projekti/,/lv/store/,/lv/akmens-virsmas/silestone/').split(',')
const profiles = {
  desktop: { viewport: { width: 1440, height: 900 }, cpu: 1, latency: 20, download: 10_000_000 / 8, upload: 2_000_000 / 8 },
  mobile: { viewport: { width: 390, height: 844 }, cpu: 4, latency: 80, download: 1_600_000 / 8, upload: 750_000 / 8 },
}
const browser = await chromium.launch({ headless: true })
const results = []
function safeUrl(value) {
  const url = new URL(value)
  for (const key of url.searchParams.keys()) if (/token|code|session|email|password|key/i.test(key)) url.searchParams.set(key, '[redacted]')
  return url.href
}
const allowedHeaders = new Set(['cache-control', 'content-type', 'content-encoding', 'content-length', 'age', 'etag', 'vary', 'cf-cache-status'])
try {
  for (const [device, profile] of Object.entries(profiles)) {
    for (const route of routes) {
      for (let run = 1; run <= runs; run++) {
        const context = await browser.newContext({ viewport: profile.viewport, deviceScaleFactor: 1, isMobile: device === 'mobile', hasTouch: device === 'mobile', reducedMotion: 'reduce' })
        await context.addInitScript(() => {
          window.__lab = { lcp: 0, cls: 0, longTasks: [], interactions: [] }
          new PerformanceObserver(list => { for (const e of list.getEntries()) window.__lab.lcp = e.startTime }).observe({ type: 'largest-contentful-paint', buffered: true })
          new PerformanceObserver(list => { for (const e of list.getEntries()) if (!e.hadRecentInput) window.__lab.cls += e.value }).observe({ type: 'layout-shift', buffered: true })
          new PerformanceObserver(list => { for (const e of list.getEntries()) window.__lab.longTasks.push(e.duration) }).observe({ type: 'longtask', buffered: true })
        })
        const page = await context.newPage()
        const cdp = await context.newCDPSession(page)
        await cdp.send('Network.enable')
        await cdp.send('Emulation.setCPUThrottlingRate', { rate: profile.cpu })
        await cdp.send('Network.emulateNetworkConditions', { offline: false, latency: profile.latency, downloadThroughput: profile.download, uploadThroughput: profile.upload })
        for (const cache of ['cold', 'warm']) {
          if (cache === 'cold') await cdp.send('Network.clearBrowserCache')
          const requests = new Map()
          const onResponse = event => requests.set(event.requestId, { url: safeUrl(event.response.url), type: event.type, status: event.response.status, headers: Object.fromEntries(Object.entries(event.response.headers).filter(([key]) => allowedHeaders.has(key.toLowerCase()))), cached: !!event.response.fromDiskCache, bytes: 0 })
          const onFinished = event => { const req = requests.get(event.requestId); if (req) req.bytes += event.encodedDataLength }
          cdp.on('Network.responseReceived', onResponse)
          cdp.on('Network.loadingFinished', onFinished)
          const errors = []
          const onError = e => errors.push(e.message)
          page.on('pageerror', onError)
          const response = await page.goto(new URL(route, base).href, { waitUntil: 'load', timeout: 60000 })
          await page.waitForTimeout(1500)
          const metrics = await page.evaluate(() => {
            const nav = performance.getEntriesByType('navigation')[0]
            const lab = window.__lab
            return { ttfbMs: nav.responseStart - nav.startTime, domReadyMs: nav.domContentLoadedEventEnd, loadMs: nav.loadEventEnd, lcpMs: lab.lcp, cls: lab.cls, longTaskCount: lab.longTasks.length, longTaskMs: lab.longTasks.reduce((a,b)=>a+b,0), labBlockingMs: lab.longTasks.reduce((a,b)=>a+Math.max(0,b-50),0), domNodes: document.querySelectorAll('*').length, mainTextChars: document.querySelector('main')?.innerText.length || 0, resources: performance.getEntriesByType('resource').map(r=>({url:r.name,startMs:r.startTime,durationMs:r.duration,transferBytes:r.transferSize,decodedBytes:r.decodedBodySize})) }
          })
          const types = {}
          for (const req of requests.values()) types[req.type] = (types[req.type] || 0) + req.bytes
          metrics.resources = metrics.resources.map(resource => ({ ...resource, url: safeUrl(resource.url) }))
          results.push({ device, route, run, cache, status: response.status(), finalUrl: safeUrl(page.url()), ...metrics, transferredBytes: [...requests.values()].reduce((s,r)=>s+r.bytes,0), requests: requests.size, bytesByType: types, waterfall: [...requests.values()], browserErrors: errors })
          console.log(`${device} ${route} ${run} ${cache}: LCP=${Math.round(metrics.lcpMs)}ms CLS=${metrics.cls.toFixed(4)} bytes=${results.at(-1).transferredBytes}`)
          cdp.off('Network.responseReceived', onResponse)
          cdp.off('Network.loadingFinished', onFinished)
          page.off('pageerror', onError)
          await page.goto('about:blank')
        }
        await context.close()
      }
    }
  }
  const api = []
  for (const route of ['/api/health/', '/api/products/?limit=12', '/api/admin/profiles/', '/lv/account/', '/admin/profiles/']) {
    for (let run = 1; run <= runs; run++) {
      const start = performance.now()
      const response = await fetch(new URL(route, base), { redirect: 'manual' })
      await response.arrayBuffer()
      api.push({ route, run, status: response.status, elapsedMs: performance.now() - start, cacheControl: response.headers.get('cache-control'), location: response.headers.get('location') })
    }
  }
  await fs.mkdir(new URL('.', 'file://' + process.cwd() + '/' + output), { recursive: true })
  await fs.writeFile(output, JSON.stringify({ sourceCommit: process.env.PERF_COMMIT || execFileSync('git', ['rev-parse','HEAD'], { encoding: 'utf8' }).trim(), runtimeRelease: process.env.PERF_RELEASE || 'candidate; see sourceCommit', recordedAt: new Date().toISOString(), base, auth: 'anonymous; no test identities or mailbox available', browser: browser.version(), playwright: JSON.parse(await fs.readFile('node_modules/@playwright/test/package.json')).version, node: process.version, host: { arch: os.arch(), cpus: os.cpus().length, region: 'VPS region unverified; origin loopback or Cloudflare from this VPS, network/CPU simulated' }, profiles, reducedMotion: 'reduce', notes: 'Lab samples, not field percentiles; labBlockingMs is observed long-task excess during this capture, not INP or Lighthouse TBT. Warm repeats preserve browser HTTP cache in the same context. Server/CDN caches are not purged. Bytes are CDP encodedDataLength, including response overhead. Useful-content proxy is main text length plus DOMContentLoaded; no authenticated success flows are measured. CDP latency is configured; observed loopback navigation TTFB is not a geographic Internet latency estimate. Sensitive URL parameters/response cookies are excluded.', results, api }, null, 2) + '\n')
} finally { await browser.close() }
