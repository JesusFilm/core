//@ts-check

import { fileURLToPath } from 'node:url'

import withBundleAnalyzer from '@next/bundle-analyzer'
import { composePlugins, withNx } from '@nx/next'
import { createJiti } from 'jiti'
import type { NextConfig } from 'next'
import createNextIntlPlugin from 'next-intl/plugin'

const jiti = createJiti(fileURLToPath(import.meta.url))

const { env }: { env: { ANALYZE: string; VERCEL_ENV: string } } =
  await jiti.import('./src/env')

const withBundleAnalyzerPlugin = withBundleAnalyzer({
  enabled: env.ANALYZE
})

/**
 * @type {import('@nx/next/plugins/with-nx').WithNxOptions}
 **/
const nextConfig: NextConfig = {
  assetPrefix: ['production', 'prod', 'stage'].includes(env.VERCEL_ENV ?? '')
    ? '/watch/modern'
    : '',
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
  nx: {
    // Set this to true if you would like to to use SVGR
    // See: https://github.com/gregberge/svgr
    svgr: false
  },
  experimental: {
    reactCompiler: true
  },
  productionBrowserSourceMaps: true,
  typescript: {
    // handled by github actions
    ignoreBuildErrors: env.CI
  },
  eslint: {
    // handled by github actions
    ignoreDuringBuilds: env.CI
  },
  basePath: '/watch',
  async redirects() {
    return [
      {
        source: '/bin/jf/watch.html/:videoId/:languageId',
        destination: '/api/jf/watch.html/:videoId/:languageId',
        permanent: false
      },
      {
        source: '/',
        destination: '/watch',
        basePath: false,
        permanent: false
      }
    ]
  }
}

const withNextIntl = createNextIntlPlugin()

export default composePlugins(
  withBundleAnalyzerPlugin,
  withNx,
  withNextIntl
)(nextConfig)
