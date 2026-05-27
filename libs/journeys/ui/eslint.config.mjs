import nextConfig from '../../shared/eslint/next.mjs'

export default [
  ...nextConfig,
  {
    ignores: [
      'libs/journeys/ui/postcss.config.mjs',
      'libs/journeys/ui/vitest.config.mts'
    ]
  },
  {
    files: ['**/*.ts', '**/*.tsx'],
    rules: {
      'no-void': ['error', { allowAsStatement: true }],
      '@typescript-eslint/no-misused-promises': 'off',
      '@typescript-eslint/require-await': 'off'
    }
  }
]
