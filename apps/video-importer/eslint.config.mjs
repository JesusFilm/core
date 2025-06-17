import { FlatCompat } from '@eslint/eslintrc'
import js from '@eslint/js'
import baseConfig from '../../eslint.config.mjs'

const compat = new FlatCompat({
  baseDirectory: import.meta.dirname,
  recommendedConfig: js.configs.recommended
})

export default [
  ...baseConfig,
  { ignores: ['apps/video-importer/eslint.config.js'] },
  ...compat.extends(),
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parserOptions: { project: ['apps/video-importer/tsconfig.json'] }
    }
  }
]
