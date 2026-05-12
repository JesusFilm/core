const { composePlugins, withNx } = require('@nx/next')
const { withPlausibleProxy } = require('next-plausible')

const { i18n } = require('./next-i18next.config')

/**
 * @type {import('@nx/next/plugins/with-nx').WithNxOptions}
 **/
const nextConfig = {
  nx: {},
  i18n,
  // Permit Tailscale MagicDNS hosts (e.g. `tailscale-mbp-siyang`) to load
  // the dev server. Wildcards (not regex) per Next.js docs:
  // https://nextjs.org/docs/app/api-reference/config/next-config-js/allowedDevOrigins
  // Dev-only by Next.js semantics — no NODE_ENV gate needed.
  allowedDevOrigins: ['tailscale-*'],
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
