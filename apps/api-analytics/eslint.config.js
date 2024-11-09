const baseConfig = require('../../eslint.config.js')

module.exports = [
  ...baseConfig,
  {
    ignores: [
      'apps/api-analytics/webpack.config.js',
      'apps/api-analytics/eslint.config.js'
    ]
  },
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parserOptions: {
        project: ['apps/api-analytics/tsconfig.*?.json']
      }
    }
  }
]
