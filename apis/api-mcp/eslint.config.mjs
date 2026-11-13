import { dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

import apiConfig from '../../libs/shared/eslint/api.mjs'

export default [
  ...apiConfig,
  {
    files: ['**/*.ts'],
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: dirname(fileURLToPath(import.meta.url))
      }
    }
  }
]
