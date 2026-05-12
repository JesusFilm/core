const withBundleAnalyzer = require('@next/bundle-analyzer')
const { composePlugins, withNx } = require('@nx/next')

const { i18n } = require('./next-i18next.config')

/**
 * @type {import('@nx/next/plugins/with-nx').WithNxOptions}
 **/
const nextConfig = {
  nx: {},
  i18n,
  // Permit the developer hostnames listed in `NEXT_PUBLIC_DEV_HOSTS`
  // (Doppler dev config) to load the dev server. Absence of the secret
  // yields `[]` (no relaxation); dev-only by Next.js semantics — no
  // NODE_ENV gate needed. The helper is duplicated inline because
  // next.config.js is JS and importing the TS helper would require
  // additional build wiring.
  // https://nextjs.org/docs/app/api-reference/config/next-config-js/allowedDevOrigins
  allowedDevOrigins: (() => {
    try {
      const raw = process.env.NEXT_PUBLIC_DEV_HOSTS ?? ''
      if (raw === '') return []
      /** @type {unknown} */
      const parsed = JSON.parse(raw)
      if (parsed === null || typeof parsed !== 'object') return []
      return Object.values(
        /** @type {Record<string, unknown>} */ (parsed)
      ).filter((v) => typeof v === 'string')
    } catch {
      return []
    }
  })(),
  images: {
    remotePatterns: [
      { protocol: 'http', hostname: 'localhost' },
      { protocol: 'https', hostname: 'unsplash.com' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'imagizer.imageshack.com' },
      { protocol: 'https', hostname: 'i.ytimg.com' },
      // arclight image provider - cloudfront
      { protocol: 'https', hostname: 'd1wl257kev7hsz.cloudfront.net' },
      // cloudflare
      { protocol: 'https', hostname: 'imagedelivery.net' },
      {
        protocol: 'https',
        hostname: `customer-${
          process.env.NEXT_PUBLIC_CLOUDFLARE_STREAM_CUSTOMER_CODE ?? ''
        }.cloudflarestream.com`
      },
      { protocol: 'https', hostname: 'image.mux.com' }
    ]
  },
  async redirects() {
    return [
      {
        source: '/journeys',
        destination: '/',
        permanent: true
      },
      {
        source: '/reports',
        destination: '/reports/journeys',
        permanent: true
      },
      {
        source: '/journeys/:slug/edit',
        destination: '/journeys/:slug',
        permanent: true
      },
      {
        source: '/publisher/:slug/edit',
        destination: '/publisher/:slug',
        permanent: true
      },
      {
        source: '/privacy',
        destination: 'https://www.cru.org/us/en/about/privacy.html',
        permanent: true
      }
    ]
  },
  async rewrites() {
    return [
      {
        source: '/share/:slug',
        destination: `${process.env.PLAUSIBLE_URL}/share/:slug`
      },
      {
        source: '/js/:slug',
        destination: `${process.env.PLAUSIBLE_URL}/js/:slug`
      },
      {
        source: '/css/:slug',
        destination: `${process.env.PLAUSIBLE_URL}/css/:slug`
      },
      {
        source: '/api/stats/:path*',
        destination: `${process.env.PLAUSIBLE_URL}/api/stats/:path*`
      },
      {
        source: '/favicon/sources/:slug',
        destination: `${process.env.PLAUSIBLE_URL}/favicon/sources/:slug`
      }
    ]
  },
  productionBrowserSourceMaps: true,
  typescript: {
    // handled by github actions
    ignoreBuildErrors: process.env.CI === 'true'
  },
  transpilePackages: [
    'shared-ui',
    'shared-ui-dynamic',
    '@mui/x-data-grid',
    '@mui/x-date-pickers',
    '@mui/x-tree-view',
    '@mui/x-charts'
  ],
  outputFileTracingExcludes: {
    '*': [
      'node_modules/@swc/core-linux-x64-gnu',
      'node_modules/@swc/core-linux-x64-musl',
      'node_modules/esbuild-linux-64/bin'
    ]
  },
  reactCompiler: true
}
const plugins = [withNx]
if (process.env.ANALYZE === 'true') {
  plugins.push(withBundleAnalyzer({ enabled: true, openAnalyzer: true }))
}
module.exports = composePlugins(...plugins)(nextConfig)
