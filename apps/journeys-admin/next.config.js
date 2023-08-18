const withNx = require('@nx/next/plugins/with-nx')
const withPlugins = require('next-compose-plugins')
const withImages = require('next-images')

const { i18n } = require('./next-i18next.config')
/**
 * @type {import('@nx/next/plugins/with-nx').WithNxOptions}
 **/
const nextConfig = {
  i18n,
  images: {
    domains: [
      'images.unsplash.com',
      'localhost',
      'unsplash.com',
      'imagizer.imageshack.com',
      // arclight image provider - cloudfront
      'd1wl257kev7hsz.cloudfront.net',
      'i.ytimg.com',
      // cloudflare
      'imagedelivery.net',
      `customer-${
        process.env.NEXT_PUBLIC_CLOUDFLARE_STREAM_CUSTOMER_CODE ?? ''
      }.cloudflarestream.com`
    ]
  },
  nx: {
    // Set this to true if you would like to to use SVGR
    // See: https://github.com/gregberge/svgr
    svgr: false
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
  }
}
module.exports = withPlugins([[withImages], [withNx]], nextConfig)
