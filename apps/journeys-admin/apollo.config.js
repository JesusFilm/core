module.exports = {
  client: {
    includes: ['./pages/**', './src/**', '../../libs/journeys/ui/**'],
    excludes: [
      './**/*.test.tsx',
      './**/*.test.ts',
      './src/components/CampaignEditor/testing.tsx'
    ],
    service: {
      name: 'api-gateway',
      localSchemaFile: 'apis/api-gateway/schema.graphql'
    }
  }
}
