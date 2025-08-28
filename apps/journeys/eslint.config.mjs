import nextConfig from '../../libs/shared/eslint/next.mjs'

export default [
  ...nextConfig,
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
    rules: {
      '@next/next/no-html-link-for-pages': ['error', 'apps/journeys/pages/']
    }
  },
  {
    files: ['**/*.ts', '**/*.tsx'],
    rules: {
      'no-void': ['error', { allowAsStatement: true }],
      '@typescript-eslint/no-misused-promises': 'off',
      '@typescript-eslint/no-require-imports': 'warn',
      '@typescript-eslint/require-await': 'warn'
    }
  }
]
