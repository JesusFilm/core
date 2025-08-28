import commonConfig from '../../../libs/shared/eslint/common.mjs'

export default [
  ...commonConfig,
  {
    ignores: [
      'libs/prisma/users/eslint.config.js',
      'libs/prisma/users/src/.prisma/**',
      'libs/prisma/users/db/**'
    ]
  },
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parserOptions: { project: ['libs/prisma/users/tsconfig.*?.json'] }
    },
    rules: {
      'import/no-relative-packages': ['error', { ignore: ['./.prisma/client'] }]
    }
  }
]
