import apiConfig from '../../libs/shared/eslint/api.mjs'
import { fileURLToPath } from 'node:url'
import { dirname } from 'node:path'

const isCI = !!process.env.CI
const tsconfigRootDir = dirname(fileURLToPath(import.meta.url))

export default [
  ...apiConfig,
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parserOptions: {
        project: isCI ? ['./tsconfig.*'] : false,
        projectService: isCI ? true : false,
        tsconfigRootDir
      }
    }
  }
]
