/** @type {import('next').NextConfig} */
const nextConfig = {
  // Note: Next.js 14+ with App Router handles i18n differently.
  // We use dynamic route segments [locale] instead of built-in i18n config.
  // The built-in i18n config is for Pages Router only.
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
    // PERFORMANCE: Optimize image formats and quality
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60, // Cache optimized images for 60 seconds
    // PERFORMANCE: Add timeout and error handling for image optimization
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    // Disable image optimization for problematic images (fallback to unoptimized)
    dangerouslyAllowSVG: false,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  
  // PERFORMANCE: Cache headers for static assets
  async headers() {
    return [
      {
        // Images - long cache with immutable flag
        source: '/images/:path*',
        headers: [
          {
            key: 'Cache-Control',
            // PERFORMANCE: Images are optimized and have hashes - cache for 1 year
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        // Next.js static files (_next/static) - already have hashes
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            // PERFORMANCE: Next.js static assets have content hashes - cache aggressively
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        // CSS files - cache with revalidation for updates
        source: '/_next/static/css/:path*.css',
        headers: [
          {
            key: 'Cache-Control',
            // PERFORMANCE: CSS files have content hashes - cache aggressively but allow revalidation
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        // Fonts - long cache with preload support
        source: '/_next/static/media/:path*.(woff|woff2|ttf|otf)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
          {
            key: 'Cross-Origin-Resource-Policy',
            value: 'cross-origin',
          },
        ],
      },
      {
        // API routes - no cache
        source: '/api/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store, must-revalidate',
          },
        ],
      },
    ]
  },
  
  // PERFORMANCE: Compress responses
  compress: true,
  
  // PERFORMANCE: Optimize production builds
  swcMinify: true,
  
  // PERFORMANCE: Enable React strict mode for better performance optimizations
  reactStrictMode: true,
  
  // PERFORMANCE: Optimize production builds
  productionBrowserSourceMaps: false, // Disable source maps in production for smaller bundles
  
  // PERFORMANCE: Experimental features for better performance
  experimental: {
    // Temporarily disabled optimizePackageImports due to module resolution issues
    // optimizePackageImports: ['lucide-react'], // Tree-shake lucide-react icons
  },
}

module.exports = nextConfig

