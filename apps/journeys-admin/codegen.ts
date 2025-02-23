import { CodegenConfig } from '@graphql-codegen/cli'

const config: CodegenConfig = {
  schema: 'apis/api-gateway/schema.graphql',
  documents: [
    'apps/journeys-admin/pages/**/*.{ts,tsx}',
    'apps/journeys-admin/src/**/*.{ts,tsx}',
    'libs/journeys/ui/**/*.{ts,tsx}',
    '!**/*.test.{ts,tsx}'
  ],
  generates: {
    'apps/journeys-admin/src/__generated__/': {
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
