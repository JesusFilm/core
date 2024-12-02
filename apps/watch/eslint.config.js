const { FlatCompat } = require('@eslint/eslintrc')
const js = require('@eslint/js')
const nextPlugin = require('@next/eslint-plugin-next')
const reactPlugin = require('eslint-plugin-react')
const reactHooksPlugin = require('eslint-plugin-react-hooks')
const globals = require('globals')

const baseConfig = require('../../eslint.config.js')

const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended
})

module.exports = [
  ...baseConfig,
  {
    ignores: [
      'apps/watch/eslint.config.js',
      'apps/watch/jest.config.ts',
      'apps/watch/.next/*'
    ]
  },
  {
    plugins: {
      '@next/next': nextPlugin,
      react: reactPlugin,
      'react-hooks': reactHooksPlugin
    },
    rules: {
      ...nextPlugin.configs.recommended.rules,
      ...nextPlugin.configs['core-web-vitals'].rules
    }
  },
  ...compat.extends('plugin:@nx/react-typescript'),
  { languageOptions: { globals: { ...globals.jest } } },
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
    rules: {
      '@next/next/no-html-link-for-pages': ['error', 'apps/watch/pages/']
    }
  },
  {
    files: ['**/*.ts', '**/*.tsx'],
    rules: {
      'no-void': ['error', { allowAsStatement: true }],
      '@typescript-eslint/no-misused-promises': 'off'
    },
    languageOptions: {
      parserOptions: { project: ['apps/watch/tsconfig.*?.json'] }
    }
  },
  {
    files: ['apps/watch/next-env.d.ts'],
    rules: { '@typescript-eslint/triple-slash-reference': 'off' }
  }
]
