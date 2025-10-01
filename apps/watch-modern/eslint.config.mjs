import nextConfig from '../../libs/shared/eslint/next.mjs'

export default [
  ...nextConfig,
  {
    ignores: [
      'apps/watch-modern/jest.config.ts',
      'apps/watch-modern/next.config.mjs'
    ]
  },
  {
    files: ['**/*.ts', '**/*.tsx'],
    rules: {
      'no-void': ['error', { allowAsStatement: true }],
      '@typescript-eslint/no-misused-promises': 'off'
    }
  }
]
