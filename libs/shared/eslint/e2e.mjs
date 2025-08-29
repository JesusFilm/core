import { FlatCompat } from '@eslint/eslintrc'
import js from '@eslint/js'

import commonConfig from './common.mjs'

const compat = new FlatCompat({
  baseDirectory: import.meta.dirname,
  recommendedConfig: js.configs.recommended
})

export default [
  ...commonConfig,
  ...compat.extends('plugin:playwright/recommended'),
  {
    files: ['src/plugins/index.js'],
    rules: {
      '@typescript-eslint/no-var-requires': 'off',
      'no-undef': 'off'
    }
  }
]
