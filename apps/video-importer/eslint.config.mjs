import { dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

import commonConfig from '../../libs/shared/eslint/common.mjs'

const tsconfigRootDir = dirname(fileURLToPath(import.meta.url))

export default [
  ...commonConfig,
  {
    ignores: ['apps/video-importer/src/**/*.spec.ts']
  },
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.lint.json'],
        tsconfigRootDir
      }
    }
  }
]
