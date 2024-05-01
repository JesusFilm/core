// @ts-check

const { composePlugins, withNx } = require('@nx/next')
const createNextIntlPlugin = require('next-intl/plugin')

// eslint-disable-next-line @typescript-eslint/no-var-requires

const withNextIntl = createNextIntlPlugin()

/**
 * @type {import('@nx/next/plugins/with-nx').WithNxOptions}
 **/
const nextConfig = {
  swcMinify: true,
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost'
      },
      {
        protocol: 'https',
        hostname: 'd1wl257kev7hsz.cloudfront.net'
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
  basePath: '/watch',
  productionBrowserSourceMaps: true,
  typescript: {
    // handled by github actions
    ignoreBuildErrors: process.env.CI === 'true'
  },
  eslint: {
    // handled by github actions
    ignoreDuringBuilds: process.env.CI === 'true'
  },
  compiler: {
    // For other options, see https://nextjs.org/docs/architecture/nextjs-compiler#emotion
    emotion: true
  },
  async redirects() {
    return [
      {
        source: '/',
        destination: '/watch',
        basePath: false,
        permanent: false
      },
      {
        source: '/:path((?!watch).*)',
        destination: '/watch/:path',
        basePath: false,
        permanent: false
      },
      {
        source: '/bin/jf/watch.html/:videoId/:languageId',
        destination: '/api/jf/watch.html/:videoId/:languageId',
        permanent: false
      }
    ]
  }
}

const plugins = [
  // Add more Next.js plugins to this list if needed.
  withNextIntl,
  withNx
]

module.exports = composePlugins(...plugins)(nextConfig)
