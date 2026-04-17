import nextConfig from '../../libs/shared/eslint/next.mjs'

export default [
  ...nextConfig,
  {
    ignores: [
      'apps/videos-admin/jest.config.ts',
      'apps/videos-admin/**/*.stories.{ts,tsx,js,jsx}',
      'apps/videos-admin/src/libs/storybookConfig/**'
    ]
  },
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
    rules: {
      '@next/next/no-html-link-for-pages': [
        'error',
        'apps/videos-admin/src/pages'
      ],
      'i18next/no-literal-string': 'off'
    }
  },
  {
    files: ['**/*.ts', '**/*.tsx'],
    rules: {
      '@typescript-eslint/no-misused-promises': 'off',
      '@typescript-eslint/no-unnecessary-type-assertion': 'warn'
    }
  }
]
