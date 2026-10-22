import { chromium } from '@playwright/test'
import fs from 'node:fs/promises'

const output = process.env.CPU_OUTPUT || '/tmp/lago-cpu-profile'
const route = process.env.CPU_ROUTE || '/lv/akmens-virsmas/silestone/'
const runs = Number(process.env.CPU_RUNS || 3)
const endpoints = process.env.CPU_ENDPOINTS ? JSON.parse(process.env.CPU_ENDPOINTS) : [{ name: 'before', base: 'http://127.0.0.1:3100' }, { name: 'after', base: 'http://127.0.0.1:3200' }]
await fs.mkdir(output, { recursive: true })
const browser = await chromium.launch({ headless: true })
const results = []
try {
  for (let run = 1; run <= runs; run++) {
    for (const endpoint of run % 2 === 0 ? [...endpoints].reverse() : endpoints) {
      const context = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1, isMobile: true, hasTouch: true, reducedMotion: 'reduce' })
      await context.addInitScript(({ skipLanguageMutation }) => {
        window.__cpuLab = { longTasks: [], lcp: 0, languageWrites: [] }
        const descriptor = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'lang')
        if (descriptor) Object.defineProperty(HTMLElement.prototype, 'lang', { ...descriptor, set(value) {
          if (this === document.documentElement) {
            window.__cpuLab.languageWrites.push({ at: performance.now(), previous: descriptor.get.call(this), next: value })
            if (skipLanguageMutation) return
          }
          descriptor.set.call(this, value)
        } })
        new PerformanceObserver(list => { for (const entry of list.getEntries()) window.__cpuLab.longTasks.push({ start: entry.startTime, duration: entry.duration, attribution: entry.attribution.map(item => ({ name: item.name, containerType: item.containerType, containerSrc: item.containerSrc })) }) }).observe({ type: 'longtask', buffered: true })
        new PerformanceObserver(list => { for (const entry of list.getEntries()) window.__cpuLab.lcp = entry.startTime }).observe({ type: 'largest-contentful-paint', buffered: true })
      }, { skipLanguageMutation: Boolean(endpoint.skipLanguageMutation) })
      const page = await context.newPage()
      const cdp = await context.newCDPSession(page)
      await cdp.send('Network.enable')
      await cdp.send('Network.clearBrowserCache')
      await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 })
      await cdp.send('Network.emulateNetworkConditions', { offline: false, latency: 80, downloadThroughput: 200000, uploadThroughput: 93750 })
      await cdp.send('Performance.enable')
      await cdp.send('Profiler.enable')
      await cdp.send('Profiler.setSamplingInterval', { interval: 1000 })
      await cdp.send('Profiler.start')
      await cdp.send('Tracing.start', { categories: 'devtools.timeline,v8,blink.user_timing,disabled-by-default-devtools.timeline', transferMode: 'ReturnAsStream' })
      await page.goto(new URL(route, endpoint.base).href, { waitUntil: 'load', timeout: 60000 })
      await page.waitForTimeout(1500)
      const originalWindow = await page.evaluate(() => ({ nowMs: performance.now(), loadMs: performance.getEntriesByType('navigation')[0].loadEventEnd, ...window.__cpuLab }))
      const originalPerformance = await cdp.send('Performance.getMetrics')
      const remaining = 8000 - originalWindow.nowMs
      if (remaining > 0) await page.waitForTimeout(remaining)
      const fixedWindow = await page.evaluate(() => ({ nowMs: performance.now(), loadMs: performance.getEntriesByType('navigation')[0].loadEventEnd, ...window.__cpuLab }))
      const fixedPerformance = await cdp.send('Performance.getMetrics')
      const { profile } = await cdp.send('Profiler.stop')
      const traceCompleted = new Promise(resolve => cdp.once('Tracing.tracingComplete', resolve))
      await cdp.send('Tracing.end')
      const { stream } = await traceCompleted
      let trace = ''
      for (;;) { const part = await cdp.send('IO.read', { handle: stream }); trace += part.data; if (part.eof) break }
      await cdp.send('IO.close', { handle: stream })
      const name = `${endpoint.name}-${run}`
      await fs.writeFile(`${output}/${name}.cpuprofile`, JSON.stringify(profile))
      await fs.writeFile(`${output}/${name}.trace.json`, trace)
      const metrics = value => Object.fromEntries(value.metrics.filter(m => ['TaskDuration','ScriptDuration','LayoutDuration','RecalcStyleDuration','LayoutCount','RecalcStyleCount','JSHeapUsedSize'].includes(m.name)).map(m => [m.name, m.value]))
      const sum = value => ({ ...value, longTaskMs: value.longTasks.reduce((s, item) => s + item.duration, 0), labBlockingMs: value.longTasks.reduce((s, item) => s + Math.max(0, item.duration - 50), 0) })
      results.push({ endpoint: endpoint.name, run, route, original: sum(originalWindow), fixed: sum(fixedWindow), originalPerformance: metrics(originalPerformance), fixedPerformance: metrics(fixedPerformance) })
      console.log(JSON.stringify(results.at(-1)))
      await context.close()
    }
  }
  await fs.writeFile(`${output}/summary.json`, JSON.stringify({ browser: browser.version(), conditions: { viewport: { width: 390, height: 844 }, cpu: 4, network: { latency: 80, downloadThroughput: 200000, uploadThroughput: 93750 }, cache: 'cold browser cache, warm server caches', order: 'alternating paired runs', capture: 'original load+1500ms and fixed 8000ms; CPU profiler and tracing enabled equally' }, results }, null, 2))
} finally { await browser.close() }
