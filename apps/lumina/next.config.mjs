//@ts-check

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

const withBundleAnalyzerPlugin = withBundleAnalyzer({
  enabled: env.ANALYZE
})

/**
 * @type {import('@nx/next/plugins/with-nx').WithNxOptions}
 **/
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'http', hostname: 'localhost' },
      { protocol: 'https', hostname: 'unsplash.com' },
      { protocol: 'https', hostname: 'images.unsplash.com' }
    ],
    minimumCacheTTL: 31536000
  },
  modularizeImports: {
    lodash: {
      transform: 'lodash/{{member}}'
    }
  },
  nx: {
    svgr: false
  },
  experimental: {
    reactCompiler: true
  },
  productionBrowserSourceMaps: true,
  typescript: {
    ignoreBuildErrors: env.CI
  },
  eslint: {
    ignoreDuringBuilds: env.CI
  }
}

const withNextIntl = createNextIntlPlugin()

export default composePlugins(
  withBundleAnalyzerPlugin,
  withNx,
  withNextIntl
)(nextConfig)
