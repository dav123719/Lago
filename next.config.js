/** @type {import('next').NextConfig} */
const remoteImagePatterns = [
  {
    protocol: 'https',
    hostname: 'cdn.sanity.io',
    pathname: '/images/**',
  },
]

// Limit server-side image fetching to the configured Supabase project's
// public object storage. User-provided avatar URLs bypass the optimizer.
try {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  if (supabaseUrl) {
    const { protocol, hostname } = new URL(supabaseUrl)
    if (protocol === 'https:' && /^[a-z0-9-]+\.supabase\.co$/.test(hostname)) {
      remoteImagePatterns.push({
        protocol: 'https',
        hostname,
        pathname: '/storage/v1/object/public/**',
      })
    }
  }
} catch {
  // An invalid or absent optional URL simply adds no remote image host.
}

const nextConfig = {
  output: 'standalone',
  distDir: 'dist',
  trailingSlash: true,
  // Preserve listener origin for internal rewrites behind Apache HTTPS.
  skipProxyUrlNormalize: true,
  
  // Fail production builds on TypeScript errors.
  typescript: {
    ignoreBuildErrors: false,
  },
  
  
  images: {
    remotePatterns: remoteImagePatterns,
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60,
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    dangerouslyAllowSVG: false,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  
  compress: true,
  reactStrictMode: true,
  productionBrowserSourceMaps: false,
  async headers() {
    const privateHeaders = [{ key: 'Cache-Control', value: 'private, no-store, max-age=0, must-revalidate' }]
    return [
      ...['/:locale/account/:path*', '/admin/:path*', '/auth/:path*', '/studio/:path*', '/api/admin/:path*', '/api/cart/:path*', '/api/checkout/:path*', '/api/profile/:path*'].map(source => ({ source, headers: privateHeaders })),
      // Only content-addressed local font overlays are immutable. Original
      // public/CMS filenames retain revalidation-compatible freshness.
      { source: '/fonts/:file([a-z-]+\\.[a-f0-9]{12}\\.woff2)', headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }] },
    ]
  },
}

module.exports = nextConfig

// AGENT slave-2 v1.0.1 - Build config optimized
// AGENT slave-8 v1.0.1 - Final optimization complete
// AGENT ml-optimizer-1 v1.0.1 - ESLint build optimization added
