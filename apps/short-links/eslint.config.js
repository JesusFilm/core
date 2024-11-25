const { FlatCompat } = require('@eslint/eslintrc')
const js = require('@eslint/js')
const nextPlugin = require('@next/eslint-plugin-next')
const reactPlugin = require('eslint-plugin-react')

const baseConfig = require('../../eslint.config.js')

const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended
})

module.exports = [
  ...baseConfig,
  {
    plugins: {
      '@next/next': nextPlugin,
      react: reactPlugin
    },
    rules: {
      ...nextPlugin.configs.recommended.rules,
      ...nextPlugin.configs['core-web-vitals'].rules
    }
  },
  ...compat.extends('plugin:@nx/react-typescript'),
  { ignores: ['apps/short-links/eslint.config.js'] },
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
    rules: {
      '@next/next/no-html-link-for-pages': ['error', 'apps/short-links/pages']
    }
  },
  {
    files: ['apps/short-links/next-env.d.ts'],
    rules: { '@typescript-eslint/triple-slash-reference': 'off' }
  },
  {
    ignores: ['apps/short-links/.next/**/*', 'apps/short-links/jest.config.ts']
  }
]
