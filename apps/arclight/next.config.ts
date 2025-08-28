import { composePlugins, withNx } from '@nx/next'
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
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
  }
}

const plugins = [
  // Add more Next.js plugins to this list if needed.
  withNx
]

module.exports = composePlugins(...plugins)(nextConfig)
