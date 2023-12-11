module.exports = {
  client: {
    includes: ['./pages/**', './src/**'],
    excludes: ['./**/*.test.tsx'],
    service: {
      name: 'api-nexus',
      localSchemaFile: 'apps/api-nexus/schema.graphql'
    }
  }
}
