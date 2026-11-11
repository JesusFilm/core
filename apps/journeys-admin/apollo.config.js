module.exports = {
  client: {
    includes: ['./pages/**', './src/**', '../../libs/journeys/ui/**'],
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
