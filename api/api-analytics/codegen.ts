import { CodegenConfig } from '@graphql-codegen/cli'

const config: CodegenConfig = {
  schema: './api/api-gateway/schema.graphql',
  documents: ['api/api-analytics/src/**/*.spec.ts'],
  generates: {
    './api/api-analytics/src/__generated__/': {
      preset: 'client',
      presetConfig: {
        gqlTagName: 'gql'
      }
    }
  }
}

export default config
