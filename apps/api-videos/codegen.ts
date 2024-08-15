import { CodegenConfig } from '@graphql-codegen/cli'

const config: CodegenConfig = {
  schema: './apps/api-gateway/schema.graphql',
  documents: ['apps/api-videos/src/**/*.ts'],
  generates: {
    './apps/api-videos/src/__generated__/': {
      preset: 'client',
      presetConfig: {
        gqlTagName: 'gql'
      }
    }
  }
}

export default config
