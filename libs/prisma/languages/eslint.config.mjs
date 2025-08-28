import commonConfig from '../../../libs/shared/eslint/common.mjs'

export default [
  ...commonConfig,
  {
    ignores: [
      'libs/prisma/languages/eslint.config.mjs',
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
      'import/no-relative-packages': ['error', { ignore: ['./.prisma/client'] }]
    }
  }
]
