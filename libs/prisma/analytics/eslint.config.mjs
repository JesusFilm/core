import baseConfig from '../../../eslint.config.mjs'

export default [
  ...baseConfig,
  {
    ignores: [
      'libs/prisma/analytics/eslint.config.js',
      'libs/prisma/analytics/src/.prisma',
      'libs/prisma/analytics/db/**'
    ]
  },
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parserOptions: { project: ['libs/prisma/analytics/tsconfig.*?.json'] }
    },
    rules: {
      '@typescript-eslint/no-unused-vars': 'off',
      'import/no-relative-packages': ['error', { ignore: ['./.prisma/client'] }]
    }
  }
]
