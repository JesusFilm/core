// eslint-disable-next-line @typescript-eslint/no-var-requires
const withNx = require('@nrwl/next/plugins/with-nx')
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true'
})
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
  basePath: '/watch',
  productionBrowserSourceMaps: true,
  async redirects() {
    return [
      {
        source: '/',
        destination: '/watch',
        basePath: false,
        permanent: false
      }
    ]
  }
}
module.exports = (_phase, { defaultConfig }) => {
  const plugins = [withBundleAnalyzer, withNx]
  return plugins.reduce((acc, plugin) => plugin(acc), {
    ...defaultConfig,
    ...nextConfig
  })
}
