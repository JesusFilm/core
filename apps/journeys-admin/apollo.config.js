module.exports = {
  client: {
    includes: ['./pages/**', './src/**', '../../libs/journeys/ui/**'],
    excludes: ['./**/*.test.tsx', './**/*.test.ts'],
    service: {
      name: 'api-gateway',
      localSchemaFile: 'apis/api-gateway/schema.graphql'
    }
  }
}
