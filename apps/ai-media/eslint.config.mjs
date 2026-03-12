import nextConfig from '../../libs/shared/eslint/next.mjs'

export default [
  ...nextConfig,
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
    rules: {
      '@next/next/no-html-link-for-pages': 'off',
      'i18next/no-literal-string': 'off'
    }
  },
  {
    ignores: ['apps/ai-media/.next/**/*', 'apps/ai-media/jest.config.ts']
  }
]
