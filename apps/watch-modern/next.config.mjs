//@ts-check

import { fileURLToPath } from 'node:url'
import path from 'node:path'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

import { existsSync } from 'node:fs'
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
  transpilePackages: ['shared', 'uimodern'],
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
  async rewrites() {
    return [
      {
        source: '/studio/:path*',
        destination: '/:path*'
      }
    ]
  },
  async redirects() {
    return [
      {
        source: '/bin/jf/watch.html/:videoId/:languageId',
        destination: '/api/jf/watch.html/:videoId/:languageId',
        permanent: false
      },
      {
        source: '/',
        destination: '/studio',
        permanent: false
      }
    ]
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Force webpack to resolve to the correct versions of react-konva and react-reconciler
      // This ensures compatibility with React 19 by pointing to the specific versioned directories
      const rootDir = path.resolve(__dirname, '../..')
      const reactKonvaPath = path.resolve(
        rootDir,
        'node_modules/.pnpm/react-konva@19.2.0_@types+react@19.0.0_konva@10.0.8_react-dom@19.0.0_react@19.0.0__react@19.0.0/node_modules/react-konva'
      )
      const reactReconcilerPath = path.resolve(
        rootDir,
        'node_modules/.pnpm/react-reconciler@0.33.0_react@19.0.0/node_modules/react-reconciler'
      )
      
      // Only add aliases if the paths exist
      if (existsSync(reactKonvaPath)) {
        config.resolve.alias = {
          ...config.resolve.alias,
          'react-konva': reactKonvaPath
        }
      }
      if (existsSync(reactReconcilerPath)) {
        config.resolve.alias = {
          ...config.resolve.alias,
          'react-reconciler': reactReconcilerPath
        }
      }
    }
    return config
  }
}

const withNextIntl = createNextIntlPlugin()

export default composePlugins(
  withBundleAnalyzerPlugin,
  withNx,
  withNextIntl
)(nextConfig)
