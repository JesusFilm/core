export const queueName = 'api-journeys-e2e-cleanup'
export const jobName = `${queueName}-job`

// Run daily at 3:00 AM UTC
const DAILY_3AM = '0 0 3 * * *'
export const repeat = DAILY_3AM
