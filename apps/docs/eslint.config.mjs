import nextConfig from '../../libs/shared/eslint/next.mjs'

export default [
  ...nextConfig,
  {
    ignores: ['apps/docs/.docusaurus/*', 'apps/docs/i18next-parser.config.js']
  },
  {
    files: ['apps/docs/docusaurus.config.js'],
    rules: {
      '@typescript-eslint/no-unsafe-assignment': 'off'
    }
  }
]
