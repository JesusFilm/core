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
      'api/api-journeys-modern/eslint.config.js',
      'api/api-journeys-modern/webpack.config.js'
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
      parserOptions: { project: ['api/api-journeys-modern/tsconfig.*?.json'] }
    }
  }
]
