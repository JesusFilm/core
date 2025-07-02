export const queueName = 'api-media-mux-downloads'
export const jobName = `${queueName}-job`

// Run every 2 hours at 15 minutes past the hour to update download sizes from Mux
const EVERY_2_HOURS_AT_15_MIN = '0 15 */2 * * *'
export const repeat = EVERY_2_HOURS_AT_15_MIN
