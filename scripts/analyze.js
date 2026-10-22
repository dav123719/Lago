#!/usr/bin/env node
/**
 * Measure initial assets referenced by production-prerendered route HTML.
 * This deliberately excludes server code, standalone copies, caches, and assets
 * belonging only to other routes. Gzip bytes are a deterministic build metric,
 * not a claim about transferred bytes, user timing, or dynamically loaded code.
 *
 * node scripts/analyze.js [--check] [--all] [--build-dir=dist] [--output=report.json]
 */
const fs = require('node:fs')
const path = require('node:path')
const zlib = require('node:zlib')

const root = path.resolve(__dirname, '..')
const args = process.argv.slice(2)
const option = (name, fallback) => args.find(arg => arg.startsWith(`--${name}=`))?.slice(name.length + 3) || fallback
const buildDir = path.resolve(root, option('build-dir', 'dist'))
const budgetConfig = JSON.parse(fs.readFileSync(path.join(root, 'performance-budgets.json'), 'utf8'))
const htmlDir = path.join(buildDir, 'server', 'app')

function walk(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
    const file = path.join(directory, entry.name)
    return entry.isDirectory() ? walk(file) : file.endsWith('.html') ? [file] : []
  })
}

const measuredAssets = new Map()
function measureAsset(url) {
  // Only Next's build-owned static assets are included. No network requests,
  // public assets, user URLs, or server files are read based on page content.
  const clean = url.split('?')[0]
  if (!clean.startsWith('/_next/static/') || clean.includes('..')) {
    throw new Error(`Unexpected build asset URL: ${url}`)
  }
  if (!measuredAssets.has(clean)) {
    const data = fs.readFileSync(path.join(buildDir, clean.slice('/_next/'.length)))
    measuredAssets.set(clean, { url: clean, rawBytes: data.length, gzipBytes: zlib.gzipSync(data).length })
  }
  return measuredAssets.get(clean)
}

function measureRoute(file) {
  const html = fs.readFileSync(file, 'utf8')
  const route = '/' + path.relative(htmlDir, file).split(path.sep).join('/').replace(/\.html$/, '').replace(/\/index$/, '')
  const scriptUrls = [...new Set([...html.matchAll(/<script\b[^>]*\bsrc="([^\"]+)"/g)].map(match => match[1]))]
  const cssUrls = [...new Set([...html.matchAll(/<link\b[^>]*\bhref="([^\"]+\.css(?:\?[^\"]*)?)"[^>]*>/g)].map(match => match[1]))]
  const scripts = scriptUrls.map(measureAsset)
  const styles = cssUrls.map(measureAsset)
  const sum = (items, field) => items.reduce((total, item) => total + item[field], 0)
  const budgets = { ...budgetConfig.defaults }
  for (const rule of budgetConfig.routes) {
    if (new RegExp(rule.pattern).test(route)) Object.assign(budgets, rule.budgets)
  }
  const metrics = {
    htmlRawBytes: Buffer.byteLength(html),
    htmlGzipBytes: zlib.gzipSync(html).length,
    jsRequests: scripts.length,
    jsRawBytes: sum(scripts, 'rawBytes'),
    jsGzipBytes: sum(scripts, 'gzipBytes'),
    cssRequests: styles.length,
    cssRawBytes: sum(styles, 'rawBytes'),
    cssGzipBytes: sum(styles, 'gzipBytes'),
  }
  const failures = Object.entries(budgets)
    .filter(([metric, limit]) => typeof metrics[metric] !== 'number' || metrics[metric] > limit)
    .map(([metric, limit]) => ({ metric, actual: metrics[metric], limit }))
  return { route, metrics, budgets, failures, assets: { scripts, styles } }
}

try {
  if (!fs.existsSync(htmlDir)) throw new Error(`Missing production build at ${htmlDir}. Run npm run build first.`)
  const routes = walk(htmlDir).map(measureRoute).sort((a, b) => a.route.localeCompare(b.route))
  if (!routes.length) throw new Error('No production route HTML found; refusing an empty successful report.')
  const report = {
    schemaVersion: 1,
    generatedAt: new Date().toISOString(),
    buildId: fs.readFileSync(path.join(buildDir, 'BUILD_ID'), 'utf8').trim(),
    scope: 'Initial script and CSS tags in prerendered route HTML. Dynamic routes, interaction-loaded chunks, images, and fonts require browser measurements.',
    compression: 'Node zlib gzip defaults; bytes are build estimates, not observed network transfer.',
    routeCount: routes.length,
    failedRoutes: routes.filter(route => route.failures.length).length,
    routes,
  }
  const output = option('output', '')
  if (output) {
    const destination = path.resolve(root, output)
    fs.mkdirSync(path.dirname(destination), { recursive: true })
    fs.writeFileSync(destination, JSON.stringify(report, null, 2) + '\n')
    console.log(`Report: ${destination}`)
  }
  const shown = args.includes('--all') ? routes : routes.filter(route => /^\/(lv|en|ru)$|^\/lv\/(store|projekti|akmens-virsmas)$/.test(route.route) || route.failures.length)
  console.table(shown.map(({ route, metrics, failures }) => ({
    route,
    'JS gzip KiB': +(metrics.jsGzipBytes / 1024).toFixed(1),
    'CSS gzip KiB': +(metrics.cssGzipBytes / 1024).toFixed(1),
    'HTML gzip KiB': +(metrics.htmlGzipBytes / 1024).toFixed(1),
    scripts: metrics.jsRequests,
    budget: failures.length ? failures.map(item => `${item.metric}: ${item.actual} > ${item.limit}`).join('; ') : 'pass',
  })))
  console.log(`${report.routeCount} prerendered routes measured; ${report.failedRoutes} exceed budgets. Dynamic/account/admin routes and page weight must also be checked in a browser.`)
  if (args.includes('--check') && report.failedRoutes) process.exitCode = 1
} catch (error) {
  console.error(error.message)
  process.exitCode = 1
}
