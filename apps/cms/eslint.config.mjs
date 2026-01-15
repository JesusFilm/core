import commonConfig from '../../libs/shared/eslint/common.mjs'
import { fileURLToPath } from 'node:url'
import { dirname } from 'node:path'

const tsconfigRootDir = dirname(fileURLToPath(import.meta.url))

export default [
  ...commonConfig,
  {
    ignores: ['**/dist/**', '**/.strapi/**', '**/types/generated/**']
  },
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.*'],
        projectService: true,
        tsconfigRootDir
      }
    }
  }
]
