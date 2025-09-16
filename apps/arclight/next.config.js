// @ts-check

const { composePlugins, withNx } = require('@nx/next')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const path = require('path')

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
  // Ensure Prisma generated clients and ONLY the required rhel engine are included
  // Keep this list minimal to avoid hitting Vercel's 250MB unzipped function limit
  outputFileTracingIncludes: {
    '*': [
      // Generated Prisma clients used by Arclight
      'node_modules/.prisma/api-media-client/**',
      'node_modules/.prisma/api-languages-client/**',
      // Prisma engines + default client location (required for rhel-openssl-3.0.x)
      'node_modules/.prisma/client/**',
      'node_modules/@prisma/engines/**'
    ]
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

    const engineFile = 'libquery_engine-rhel-openssl-3.0.x.so.node'
    const prismaClientFolders = [
      '.prisma/api-media-client',
      '.prisma/api-languages-client'
    ]

    /** @type {import('copy-webpack-plugin').Pattern[]} */
    const patterns = prismaClientFolders.flatMap((clientFolder) => [
      // Prefer copying from the generated client folder if present
      {
        from: path.join(
          process.cwd(),
          'node_modules',
          clientFolder,
          engineFile
        ),
        to: path.join(clientFolder, engineFile),
        noErrorOnMissing: true
      },
      // Fallback: copy from @prisma/engines into each client folder
      {
        from: path.join(
          process.cwd(),
          'node_modules',
          '@prisma',
          'engines',
          engineFile
        ),
        to: path.join(clientFolder, engineFile),
        noErrorOnMissing: true
      }
    ])

    config.plugins = Array.isArray(config.plugins) ? config.plugins : []
    config.plugins.push(new CopyWebpackPlugin({ patterns }))

    return config
  }
}

const plugins = [
  // Add more Next.js plugins to this list if needed.
  withNx
]

module.exports = composePlugins(...plugins)(nextConfig)
