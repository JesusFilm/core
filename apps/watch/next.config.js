const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true'
})
const { composePlugins, withNx } = require('@nx/next')
const path = require('path')

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
  transpilePackages: ['shared-ui', 'uimodern'],
  outputFileTracingExcludes: {
    '*': [
      'node_modules/@swc/core-linux-x64-gnu',
      'node_modules/@swc/core-linux-x64-musl',
      'node_modules/esbuild-linux-64/bin'
    ]
  },
  webpack(config) {
    // make /assets/* in CSS work inside Nx monorepo
    config.resolve.alias['/assets'] = path.resolve(__dirname, 'public/assets')

    // Configure SVGR manually to replace deprecated NX SVGR support
    // SVGs can be imported as React components or as URLs
    config.module.rules.push({
      test: /\.svg$/i,
      type: 'asset',
      resourceQuery: /url/ // *.svg?url
    })
    config.module.rules.push({
      test: /\.svg$/i,
      issuer: /\.[jt]sx?$/,
      resourceQuery: { not: [/url/] }, // exclude if *.svg?url
      use: ['@svgr/webpack']
    })

    return config
  },
  basePath: '/watch',
  // eslint-disable-next-line @typescript-eslint/require-await
  async redirects() {
    return [
      {
        source: '/',
        destination: '/watch',
        permanent: false,
        basePath: false
      },
      {
        source: '/easter',
        destination: '/easter.html/english.html',
        permanent: true
      }
    ]
  }
}
module.exports = composePlugins(withBundleAnalyzer, withNx)(nextConfig)
