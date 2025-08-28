import nextConfig from '../../libs/shared/eslint/next.mjs'

export default [
  ...nextConfig,
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
    rules: {
      '@next/next/no-html-link-for-pages': ['error', 'apps/arclight/pages']
    }
  }
]
