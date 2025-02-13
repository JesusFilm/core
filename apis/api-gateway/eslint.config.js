const baseConfig = require('../../eslint.config.js')

module.exports = [
  ...baseConfig,
  { ignores: ['apis/api-gateway/eslint.config.js'] },
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parserOptions: { project: ['apis/api-gateway/tsconfig.*?.json'] }
    }
  }
]
