import { CodegenConfig } from '@graphql-codegen/cli'

const config: CodegenConfig = {
  schema: './apis/api-gateway/schema.graphql',
  documents: ['apis/api-journeys/src/**/*.ts'],
  generates: {
    './apis/api-journeys/src/__generated__/': {
      preset: 'client',
      presetConfig: {
        gqlTagName: 'gql'
      }
    }
  }
}

export default config
