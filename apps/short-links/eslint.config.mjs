import nextConfig from '../../libs/shared/eslint/next.mjs'

export default [
  ...nextConfig,
  { ignores: ['apps/short-links/eslint.config.js'] },
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
    rules: {
      '@next/next/no-html-link-for-pages': ['error', 'apps/short-links/pages'],
      'i18next/no-literal-string': 'off'
    }
  },
  {
    files: ['apps/short-links/next-env.d.ts'],
    rules: { '@typescript-eslint/triple-slash-reference': 'off' }
  },
  {
    ignores: ['apps/short-links/.next/**/*', 'apps/short-links/jest.config.ts']
  }
]
