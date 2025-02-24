import { CodegenConfig } from '@graphql-codegen/cli'

const config: CodegenConfig = {
  schema: 'apis/api-gateway/schema.graphql',
  documents: ['libs/journeys/ui/src/**/*.{ts,tsx}'],
  config: {
    // preResolveTypes: true,
    namingConvention: {
      enumValues: 'change-case#camelCase'
    },
    avoidOptionals: {
      field: true
    },
    nonOptionalTypename: true,
    skipTypeNameForRoot: true
  },
  generates: {
    'libs/journeys/ui/src/': {
      preset: 'near-operation-file',
      presetConfig: {
        extension: '.ts',
        baseTypesPath: '../__generated__/globalTypes.ts',
        folder: '__generated__'
      },
      plugins: ['typescript-operations']
    },
    'libs/journeys/ui/__generated__/globalTypes.ts': {
      plugins: ['typescript']
    }
  },
  ignoreNoDocuments: true
}

export default config
