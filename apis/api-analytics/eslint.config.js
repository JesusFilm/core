const baseConfig = require('../../eslint.config.js')

module.exports = [
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
