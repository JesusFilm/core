import commonConfig from '../../shared/eslint/common.mjs'

export default [
  ...commonConfig,
  { ignores: ['libs/nest/common/eslint.config.js'] },
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parserOptions: { project: ['libs/nest/common/tsconfig.*?.json'] }
    }
  }
]
