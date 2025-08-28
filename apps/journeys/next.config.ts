import { composePlugins, withNx } from '@nx/next'
import type { NextConfig } from 'next'
import { withPlausibleProxy } from 'next-plausible'

import { i18n } from './next-i18next.config'

const nextConfig: NextConfig = {
  nx: {
    // Set this to true if you would like to to use SVGR
    // See: https://github.com/gregberge/svgr
    svgr: false
  },
  i18n,
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
  eslint: {
    // handled by github actions
    ignoreDuringBuilds: process.env.CI === 'true'
  },
  transpilePackages: ['journeys-ui'],
  outputFileTracingExcludes: {
    '*': [
      'node_modules/@swc/core-linux-x64-gnu',
      'node_modules/@swc/core-linux-x64-musl',
      'node_modules/esbuild-linux-64/bin'
    ]
  },
  rewrites() {
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
