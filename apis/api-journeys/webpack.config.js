const { composePlugins, withNx } = require('@nx/webpack')
const webpack = require('webpack')

// Nx plugins for webpack.
module.exports = composePlugins(withNx(), (config) => {
  // Ignore optional NestJS peer dependencies that aren't used
  config.plugins = [
    ...(config.plugins || []),
    new webpack.IgnorePlugin({
      checkResource(resource) {
        const optionalDeps = [
          '@nestjs/websockets',
          '@nestjs/microservices',
          '@as-integrations/fastify',
          '@apollo/gateway',
          'class-validator',
          'class-transformer'
        ]
        return optionalDeps.some((dep) => resource.startsWith(dep))
      }
    })
  ]
  return config
})
