const baseConfig = require('../../eslint.config.js')

module.exports = [
  ...baseConfig,
  { ignores: ['apps/api-gateway/eslint.config.js'] },
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
    // Override or add rules here
    rules: {}
  },
  {
    files: ['**/*.ts', '**/*.tsx'],
    // Override or add rules here
    rules: {},
    languageOptions: {
      parserOptions: { project: ['apps/api-gateway/tsconfig.*?.json'] }
    }
  },
  {
    files: ['**/*.js', '**/*.jsx'],
    // Override or add rules here
    rules: {}
  }
]
