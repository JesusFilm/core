import nextConfig from '../../libs/shared/eslint/next.mjs'

export default [
  ...nextConfig,
  {
    ignores: [
      'apps/journeys/jest.config.ts',
      'apps/journeys/next.config.js',
      'apps/journeys/i18next-parser.config.js',
      'apps/journeys/**/*.stories.{ts,tsx,js,jsx}',
      'apps/journeys/src/libs/storybook/**'
    ]
  },
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
