import yogaConfig from '../../libs/shared/eslint/yogaWithReactEmail.mjs'

export default [
  ...yogaConfig,
  { ignores: ['libs/yoga/eslint.config.js'] },
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parserOptions: { project: ['libs/yoga/tsconfig.*?.json'] }
    }
  }
]
