module.exports = {
  client: {
    includes: ['./app/**', './src/**', '../../libs/journeys/ui/**'],
    excludes: ['./**/*.test.tsx'],
    service: {
      name: 'api-gateway',
      localSchemaFile: 'apps/api-gateway/schema.graphql'
    }
  }
}
