import commonConfig from '../../libs/shared/eslint/common.mjs'
import { FlatCompat } from '@eslint/eslintrc'
import js from '@eslint/js'
const compat = new FlatCompat({
  baseDirectory: import.meta.dirname,
  recommendedConfig: js.configs.recommended
})

export default [
  ...commonConfig,
  ...compat.extends('plugin:playwright/recommended'),
  { ignores: ['apps/watch-e2e/eslint.config.js'] },
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parserOptions: { project: ['apps/watch-e2e/tsconfig.*?.json'] }
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
