// @ts-check

/**
 * Runtime Next.js config, copied to dist/apps/arclight/next.config.js by the
 * `_build` target. Unlike next.config.js it must not require `@nx/next`, which
 * is not installed in the production Docker image (nrwl/nx#36511 — the reason
 * arclight builds with `next build` directly instead of `@nx/next:build`).
 * Keep the options below in sync with next.config.js.
 *
 * @type {import('next').NextConfig}
 **/
const nextConfig = {
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
  },
  reactCompiler: true
}

module.exports = nextConfig
