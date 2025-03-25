import { FlatCompat } from '@eslint/eslintrc'
import js from '@eslint/js'
import baseConfig from '../../eslint.config.mjs'
import eslintPluginReact from 'eslint-plugin-react'

const compat = new FlatCompat({
  baseDirectory: import.meta.dirname,
  recommendedConfig: js.configs.recommended
})

export default [
  ...baseConfig,
  { ignores: ['libs/yoga/eslint.config.js'] },
  ...compat.extends('plugin:@nx/react-typescript'),
  {
    plugins: {
      react: eslintPluginReact
    }
  },
  { rules: { 'i18next/no-literal-string': 'off' } },
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parserOptions: { project: ['libs/yoga/tsconfig.*?.json'] }
    }
  }
]
