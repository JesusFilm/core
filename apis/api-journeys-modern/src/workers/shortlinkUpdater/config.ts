export const queueName = 'api-journeys-shortlink-updater'
export const jobName = `${queueName}-job`

// Run daily at 3 AM to check and update all shortlinks
const EVERY_DAY_AT_5_AM = '0 0 5 * * *'
export const repeat = EVERY_DAY_AT_5_AM
