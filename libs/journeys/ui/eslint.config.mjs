import nextConfig from '../../shared/eslint/next.mjs'

export default [
  ...nextConfig,
  {
    ignores: [
      'libs/journeys/ui/jest.config.ts',
      'libs/journeys/ui/postcss.config.mjs',
      'libs/journeys/ui/i18next-parser.config.js',
      'libs/journeys/ui/**/*.stories.{ts,tsx,js,jsx}',
      'libs/journeys/ui/src/libs/journeyUiConfig/**',
      'libs/journeys/ui/src/libs/simpleComponentConfig/**'
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
