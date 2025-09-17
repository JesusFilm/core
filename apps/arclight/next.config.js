// @ts-check

const { composePlugins, withNx } = require('@nx/next')
// Prisma Next.js monorepo workaround plugin (static require per docs)
// eslint-disable-next-line @typescript-eslint/no-var-requires, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
const PrismaPlugin =
  /** @type {new () => import('webpack').WebpackPluginInstance} */ (
    require('@prisma/nextjs-monorepo-workaround-plugin').PrismaPlugin
  )

/**
 * @type {import('@nx/next/plugins/with-nx').WithNxOptions}
 **/
const nextConfig = {
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
  outputFileTracingExcludes: {
    '*': [
      'node_modules/@swc/core-linux-x64-gnu',
      'node_modules/@swc/core-linux-x64-musl',
      'node_modules/esbuild-linux-64/bin'
    ]
  },
  experimental: {
    fallbackNodePolyfills: false,
    reactCompiler: true
  },
  /**
   * @param {import('webpack').Configuration} config
   * @param {{ isServer: boolean }} ctx
   * @returns {import('webpack').Configuration}
   */
  webpack: (config, ctx) => {
    const { isServer } = ctx
    if (!isServer) return config
    config.plugins = Array.isArray(config.plugins) ? config.plugins : []
    /** @type {import('webpack').WebpackPluginInstance} */
    const prismaPlugin = new PrismaPlugin()
    config.plugins.push(prismaPlugin)
    return config
  }
}

const plugins = [
  // Add more Next.js plugins to this list if needed.
  withNx
]

module.exports = composePlugins(...plugins)(nextConfig)
