const withBundleAnalyzer = require('@next/bundle-analyzer')
const { composePlugins, withNx } = require('@nx/next')

const { i18n } = require('./next-i18next.config')

/**
 * @type {import('@nx/next/plugins/with-nx').WithNxOptions}
 **/
const nextConfig = {
  nx: {
    // Set this to true if you would like to to use SVGR
    // See: https://github.com/gregberge/svgr
    svgr: false
  },
  i18n,
  compiler: {
    // For other options, see https://nextjs.org/docs/architecture/nextjs-compiler#emotion
    emotion: true
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
  transpilePackages: ['shared-ui', 'shared-ui-dynamic'],
  experimental: {
    outputFileTracingExcludes: {
      '*': [
        'node_modules/@swc/core-linux-x64-gnu',
        'node_modules/@swc/core-linux-x64-musl',
        'node_modules/esbuild-linux-64/bin'
      ]
    },
    fallbackNodePolyfills: false
  }
}
const plugins = [withNx]
if (process.env.ANALYZE === 'true') {
  plugins.push(withBundleAnalyzer({ enabled: true, openAnalyzer: true }))
}
module.exports = composePlugins(...plugins)(nextConfig)
