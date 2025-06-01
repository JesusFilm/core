import baseConfig from '../../../eslint.config.mjs'

export default [
  ...baseConfig,
  { ignores: ['libs/prisma/media/eslint.config.js'] },
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parserOptions: { project: ['libs/prisma/media/tsconfig.*?.json'] }
    },
    rules: {
      '@typescript-eslint/no-unused-vars': 'off'
    }
  }
]
