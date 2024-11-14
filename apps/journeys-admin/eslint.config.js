const { FlatCompat } = require('@eslint/eslintrc')
const js = require('@eslint/js')
const baseConfig = require('../../eslint.config.js')
const globals = require('globals')
const nextPlugin = require('@next/eslint-plugin-next')
const reactPlugin = require('eslint-plugin-react')
const reactHooksPlugin = require('eslint-plugin-react-hooks')

const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended
})

module.exports = [
  ...baseConfig,
  {
    ignores: [
      'apps/journeys-admin/eslint.config.js',
      'apps/journeys-admin/jest.config.ts',
      'apps/journeys-admin/.next/*'
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
      '@next/next/no-html-link-for-pages': [
        'error',
        'apps/journeys-admin/pages/'
      ]
    }
  },
  {
    files: ['**/*.ts', '**/*.tsx'],
    rules: {
      'no-void': ['error', { allowAsStatement: true }],
      '@typescript-eslint/no-misused-promises': 'off'
    },
    languageOptions: {
      parserOptions: { project: ['apps/journeys-admin/tsconfig.*?.json'] }
    }
  },
  {
    files: ['apps/journeys-admin/next-env.d.ts'],
    rules: { '@typescript-eslint/triple-slash-reference': 'off' }
  }
]
