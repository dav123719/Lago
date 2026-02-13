#!/usr/bin/env node

/**
 * Bundle Analyzer Script
 * Analyzes webpack bundle size and composition
 * Usage: npm run analyze
 */

const { execSync } = require('child_process')
const fs = require('fs')
const path = require('path')

// ============================================
// CONFIGURATION
// ============================================

const BUILD_DIR = path.join(__dirname, '..', 'dist')
const ANALYZE_DIR = path.join(__dirname, '..', '.analyze')
const BUDGETS = {
  // Size budgets in bytes
  total: 3.5 * 1024 * 1024, // 3.5MB total
  js: 500 * 1024, // 500KB JS
  css: 100 * 1024, // 100KB CSS
  html: 50 * 1024, // 50KB HTML
  images: 2 * 1024 * 1024, // 2MB images (warn only)
  fonts: 300 * 1024, // 300KB fonts
}

const COLORS = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
}

// ============================================
// UTILITIES
// ============================================

function formatBytes(bytes, decimals = 2) {
  if (bytes === 0) return '0 B'
  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i]
}

function colorize(color, text) {
  return COLORS[color] + text + COLORS.reset
}

function printBox(title, content) {
  const width = 70
  const line = '─'.repeat(width)
  console.log(colorize('cyan', `┌${line}┐`))
  console.log(colorize('cyan', `│`) + ' ' + title.padEnd(width - 1) + colorize('cyan', '│'))
  console.log(colorize('cyan', `├${line}┤`))
  content.split('\n').forEach((line) => {
    console.log(colorize('cyan', '│') + ' ' + line.padEnd(width - 1) + colorize('cyan', '│'))
  })
  console.log(colorize('cyan', `└${line}┘`))
}

// ============================================
// ANALYSIS FUNCTIONS
// ============================================

function getFileSize(filePath) {
  try {
    const stats = fs.statSync(filePath)
    return stats.size
  } catch {
    return 0
  }
}

function getAllFiles(dir, ext = '') {
  const files = []
  
  function traverse(currentDir) {
    const items = fs.readdirSync(currentDir)
    for (const item of items) {
      const fullPath = path.join(currentDir, item)
      const stat = fs.statSync(fullPath)
      if (stat.isDirectory()) {
        traverse(fullPath)
      } else if (!ext || path.extname(item) === ext) {
        files.push({
          path: fullPath,
          size: stat.size,
          relative: path.relative(BUILD_DIR, fullPath),
        })
      }
    }
  }
  
  if (fs.existsSync(dir)) {
    traverse(dir)
  }
  
  return files.sort((a, b) => b.size - a.size)
}

function analyzeBundles() {
  const staticDir = path.join(BUILD_DIR, '_next', 'static')
  const chunksDir = path.join(staticDir, 'chunks')
  
  const analysis = {
    totalSize: 0,
    jsSize: 0,
    cssSize: 0,
    htmlSize: 0,
    imageSize: 0,
    fontSize: 0,
    otherSize: 0,
    chunks: [],
    largestFiles: [],
  }
  
  // Get all files
  const allFiles = getAllFiles(BUILD_DIR)
  
  for (const file of allFiles) {
    analysis.totalSize += file.size
    
    const ext = path.extname(file.path).toLowerCase()
    
    if (ext === '.js' || ext === '.mjs') {
      analysis.jsSize += file.size
      if (file.path.includes('chunks')) {
        analysis.chunks.push(file)
      }
    } else if (ext === '.css') {
      analysis.cssSize += file.size
    } else if (ext === '.html') {
      analysis.htmlSize += file.size
    } else if (['.jpg', '.jpeg', '.png', '.gif', '.svg', '.webp', '.avif'].includes(ext)) {
      analysis.imageSize += file.size
    } else if (['.woff', '.woff2', '.ttf', '.otf', '.eot'].includes(ext)) {
      analysis.fontSize += file.size
    } else {
      analysis.otherSize += file.size
    }
  }
  
  analysis.largestFiles = allFiles.slice(0, 20)
  analysis.chunks = analysis.chunks.sort((a, b) => b.size - a.size)
  
  return analysis
}

function checkBudgets(analysis) {
  const results = []
  
  // Check total size
  const totalStatus = analysis.totalSize <= BUDGETS.total ? 'pass' : 'fail'
  results.push({
    name: 'Total Bundle',
    size: analysis.totalSize,
    budget: BUDGETS.total,
    status: totalStatus,
  })
  
  // Check JS size
  const jsStatus = analysis.jsSize <= BUDGETS.js ? 'pass' : 'fail'
  results.push({
    name: 'JavaScript',
    size: analysis.jsSize,
    budget: BUDGETS.js,
    status: jsStatus,
  })
  
  // Check CSS size
  const cssStatus = analysis.cssSize <= BUDGETS.css ? 'pass' : 'fail'
  results.push({
    name: 'CSS',
    size: analysis.cssSize,
    budget: BUDGETS.css,
    status: cssStatus,
  })
  
  // Check HTML size
  const htmlStatus = analysis.htmlSize <= BUDGETS.html ? 'pass' : 'warn'
  results.push({
    name: 'HTML',
    size: analysis.htmlSize,
    budget: BUDGETS.html,
    status: htmlStatus,
  })
  
  // Check image size (warn only)
  const imageStatus = analysis.imageSize <= BUDGETS.images ? 'pass' : 'warn'
  results.push({
    name: 'Images',
    size: analysis.imageSize,
    budget: BUDGETS.images,
    status: imageStatus,
  })
  
  // Check font size
  const fontStatus = analysis.fontSize <= BUDGETS.fonts ? 'pass' : 'warn'
  results.push({
    name: 'Fonts',
    size: analysis.fontSize,
    budget: BUDGETS.fonts,
    status: fontStatus,
  })
  
  return results
}

