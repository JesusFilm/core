import baseConfig from '../../eslint.config.mjs'

export default [
  ...baseConfig,
  {
    ignores: [
      'apis/api-languages/eslint.config.js',
      'apis/api-languages/webpack.config.js'
    ]
  },
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parserOptions: { project: ['apis/api-languages/tsconfig.*?.json'] }
    }
  }
]
