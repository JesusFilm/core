const { FlatCompat } = require('@eslint/eslintrc')
const js = require('@eslint/js')
const baseConfig = require('../../eslint.config.js')

const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended
})

module.exports = [
  ...baseConfig,
  { ignores: ['apps/journeys-admin-e2e/eslint.config.js'] },
  ...compat.extends('plugin:playwright/recommended'),
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parserOptions: { project: ['apps/journeys-admin-e2e/tsconfig.*?.json'] }
    }
  },
  {
    files: ['apps/journeys-admin-e2e/src/plugins/index.js'],
    rules: {
      '@typescript-eslint/no-var-requires': 'off',
      'no-undef': 'off'
    }
  }
]