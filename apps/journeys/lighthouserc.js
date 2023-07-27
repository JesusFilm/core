const DEPLOYMENT_URL = process.env.DEPLOYMENT_URL || 'http://localhost:4100/'

module.exports = {
  ci: {
    collect: {
      url: [
        DEPLOYMENT_URL,
        `${DEPLOYMENT_URL}/fact-or-fiction`,
        `${DEPLOYMENT_URL}/embed/fact-or-fiction`
      ],
      numberOfRuns: 1,
      startServerCommand: 'nx serve journeys'
    },
    assert: {
      assertions: {
        'categories:performance': [
          'warning',
          { minScore: 0.7, aggregationMethod: 'median-run' }
        ],
        'categories:accessibility': [
          'warning',
          { minScore: 0.8, aggregationMethod: 'pessimistic' }
        ],
        'categories:best-practices': [
          'warning',
          { minScore: 1, aggregationMethod: 'pessimistic' }
        ],
        'categories:seo': [
          'warning',
          { minScore: 0.7, aggregationMethod: 'pessimistic' }
        ],
        'largest-contentful-paint': ['warn', { maxNumericValue: 2500 }],
        'first-contentful-paint': ['warn', { maxNumericValue: 2000 }],
        'total-blocking-time': ['warn', { maxNumericValue: 200 }]
      }
    },
    upload: {
      target: 'temporary-public-storage'
    }
  }
}
