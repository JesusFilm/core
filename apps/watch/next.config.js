const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true'
})
const { composePlugins, withNx } = require('@nx/next')

const { i18n } = require('./next-i18next.config')

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
        hostname: `customer-${
          process.env.NEXT_PUBLIC_CLOUDFLARE_STREAM_CUSTOMER_CODE ?? ''
        }.cloudflarestream.com`
      },
      // Mux video service
      { protocol: 'https', hostname: 'image.mux.com' }
    ],
    minimumCacheTTL: 31536000
  },
  i18n,
  experimental: {
    reactCompiler: true
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
  productionBrowserSourceMaps: true,
  typescript: {
    // handled by github actions
    ignoreBuildErrors: process.env.CI === 'true'
  },
  eslint: {
    // handled by github actions
    ignoreDuringBuilds: process.env.CI === 'true'
  },
  transpilePackages: ['shared-ui'],
  outputFileTracingExcludes: {
    '*': [
      'node_modules/@swc/core-linux-x64-gnu',
      'node_modules/@swc/core-linux-x64-musl',
      'node_modules/esbuild-linux-64/bin'
    ]
  },
  async redirects() {
    return [
      {
        source: '/',
        destination: '/watch',
        permanent: false
      },
      {
        source: '/bin/jf/watch.html/:videoId/:languageId',
        destination: '/api/jf/watch.html/:videoId/:languageId',
        permanent: false
      },
      {
        source: '/watch/easter',
        destination: '/watch/easter.html/english.html',
        permanent: true
      }
    ]
  }
}
module.exports = composePlugins(withBundleAnalyzer, withNx)(nextConfig)
