const DEPLOYMENT_URL = process.env.DEPLOYMENT_URL || 'http://localhost:4200/'

module.exports = {
  ci: {
    collect: {
      url: [
        DEPLOYMENT_URL,
        `${DEPLOYMENT_URL}journeys/a1f4148d-d5ca-4a77-af31-6227b786fc23`,
        `'${DEPLOYMENT_URL}journeys/a1f4148d-d5ca-4a77-af31-6227b786fc23/edit?stepId=8dd7cf0a-1b61-4f2f-9c85-34a18c4eb5a7`
      ],
      numberOfRuns: 1,
      startServerCommand: 'nx serve journeys-admin'
    },
    assert: {
      assertions: {
        'largest-contentful-paint': [
          'warn',
          {
            maxNumericValue: 2500
          }
        ],
        'first-contentful-paint': [
          'warn',
          {
            maxNumericValue: 2000
          }
        ],
        'total-blocking-time': [
          'warn',
          {
            maxNumericValue: 200
          }
        ]
      }
    },
    upload: {
      target: 'temporary-public-storage'
    }
  }
}
