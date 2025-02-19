import { CodegenConfig } from '@graphql-codegen/cli'

const config: CodegenConfig = {
  schema: './apis/api-gateway/schema.graphql',
  documents: ['apis/api-analytics/src/**/*.spec.ts'],
  generates: {
    './apis/api-analytics/src/__generated__/': {
      preset: 'client',
      presetConfig: {
        gqlTagName: 'gql'
      }
    }
  }
}

export default config
