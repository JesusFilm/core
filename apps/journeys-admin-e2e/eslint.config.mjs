import e2eConfig from '../../libs/shared/eslint/e2e.mjs'

export default [
  ...e2eConfig,
  { ignores: ['apps/journeys-admin-e2e/eslint.config.js'] },
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parserOptions: { project: ['apps/journeys-admin-e2e/tsconfig.*?.json'] }
    }
  }
]
