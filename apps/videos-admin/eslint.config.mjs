import nextConfig from '../../libs/shared/eslint/next.mjs'

export default [
  ...nextConfig,
  {
    ignores: ['apps/videos-admin/jest.config.ts']
  },
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
    }
  }
]
