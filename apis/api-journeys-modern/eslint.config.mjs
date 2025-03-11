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
  ...compat.extends('plugin:@nx/react-typescript'),
  {
    ignores: [
      'apis/api-journeys-modern/eslint.config.js',
      'apis/api-journeys-modern/webpack.config.js'
    ]
  },
  {
    plugins: {
      react: eslintPluginReact
    }
  },
  { rules: { 'i18next/no-literal-string': 'off' } },
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parserOptions: { project: ['apis/api-journeys-modern/tsconfig.*?.json'] }
    }
  }
]
