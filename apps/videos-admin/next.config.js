const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true'
})
const { composePlugins, withNx } = require('@nx/next')

/**
 * @type {import('@nx/next/plugins/with-nx').WithNxOptions}
 **/
const nextConfig = {
  // Enables Cache Components mode (Next.js 16+).
  // See: https://nextjs.org/docs/app/api-reference/config/next-config-js/cacheComponents
  cacheComponents: true,
  compiler: {
    emotion: true
  },
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
      }
    ],
    minimumCacheTTL: 31536000
  },
  reactCompiler: true,
  modularizeImports: {
    lodash: {
      transform: 'lodash/{{member}}'
    }
  },
  nx: {},
  productionBrowserSourceMaps: true,
  typescript: {
    // handled by github actions
    ignoreBuildErrors: process.env.CI === 'true'
  },
  transpilePackages: ['locales'],
  outputFileTracingExcludes: {
    '*': [
      'node_modules/@swc/core-linux-x64-gnu',
      'node_modules/@swc/core-linux-x64-musl',
      'node_modules/esbuild-linux-64/bin'
    ]
  }
}

module.exports = composePlugins(withBundleAnalyzer, withNx)(nextConfig)
