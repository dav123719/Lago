/**
 * Lighthouse CI Configuration
 * Performance budgets and CI integration for automated quality checks
 */

module.exports = {
  ci: {
    // ============================================
    // COLLECT CONFIGURATION
    // ============================================
    collect: {
      // Static site - serve the dist folder
      staticDistDir: './dist',

      // Number of runs to average results
      numberOfRuns: 3,

      // URL patterns to test (relative to staticDistDir)
      url: [
        '/lv/', // Homepage
        '/lv/store/', // Store page
        '/lv/projects/', // Projects page
        '/lv/contact/', // Contact page
        '/lv/about/', // About page
      ],

      // Chrome flags for consistent testing
      chromeFlags: '--no-sandbox --headless --disable-gpu',

      // Settings for consistent results
      settings: {
        preset: 'desktop',
        throttling: {
          // Simulate slow 4G
          rttMs: 150,
          throughputKbps: 1638.4,
          cpuSlowdownMultiplier: 4,
        },
        formFactor: 'desktop',
        screenEmulation: {
          mobile: false,
          width: 1350,
          height: 940,
          deviceScaleFactor: 1,
          disabled: false,
        },
        emulatedUserAgent:
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
      },
    },

    // ============================================
    // ASSERT CONFIGURATION (PERFORMANCE BUDGETS)
    // ============================================
    assert: {
      preset: 'lighthouse:recommended',

      // Performance budgets - fail CI if these thresholds are not met
      assertions: {
        // Performance score (0-100)
        'categories:performance': ['error', { minScore: 0.75 }],

        // Accessibility score
        'categories:accessibility': ['error', { minScore: 0.9 }],

        // Best practices score
        'categories:best-practices': ['error', { minScore: 0.9 }],

        // SEO score
        'categories:seo': ['error', { minScore: 0.9 }],

        // PWA score (warn only)
        'categories:pwa': ['warn', { minScore: 0.5 }],

        // Core Web Vitals
        'first-contentful-paint': ['error', { maxNumericValue: 2000 }], // < 2s
        'largest-contentful-paint': ['error', { maxNumericValue: 2500 }], // < 2.5s
        'total-blocking-time': ['error', { maxNumericValue: 200 }], // < 200ms
        'cumulative-layout-shift': ['error', { maxNumericValue: 0.1 }], // < 0.1
        'speed-index': ['error', { maxNumericValue: 3000 }], // < 3s
        'interactive': ['error', { maxNumericValue: 3500 }], // < 3.5s

        // Resource budgets
        'resource-summary:document:size': ['error', { maxNumericValue: 50000 }], // HTML < 50KB
        'resource-summary:script:size': ['error', { maxNumericValue: 500000 }], // JS < 500KB
        'resource-summary:stylesheet:size': ['error', { maxNumericValue: 100000 }], // CSS < 100KB
        'resource-summary:image:size': ['warn', { maxNumericValue: 2000000 }], // Images < 2MB (warn)
        'resource-summary:font:size': ['error', { maxNumericValue: 300000 }], // Fonts < 300KB
        'resource-summary:third-party:count': ['warn', { maxNumericValue: 10 }], // Max 10 third-party requests

        // Network budgets
        'network-requests': ['error', { maxNumericValue: 100 }], // Max 100 requests
        'network-rtt': ['error', { maxNumericValue: 150 }], // RTT < 150ms
        'network-server-latency': ['error', { maxNumericValue: 600 }], // Server latency < 600ms

        // Image optimization
        'uses-optimized-images': 'error',
        'uses-webp-images': 'warn',
        'efficiently-encode-images': 'error',
        'modern-image-formats': 'warn',

        // JavaScript optimization
        'unused-javascript': 'warn',
        'total-byte-weight': ['error', { maxNumericValue: 3500000 }], // Total < 3.5MB
        'dom-size': ['error', { maxNumericValue: 1500 }], // DOM nodes < 1500
        'uses-text-compression': 'error',
        'uses-long-cache-ttl': 'warn',

        // Security
        'is-on-https': 'error',
        'uses-http2': 'warn',
        'no-document-write': 'error',
        'geolocation-on-start': 'error',
        'notification-on-start': 'error',

        // SEO specific
        'meta-description': 'error',
        'document-title': 'error',
        'hreflang': 'error',
        'canonical': 'error',
        'structured-data': 'warn',
        'link-text': 'warn',
        'crawlable-anchors': 'error',

        // Accessibility specific
        'color-contrast': 'error',
        'image-alt': 'error',
        'label': 'error',
        'tabindex': 'error',
      },
    },

    // ============================================
    // UPLOAD CONFIGURATION
    // ============================================
    upload: {
      // Upload to temporary public storage for PR comments
      target: 'temporary-public-storage',

      // Alternative: Upload to LHCI server (if you have one)
      // target: 'lhci',
      // serverBaseUrl: 'https://your-lhci-server.com',
      // token: process.env.LHCI_TOKEN,

      // GitHub status check settings
      githubStatusContextSuffix: '-lighthouse',
      githubAppToken: process.env.LHCI_GITHUB_APP_TOKEN,
    },

    // ============================================
    // SERVER CONFIGURATION (for dynamic testing)
    // ============================================
    server: {
      // If you need to test against a running server instead of static files
      // startServerCommand: 'npm run start',
      // startServerReadyPattern: 'Ready on',
      // startServerReadyTimeout: 60000,
      // port: 3000,
    },
  },
}
