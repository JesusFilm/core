// eslint-disable-next-line @typescript-eslint/no-var-requires
const withNx = require('@nrwl/next/plugins/with-nx')
const withPlugins = require('next-compose-plugins')
const withImages = require('next-images')
const { i18n } = require('./next-i18next.config')
/**
 * @type {import('@nrwl/next/plugins/with-nx').WithNxOptions}
 **/
const nextConfig = {
  images: {
    domains: [
      'images.unsplash.com',
      'localhost',
      'unsplash.com',
      'd1wl257kev7hsz.cloudfront.net'
    ],
    disableStaticImages: true
  },
  nx: {
    // Set this to true if you would like to to use SVGR
    // See: https://github.com/gregberge/svgr
    svgr: false
  },
  i18n,
  trailingSlash: true
}
module.exports = withPlugins([[withImages], [withNx]], nextConfig)
