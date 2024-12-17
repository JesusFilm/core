const { FlatCompat } = require('@eslint/eslintrc')
const js = require('@eslint/js')
const reactPlugin = require('eslint-plugin-react')
const baseConfig = require('../../eslint.config.js')
const eslintPluginReact = require('eslint-plugin-react')
const eslintPluginI18next = require('eslint-plugin-i18next')

const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended
})

module.exports = [
  ...baseConfig,
  {
    ignores: [
      'apps/api-journeys/eslint.config.js',
      'apps/api-journeys/webpack.config.js'
    ]
  },
  ...compat.extends('plugin:@nx/react-typescript'),
  {
    plugins: {
      react: eslintPluginReact,
      i18next: eslintPluginI18next
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
      parserOptions: { project: ['apps/api-journeys/tsconfig.*?.json'] }
    }
  }
]
