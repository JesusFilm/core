import commonConfig from '../../shared/eslint/common.mjs'

export default [
  ...commonConfig,
  { ignores: ['libs/nest/gqlAuthGuard/eslint.config.js'] },
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parserOptions: { project: ['libs/nest/gqlAuthGuard/tsconfig.*?.json'] }
    }
  }
]
