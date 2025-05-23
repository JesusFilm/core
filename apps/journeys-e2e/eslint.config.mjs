import { FlatCompat } from '@eslint/eslintrc'
import js from '@eslint/js'
import baseConfig from '../../eslint.config.mjs'

const compat = new FlatCompat({
  baseDirectory: import.meta.dirname,
  recommendedConfig: js.configs.recommended
})

export default [
  ...baseConfig,
  { ignores: ['apps/journeys-e2e/eslint.config.js'] },
  ...compat.extends('plugin:playwright/recommended'),
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parserOptions: { project: ['apps/journeys-e2e/tsconfig.*?.json'] }
    }
  },
  {
    files: ['apps/journeys-e2e/src/plugins/index.js'],
    rules: {
      '@typescript-eslint/no-var-requires': 'off',
      'no-undef': 'off'
    }
  }
]
