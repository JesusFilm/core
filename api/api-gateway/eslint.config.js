const baseConfig = require('../../eslint.config.js')

module.exports = [
  ...baseConfig,
  { ignores: ['api/api-gateway/eslint.config.js'] },
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parserOptions: { project: ['api/api-gateway/tsconfig.*?.json'] }
    }
  }
]
