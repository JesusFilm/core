// @ts-check

const { composePlugins, withNx } = require('@nx/next')

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
      // Node-API engine for AWS Lambda (Amazon Linux, OpenSSL 3)
      'node_modules/.prisma/client/libquery_engine-rhel-openssl-3.0.x.so.node',
      '../../node_modules/.prisma/client/libquery_engine-rhel-openssl-3.0.x.so.node'
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
  }
}

const plugins = [
  // Add more Next.js plugins to this list if needed.
  withNx
]

module.exports = composePlugins(...plugins)(nextConfig)
