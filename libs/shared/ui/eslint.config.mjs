import nextConfig from '../../../packages/eslint-config/next.mjs'

export default [
  ...nextConfig,
  {
    ignores: [
      'libs/shared/ui/eslint.config.js',
      'libs/shared/ui/jest.config.ts',
      'libs/shared/ui/apollo.config.js'
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
      parserOptions: { project: ['libs/shared/ui/tsconfig.*?.json'] }
    }
  }
]
