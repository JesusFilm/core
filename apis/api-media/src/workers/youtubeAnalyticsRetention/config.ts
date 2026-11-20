export const queueName = 'api-media-youtube-analytics-retention'
export const jobName = `${queueName}-job`

// Run once a day at 03:00, clear of dataExport at midnight
const EVERY_DAY_AT_3AM = '0 0 3 * * *'
export const repeat = EVERY_DAY_AT_3AM
