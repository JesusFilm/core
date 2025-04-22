import { FlatCompat } from '@eslint/eslintrc'
import js from '@eslint/js'
import reactPlugin from 'eslint-plugin-react'
import baseConfig from '../../eslint.config.mjs'
import eslintPluginReact from 'eslint-plugin-react'

const compat = new FlatCompat({
  baseDirectory: import.meta.dirname,
  recommendedConfig: js.configs.recommended
})

export default [
  ...baseConfig,
  {
    ignores: [
      'apis/api-journeys/eslint.config.js',
      'apis/api-journeys/webpack.config.js'
    ]
  },
  ...compat.extends('plugin:@nx/react-typescript'),
  {
    plugins: {
      react: eslintPluginReact
    },

    rules: {
      ...reactPlugin.configs['jsx-runtime'].rules
    }
  },
  { rules: { 'i18next/no-literal-string': 'off' } },
  {
    files: ['**/*.ts', '**/*.tsx'],
    rules: {
      'no-void': ['error', { allowAsStatement: true }],
      '@typescript-eslint/no-misused-promises': 'off',
      '@typescript-eslint/no-require-imports': 'off',
      '@typescript-eslint/require-await': 'off'
    },
    languageOptions: {
      parserOptions: { project: ['apis/api-journeys/tsconfig.*?.json'] }
    }
  }
]
