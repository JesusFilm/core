export const queueName = 'api-media-mux-videos'
export const jobName = `${queueName}-job`

// Run once a day at 4 AM to avoid conflicts with other workers
const EVERY_DAY_AT_7_AM = '0 0 7 * * *'
export const repeat = EVERY_DAY_AT_7_AM
