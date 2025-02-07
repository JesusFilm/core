const baseConfig = require('../../eslint.config.js')

module.exports = [
  ...baseConfig,
  {
    ignores: [
      'api/api-analytics/webpack.config.js',
      'api/api-analytics/eslint.config.js'
    ]
  },
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parserOptions: {
        project: ['api/api-analytics/tsconfig.*?.json']
      }
    }
  }
]
