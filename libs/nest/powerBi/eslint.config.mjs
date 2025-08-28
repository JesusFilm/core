import commonConfig from '../../shared/eslint/common.mjs'

export default [
  ...commonConfig,
  { ignores: ['libs/nest/powerBi/eslint.config.js'] },
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parserOptions: { project: ['libs/nest/powerBi/tsconfig.*?.json'] }
    }
  }
]
