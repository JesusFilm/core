import baseConfig from '../../../eslint.config.mjs'

export default [
  ...baseConfig,
  { ignores: ['libs/prisma/languages/eslint.config.js'] },
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parserOptions: { project: ['libs/prisma/languages/tsconfig.*?.json'] }
    },
    rules: {
      '@typescript-eslint/no-unused-vars': 'off'
    }
  }
]
