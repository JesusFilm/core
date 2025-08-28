import nextConfig from '../../libs/shared/eslint/next.mjs'

export default [
  ...nextConfig,
  {
    ignores: [
      'apps/watch-modern/eslint.config.js',
      'apps/watch-modern/jest.config.ts',
      'apps/watch-modern/.next/*'
    ]
  },
  { languageOptions: { globals: {} } },
  {
    files: ['**/*.ts', '**/*.tsx'],
    rules: {
      'no-void': ['error', { allowAsStatement: true }],
      '@typescript-eslint/no-misused-promises': 'off'
    },
    languageOptions: {
      parserOptions: { project: ['apps/watch-modern/tsconfig.*?.json'] }
    }
  },
  {
    files: ['apps/watch-modern/next-env.d.ts'],
    rules: { '@typescript-eslint/triple-slash-reference': 'off' }
  }
]
