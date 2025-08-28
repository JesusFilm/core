import commonConfig from '../../../libs/shared/eslint/common.mjs'

export default [
  ...commonConfig,
  {
    ignores: [
      'libs/prisma/media/eslint.config.js',
      'libs/prisma/media/src/.prisma/**',
      'libs/prisma/media/db/**'
    ]
  },
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parserOptions: { project: ['libs/prisma/media/tsconfig.*?.json'] }
    },
    rules: {
      'import/no-relative-packages': ['error', { ignore: ['./.prisma/client'] }]
    }
  }
]
