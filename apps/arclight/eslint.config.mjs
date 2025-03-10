import { FlatCompat } from '@eslint/eslintrc'
import js from '@eslint/js'
import nextPlugin from '@next/eslint-plugin-next'
import reactPlugin from 'eslint-plugin-react'

import baseConfig from '../../eslint.config.mjs'

const compat = new FlatCompat({
  baseDirectory: import.meta.dirname,
  recommendedConfig: js.configs.recommended
})

export default [
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
  { ignores: ['apps/arclight/eslint.config.js'] },
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
    rules: {
      '@next/next/no-html-link-for-pages': ['error', 'apps/arclight/pages']
    }
  },
  {
    files: ['apps/arclight/next-env.d.ts'],
    rules: { '@typescript-eslint/triple-slash-reference': 'off' }
  },
  { ignores: ['apps/arclight/.next/**/*', 'apps/arclight/jest.config.ts'] }
]
