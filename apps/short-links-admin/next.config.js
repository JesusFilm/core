const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true'
})
const { composePlugins, withNx } = require('@nx/next')

/**
 * @type {import('@nx/next/plugins/with-nx').WithNxOptions}
 **/
const nextConfig = {
  compiler: {
    emotion: true
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
  outputFileTracingExcludes: {
    '*': [
      'node_modules/@swc/core-linux-x64-gnu',
      'node_modules/@swc/core-linux-x64-musl',
      'node_modules/esbuild-linux-64/bin'
    ]
  }
}

module.exports = composePlugins(withBundleAnalyzer, withNx)(nextConfig)
