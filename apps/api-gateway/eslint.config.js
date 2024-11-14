const baseConfig = require('../../eslint.config.js')

module.exports = [
  ...baseConfig,
  { ignores: ['apps/api-gateway/eslint.config.js'] },
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parserOptions: { project: ['apps/api-gateway/tsconfig.*?.json'] }
    }
  }
]
