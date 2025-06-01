import baseConfig from '../../../eslint.config.mjs'

export default [
  ...baseConfig,
  { ignores: ['libs/prisma/users/eslint.config.js'] },
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parserOptions: { project: ['libs/prisma/users/tsconfig.*?.json'] }
    },
    rules: {
      '@typescript-eslint/no-unused-vars': 'off'
    }
  }
]
