import nextConfig from '../../shared/eslint/next.mjs'

export default [
  ...nextConfig,
  {
    ignores: [
      'libs/shared/ui-dynamic/eslint.config.js',
      'libs/shared/ui-dynamic/jest.config.ts',
      'libs/shared/ui-dynamic/apollo.config.js'
    ]
  },
  {
    files: ['**/*.ts', '**/*.tsx'],
    rules: {
      'no-void': ['error', { allowAsStatement: true }],
      '@typescript-eslint/no-misused-promises': 'off'
    },
    languageOptions: {
      parserOptions: { project: ['libs/shared/ui-dynamic/tsconfig.*?.json'] }
    }
  }
]
