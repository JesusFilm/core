const DEPLOYMENT_URL = process.env.DEPLOYMENT_URL || 'http://localhost:4200/'

module.exports = {
  ci: {
    collect: {
      url: [
        DEPLOYMENT_URL,
        `${DEPLOYMENT_URL}/journeys/e08ef53a-be61-4758-8d1f-a461d6e34e7a`,
        `'${DEPLOYMENT_URL}/journeys/e08ef53a-be61-4758-8d1f-a461d6e34e7a/edit?stepId=728f91b2-57a0-4e0e-b753-a5bc07af02b3`
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
