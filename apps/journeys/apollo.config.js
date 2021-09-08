module.exports = {
  client: {
    includes: ['./pages/**', './src/**'],
    excludes: ['./**/*.test.tsx'],
    service: {
      name: 'api',
      url: 'http://localhost:4000'
    }
  }
}
