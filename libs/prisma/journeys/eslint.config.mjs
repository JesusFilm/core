import commonConfig from '../../..//libs/shared/eslint/common.mjs'

export default [
  ...commonConfig,
  {
    ignores: [
      'libs/prisma/journeys/eslint.config.mjs',
      'libs/prisma/journeys/src/.prisma/**',
      'libs/prisma/journeys/db/**'
    ]
  },
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parserOptions: { project: ['libs/prisma/journeys/tsconfig.*?.json'] }
    },
    rules: {
      'import/no-relative-packages': ['error', { ignore: ['./.prisma/client'] }]
    }
  }
]
