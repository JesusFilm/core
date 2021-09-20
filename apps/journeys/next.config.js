// eslint-disable-next-line @typescript-eslint/no-var-requires
const withNx = require('@nrwl/next/plugins/with-nx')
const withPlugins = require('next-compose-plugins')
const withImages = require('next-images')
/**
 * @type {import('@nrwl/next/plugins/with-nx').WithNxOptions}
 **/
const nextConfig = {
  images: {
    domains: ['images.unsplash.com', 'localhost', 'unsplash.com']
  },
  nx: {
    // Set this to true if you would like to to use SVGR
    // See: https://github.com/gregberge/svgr
    svgr: false

  }
}
module.exports = withPlugins([[withImages], [withNx]], nextConfig)
// module.exports = withImages(nextConfig)
