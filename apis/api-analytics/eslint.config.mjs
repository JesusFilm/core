import baseConfig from '../../eslint.config.mjs'

export default [
  ...baseConfig,
  {
    ignores: [
      'apis/api-analytics/webpack.config.js',
      'apis/api-analytics/eslint.config.js'
    ]
  },
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parserOptions: {
        project: ['apis/api-analytics/tsconfig.*?.json']
      }
    }
  }
]
