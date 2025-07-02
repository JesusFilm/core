export const queueName = 'api-media-mux-downloads'
export const jobName = `${queueName}-job`

// Run every 6 hours to update download sizes from Mux
const EVERY_6_HOURS = '0 0 */6 * * *'
export const repeat = EVERY_6_HOURS
