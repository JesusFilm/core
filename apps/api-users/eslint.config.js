const { FlatCompat } = require('@eslint/eslintrc')
const js = require('@eslint/js')
const baseConfig = require('../../eslint.config.js')
const eslintPluginReact = require('eslint-plugin-react')
const eslintPluginI18next = require('eslint-plugin-i18next')

const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended
})

module.exports = [
  ...baseConfig,
  ...compat.extends('plugin:@nx/react-typescript'),
  {
    ignores: [
      'apps/api-users/eslint.config.js',
      'apps/api-users/webpack.config.js'
    ]
  },
  {
    plugins: {
      react: eslintPluginReact,
      i18next: eslintPluginI18next
    }
  },
  { rules: { 'i18next/no-literal-string': 'off' } },
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parserOptions: { project: ['apps/api-users/tsconfig.*?.json'] }
    }
  }
]
