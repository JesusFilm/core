const baseConfig = require('../../eslint.config.js')

module.exports = [
  ...baseConfig,
  {
    ignores: [
      'apis/api-media/eslint.config.js',
      'apis/api-media/webpack.config.js'
    ]
  },
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parserOptions: { project: ['apis/api-media/tsconfig.*?.json'] }
    }
  }
]
