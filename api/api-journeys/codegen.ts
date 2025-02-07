import { CodegenConfig } from '@graphql-codegen/cli'

const config: CodegenConfig = {
  schema: './api/api-gateway/schema.graphql',
  documents: ['api/api-journeys/src/**/*.ts'],
  generates: {
    './api/api-journeys/src/__generated__/': {
      preset: 'client',
      presetConfig: {
        gqlTagName: 'gql'
      }
    }
  }
}

export default config
