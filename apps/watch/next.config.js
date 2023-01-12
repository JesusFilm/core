// eslint-disable-next-line @typescript-eslint/no-var-requires
const withNx = require('@nrwl/next/plugins/with-nx')
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true'
})
const withPlugins = require('next-compose-plugins')
/**
 * @type {import('@nrwl/next/plugins/with-nx').WithNxOptions}
 **/
const nextConfig = {
  swcMinify: true,
  images: {
    domains: ['localhost', 'd1wl257kev7hsz.cloudfront.net'],
    minimumCacheTTL: 31536000
  },
  experimental: {
    modularizeImports: {
      lodash: {
        transform: 'lodash/{{member}}'
      }
    }
  },
  nx: {
    // Set this to true if you would like to to use SVGR
    // See: https://github.com/gregberge/svgr
    svgr: false
  },
  i18n: {
    locales: ['en'],
    defaultLocale: 'en',
    localeDetection: false
  },
  trailingSlash: true,
  productionBrowserSourceMaps: true
}
module.exports = withPlugins([[withBundleAnalyzer], [withNx]], nextConfig)
