import { FlatCompat } from '@eslint/eslintrc'
import js from '@eslint/js'
import typescriptPlugin from '@typescript-eslint/eslint-plugin'
import globals from 'globals'
import eslintReact from 'eslint-plugin-react'

import baseConfig from '../../eslint.config.mjs'

const compat = new FlatCompat({
  baseDirectory: import.meta.dirname,
  recommendedConfig: js.configs.recommended
})

export default [
  ...baseConfig,
  { ignores: ['apps/docs/.docusaurus/*'] },
  {
    plugins: {
      react: eslintReact,
      '@typescript-eslint': typescriptPlugin
    }
  },
  ...compat.extends('plugin:@nx/react-typescript'),
  { languageOptions: { globals: { ...globals.jest } } },
  {
    files: ['**/*.ts', '**/*.tsx'],
    rules: { 'no-void': ['error', { allowAsStatement: true }] },
    languageOptions: { parserOptions: { project: ['apps/docs/tsconfig.json'] } }
  }
]
