import yogaConfig from '../../libs/shared/eslint/yogaWithReactEmail.mjs'
import { fileURLToPath } from 'node:url'
import { dirname } from 'node:path'

const isCI = !!process.env.CI
const tsconfigRootDir = dirname(fileURLToPath(import.meta.url))

export default [
  ...yogaConfig,
  {
    ignores: ['apis/api-journeys-modern/webpack.config.js']
  },
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
