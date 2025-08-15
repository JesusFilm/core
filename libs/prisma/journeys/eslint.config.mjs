import baseConfig from '../../../eslint.config.mjs'

export default [
  ...baseConfig,
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
      '@typescript-eslint/no-unused-vars': 'off',
      'import/no-relative-packages': ['error', { ignore: ['./.prisma/client'] }]
    }
  }
]
