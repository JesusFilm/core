import commonConfig from '../../../libs/shared/eslint/common.mjs'

export default [
  ...commonConfig,
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
      'import/no-relative-packages': ['error', { ignore: ['./.prisma/client'] }]
    }
  }
]
