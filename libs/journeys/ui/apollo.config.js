module.exports = {
  client: {
    includes: ['./src/**'],
    excludes: [
      '**/*.test.ts',
      '**/*.test.tsx',
      '**/*.spec.ts',
      '**/*.spec.tsx'
    ],
    service: {
      name: 'api-gateway',
      localSchemaFile: 'apis/api-gateway/schema.graphql'
    }
  }
}
