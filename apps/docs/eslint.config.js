const { FlatCompat } = require('@eslint/eslintrc')
const js = require('@eslint/js')
const typescriptPlugin = require('@typescript-eslint/eslint-plugin')
const globals = require('globals')

const baseConfig = require('../../eslint.config.js')

const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended
})

module.exports = [
  ...baseConfig,
  { ignores: ['apps/docs/.docusaurus/*'] },
  {
    plugins: {
      react: require('eslint-plugin-react'),
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
