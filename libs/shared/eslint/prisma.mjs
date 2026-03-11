import tsParser from '@typescript-eslint/parser'

import commonConfig from './common.mjs'

export default function prismaConfig(tsconfigRootDir) {
  return [
    ...commonConfig,
    {
      files: ['**/*.ts'],
      languageOptions: {
        parser: tsParser,
        parserOptions: {
          projectService: {
            defaultProject: 'tsconfig.lib.json'
          },
          tsconfigRootDir
        }
      }
    },
    {
      files: ['**/client.ts', '**/generated.ts'],
      rules: {
        'import/no-useless-path-segments': 'off'
      }
    }
  ]
}
