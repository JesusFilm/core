import nextConfig from '../../shared/eslint/next.mjs'

export default [
  ...nextConfig,
  {
    ignores: [
      'libs/journeys/ui/eslint.config.js',
      'libs/journeys/ui/jest.config.ts',
      'libs/journeys/ui/i18next-parser.config.js',
      'libs/journeys/ui/apollo.config.js',
      'libs/journeys/ui/postcss.config.mjs'
    ]
  },
  {
    files: ['**/*.ts', '**/*.tsx'],
    rules: {
      'no-void': ['error', { allowAsStatement: true }],
      '@typescript-eslint/no-misused-promises': 'off',
      '@typescript-eslint/require-await': 'off'
    },
    languageOptions: {
      parserOptions: { project: ['libs/journeys/ui/tsconfig.*?.json'] }
    }
  }
]
