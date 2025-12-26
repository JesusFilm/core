import nextConfig from '../../libs/shared/eslint/next.mjs'

export default [
  ...nextConfig,
  {
    ignores: ['apps/arclight/next.config.js']
  },
  {
    files: ['apps/arclight/**/*.{js,jsx,ts,tsx}'],
    rules: {
      // Allow literal strings in this project (e.g. small validation UI messages).
      'i18next/no-literal-string': 'off'
    }
  }
]
