import nextConfig from '../../libs/shared/eslint/next.mjs'

export default [
  ...nextConfig,
  {
    ignores: [
      'apps/arclight/next.config.js',
      'apps/arclight/vitest.config.mts'
    ]
  }
]
