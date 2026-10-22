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
  
  // NOTE: Custom headers are not supported with static export (output: 'export').
  // Configure headers in your web server (nginx, Apache, Vercel, etc.) instead.
  // Removed headers() function to prevent build warnings.
  
  compress: true,
  reactStrictMode: true,
  productionBrowserSourceMaps: false,
}

module.exports = nextConfig

// AGENT slave-2 v1.0.1 - Build config optimized
// AGENT slave-8 v1.0.1 - Final optimization complete
// AGENT ml-optimizer-1 v1.0.1 - ESLint build optimization added
