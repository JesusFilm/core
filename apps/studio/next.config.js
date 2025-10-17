const { composePlugins, withNx } = require('@nx/next')

/**
 * @type {import('@nx/next/plugins/with-nx').WithNxOptions}
 **/
const nextConfig = {
  experimental: {
    reactCompiler: true
  },
  nx: {
    svgr: false
  },
  transpilePackages: ['shared-ui'],
  typescript: {
    ignoreBuildErrors: process.env.CI === 'true'
  },
  eslint: {
    ignoreDuringBuilds: process.env.CI === 'true'
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'source.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'imagedelivery.net',
      }
    ]
  }
}

module.exports = composePlugins(withNx)(nextConfig)
