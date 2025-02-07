module.exports = {
  client: {
    includes: ['./src/**'],
    excludes: ['./**/*.test.tsx'],
    service: {
      name: 'api-gateway',
      localSchemaFile: 'api/api-gateway/schema.graphql'
    }
  }
}
