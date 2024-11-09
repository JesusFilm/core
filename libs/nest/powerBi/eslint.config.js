const baseConfig = require('../../../eslint.config.js')

module.exports = [
  ...baseConfig,
  { ignores: ['libs/nest/powerBi/eslint.config.js'] },
  {
    files: ['**/*.ts', '**/*.tsx'],
    // Override or add rules here
    rules: {},
    languageOptions: {
      parserOptions: { project: ['libs/nest/powerBi/tsconfig.*?.json'] }
    }
  }
]
