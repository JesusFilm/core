import nextConfig from '../../libs/shared/eslint/next.mjs'

export default [
  ...nextConfig,
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
    rules: {
      '@next/next/no-html-link-for-pages': ['error', 'apps/short-links/pages'],
      'i18next/no-literal-string': 'off'
    }
  },
  {
    ignores: ['apps/short-links/.next/**/*', 'apps/short-links/jest.config.ts']
  }
]
