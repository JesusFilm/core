import nextConfig from '../../shared/eslint/next.mjs'

export default [
  ...nextConfig,
  {
    ignores: ['libs/shared/ui-dynamic/vitest.config.mts']
  },
  {
    files: ['**/*.ts', '**/*.tsx'],
    rules: {
      'no-void': ['error', { allowAsStatement: true }],
      '@typescript-eslint/no-misused-promises': 'off'
    }
  }
]
