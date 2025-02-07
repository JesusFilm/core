const baseConfig = require('../../eslint.config.js')

module.exports = [
  ...baseConfig,
  {
    ignores: [
      'api/api-media/eslint.config.js',
      'api/api-media/webpack.config.js'
    ]
  },
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parserOptions: { project: ['api/api-media/tsconfig.*?.json'] }
    }
  }
]
