export const queueName = 'api-journeys-shortlink-updater'
export const jobName = `${queueName}-job`

// Run every 3 hours to check and update all shortlinks
const EVERY_THREE_HOURS = '0 0 */3 * * *'
export const repeat = EVERY_THREE_HOURS
