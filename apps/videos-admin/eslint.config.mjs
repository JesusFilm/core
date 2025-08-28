import nextConfig from '../../libs/shared/eslint/next.mjs'

export default [
  ...nextConfig,
  {
    ignores: [
      'apps/videos-admin/eslint.config.js',
      'apps/videos-admin/jest.config.ts',
      'apps/videos-admin/.next/*'
    ]
  },
  { languageOptions: { globals: {} } },
  {
    files: ['apps/videos-admin/src/libs/storybookConfig/videosAdminConfig.tsx'],
    rules: { 'i18next/no-literal-string': 'off' }
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
      '@typescript-eslint/no-misused-promises': 'off'
    },
    languageOptions: {
      parserOptions: { project: ['apps/videos-admin/tsconfig.*?.json'] }
    }
  },
  {
    files: ['apps/videos-admin/next-env.d.ts'],
    rules: { '@typescript-eslint/triple-slash-reference': 'off' }
  },
  { ignores: ['apps/videos-admin/.next'] }
]
