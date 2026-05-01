// @ts-check

import { fileURLToPath } from 'node:url'

import withBundleAnalyzer from '@next/bundle-analyzer'
import { composePlugins, withNx } from '@nx/next'
import { createJiti } from 'jiti'
import createNextIntlPlugin from 'next-intl/plugin'

const jiti = createJiti(fileURLToPath(import.meta.url))

/**
 * @type {import('@/env')}
 */
const { env } = await jiti.import('./src/env')

/**
 * @type {import('@nx/next/plugins/with-nx').WithNxOptions}
 **/
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'http', hostname: 'localhost' },
      { protocol: 'https', hostname: 'unsplash.com' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'imagizer.imageshack.com' },
      { protocol: 'https', hostname: 'i.ytimg.com' },
      // jesusfilm wordpress website
      { protocol: 'https', hostname: 'develop.jesusfilm.org' },
      { protocol: 'https', hostname: 'jesusfilm.org' },
      { protocol: 'https', hostname: 'www.jesusfilm.org' },
      // arclight image provider - cloudfront
      { protocol: 'https', hostname: 'd1wl257kev7hsz.cloudfront.net' },
      { protocol: 'https', hostname: 'd3s4plubcuq0w9.cloudfront.net' },
      // cloudflare
      { protocol: 'https', hostname: 'imagedelivery.net' },
      {
        protocol: 'https',
        hostname: `customer-${env.NEXT_PUBLIC_CLOUDFLARE_STREAM_CUSTOMER_CODE}.cloudflarestream.com`
      }
    ],
    minimumCacheTTL: 31536000
  },
  modularizeImports: {
    lodash: {
      transform: 'lodash/{{member}}'
    }
  },
  nx: {},
  reactCompiler: true,
  productionBrowserSourceMaps: true,
  typescript: {
    ignoreBuildErrors: env.CI
  },
  outputFileTracingExcludes: {
    '*': [
      'node_modules/@swc/core-linux-x64-gnu',
      'node_modules/@swc/core-linux-x64-musl',
      'node_modules/esbuild-linux-64/bin'
    ]
  },
  // eslint-disable-next-line @typescript-eslint/require-await
  async redirects() {
    return [
      {
        source: '/',
        destination: 'https://www.jesusfilm.org/watch',
        permanent: false
      }
    ]
  }
}

const withBundleAnalyzerPlugin = withBundleAnalyzer({
  enabled: env.ANALYZE
})

const withNextIntl = createNextIntlPlugin()

export default composePlugins(
  withBundleAnalyzerPlugin,
  withNx,
  withNextIntl
)(nextConfig)
