import commonConfig from '../../../libs/shared/eslint/common.mjs'

export default [
  ...commonConfig,
  { ignores: ['libs/nest/decorators/eslint.config.js'] },
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parserOptions: { project: ['libs/nest/decorators/tsconfig.*?.json'] }
    },
    rules: {}
  }
]
