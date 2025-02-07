module.exports = {
  client: {
    includes: ['./pages/**', './src/**', '../../libs/journeys/ui/**'],
    excludes: ['./**/*.test.tsx'],
    service: {
      name: 'api-gateway',
      localSchemaFile: 'api/api-gateway/schema.graphql'
    }
  }
}
