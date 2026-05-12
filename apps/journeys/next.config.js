const { composePlugins, withNx } = require('@nx/next')
const { withPlausibleProxy } = require('next-plausible')

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
  // NODE_ENV gate needed.
  //
  // Kept aligned with `@core/shared/dev-hosts` (libs/shared/dev-hosts) —
  // identical fail-closed semantics. We don't `require()` the TS helper
  // here because next.config.js is plain CJS executed at Node startup
  // before any TS transpile is wired up, and no other next.config.js in
  // this repo currently pulls from libs/. Update both sites in lockstep
  // if the parsing rules change.
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
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'unsplash.com' },
      { protocol: 'https', hostname: 'imagizer.imageshack.com' },
      // arclight image provider - cloudfront
      { protocol: 'https', hostname: 'd1wl257kev7hsz.cloudfront.net' },
      { protocol: 'https', hostname: 'i.ytimg.com' },
      // cloudflare
      { protocol: 'https', hostname: 'imagedelivery.net' },
      {
        protocol: 'https',
        hostname: 'customer-209o3ptmsiaetvfx.cloudflarestream.com'
      },
      { protocol: 'https', hostname: 'cloudflarestream.com' },
      { protocol: 'https', hostname: 'image.mux.com' }
    ]
  },
  productionBrowserSourceMaps: true,
  typescript: {
    // handled by github actions
    ignoreBuildErrors: process.env.CI === 'true'
  },
  transpilePackages: ['journeys-ui'],
  outputFileTracingExcludes: {
    '*': [
      'node_modules/@swc/core-linux-x64-gnu',
      'node_modules/@swc/core-linux-x64-musl',
      'node_modules/esbuild-linux-64/bin'
    ]
  },
  async rewrites() {
    return [
      {
        source: '/api/graphql',
        destination: process.env.GATEWAY_URL
      },
      {
        source: '/robots.txt',
        destination: '/api/robots'
      }
    ]
  }
}
module.exports = composePlugins(
  withNx,
  withPlausibleProxy({
    subdirectory: 'plausible',
    customDomain: process.env.PLAUSIBLE_URL
  })
)(nextConfig)
