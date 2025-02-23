import { CodegenConfig } from '@graphql-codegen/cli'

const config: CodegenConfig = {
  schema: '../../apis/api-gateway/schema.graphql',
  documents: [
    './pages/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
    '../../libs/journeys/ui/**/*.{ts,tsx}',
    '!**/*.test.{ts,tsx}'
  ],
  generates: {
    './src/__generated__/': {
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
