const baseConfig = require('../../../eslint.config.js')

module.exports = [
  ...baseConfig,
  { ignores: ['libs/nest/decorators/eslint.config.js'] },
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parserOptions: { project: ['libs/nest/decorators/tsconfig.*?.json'] }
    }
  }
]
