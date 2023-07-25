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
