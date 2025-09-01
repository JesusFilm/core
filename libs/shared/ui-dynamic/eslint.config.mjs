import nextConfig from '../../shared/eslint/next.mjs'

export default [
  ...nextConfig,
  {
    ignores: ['libs/shared/ui-dynamic/jest.config.ts']
  },
  {
    files: ['**/*.ts', '**/*.tsx'],
    rules: {
      'no-void': ['error', { allowAsStatement: true }],
      '@typescript-eslint/no-misused-promises': 'off'
    }
  }
]
