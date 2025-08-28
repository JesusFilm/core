import withBundleAnalyzer from '@next/bundle-analyzer'
import { composePlugins, withNx } from '@nx/next'
import type { NextConfig } from 'next'

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
  eslint: {
    // handled by github actions
    ignoreDuringBuilds: process.env.CI === 'true'
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
  experimental: {
    fallbackNodePolyfills: false,
    reactCompiler: true
  }
}
const plugins: any[] = [withNx]
if (process.env.ANALYZE === 'true') {
  plugins.push(withBundleAnalyzer({ enabled: true, openAnalyzer: true }))
}
module.exports = composePlugins(...plugins)(nextConfig)
