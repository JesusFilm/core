const baseConfig = require('../../../eslint.config.js')

module.exports = [
  ...baseConfig,
  { ignores: ['libs/nest/gqlAuthGuard/eslint.config.js'] },
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parserOptions: { project: ['libs/nest/gqlAuthGuard/tsconfig.*?.json'] }
    }
  }
]
