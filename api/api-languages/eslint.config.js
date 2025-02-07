const baseConfig = require('../../eslint.config.js')

module.exports = [
  ...baseConfig,
  {
    ignores: [
      'api/api-languages/eslint.config.js',
      'api/api-languages/webpack.config.js'
    ]
  },
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parserOptions: { project: ['api/api-languages/tsconfig.*?.json'] }
    }
  }
]
