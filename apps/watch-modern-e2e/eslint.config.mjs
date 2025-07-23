import { FlatCompat } from '@eslint/eslintrc'
import js from '@eslint/js'
import baseConfig from '../../eslint.config.mjs'

const compat = new FlatCompat({
  baseDirectory: import.meta.dirname,
  recommendedConfig: js.configs.recommended
})

export default [
  ...baseConfig,
  ...compat.extends('plugin:playwright/recommended'),
  { ignores: ['apps/watch-modern-e2e/eslint.config.js'] },
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parserOptions: { project: ['apps/watch-modern-e2e/tsconfig.*?.json'] }
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
