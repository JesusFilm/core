import { FlatCompat } from '@eslint/eslintrc'
import js from '@eslint/js'
import reactPlugin from 'eslint-plugin-react'

import commonConfig from './common.mjs'

const compat = new FlatCompat({
  baseDirectory: import.meta.dirname,
  recommendedConfig: js.configs.recommended
})

const yogaWithReactEmailConfig = [
  ...commonConfig,
  ...compat.extends('plugin:@nx/react-typescript'),
  { plugins: { react: reactPlugin } },
  { rules: { 'i18next/no-literal-string': 'off' } },
  { ignores: ['**/webpack.config.js'] }
]

export default yogaWithReactEmailConfig
