import { CodegenConfig } from '@graphql-codegen/cli'

const config: CodegenConfig = {
  schema: 'apis/api-gateway/schema.graphql',
  documents: ['libs/journeys/ui/src/**/*.{ts,tsx}'],
  generates: {
    'libs/journeys/ui/src/': {
      preset: 'near-operation-file',
      presetConfig: {
        extension: '.ts',
        baseTypesPath: '../__generated__/types.ts',
        folder: '__generated__'
      },
      plugins: ['typescript-operations']
    },
    'libs/journeys/ui/__generated__/types.ts': {
      plugins: ['typescript']
    }
  },
  ignoreNoDocuments: true
}

export default config
