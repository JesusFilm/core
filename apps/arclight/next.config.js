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
      // Default Prisma client location (required for rhel-openssl-3.0.x)
      'node_modules/.prisma/client/**'
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

    // Optionally source folder names from env, but normalize to paths under node_modules
    /** @type {string[]} */
    /** @type {string[]} */
    const envClientFolders = []
    /** @type {unknown} */
    const mediaEnvUnknown = process.env.PRISMA_LOCATION_MEDIA
    /** @type {unknown} */
    const languagesEnvUnknown = process.env.PRISMA_LOCATION_LANGUAGES
    /**
     * @param {unknown} maybePath
     * @returns {string | null}
     */
    const extractNodeModulesSubpath = (maybePath) => {
      if (typeof maybePath !== 'string' || maybePath.length === 0) return null
      const marker = 'node_modules/'
      const idx = maybePath.lastIndexOf(marker)
      if (idx === -1) return null
      return maybePath.slice(idx + marker.length)
    }
    const mediaSub = extractNodeModulesSubpath(mediaEnvUnknown)
    const languagesSub = extractNodeModulesSubpath(languagesEnvUnknown)
    if (typeof mediaSub === 'string') envClientFolders.push(mediaSub)
    if (typeof languagesSub === 'string') envClientFolders.push(languagesSub)
    const effectiveClientFolders = Array.from(
      new Set([...prismaClientFolders, ...envClientFolders])
    )

    /** @type {import('copy-webpack-plugin').Pattern[]} */
    const patterns = [
      // Also place engine in Prisma's default lookup folder inside server output
      {
        from: path.join(
          process.cwd(),
          'node_modules',
          '@prisma',
          'engines',
          engineFile
        ),
        to: path.join('node_modules', '.prisma', 'client', engineFile),
        noErrorOnMissing: true
      }
    ].concat(
      effectiveClientFolders.flatMap((clientFolder) => [
        // Prefer copying from the generated client folder if present
        {
          from: path.join(
            process.cwd(),
            'node_modules',
            clientFolder,
            engineFile
          ),
          to: path.join('node_modules', clientFolder, engineFile),
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
          to: path.join('node_modules', clientFolder, engineFile),
          noErrorOnMissing: true
        }
      ])
    )

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
