const { FlatCompat } = require('@eslint/eslintrc')
const js = require('@eslint/js')
const baseConfig = require('../../eslint.config.js')

const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended
})

module.exports = [
  ...baseConfig,
  ...compat.extends('plugin:playwright/recommended'),
  { ignores: ['apps/arclight-e2e/eslint.config.js'] },
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parserOptions: { project: ['apps/arclight-e2e/tsconfig.*?.json'] }
    }
  },
  {
    files: ['src/plugins/index.js'],
    rules: {
      '@typescript-eslint/no-var-requires': 'off',
      'no-undef': 'off'
    }
  }
]
