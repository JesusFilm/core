module.exports = {
  client: {
    includes: ['./src/**'],
    excludes: ['./**/*.test.tsx'],
    service: {
      name: 'api-gateway',
      localSchemaFile: 'apps/api-gateway/schema.graphql'
    }
  }
}
