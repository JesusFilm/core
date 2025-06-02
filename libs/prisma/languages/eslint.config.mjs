import baseConfig from '../../../eslint.config.mjs'

export default [
  ...baseConfig,
  {
    ignores: [
      'libs/prisma/languages/eslint.config.js',
      'libs/prisma/languages/src/.prisma/**',
      'libs/prisma/languages/db/**'
    ]
  },
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parserOptions: { project: ['libs/prisma/languages/tsconfig.*?.json'] }
    },
    rules: {
      '@typescript-eslint/no-unused-vars': 'off',
      'import/no-relative-packages': ['error', { ignore: ['./.prisma/client'] }]
    }
  }
]