function findDuplicateModules() {
  const nodeModulesDir = path.join(__dirname, '..', 'node_modules')
  const duplicates = []
  
  // Check for common duplicate packages
  const commonDuplicates = [
    'lodash',
    '@babel/runtime',
    'core-js',
    'regenerator-runtime',
    'scheduler',
    'prop-types',
    'react-is',
  ]
  
  for (const pkg of commonDuplicates) {
    const pkgPaths = []
    
    function findPackages(dir, depth = 0) {
      if (depth > 3) return
      
      try {
        const items = fs.readdirSync(dir)
        for (const item of items) {
          if (item === 'node_modules') {
            const pkgPath = path.join(dir, item, pkg)
            if (fs.existsSync(pkgPath)) {
              pkgPaths.push(pkgPath)
            }
            findPackages(path.join(dir, item), depth + 1)
          }
        }
      } catch {
        // Ignore errors
      }
    }
    
    findPackages(nodeModulesDir)
    
    if (pkgPaths.length > 1) {
      duplicates.push({ package: pkg, paths: pkgPaths })
    }
  }
  
  return duplicates
}

// ============================================
// REPORT GENERATION
// ============================================

function generateReport(analysis, budgetResults, duplicates) {
  let report = ''
  
  // Header
  report += colorize('cyan', '\n╔══════════════════════════════════════════════════════════════════════╗\n')
  report += colorize('cyan', '║') + colorize('white', '              LAGO WEBSITE - BUNDLE ANALYSIS REPORT              ') + colorize('cyan', '║\n')
  report += colorize('cyan', '╚══════════════════════════════════════════════════════════════════════╝\n\n')
  
  // Budget Results
  report += colorize('magenta', '📊 PERFORMANCE BUDGETS\n')
  report += '─'.repeat(70) + '\n\n'
  
  for (const result of budgetResults) {
    const percentage = (result.size / result.budget) * 100
    const barLength = 30
    const filledLength = Math.round((percentage / 100) * barLength)
    const bar = '█'.repeat(filledLength) + '░'.repeat(barLength - filledLength)
    
    const statusIcon = result.status === 'pass' ? '✅' : result.status === 'warn' ? '⚠️' : '❌'
    const statusColor = result.status === 'pass' ? 'green' : result.status === 'warn' ? 'yellow' : 'red'
    
    report += `${statusIcon} ${result.name.padEnd(15)} ${colorize(statusColor, bar)} ${formatBytes(result.size).padStart(10)} / ${formatBytes(result.budget)} (${percentage.toFixed(1)}%)\n`
  }
  
  report += '\n'
  
  // Breakdown
  report += colorize('magenta', '📦 BUNDLE BREAKDOWN\n')
  report += '─'.repeat(70) + '\n\n'
  report += `  JavaScript:  ${formatBytes(analysis.jsSize).padStart(12)} (${((analysis.jsSize / analysis.totalSize) * 100).toFixed(1)}%)\n`
  report += `  CSS:         ${formatBytes(analysis.cssSize).padStart(12)} (${((analysis.cssSize / analysis.totalSize) * 100).toFixed(1)}%)\n`
  report += `  Images:      ${formatBytes(analysis.imageSize).padStart(12)} (${((analysis.imageSize / analysis.totalSize) * 100).toFixed(1)}%)\n`
  report += `  Fonts:       ${formatBytes(analysis.fontSize).padStart(12)} (${((analysis.fontSize / analysis.totalSize) * 100).toFixed(1)}%)\n`
  report += `  HTML:        ${formatBytes(analysis.htmlSize).padStart(12)} (${((analysis.htmlSize / analysis.totalSize) * 100).toFixed(1)}%)\n`
  report += `  Other:       ${formatBytes(analysis.otherSize).padStart(12)} (${((analysis.otherSize / analysis.totalSize) * 100).toFixed(1)}%)\n`
  report += `  ${'─'.repeat(50)}\n`
  report += `  Total:       ${colorize('white', formatBytes(analysis.totalSize).padStart(12))}\n\n`
  
  // Largest Files
  report += colorize('magenta', '🏆 LARGEST FILES\n')
  report += '─'.repeat(70) + '\n\n'
  
  for (let i = 0; i < Math.min(10, analysis.largestFiles.length); i++) {
    const file = analysis.largestFiles[i]
    const sizeStr = formatBytes(file.size).padStart(10)
    report += `  ${(i + 1).toString().padStart(2)}. ${sizeStr}  ${file.relative}\n`
  }
  
  // JS Chunks
  if (analysis.chunks.length > 0) {
    report += '\n'
    report += colorize('magenta', '🔧 JS CHUNKS\n')
    report += '─'.repeat(70) + '\n\n'
    
    for (let i = 0; i < Math.min(10, analysis.chunks.length); i++) {
      const chunk = analysis.chunks[i]
      const sizeStr = formatBytes(chunk.size).padStart(10)
      report += `  ${(i + 1).toString().padStart(2)}. ${sizeStr}  ${chunk.relative}\n`
    }
  }
  
  // Duplicates
  if (duplicates.length > 0) {
    report += '\n'
    report += colorize('yellow', '⚠️  POTENTIAL DUPLICATE PACKAGES\n')
    report += '─'.repeat(70) + '\n\n'
    
    for (const dup of duplicates) {
      report += `  📦 ${dup.package} (${dup.paths.length} versions found)\n`
    }
    report += '\n  Tip: Use "npm ls <package>" to investigate\n'
  }
  
  // Recommendations
  report += '\n'
  report += colorize('magenta', '💡 RECOMMENDATIONS\n')
  report += '─'.repeat(70) + '\n\n'
  
  const failedBudgets = budgetResults.filter(r => r.status === 'fail')
  if (failedBudgets.length > 0) {
    report += colorize('yellow', '  Budget Overruns:\n')
    for (const fail of failedBudgets) {
      report += `    • Reduce ${fail.name.toLowerCase()} by ${formatBytes(fail.size - fail.budget)}\n`
    }
    report += '\n'
  }
  
  if (analysis.jsSize > BUDGETS.js * 0.8) {
    report += '  • Consider code splitting with dynamic imports\n'
    report += '  • Review and remove unused dependencies\n'
  }
  
  if (analysis.imageSize > BUDGETS.images * 0.8) {
    report += '  • Optimize images with WebP/AVIF format\n'
    report += '  • Implement lazy loading for below-fold images\n'
  }
  
  if (duplicates.length > 0) {
    report += '  • Run "npm dedupe" to reduce duplicate packages\n'
  }
  
  report += '  • Use "next/dynamic" for non-critical components\n'
  report += '  • Enable webpack optimization in next.config.js\n'
  
  report += '\n'
  
  return report
}

