const withNx = require('@nx/next/plugins/with-nx')
const withPlugins = require('next-compose-plugins')
const withImages = require('next-images')

const { i18n, localePath } = require('./next-i18next.config')

/**
 * @type {import('@nx/next/plugins/with-nx').WithNxOptions}
 **/
const nextConfig = {
  i18n,
  localePath,
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
      'customer-209o3ptmsiaetvfx.cloudflarestream.com',
      'cloudflarestream.com'
    ]
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
  transpilePackages: ['journeys-ui']
}
module.exports = withPlugins([[withImages], [withNx]], nextConfig)
