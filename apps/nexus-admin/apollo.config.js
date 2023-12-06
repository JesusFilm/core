module.exports = {
  client: {
    includes: ['./pages/**', './src/**', '../../libs/journeys/ui/**'],
    excludes: ['./**/*.test.tsx'],
    service: {
      name: 'api-nexus',
      localSchemaFile: 'apps/api-nexus/schema.graphql'
    }
  }
}
