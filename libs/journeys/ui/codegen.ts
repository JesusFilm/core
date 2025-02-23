import { CodegenConfig } from '@graphql-codegen/cli'

const config: CodegenConfig = {
  schema: 'apis/api-gateway/schema.graphql',
  documents: [
    'libs/journeys/ui/src/**/*.{ts,tsx}',
    '!libs/journeys/ui/src/**/*.test.{ts,tsx}'
  ],
  generates: {
    'libs/journeys/ui/src/__generated__/': {
      preset: 'client',
      plugins: [],
      presetConfig: {
        gqlTagName: 'gql',
        fragmentMasking: false
      }
    }
  },
  ignoreNoDocuments: true
}

export default config
