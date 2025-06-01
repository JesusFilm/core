import baseConfig from '../../../eslint.config.mjs'

export default [
  ...baseConfig,
  { ignores: ['libs/prisma/analytics/eslint.config.js'] },
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parserOptions: { project: ['libs/prisma/analytics/tsconfig.*?.json'] }
    },
    rules: {
      '@typescript-eslint/no-unused-vars': 'off'
    }
  }
]