function saveJsonReport(analysis, budgetResults) {
  if (!fs.existsSync(ANALYZE_DIR)) {
    fs.mkdirSync(ANALYZE_DIR, { recursive: true })
  }
  
  const report = {
    timestamp: new Date().toISOString(),
    analysis: {
      totalSize: analysis.totalSize,
      jsSize: analysis.jsSize,
      cssSize: analysis.cssSize,
      htmlSize: analysis.htmlSize,
      imageSize: analysis.imageSize,
      fontSize: analysis.fontSize,
      otherSize: analysis.otherSize,
    },
    budgets: budgetResults,
    largestFiles: analysis.largestFiles.slice(0, 50).map(f => ({
      path: f.relative,
      size: f.size,
    })),
    chunks: analysis.chunks.map(c => ({
      path: c.relative,
      size: c.size,
    })),
  }
  
  fs.writeFileSync(
    path.join(ANALYZE_DIR, 'bundle-analysis.json'),
    JSON.stringify(report, null, 2)
  )
  
  console.log(colorize('cyan', `📄 JSON report saved to: ${path.join(ANALYZE_DIR, 'bundle-analysis.json')}\n`))
}

// ============================================
// MAIN
// ============================================

async function main() {
  console.log(colorize('cyan', '\n🔍 Starting bundle analysis...\n'))
  
  // Check if build exists
  if (!fs.existsSync(BUILD_DIR)) {
    console.log(colorize('yellow', '⚠️  Build directory not found. Building first...\n'))
    try {
      execSync('npm run build', { stdio: 'inherit', cwd: path.join(__dirname, '..') })
    } catch (error) {
      console.error(colorize('red', '❌ Build failed:'), error.message)
      process.exit(1)
    }
  }
  
  // Run analysis
  console.log(colorize('cyan', '📊 Analyzing bundles...\n'))
  const analysis = analyzeBundles()
  const budgetResults = checkBudgets(analysis)
  const duplicates = findDuplicateModules()
  
  // Generate and print report
  const report = generateReport(analysis, budgetResults, duplicates)
  console.log(report)
  
  // Save JSON report
  saveJsonReport(analysis, budgetResults)
  
  // Exit with error code if budgets failed
  const hasFailures = budgetResults.some(r => r.status === 'fail')
  if (hasFailures) {
    console.log(colorize('red', '❌ Some performance budgets failed!\n'))
    process.exit(1)
  }
  
  console.log(colorize('green', '✅ All performance budgets passed!\n'))
  process.exit(0)
}

main().catch((error) => {
  console.error(colorize('red', '❌ Analysis failed:'), error)
  process.exit(1)
})
