export const queueName = 'api-media-publish'
export const jobName = `${queueName}-job`

// Run once a day at 4 AM to avoid conflicts with other workers
const EVERY_DAY_AT_4_AM = '0 0 4 * * *'
export const repeat = EVERY_DAY_AT_4_AM
