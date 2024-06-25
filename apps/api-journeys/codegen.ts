import { CodegenConfig } from '@graphql-codegen/cli'

const config: CodegenConfig = {
  schema: './apps/api-gateway/schema.graphql',
  documents: ['apps/api-journeys/src/**/*.ts'],
  generates: {
    './apps/api-journeys/src/__generated__/': {
      preset: 'client',
      presetConfig: {
        gqlTagName: 'gql'
      }
    }
  }
}

export default config
