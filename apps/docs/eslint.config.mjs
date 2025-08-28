import nextConfig from '../../libs/shared/eslint/next.mjs'

export default [
  ...nextConfig,
  { ignores: ['apps/docs/.docusaurus/*'] },
  {
    files: ['apps/docs/docusaurus.config.js'],
    rules: {
      '@typescript-eslint/no-unsafe-assignment': 'off'
    }
  }
]
