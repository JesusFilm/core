export const queueName = 'api-journeys-anonymous-journey-cleanup'
export const jobName = `${queueName}-job`

const DAILY_4AM = '0 0 4 * * *'
export const repeat = DAILY_4AM
