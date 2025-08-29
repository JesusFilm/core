import baseConfig from '../../../eslint.config.mjs'

export default [
  ...baseConfig,
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
      '@typescript-eslint/no-unused-vars': 'off',
      'import/no-relative-packages': ['error', { ignore: ['./.prisma/client'] }]
    }
  }
]
