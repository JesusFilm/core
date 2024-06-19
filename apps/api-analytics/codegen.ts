import { CodegenConfig } from '@graphql-codegen/cli'

const config: CodegenConfig = {
  schema: './apps/api-gateway/schema.graphql',
  documents: ['apps/api-analytics/src/**/*.spec.ts'],
  generates: {
    './apps/api-analytics/src/__generated__/': {
      preset: 'client',
      presetConfig: {
        gqlTagName: 'gql'
      }
    }
  }
}

export default config
