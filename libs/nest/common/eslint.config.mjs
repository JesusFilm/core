import baseConfig from '../../../eslint.config.mjs'

export default [
  ...baseConfig,
  { ignores: ['libs/nest/common/eslint.config.js'] },
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parserOptions: { project: ['libs/nest/common/tsconfig.*?.json'] }
    }
  }
]
