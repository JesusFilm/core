import nextConfig from '../../libs/shared/eslint/next.mjs'

export default [
  ...nextConfig,
  {
    ignores: [
      'apps/watch/eslint.config.js',
      'apps/watch/jest.config.ts',
      'apps/watch/.next/*'
    ]
  },
  { languageOptions: { globals: {} } },
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
    rules: {
      '@next/next/no-html-link-for-pages': ['error', 'apps/watch/pages/']
    }
  },
  {
    files: ['**/*.ts', '**/*.tsx'],
    rules: {
      'no-void': ['error', { allowAsStatement: true }],
      '@typescript-eslint/no-misused-promises': 'off'
    },
    languageOptions: {
      parserOptions: { project: ['apps/watch/tsconfig.*?.json'] }
    }
  },
  {
    files: ['apps/watch/next-env.d.ts'],
    rules: { '@typescript-eslint/triple-slash-reference': 'off' }
  }
]
